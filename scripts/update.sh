#!/bin/bash
# Get latest code from github
sudo git fetch --all && git reset --hard origin/master

# Move CertBot Certs back because git just downloaded the localhost temp certs
# Remove localhost certs
sudo rm /code/tls/fullchain.pem
sudo rm /code/tls/privkey.pem 

#Find directory with keys and cert and link to them
for d in /etc/letsencrypt/live/*/ ; do
    sudo ln -s $d/fullchain.pem /code/tls/fullchain.pem
	sudo ln -s $d/privkey.pem /code/tls/privkey.pem
done

# Installs all new modules in package.json and checks for security issues and fix them
sudo npm install
sudo npm update
sudo npm audit fix

# Run webpack so that the bundle.js can be created if needed
sudo npx webpack --config webpack.config.js