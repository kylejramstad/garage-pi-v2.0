#!/bin/bash
# Get latest code from github
git -c user.name=test -c user.email=test@test.com stash
git pull
git stash pop

# Installs all modules in package.json and checks for security issues and fix them
sudo npm install
sudo npm audit fix

# Run webpack so that the bundle.js can be created
npx webpack --config webpack.config.js