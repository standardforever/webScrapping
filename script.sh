#!/bin/bash

# Install dependencies
apt-get install sudo
sudo apt-get update
sudo apt-get install -yq wget gnupg ca-certificates
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt-get update
sudo apt-get install -yq google-chrome-stable

# Install Node.js
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt-get install -yq nodejs

# Set up Puppeteer configuration
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install project dependencies
cd /path/to/your/project
npm install


