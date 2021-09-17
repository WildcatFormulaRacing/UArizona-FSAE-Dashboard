#!/bin/bash

# install all utils
sudo apt update # this might require explicit consent to install
sudo apt upgrade -y
# vim is optional here but extremely highly recommended
sudo apt-get install xserver-xorg xinit matchbox-window-manager git vim -y

# dependencies needed for the actual executable
sudo apt install kde-cli-tools kde-runtime trash-cli libglib2.0-bin gvfs-bin rpm -y

# uncomment if building on the pi
echo "Do you want to install node, only needed if you are building? [Y,n]"
read input
if [[ $input == "Y" || $input == "y" ]]; then
        echo "Installing Node"
        wget https://nodejs.org/dist/v14.17.6/node-v14.17.6-linux-armv7l.tar.xz
        tar -xzf node-v14.17.6-linux-armv7l.tar.xz
        sudo cp -R node-v14.16.6-linux-armv7l/* /usr/local
        
        # verify
        if ! command -v <the_command> &> /dev/null
        then
            echo -e "\033[0;31mUNSUCCESSFUL NODE INSTALL, MUST INSTALL MANUALLY"
        fi
else
        echo "Skipping Node installation"
fi

###### Service Installation #######
# download the executable
# @TODO change to be up to date with current release
echo "Downloading latest release"
wget https://github.com/WildcatFormulaRacing/UArizona-FSAE-Dashboard/releases/download/v1.0.0-alpha/dash-type_1.0.0-alpha_armhf.deb
echo "Installing dashboard"
# install the package
sudo dpkg -i dash-type_1.0.0-alpha_armhf.deb

echo "Creating systemd service"
# move the launch script
sudo mv ./launch-dash.sh /home/pi/

# move the service file
sudo mv ./dashboard-service /lib/systemd/system/
sudo chmod 644 /lib/systemd/system/dashboard-service

# enable the service
sudo systemctl daemon-reload
sudo systemctl enable dashboard-service.service

echo "Systemd service created, application will launch on boot"