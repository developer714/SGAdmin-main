#!/bin/bash

FrontendDomain="dashboard.sensedefence.net"
PrimaryBackendDomain="pomb.sdinternal.com"
LBBackendDomain="backend.sdinternal.com"
GithubUsername="Binary-Vanguard-12138"
GithubToken="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"
AdminDirName="SGAdmin"

IS_DEBIAN=false

function is_debian {
    # Check if the release file exists and contains 'Debian' or 'Ubuntu'
    if [ -f /etc/debian_version ]; then
        IS_DEBIAN=true
        return 0
    fi

    # Alternatively, check /etc/os-release for Debian or Ubuntu
    if grep -qi "debian\|ubuntu" /etc/os-release; then
        IS_DEBIAN=true
        return 0
    fi

    return 1
}

function install_deps {
    # install dependency libraries
    if [ "$IS_DEBIAN" = true ]; then
        sudo apt update -y
        sudo apt install -y git vim mc wget
        sudo apt install -y nodejs npm certbot
    else
        sudo yum -y update
        sudo yum install -y epel-release git vim mc wget
        sudo yum install -y nodejs npm certbot
    fi
}

function checkout_latest_release {
    # Get new tags from remote
    git fetch --tags

    # Get latest tag name
    latestTag=$(git describe --tags `git rev-list --tags --max-count=1`)

    # Checkout latest tag
    git checkout $latestTag
}

function install_nginx {
    # install nginx
    if [ "$IS_DEBIAN" = true ]; then
        # Install NGINX on Debian/Ubuntu

        # Add NGINX repository
        sudo bash -c '
cat <<EOF > /etc/apt/sources.list.d/nginx.list
deb http://nginx.org/packages/debian/ $(lsb_release -cs) nginx
deb-src http://nginx.org/packages/debian/ $(lsb_release -cs) nginx
EOF
'
        # Add NGINX GPG key
        curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo apt-key add -
        # Update package list
        sudo apt update -y
        # Install NGINX
        sudo apt install -y nginx
    else
        # install nginx
        # refer to https://gist.github.com/lukespragg/756793c1031ba913f143
        sudo bash -c '
cat <<EOF > /etc/yum.repos.d/nginx.repo
[nginx]
name=nginx repo
baseurl=https://nginx.org/packages/centos/\$releasever/\$basearch/
gpgcheck=0
enabled=1
EOF
'
        sudo yum install -y nginx
    fi
    sudo mkdir /etc/nginx/modules -p
}

function install_sd_admin {
    # install SGAdmin
    cd ~
    if [ -d $AdminDirName ]
    then
        echo "SGAdmin directory already exists"
        cd $AdminDirName
        # Update github token
        git remote set-url origin https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$AdminDirName.git
        git remote set-url --push origin https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$AdminDirName.git
        git pull
    else
        git clone https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$AdminDirName.git
    fi
    cd ~/$AdminDirName/admin/client/

    if [ -f ~/.env ]
    then
        cp ~/.env ./.env
    else
        cp .env.example .env
    fi

    npm i
    npm run build

    sudo mkdir /var/www/html/admin/ -p
    sudo cp -r build/ /var/www/html/admin/
    sudo -u nginx stat /var/www/html/admin/build
    cd ..
}

function prepare_nginx_conf_dir {
    # prepare nginx configuration directory
    cd /etc/nginx/
    if [ ! -d "sites-enabled" ]
    then
        sudo mkdir sites-enabled
    fi
    sudo chmod 777 sites-enabled -R
    if [ ! -d "sites-available" ]
    then
        sudo mkdir sites-available
    fi
    sudo chmod 777 sites-available -R
}

function generate_cert {
    # generate self signed root CA, and certficate for front-end domain
    # refer to https://gist.github.com/fntlnz/cf14feb5a46b2eda428e000157447309
    root_dir=~/sg_certs/root/
    mkdir -p $root_dir
    cd $root_dir
    # Create Root Key
    openssl genrsa -out privateKey.pem 4096
    # Create and self sign the Root Certificate
    openssl req -x509 -new -nodes -key privateKey.pem -sha512 -days 3650 -subj "/C=GB/ST=London/L=London/O=SenseDefence AI/CN=SenseDefence AI Root CA" -out certificate.pem
    # Create a certificate
    cert_dir=/etc/nginx/sites-available/$FrontendDomain/certs
    if [ ! -d $cert_dir ]
    then
        sudo mkdir -p $cert_dir
    fi
    cd $cert_dir
    sudo openssl genrsa -out privkey.pem 4096
    IFS="."; read -ra strarr <<< "$FrontendDomain"
    IFS=""
    for (( n = 0; n < ${#strarr[*]}; n++))
    do
        if (( 0 < n )); then
            FrontendCN="$FrontendCN${strarr[n]}"
            if (( ${#strarr[*]} > n + 1 )); then
                FrontendCN+="."
            fi
        fi
    done
    FrontendCN=*.$FrontendCN
    sudo openssl req -new -sha512 -key privkey.pem -subj "/C=GB/ST=London/O=SenseDefence AI/CN=$FrontendCN" -out csr.pem
    sudo openssl req -in csr.pem -noout -text
    sudo openssl x509 -req -in csr.pem -CA $root_dir/certificate.pem -CAkey $root_dir/privateKey.pem -CAcreateserial -out fullchain.pem -days 3650 -sha512
    sudo openssl x509 -in fullchain.pem -text -noout
}

function config_nginx {
    cat <<EOF > ~/$FrontendDomain.conf
server {
    listen 80;
    listen 443 ssl http2;
    server_name $FrontendDomain *.$FrontendDomain;

    ssl_certificate /etc/nginx/sites-available/$FrontendDomain/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/sites-available/$FrontendDomain/certs/privkey.pem;

    root /var/www/html/admin/build;
    index index.html index.htm;

    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_min_length 0;
    gzip_types text/plain application/javascript text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype;

    location / {
        gzip_static on;
        try_files \$uri \$uri/ /index.html =404;
    }

    location /api/user/ {
        proxy_pass https://$LBBackendDomain/api/user/;
        proxy_set_header Origin \$scheme://\$host;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }

    location /api/ {
        proxy_pass https://$PrimaryBackendDomain/api/;
        proxy_set_header Origin \$scheme://\$host;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }
    location = /health {
        access_log off;
        add_header 'Content-Type' 'application/json';
        return 200 '{"status":"UP"}';
    }
}
EOF

    sudo mv -f ~/$FrontendDomain.conf /etc/nginx/sites-available/$FrontendDomain.conf
    if [ -f /etc/nginx/sites-enabled/$FrontendDomain.conf ]
    then
        sudo unlink /etc/nginx/sites-enabled/$FrontendDomain.conf
    fi
    sudo ln -s /etc/nginx/sites-available/$FrontendDomain.conf /etc/nginx/sites-enabled/$FrontendDomain.conf

    if [ "$IS_DEBIAN" = false ]; then
        sudo setsebool -P httpd_enable_homedirs 1
        sudo setenforce 0
    fi

    # add include /etc/nginx/sites-enabled/*.conf; directive in the nginx.conf file
    # remove original /etc/nginx/sites-enabled/*.conf;
    # replace include /etc/nginx/conf.d/*.conf; with include /etc/nginx/conf.d/*.conf; include /etc/nginx/sites-enabled/*.conf;
    sudo sed -i 's/#\s*include \/etc\/nginx\/sites-enabled\/\*\.conf;//g; s/include \/etc\/nginx\/sites-enabled\/\*\.conf;//g; s/include \/etc\/nginx\/conf\.d\/\*\.conf\;\s*\n*/include \/etc\/nginx\/conf\.d\/\*\.conf\;\n    include \/etc\/nginx\/sites-enabled\/\*\.conf\;/g' /etc/nginx/nginx.conf
}

function restart_nginx {
    sudo systemctl restart nginx
    sudo systemctl daemon-reload
}

function install_keycloak_server {
    sudo apt update && sudo apt upgrade -y

    sudo apt install software-properties-common ca-certificates chrony -y
    sudo vi /etc/chrony/chrony.conf
    sudo systemctl restart chrony.service

    sudo apt install openjdk-17-jre-headless openjdk-17-jdk-headless -y
    wget https://github.com/keycloak/keycloak/releases/download/21.0.1/keycloak-21.0.1.tar.gz
    sudo vi /etc/environment
    JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
    source /etc/environment
    tar zxvf keycloak-21.0.1.tar.gz

    sudo mv keycloak-21.0.1 keycloak

    sudo mv keycloak /opt/
    sudo vi /opt/keycloak/conf/keycloak.conf
    db=postgres
    db-username=DB_USER_NAME
    db-password=DB_PASSWORD
    db-url=jdbc:postgresql://localhost/keycloak
    health-enabled=true
    metrics-enabled=true

    # HTTP
    #http-enabled=true
    #hostname-strict=false
    #hostname-strict-https=false
    #log=console,file

    proxy=edge
    hostname=kullanici-panel.fatlan.com
    #hostname=kullanici-panel.fatlan.com:8080
    cd /opt/keycloak/bin/
    export KEYCLOAK_ADMIN=admin
    export KEYCLOAK_ADMIN_PASSWORD=KYC_PASS
    ./kc.sh --verbose build

    ./kc.sh --verbose start

    ctrl+c
    sudo vim /etc/systemd/system/keycloak.service
    [Unit]
    Description=Keycloak Identity Provider
    Requires=network.target
    After=syslog.target network.target

    [Service]
    Type=idle
    User=ubuntu
    Group=ubuntu
    #RemainAfterExit=yes
    LimitNOFILE=102642
    ExecStart=/opt/keycloak/bin/kc.sh start --log=console,file
    #WorkingDirectory=/opt/keycloak
    StandardOutput=null

    [Install]
    WantedBy=multi-user.target
    sudo systemctl daemon-reload
    sudo systemctl enable keycloak.service
    sudo systemctl start keycloak.service
    sudo systemctl status keycloak.service


}

# The following functions must be called in sequence.
is_debian
install_deps
install_keycloak_server
install_nginx
install_sd_admin
prepare_nginx_conf_dir
generate_cert
config_nginx
restart_nginx
