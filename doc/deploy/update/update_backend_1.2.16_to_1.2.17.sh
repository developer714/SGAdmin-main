#!/bin/sh

BackendDomain="be01.sdinternal.com"
GithubUsername="David-Hang-12138"
GithubToken="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"
AdminDirName="SGAdmin"
EngineDirName="WAF-Engine"
DepsRootDir="others/"
AdminVersion="1.2.17"

# Before running this script, you will need to update the database with new email templates
# You will also need to update the SMTP credentials in the config/production.json
# Also add "frontEndUrl": "https://dashboard.sensedefence.net" in the config/production.json,
# After updating frontend, update the contact address of all email templates in SA panel.

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
    git pull
    git checkout $AdminVersion

    cd ~/$AdminDirName/admin/server/
    npm i
    pm2 restart 0
}

# The following functions must be called in sequence.
update_sd_admin
