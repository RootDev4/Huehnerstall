#!/bin/bash

# Update and install prerequisites
apt update && apt upgrade -y
apt install curl gcc g++ make python3-pip -y

#
pip3 install Adafruit_DHT gpiozero

# Download and install NodeJS and NPM
curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
apt install nodejs -y

# Upgrade to the latest version of NPM
npm install -g npm@latest

# Test NodeJS installation
echo -e "\nInstallation finished."
echo "NodeJS version: $(node -v)"
echo "NPM version: $(npm -v)"