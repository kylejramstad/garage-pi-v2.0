# garage-pi-v2

Control your garage door using a web application running on your Raspberry Pi.

## Setup for V2
**To use this version of Garage-Pi, you will need to be able to build from source.**

### Wiring
You can find the [original setup instructions on howchoo](https://howchoo.com/g/yznmzmuxywu/how-to-control-your-garage-door-from-your-phone-using-a-raspberry-pi). These instructions will show you how to wire your Pi and how to install the original Garage-Pi.
**Skip the instrucitons on how to install the garage-pi software. Garage-Pi-v2 does not install the same way**

### Setup Rasbian
You can find instuctions on [How to set up your Raspberry Pi without a keyboard, monitor, or mouse on howchoo](https://howchoo.com/g/mzgzy2mwowj/how-to-set-up-raspberry-pi-without-keyboard-monitor-mouse).

### Installing Docker on your Pi
1. You'll first need to ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
1. Then you will install docker
   - ```curl -sSL https://get.docker.com | sh```
   - This will run the install script right from docker.com

### Building and Running the Garage-Pi-v2 Image
1. You'll need to download the source files from Github and unzip them into a directory on your computer
1. Open up a terminal
1. Copy the source files to the Pi
   - ```sudo scp -r ./garage-pi-v2.0 pi@192.168.1.1:/home/pi/code/```
   - Use the IP address of your Pi
1. ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
1. Go into your code folder
   - ```cd /home/pi/code/```
1. Build the Docker Image
   - ```sudo docker build .```
   - **Do not miss the . (dot) at the end of that command**
   - This may take some time (about 30 minutes)
   - It should end in saying something similar to **"Successfully built 92e73e14e9a0"**
   - The random numbers and characters at the end is the name of the image
1. Run the image
   - ```sudo docker run --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 -d 92e73e14e9a0```
   - **Use the name of the image you built in the command above**
   
### First Time Use and SSL/TLS Download
1. Open a web browser to https://192.168.1.1
   - Use the IP address of your Pi
1. Follow the onscreen instructions to create your first user
1. After logging in, click the setting to add users, delete users, change your password, setup your Amazon Alexa or Google Assistant, adjust the logs, and to **download and install the SSL/TLS certificate** *(This will stop those warnings when visiting the page)*

### Port Forwarding and Making Garage-Pi-v2 Public to the Internet
**This is extremely dangerous. Only do this if you understand the risks involved.**
Otherwise, you should setup a VPN in your home and tunnel into it before accessing the Garage-Pi interface page.

*You cannot use the voice assistant feature if your Pi is not accessable from the public internet.*

- [Access your Raspberry Pi over the internet](https://www.raspberrypi.org/documentation/remote-access/access-over-Internet/README.md)
  - You'll need to find your routers manual to learn how to configure port fowarding to **Port 443** on your Pi.
- [How to make your own Raspberry Pi VPN](https://howchoo.com/g/nzu3zdnjzti/raspberry-pi-vpn)

## TODO
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
- [ ] Add PWA components for iOS compatibility
- [ ] Allow for multiple garage door openers
- [ ] Add instructions on how to change SSL/TLS Cert to match the user's IP address
- [ ] Add "open" or "close" to logs


## Acknowledgements
* Original Garage-Pi Created by Tyler Jones at Howchoo.com and on Github
* Favicon made by Freepik from [www.flaticon.com](www.flaticon.com) is licensed by CC 3.0 BY
