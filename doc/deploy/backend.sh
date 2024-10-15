#!/bin/bash

BackendDomain="pomb.sdinternal.com"
GithubUsername="Binary-Vanguard-12138"
GithubToken="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"
AdminDirName="SGAdmin"
EngineDirName="WAF-Engine"
DepsRootDir="others/"

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
        # Update package list and upgrade all packages
        sudo apt update -y
        sudo apt upgrade -y
        # Install required packages
        sudo apt install -y git vim python3 python3-pip python3-dev mc wget net-tools
        # Install build-essential package group for development tools
        sudo apt install -y build-essential
        # Install Apache and development libraries
        sudo apt install -y libpcre3 libpcre3-dev libxml2 libxml2-dev libcurl4-openssl-dev openssl libssl-dev libsodium-dev
        # Install Node.js and npm
        sudo apt install -y nodejs npm
    else
        sudo yum -y update
        sudo yum install -y epel-release git vim python3 python3-pip python3-devel mc wget net-tools
        sudo yum groupinstall -y "Development Tools"
        sudo yum install -y httpd httpd-devel pcre pcre-devel libxml2 libxml2-devel curl curl-devel openssl openssl-devel libsodium libsodium-devel
        sudo yum install -y nodejs npm
    fi
    sudo npm install -g pm2

    pm2 # Run pm2 for the first time, banner will be removed after the 1st time
    # do the indications of pm2 startup
    readarray -t lines <<<"$(pm2 startup)"
    ${lines[2]}
}

function checkout_latest_release {
    # Get new tags from remote
    git fetch --tags

    # Get latest tag name
    latestTag=$(git describe --tags `git rev-list --tags --max-count=1`)

    # Checkout latest tag
    git checkout $latestTag
}

function install_yajl {
    # install yajl
    cd ~/$EngineDirName/$DepsRootDir/yajl
    checkout_latest_release
    if [ "$IS_DEBIAN" = true ]; then
        sudo apt install ruby cmake -y
    else
        sudo yum install ruby cmake -y
    fi
    ./configure
    make -j$(nproc) && sudo make install
    cd ..
}

function install_geoip {
    # install geoip
    cd ~/$EngineDirName/$DepsRootDir/geoip-api-c
    checkout_latest_release
    ./bootstrap
    ./configure
    make -j$(nproc) && sudo make install
    cd ..
}

function install_libmaxminddb {
    # install libmaxminddb
    cd ~/$EngineDirName/$DepsRootDir/libmaxminddb
    checkout_latest_release
    git submodule init
    git submodule update
    ./bootstrap
    ./configure
    make -j$(nproc) && make check -j$(nproc)
    sudo make install
    sudo ldconfig
    cd ..
}

function install_libsodium {
    #install libsodium for captcha module
    cd ~/$EngineDirName/$DepsRootDir/libsodium
    checkout_latest_release

    ./autogen.sh
    ./configure --prefix=/usr/local/libsodium --with-pic
    make -j$(nproc)
    make check -j$(nproc)
    sudo make install
}

function install_waf_engine {
    # install WAF-Engine for rules-check tool
    cd ~
    if [ -d $EngineDirName ]
    then
        echo "WAF-Engine directory already exists"
    else
        git clone -b v3/master --single-branch https://$GithubUsername:$GithubToken@github.com/Sense-Guard/WAF-Engine.git
    fi
    cd ~/$EngineDirName/
    git submodule init
    git submodule update
    install_yajl
    # install_geoip
    install_libmaxminddb
    install_libsodium
    cd ~/$EngineDirName/
    ./build.sh
    if [ "$IS_DEBIAN" = true ]; then
        ./configure --with-yajl=/usr/local --with-maxmind=/usr/local --with-sodium=/usr/local/libsodium CPPFLAGS="-I/usr/include/python3.11" LDFLAGS="-L/usr/lib64" LIBS="-lpython3.11"
    else
        ./configure --with-yajl=/usr/local --with-maxmind=/usr/local --with-sodium=/usr/local/libsodium CPPFLAGS="-I/usr/include/python3.6m" LDFLAGS="-L/usr/lib64" LIBS="-lpython3.6m"
    fi
    make -j$(nproc) && sudo make install
    cd ~
    rm -rf $EngineDirName
}

function install_nginx {
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
    cd ~/$AdminDirName/admin/server/
    npm i

    pm2 start server.config.js --env production
    pm2 save
    # pm2 stop 0 # it will occur nginx fails to start

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
    cert_dir=/etc/nginx/sites-available/$BackendDomain/certs
    if [ ! -d $cert_dir ]
    then
        sudo mkdir -p $cert_dir
    fi

    cd $cert_dir
    sudo openssl genrsa -out privkey.pem 4096
    IFS="."; read -ra strarr <<< "$BackendDomain"
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
    sudo chown -R $username /etc/nginx/sites-available/$BackendDomain/
}

function config_nginx {
    cat <<EOF > ~/$BackendDomain.conf
server {
    listen 80;
    listen 443 ssl http2;
    server_name $BackendDomain;
    root /usr/share/nginx/html/;
    index index.html index.htm;
    ssl_certificate /etc/nginx/sites-available/$BackendDomain/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/sites-available/$BackendDomain/certs/privkey.pem;

    location / {
        proxy_pass http://localhost:5000/;
        proxy_set_header X-Forwarded-Host \$host;
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
    sudo mv -f ~/$BackendDomain.conf /etc/nginx/sites-available/$BackendDomain.conf
    username=$(whoami)
    sudo chown $username /etc/nginx/sites-available/$BackendDomain.conf

    if [ -f /etc/nginx/sites-enabled/$BackendDomain.conf ]
    then
        sudo unlink /etc/nginx/sites-enabled/$BackendDomain.conf
    fi
    sudo ln -s /etc/nginx/sites-available/$BackendDomain.conf /etc/nginx/sites-enabled/$BackendDomain.conf

    if [ "$IS_DEBIAN" = false ]; then
        sudo setsebool -P httpd_can_network_connect 1
        sudo setsebool -P httpd_enable_homedirs 1
        sudo setenforce 0
    fi

    # add include /etc/nginx/sites-enabled/*.conf; directive in the nginx.conf file
    # remove original /etc/nginx/sites-enabled/*.conf;
    # replace include /etc/nginx/conf.d/*.conf; with include /etc/nginx/conf.d/*.conf; include /etc/nginx/sites-enabled/*.conf;
    sudo sed -i 's/server_names_hash_bucket_size\s*[0-9]*;//g; s/#\s*include \/etc\/nginx\/sites-enabled\/\*\.conf;//g; s/include \/etc\/nginx\/sites-enabled\/\*\.conf;//g; s/include \/etc\/nginx\/conf\.d\/\*\.conf\;\s*\n*/include \/etc\/nginx\/conf\.d\/\*\.conf\;\n    include \/etc\/nginx\/sites-enabled\/\*\.conf\;\n    server_names_hash_bucket_size  128;/g' /etc/nginx/nginx.conf
}

function prepare_ca_trust {
    if [ "$IS_DEBIAN" = true ]; then
        sudo chmod o+rw -R /usr/local/share/ca-certificates/
    else
        sudo chmod o+rw -R /etc/pki/ca-trust/source/anchors/
    fi
}

function restart_nginx {
    sudo systemctl restart nginx
}

# The following functions must be called in sequence.
is_debian
install_deps
install_nginx
# install_waf_engine
install_sd_admin
prepare_nginx_conf_dir
generate_cert
config_nginx
prepare_ca_trust
restart_nginx
