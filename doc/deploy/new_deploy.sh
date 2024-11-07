#!/bin/bash

AUDomain="au01-eu.dev.sensedefence.net"
GithubUsername="Binary-Vanguard-12138"
GithubToken="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"
EngineDirName="AU-Engine"
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
        # Update package lists and upgrade all packages
        sudo apt update -y
        sudo apt upgrade -y
        # Install required packages
        sudo apt install -y git vim mc python3 python3-pip python3-dev wget net-tools
        sudo apt install -y build-essential
        # Install packages needed for NGINX
        sudo apt install -y patch libgoogle-perftools-dev libxml2 libxml2-dev libxslt1-dev libgd-dev libpcre3-dev
        # Install Node.js and npm
        sudo apt install -y nodejs npm
        sudo apt install -y python3-virtualenv
    else
        sudo yum -y update
        sudo yum install -y epel-release git vim mc python3 python3-pip python3-devel wget net-tools
        sudo yum groupinstall -y "Development Tools"
        # for nginx
        sudo yum install -y patch gperftools gperftools-devel libxml2 libxml2-devel libxslt-devel gd-devel pcre-devel
        sudo yum install -y nodejs npm
        sudo python3 -m pip install virtualenv
    fi
    sudo npm install -g pm2
    pm2 # Run pm2 for the first time, banner will be removed after the 1st time
    # do the indications of pm2 startup
    readarray -t lines <<<"$(pm2 startup)"
    ${lines[2]}
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
    sudo systemctl daemon-reload
    sudo systemctl enable nginx

    # Download source code of nginx
    cd ~
    if [ "$IS_DEBIAN" = true ]; then
        nginx_version=$(/usr/sbin/nginx -v 2>&1 | grep -o '[0-9.]*$')
    else
        nginx_version=$(nginx -v 2>&1 | grep -o '[0-9.]*$')
    fi
    if [ ! -d ~/nginx-$nginx_version ]
    then
        wget http://nginx.org/download/nginx-$nginx_version.tar.gz
        tar -xvzf nginx-$nginx_version.tar.gz
        rm -f nginx-$nginx_version.tar.gz
    fi
}

function install_sqlite3 {
    cd ~
    wget https://www.sqlite.org/2022/sqlite-autoconf-3390300.tar.gz
    tar -xvzf sqlite-autoconf-3390300.tar.gz
    cd sqlite-autoconf-3390300
    ./configure --exec-prefix=/usr
    make -j$(nproc)
    sudo make install

    sudo cp /usr/lib/libsqlite3.so.0.8.6 /usr/lib64/libsqlite3.so.0.8.6
    cd ..
    rm -rf sqlite-autoconf-3390300
    rm -f sqlite-autoconf-3390300.tar.gz
}

function download_dataset {
    echo "download_dataset"
    cd ~
    if [ ! -d dataset ]
    then
        mkdir dataset
    fi
    : <<'END'
    if [ ! -f CTU-13-Dataset.tar.bz2 ]
    then
        wget https://mcfp.felk.cvut.cz/publicDatasets/CTU-13-Dataset/CTU-13-Dataset.tar.bz2
    fi
    # Only extract 1 directory
    tar -xvf CTU-13-Dataset.tar.bz2 1
    cp CTU-13-Dataset/1/capture20110810.binetflow ~/dataset/flowdata.binetflow
    rm -rf CTU-13-Dataset
    rm -f CTU-13-Dataset.tar.bz2
END
    if [ ! -f capture20110810.binetflow ]
    then
        wget https://mcfp.felk.cvut.cz/publicDatasets/CTU-Malware-Capture-Botnet-42/detailed-bidirectional-flow-labels/capture20110810.binetflow
    fi
    mv capture20110810.binetflow ~/dataset/flowdata.binetflow
}

function train_model {
    echo "train_model"
    cd ~/$EngineDirName/AUEngine
    source env/bin/activate
    python3 api/v1/ai_botnetd/dataset_load.py
    deactivate
}

function install_gunicorn_daemon {
    echo "install_gunicorn_daemon"
    cd ~
    home_path=$(pwd)
    user_name=$(whoami)
    cpu_cores=$(nproc --all)
    cat <<EOF > gunicorn.service
[Unit]
Description=gunicorn daemon
After=network.target
[Service]
User=$user_name
Group=nginx
WorkingDirectory=$home_path/$EngineDirName/AUEngine
EnvironmentFile=$home_path/$EngineDirName/AUEngine/AUEngine/.env
ExecStart=$home_path/$EngineDirName/AUEngine/env/bin/gunicorn --chdir $home_path/$EngineDirName/AUEngine --workers $cpu_cores --log-level debug --error-logfile $home_path/$EngineDirName/AUEngine/error.log --bind unix:$home_path/$EngineDirName/AUEngine/app.sock AUEngine.wsgi:application
[Install]
WantedBy=multi-user.target
EOF
    sudo mv gunicorn.service /etc/systemd/system/gunicorn.service
    sudo systemctl daemon-reload
    sudo systemctl start gunicorn
    sudo systemctl enable gunicorn
    sudo systemctl stop gunicorn

    sudo usermod -a -G $user_name nginx
    chmod 710 $home_path
}

function install_au_engine {
    cd ~
    if [ ! -d $EngineDirName ]
    then
        git clone https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$EngineDirName.git
    else
        cd $EngineDirName
        # Update github token
        git remote set-url origin https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$EngineDirName.git
        git remote set-url --push origin https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$EngineDirName.git
        git pull
    fi
    cd ~/$EngineDirName/AUEngine
    if [ ! -d /var/log/au ]; then
        sudo mkdir -p /var/log/au
    fi
    sudo chmod 777 -R /var/log/au/
 
    virtualenv env
    source env/bin/activate
    pip3 install -r requirements.txt
    python3 manage.py migrate
    deactivate

    # Create empty .env file
    cd ~/$EngineDirName/AUEngine/AUEngine
    cp .env.example .env
}

function prepare_nginx_conf_dir {
    # prepare nginx configuration directory
    sudo cp -rf ~/$EngineDirName/asset/etc/nginx /etc/

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
    # generate self signed root CA, and certficate for backend domain
    # refer to https://gist.github.com/fntlnz/cf14feb5a46b2eda428e000157447309
    root_dir=~/sg_certs/root/
    mkdir -p $root_dir
    cd $root_dir
    # Create Root Key
    openssl genrsa -out privateKey.pem 4096
    # Create and self sign the Root Certificate
    openssl req -x509 -new -nodes -key privateKey.pem -sha512 -days 3650 -subj "/C=GB/ST=London/L=London/O=SenseDefence AI/CN=SenseDefence AI Root CA" -out certificate.pem
    # Create a certificate
    cert_dir=/etc/nginx/sites-available/$AUDomain/certs
    if [ ! -d $cert_dir ]
    then
        sudo mkdir -p $cert_dir
    fi

    cd $cert_dir
    sudo openssl genrsa -out privkey.pem 4096
    IFS="."; read -ra strarr <<< "$AUDomain"
    IFS=""
    for (( n = 0; n < ${#strarr[*]}; n++))
    do
        if (( 0 < n )); then
            BackendCN="$BackendCN${strarr[n]}"
            if (( ${#strarr[*]} > n + 1 )); then
                BackendCN+="."
            fi
        fi
    done
    BackendCN=*.$BackendCN
    sudo openssl req -new -sha512 -key privkey.pem -subj "/C=GB/ST=London/O=SenseDefence AI/CN=$BackendCN" -out csr.pem
    sudo openssl req -in csr.pem -noout -text
    sudo openssl x509 -req -in csr.pem -CA $root_dir/certificate.pem -CAkey $root_dir/privateKey.pem -CAcreateserial -out fullchain.pem -days 3650 -sha512
    sudo openssl x509 -in fullchain.pem -text -noout

    username=$(whoami)
    sudo chown -R $username /etc/nginx/sites-available/$AUDomain/
}

function config_nginx {
    cd ~
    home_dir=$(pwd)
    cat <<EOF > ~/$AUDomain.conf
server {
    listen 80;
    listen 443 ssl http2;
    server_name $AUDomain;
    root /usr/share/nginx/html/;
    index index.html index.htm;
    ssl_certificate /etc/nginx/sites-available/$AUDomain/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/sites-available/$AUDomain/certs/privkey.pem;


    location /api/engine/ {
        proxy_pass http://unix:$home_dir/$EngineDirName/AUEngine/app.sock:/api/;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }

    location /api/admin/ {
        proxy_pass http://localhost:5003/api/;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_buffer_size          128k;
        proxy_buffers              4 256k;
        proxy_busy_buffers_size    256k;
    }
}
EOF
    sudo mv -f ~/$AUDomain.conf /etc/nginx/sites-available/$AUDomain.conf
    username=$(whoami)
    sudo chown $username /etc/nginx/sites-available/$AUDomain.conf

    if [ -f /etc/nginx/sites-enabled/$AUDomain.conf ]
    then
        sudo unlink /etc/nginx/sites-enabled/$AUDomain.conf
    fi
    sudo ln -s /etc/nginx/sites-available/$AUDomain.conf /etc/nginx/sites-enabled/$AUDomain.conf

    if [ "$IS_DEBIAN" = false ]; then
        sudo setsebool -P httpd_can_network_connect 1
        sudo setsebool -P httpd_enable_homedirs 1
        sudo setenforce 0
        sudo sed -i 's/SELINUX=enforcing/SELINUX=permissive/g' /etc/selinux/config
    fi

    # add include /etc/nginx/sites-enabled/*.conf; directive in the nginx.conf file
    # remove original /etc/nginx/sites-enabled/*.conf;
    # replace include /etc/nginx/conf.d/*.conf; with include /etc/nginx/conf.d/*.conf; include /etc/nginx/sites-enabled/*.conf;
    sudo sed -i 's/#\s*include \/etc\/nginx\/sites-enabled\/\*\.conf;//g; s/include \/etc\/nginx\/sites-enabled\/\*\.conf;//g; s/include \/etc\/nginx\/conf\.d\/\*\.conf\;\s*\n*/include \/etc\/nginx\/conf\.d\/\*\.conf\;\n    include \/etc\/nginx\/sites-enabled\/\*\.conf\;/g' /etc/nginx/nginx.conf
}

function restart_nginx {
    sudo systemctl restart nginx
}

function install_logstash {
    # install logstash
    if [ "$IS_DEBIAN" = true ]; then
        # refer to https://www.elastic.co/guide/en/logstash/8.15/installing-logstash.html#_apt
        wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elastic-keyring.gpg
        sudo apt-get install apt-transport-https
        echo "deb [signed-by=/usr/share/keyrings/elastic-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-8.x.list
        sudo apt-get update && sudo apt-get install -y logstash
    else
        # refer to https://www.elastic.co/guide/en/logstash/8.2/installing-logstash.html#_yum
        sudo rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
        sudo bash -c '
cat <<EOF > /etc/yum.repos.d/logstash.repo
[logstash-8.x]
name=Elastic repository for 8.x packages
baseurl=https://artifacts.elastic.co/packages/8.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF
'
        sudo yum install logstash -y
        sudo yum install java -y
    fi
}

function write_logstash_cfg {
    sudo bash -c '
cat <<EOF > /etc/logstash/logstash.yml
path.data: /var/lib/logstash
path.config: /etc/logstash/conf.d
path.logs: /var/log/logstash
EOF
'

    # copy default config files for logstash
    if [ -d ~/$EngineDirName/asset/etc/logstash ]
    then
        sudo cp -r ~/$EngineDirName/asset/etc/logstash/* /etc/logstash/
    fi
    sudo chmod 777 -R /etc/logstash/conf.d

    if [ ! -d /etc/logstash/certs ]
    then
        sudo mkdir /etc/logstash/certs
    fi
    sudo chmod 777 -R /etc/logstash/certs
    sudo systemctl restart logstash
}

function install_traffic_accounting_nginx {
    # Install Traffic Accounting module for NGINX
    cd ~
    git clone https://$GithubUsername:$GithubToken@github.com/Sense-Guard/traffic-accounting-nginx-module.git
    if [ "$IS_DEBIAN" = true ]; then
        nginx_version=$(/usr/sbin/nginx -v 2>&1 | grep -o '[0-9.]*$')
    else
        nginx_version=$(nginx -v 2>&1 | grep -o '[0-9.]*$')
    fi
    cd ~/nginx-$nginx_version/
    ./configure --with-compat --add-dynamic-module=../traffic-accounting-nginx-module/
    make -j$(nproc) modules
    sudo cp objs/ngx_http_accounting_module.so /etc/nginx/modules/
    cd ..
    rm -rf traffic-accounting-nginx-module
}

function install_sd_agent {
    # install WAF Edge API Agent
    cd ~/$EngineDirName/admin
    npm install
    npm run build
    pm2 start admin.config.js --env production
    pm2 save
    # pm2 stop 0 # it will occur nginx fails to start
}

function config_logrotate {
    echo "config_logrotate"
    # add/modify create directive in the file /etc/logrotate.d/nginx. create 0644 nginx adm
    # Refer to https://sg-ai.atlassian.net/wiki/spaces/DH/pages/6815745/M+3-3+Migration+of+ELK+stack
    sudo sed -i 's/create [0-9]* nginx adm/create 0644 nginx adm/g' /etc/logrotate.d/nginx
    if [ -f /var/log/nginx/http_accounting.log ]
    then
        sudo chmod 644 /var/log/nginx/http_accounting.log
    else
        echo "WARN: /var/log/nginx/http_accounting.log does not exist!"
    fi
}

function prepare_ca_trust {
    if [ "$IS_DEBIAN" = true ]; then
        sudo chmod o+rw -R /usr/local/share/ca-certificates/
    else
        sudo chmod o+rw -R /etc/pki/ca-trust/source/anchors/
    fi
}

is_debian
install_deps
install_keycloak_server
install_nginx
install_sqlite3
install_au_engine
download_dataset
train_model
install_gunicorn_daemon
prepare_nginx_conf_dir
generate_cert
config_nginx
install_logstash
write_logstash_cfg
install_sd_agent
install_traffic_accounting_nginx
restart_nginx
config_logrotate
prepare_ca_trust
