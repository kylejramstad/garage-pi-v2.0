#!/bin/bash

# refreshing the repositories
apt-get update

# install sudo
apt-get install sudo

# Python and pip
# This is the biggest part and takes a long time...
# Needed to install node-gyp which is needed for rpio
# Without rpio this project doesn't work
sudo apt-get -y install python2.7 python-pip

# Install tzupdate to automatically set the correct time based on geolocation of IP
# This is need for accurate time keeping in the app
sudo pip install -U tzupdate
sudo tzupdate

# Installs all modules in package.json and checks for security issues and fix them
sudo npm install
sudo npm audit fix

# Run webpack so that the bundle.js can be created
npx webpack --config webpack.config.js