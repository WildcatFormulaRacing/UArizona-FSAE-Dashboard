#!/bin/bash

### This script should be used to package and build the dashboard application
### I've had way too many problems using electrons built-in build system so
### we should avoid using it and use this one instead.
### @NOTE this needs to be ran as root because it installs an app

# check for root permissions
if [ "$EUID" -ne 0 ]
then
    echo "Script must be ran as root!"
    exit
fi

# check to see if the build tool is installec
if ! command -v electron-installer-debian &> /dev/null
then
    echo "electron-installer-debian not installed, running npm to install it"
    sudo npm install -g electron-installer-debian
fi

# everythings installed lets package the app
echo "packaging the application"
# move to the src directory
cd ../dashboard/
# package the app
npm run build

# this builds the application in ./out/dashboard-linux-armv7l
echo "app built building into .deb"
electron-installer-debian --src ./out/dashboard-linux-armv7l/ --dest /home/pi/deb/ --arch armhf

echo "App build at /home/pi/deb/"