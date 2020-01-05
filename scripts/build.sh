#!/bin/bash
cd ./garage-pi-v2
sudo docker build -t bugman000/garage-pi-v2 .

if [ "$1" != "distro" ]
	then
		sudo docker run --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 --publish 80:80 -d bugman000/garage-pi-v2
		sudo docker exec -i garage-pi certbot certonly --webroot -w /code/tls -n --domains $1 --agree-tos --email $2
		sudo docker exec -i garage-pi sudo rm /code/tls/fullchain.pem
		sudo docker exec -i garage-pi sudo rm /code/tls/privkey.pem
		sudo docker exec -i garage-pi ln -s /etc/letsencrypt/live/$1/fullchain.pem /code/tls/fullchain.pem
		sudo docker exec -i garage-pi ln -s /etc/letsencrypt/live/$1/privkey.pem /code/tls/privkey.pem
		sudo crontab -l > garage-pi-cron && echo "0 2 * * 3 sudo docker exec -t garage-pi /code/scripts/update.sh && sudo docker container restart garage-pi >/dev/null 2>&1" >> garage-pi-cron && sudo crontab garage-pi-cron && sudo rm garage-pi-cron
		sudo docker container restart garage-pi
fi