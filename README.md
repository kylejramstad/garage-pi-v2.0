# garage-pi-v2

Control your garage door using a web application running on your Raspberry Pi.

## Setup for V2
**It is recommended you build from source**

### Wiring
You can find the [original setup instructions on howchoo](https://howchoo.com/g/yznmzmuxywu/how-to-control-your-garage-door-from-your-phone-using-a-raspberry-pi). These instructions will show you how to wire your Pi and how to install the original Garage-Pi.
**Skip the instrucitons on how to install the garage-pi software. Garage-Pi-v2 does not install the same way**

### Setup Rasbian
You can find instuctions on [How to set up your Raspberry Pi without a keyboard, monitor, or mouse on howchoo](https://howchoo.com/g/mzgzy2mwowj/how-to-set-up-raspberry-pi-without-keyboard-monitor-mouse).

### Installing Docker on your Pi
1. You'll first need to ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
   - default password is "raspberry"
1. Then install docker
   - ```curl -sSL https://get.docker.com | sh```
   - This will run the install script right from docker.com

### Install Garage-Pi-v2 From Repository (faster)
1. Open up a terminal
1. ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
   - default password is "raspberry"
1. Download and run
   - ```sudo docker run --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 -d bugman000/garage-pi-v2```
1. **This pre-built image has SSL/TLS certificates and keys that are common for everyone that has downloaded this image! DO NOT SKIP THIS STEP! Otherwise other people will have your servers keys!**
   - ```sudo docker exec garage-pi /bin/bash /code/create.sh```
      - add parameters to this command to add more DNS alt_names
      - For example: ```sudo docker exec garage-pi /bin/bash /code/create.sh **example.com sub.example.com**```
1. Restart your server
   - ```sudo docker container restart garage-pi```
1. Add update script
   - ```(sudo crontab -l 2>/dev/null; echo "* 3 * * * sudo docker exec garage-pi /bin/bash /code/update.sh && sudo docker container restart garage-pi") | sudo crontab -```
   - **This allows Garage-Pi to update itself at 3am every night**

### Building Garage-Pi-v2 From Source (longer)
1. Open up a terminal
1. ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
   - default password is "raspberry"
1. Copy the source files to the Pi from Github
   - ```sudo git clone https://github.com/kylejramstad/garage-pi-v2.git```
1. Build the Docker Image
   - ```sudo ./garage-pi-v2/build.sh```
   - This may take some time (about 60 minutes)
       - add parameters to this command to add more DNS alt_names
       - For example: ```sudo ./garage-pi-v2/build.sh example.com sub.example.com```
   
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

## [TODO]
- [x] Continually update React components so users can see up to date sensor readings
- [x] Add secure login using JavaScript Crypto with SHA512 hashes
- [x] Add SSL/TLS self-signed certificate and instruction on how to install on machine
- [x] Add multiple users, user deletion, password change
- [x] Add Voice Assistance user
- [x] Logs
- [x] Add settings page
- [x] Add license
- [x] Add favicon
- [x] Delete SASS and convert to CSS since we we're using anything special to SASS
- [x] Style the pages using some new CSS (make it look pretty)
- [x] Add some basic PWA components for android phones
- [x] Users have a log of when the garage opens from pressing the garage button.
- [x] Add "open" or "close" to logs
- [x] Add setting to delete logs
- [x] Add "open" or "close" to logs
- [x] Add instructions on how to change SSL/TLS Cert to match the user's IP address
- [ ] Add PWA components for iOS compatibility
- [ ] Allow for multiple garage door openers
- [ ] Reduce build time below 1 hour
- [ ] Timer to close garage if left open too long (allow user to set time)
- [ ] Only allow admin user to delete other users (first user is considered admin)
- [x] Show users how many logs they currently keep
- [ ] Add notifications via ifttt webhooks (auto close, open or close manually, open closed by user, left partially open)
- [ ] Allow user to disable voice assistant
- [ ] Create new certificates and keys automatically if installed from repository
- [ ] Make download script so that user only types one line to install software

## Acknowledgements
* Original Garage-Pi Created by Tyler Jones at Howchoo.com and on Github
* Favicon made by Freepik from [www.flaticon.com](www.flaticon.com) is licensed by CC 3.0 BY
