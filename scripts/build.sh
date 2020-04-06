#!/bin/bash
print_help () {
	echo "usage: build.sh [options]"
	echo "	options:"
	echo "		-d, --distro	Create a Garage-Pi-v2 image for distribution"
	echo "		-h, --help	Display this help message"
	echo "		-s, --setup	Setup Garage-Pi-v2"
}

build (){
	cd ./garage-pi-v2
	sudo docker build -t bugman000/garage-pi-v2 .
}

setup (){
	sudo docker run -v /etc/timezone:/etc/timezone --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 --publish 80:80 -d bugman000/garage-pi-v2
	sudo docker exec -i garage-pi certbot certonly --webroot -w /code/tls -n --domains $d --agree-tos --email $e
	sudo docker exec -i garage-pi sudo rm /code/tls/fullchain.pem
	sudo docker exec -i garage-pi sudo rm /code/tls/privkey.pem
	sudo docker exec -i garage-pi ln -s /etc/letsencrypt/live/$d/fullchain.pem /code/tls/fullchain.pem
	sudo docker exec -i garage-pi ln -s /etc/letsencrypt/live/$d/privkey.pem /code/tls/privkey.pem
	sudo crontab -l 2>/dev/null; echo -e  "0 2 * * 3 sudo docker exec -t garage-pi /code/scripts/update.sh && sudo docker container restart garage-pi >/dev/null 2>&1\n*/5 * * * * ~/dynudns/dynu.sh >/dev/null 2>&1" | sudo crontab -
	sudo docker container restart garage-pi
}

if [ $# -eq 0 ]
	then
    	print_help
		exit 0
fi

if [ "$1" == "--help" ] || [ "$1" == "-h" ]
	then
		print_help
		exit 0
fi

if [ "$1" == "-distro" ] || [ "$1" == "-d" ]
	then
		build
		exit 0
fi

if [ "$1" == "--setup" ] || [ "$1" == "-s" ]
	then
		read -p 'Enter your DDNS Domain (e.g. garage-example.dynu.net): ' d
		read -p 'Enter your email address (this is sent to LetsEncrypt only): ' e
		build
		setup
		exit 0
fi