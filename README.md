# garage-pi-v2

Control your garage door using a web application running on your Raspberry Pi.

## Setup for V2

### Wiring
You can find the [original setup instructions on howchoo](https://howchoo.com/g/yznmzmuxywu/how-to-control-your-garage-door-from-your-phone-using-a-raspberry-pi). These instructions will show you how to wire your Pi and how to install the original Garage-Pi.
**Use only for wiring instructions**

### Setup Rasbian
You can find instuctions on [How to set up your Raspberry Pi without a keyboard, monitor, or mouse on howchoo](https://howchoo.com/g/mzgzy2mwowj/how-to-set-up-raspberry-pi-without-keyboard-monitor-mouse).

### Install Garage-Pi-v2 From Repository (faster)
1. Open up a terminal
1. ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
   - default password is "raspberry"
1. Download Docker, Garage-Pi, and then run
   - ```curl -sSL https://raw.githubusercontent.com/kylejramstad/garage-pi-v2/master/scripts/download.sh | bash```
       - add parameters to this command to add more DNS alt_names
       - For example: ```curl -sSL https://raw.githubusercontent.com/kylejramstad/garage-pi-v2/master/scripts/download.sh | bash -s example.com sub.example.com```

### Building Garage-Pi-v2 From Source (longer)
1. Open up a terminal
1. ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
   - default password is "raspberry"
1. Install docker
   - ```curl -sSL https://get.docker.com | sh```
   - This will run the install script right from docker.com
1. Copy the source files to the Pi from Github
   - ```sudo git clone https://github.com/kylejramstad/garage-pi-v2.git```
1. Build the Docker Image
   - ```sudo ./garage-pi-v2/scripts/build.sh```
   - This may take some time (about 60 minutes)
       - add parameters to this command to add more DNS alt_names
       - For example: ```sudo ./garage-pi-v2/scripts/build.sh example.com sub.example.com```
   
## First Time Use and SSL/TLS Download
1. Open a web browser to https://192.168.1.1
   - Use the IP address of your Pi
1. Follow the onscreen instructions to create your first user
1. After logging in, click the setting to add users, delete users, change your password, setup your Amazon Alexa or Google Assistant, adjust the logs, and to **download and install the SSL/TLS certificate** *(This will stop those warnings when visiting the page)*

## Port Forwarding and Making Garage-Pi-v2 Public to the Internet
**This is extremely dangerous. Only do this if you understand the risks involved.**
Otherwise, you should setup a VPN in your home and tunnel into it before accessing the Garage-Pi interface page.

*You cannot use the voice assistant feature if your Pi is not accessable from the public internet.*

- [Access your Raspberry Pi over the internet](https://www.raspberrypi.org/documentation/remote-access/access-over-Internet/README.md)
  - You'll need to find your routers manual to learn how to configure port fowarding to **Port 443** on your Pi.
- [How to make your own Raspberry Pi VPN](https://howchoo.com/g/nzu3zdnjzti/raspberry-pi-vpn)

## TODO
- [ ] Add PWA components for iOS compatibility
- [ ] Allow for multiple garage door openers
- [ ] Reduce build time below 1 hour
- [ ] Timer to close garage if left open too long (allow user to set time)
- [ ] Only allow admin user to delete other users (first user is considered admin)
- [x] Show users how many logs they currently keep
- [ ] Add notifications via ifttt webhooks (auto close, open or close manually, open closed by user, left partially open)
- [x] Allow user to disable voice assistant
- [x] Create new certificates and keys automatically if installed from repository
- [x] Make download script so that user only types one line to install software
- [ ] Make it easy for users to set pins in the settings
- [ ] Make instructions on how to set up a ddns service so that users can easily access garage-pi

## Acknowledgements
* Original Garage-Pi Created by Tyler Jones at Howchoo.com and on Github
* Favicon made by Freepik from [www.flaticon.com](www.flaticon.com) is licensed by CC 3.0 BY
