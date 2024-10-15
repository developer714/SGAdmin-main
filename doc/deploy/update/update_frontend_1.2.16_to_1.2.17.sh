#!/bin/sh

FrontendDomain="dashboard.sensedefence.net"
PrimaryBackendDomain="pomb.sdinternal.com"
LBBackendDomain="backend.sdinternal.com"
GithubUsername="David-Hang-12138"
GithubToken="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"
AdminDirName="SGAdmin"
AdminVersion="1.2.17"

function update_sd_admin {
    # Update SGAdmin
    cd ~
    if [ -d $AdminDirName ]
    then
        echo "SGAdmin directory already exists"
        cd $AdminDirName
        # Update github token
        git remote set-url origin https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$AdminDirName.git
        git remote set-url --push origin https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$AdminDirName.git
    else
        git clone https://$GithubUsername:$GithubToken@github.com/Sense-Guard/$AdminDirName.git
    fi

    cd ~/$AdminDirName/
    git checkout main
    git checkout -- .
    git pull
    git checkout $AdminVersion

    cd ~/$AdminDirName/admin/client/

    npm i
    npm run build

    sudo rm -rf /var/www/html/admin/build/
    sudo cp -r build/ /var/www/html/admin/
    cd ..
}

# The following functions must be called in sequence.
update_sd_admin
