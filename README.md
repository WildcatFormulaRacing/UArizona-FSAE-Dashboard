# UArizona-FSAE-Dashboard

This repository contains the dashboard software for the University of Arizona Wildcat Formula Racing Team

![demo](https://user-images.githubusercontent.com/50720185/138546363-ae7a3a3d-7110-40ea-8543-fcc20cae0525.gif)

# Getting Started
This package is intended to be ran on a Raspberry Pi (arm based) running some "lite" version of Raspberry Pi OS (this is what the setup script assumes). To get started, first clone the repository:
```
git clone https://github.com/WildcatFormulaRacing/UArizona-FSAE-Dashboard.git
```
Then move into the directory and run the setup script which will guide you through the rest of the installation (<ins>must be ran as root</ins>):
```
cd ./UArizona-FSAE-Dashboard/setup/
sudo sh ./setup.sh
```
After this script has been ran, the dashboard will launch automatically on boot but can be explicitly invoked via:
```
sh /home/pi/launch-dash.sh
```

# Development Quick Start
This is a quick start guide for developing this project, for a more comprehensive guide of how this package works see our <ins>full development guide</ins> (coming soon).

To get started, fork this repository and clone it locally. For any changes/features you made and want merged, simply just create a pull request and we'll get it implemented! (If you have explicit push access to this repo make a branch for your feature/change). 

There are two main folders in this repo, "setup" is used for storing everything related to getting this program running on a Raspberry Pi (shell scripts, services, cronjobs, etc...), and "dashboard", which is the actual application.
## Dashboard Development
As stated above, the "dashboard" folder contains the unbuilt Electron project. The only prerequisite for developing is Node.js, we recommend `Node.js v14.17.6`. 

You will first need to install all of the node modules. From the root folder,
change your directory to the dashboard folder:
```
cd dashboard/
```
then install the node modules using npm
```
npm install
```
After installation, the app can be ran in development mode via:
```
npm start
```
### Developing on Different Operating Systems
A couple things to note for developing on different operating systems. In Windows, if you are plugging in an Arduino as a mock ECU the port constant will need to be changed to `COM3` or represents whichever port your serial device is plugged into (you can see the serial devices in Device Manager), the default is currently:
```
const PORT = "COM3";
```


For Unix based systems (MacOS, Linux) this constant will need to be changed to something of the pattern `/dev/tty[serialport]`. For example on the Raspberry Pi the port constant is set as:
```
const PORT = "/dev/ttyACM0";
```
You can see which serial devices in the `/dev/` folder:
```
ls /dev/tty*
```

### Building
You are able compile the project into an executable by running:
```
npm run make
```
<ins>**The app must be built on the system that it is going to be run on**</ins>. Because the dashboard is running on a Raspberry Pi, `npm run make` must be ran on the Pi itself. It will produce an `out/` folder from which you can install the application.

On the Raspberry Pi the `deb` package can be installed using `dpkg`:
```
sudo dpkg -i [.deb file in the out folder]
```

## Raspberry Pi Development
As stated above, the "setup" folder contains everything Raspberry Pi, currently there are a couple of items in there:
### [setup.sh](./setup/setup.sh)
This is a Shell script for installing the dashboard application and all the related setup needed. Any additional prerequisite packages should be added here for installation, and any time a new built package is released the installation link should be changed here as well.

### [prefligh-dash.sh](./setup/preflight-dash.sh)
A Shell script for initializing the dashboard environment, anything that needs to be started prior to dashboard launch should be executed here.

### [launch-dash.sh](./setup/launch-dash.sh)
A Shell script for starting the application. This should be kept bare, it is only used by systemd to invoke the application.

### [dashboard.service](./setup/dashboard.service)
A systemd service for starting the dashboard on boot, invokes `launch-dash.sh`.
