# garage-pi-v2

Control your garage door using a web application running on your Raspberry Pi.

## Compatibility
### Hardware
- [x] Raspberry Pi 2 Model B 
- [x] Raspberry Pi  2 Model B v1.2 
- [x] Raspberry Pi 3 Model B
- [x] Rasberry Pi 3 Model B+
- [x] Rasberry Pi 4 Model B

### Rasbian Version
- [x] Stretch
- [x] Buster


## Setup for V2

### Wiring
You can find the [original setup instructions on howchoo](https://howchoo.com/g/yznmzmuxywu/how-to-control-your-garage-door-from-your-phone-using-a-raspberry-pi). These instructions will show you how to wire your Pi and how to install the original Garage-Pi.
**Use only for wiring instructions**

   - The open sensor, close sensor, and relay can be wired to the following physical pins:
       - 3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 29, 31, 32, 33, 35, 36, 37, 38, 40.
       - These are physical pins of the Raspberry Pi
![alt text](https://www.bigmessowires.com/wp-content/uploads/2018/05/Raspberry-GPIO.jpg "Physical Pinout Diagram")

### Setup Rasbian
You can find instuctions on [How to set up your Raspberry Pi without a keyboard, monitor, or mouse on howchoo](https://howchoo.com/g/mzgzy2mwowj/how-to-set-up-raspberry-pi-without-keyboard-monitor-mouse).

### Setup DDNS Service
**This is extremely dangerous. Only do this if you understand the risks involved.**
1. Go to a DDNS service provider [Dynu.com](https://www.dynu.com) is recommended
1. Create a dynamic DNS domain with the provider
   - Make sure you link the domain to your IPv4 and/or IPv6 address [whatismyipaddress.com](https://whatismyipaddress.com/)
1. This domain will be used to access your garage and during the installation process
1. Make sure that if your IP address changes that dynu.com updates the DDNS record
   - Follow the instructions here [https://www.dynu.com/DynamicDNS/IPUpdateClient/RaspberryPi-Dynamic-DNS](https://www.dynu.com/DynamicDNS/IPUpdateClient/RaspberryPi-Dynamic-DNS)

### Port Forwarding
**This will make your network visible to the public internet.**
**Make sure you have correctly configured your router and any firewalls.**
- [Access your Raspberry Pi over the internet](https://www.raspberrypi.org/documentation/remote-access/access-over-Internet/README.md)
  - You'll need to find your routers manual to learn how to configure port fowarding to **Port 443 and Port 80** on your Pi.
**You need to forward external ports 443 and 80 to internal ports 443 and 80 respectively**

### Install Garage-Pi-v2 From Repository (faster)
1. Open up a terminal
1. ssh into your Pi
   - ```ssh pi@192.168.1.1```
   - Use the IP address of your Pi
   - default password is "raspberry"
1. Download Docker & Garage-Pi by running
   - ```curl -sSL https://raw.githubusercontent.com/kylejramstad/garage-pi-v2/master/scripts/download.sh | bash```

### Building Garage-Pi-v2 From Source (longer)
**Don't do this step if you installed Garage-Pi-v2 from repository**
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
   - ```sudo ./garage-pi-v2/scripts/build.sh --setup```
   - This may take some time (about 60 minutes)
   
## First Time Use
1. Open a web browser to the domain you setup
   - You should notice that a http address should redirect to a https address
1. Follow the onscreen instructions to create your first user
1. After logging in, click the setting to add users, delete users, change your password, setup your Amazon Alexa or Google Assistant, adjust the logs, etc.


## TODO
- [ ] Only allow admin user to delete other users (first user is considered admin)
- [ ] Add PWA components for iOS compatibility
- [ ] Allow for multiple garage door openers
- [ ] Change Log to Calendar View for easier viewing of logs
- [ ] Keep logs by the day/week/month
- [ ] Consider logs be kept in database if there are going to be so much more of them

## Acknowledgements
* Original Garage-Pi Created by Tyler Jones at Howchoo.com and on Github
* Favicon made by Freepik from [www.flaticon.com](www.flaticon.com) is licensed by CC 3.0 BY
