#!/bin/bash
#To be run by a user building the docker container
print_help () {
	echo "usage: build.sh [options]"
	echo "	options:"
	echo "		-d, --distro		Create a Garage-Pi-v2 image for distribution"
	echo "		-h, --help		Display this help message"
	echo "		-s, --setup		Setup Garage-Pi-v2"
	echo "		-n, --no-cert		Setup Garage-Pi-v2 without certificates"
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
	sudo docker exec garage-pi crontab /etc/cron.d/certbot
	sudo crontab -l 2>/dev/null; echo -e  "0 2 * * 3 sudo docker exec -t garage-pi /code/scripts/update.sh && sudo docker container restart garage-pi >/dev/null 2>&1" | sudo crontab -
	sudo docker container restart garage-pi
}

verify (){
	read -p "Are you sure?" -n 1 -r
	echo    # (optional) move to a new line
	if [[ ! $REPLY =~ ^[Yy]$ ]]
		then
			[[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
	fi
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
		verify
		build
		exit 0
fi

if [ "$1" == "--setup" ] || [ "$1" == "-s" ]
	then
		verify
		read -p 'Enter your DDNS Domain (e.g. garage-example.dynu.net): ' d
		read -p 'Enter your email address (this is sent to LetsEncrypt only): ' e
		build
		setup
		exit 0
fi

if [ "$1" == "--no-cert" ] || [ "$1" == "-n" ]
	then
		echo "You will have to import your own certs to the docker containers /code/tls folder"
		verify
		build
		sudo docker run -v /etc/timezone:/etc/timezone --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 --publish 80:80 -d bugman000/garage-pi-v2
		exit 0
fi