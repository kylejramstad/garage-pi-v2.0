#!/bin/bash
#To be run by user that just wants to download the docker container
read -p 'Enter your DDNS Domain (e.g. garage-example.dynu.net): ' d
read -p 'Enter your email address (this is sent to LetsEncrypt only): ' e
curl -sSL https://get.docker.com | sh
sudo docker run -v /etc/timezone:/etc/timezone --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 --publish 80:80 -d bugman000/garage-pi-v2
sudo docker exec -i garage-pi certbot certonly --webroot -w /code/tls -n --domains $d --agree-tos --email $e
sudo docker exec -i garage-pi sudo rm /code/tls/fullchain.pem
sudo docker exec -i garage-pi sudo rm /code/tls/privkey.pem
sudo docker exec -i garage-pi ln -s /etc/letsencrypt/live/$d/fullchain.pem /code/tls/fullchain.pem
sudo docker exec -i garage-pi ln -s /etc/letsencrypt/live/$d/privkey.pem /code/tls/privkey.pem
sudo crontab -l 2>/dev/null; echo -e  "0 2 * * 3 sudo docker exec -t garage-pi /code/scripts/update.sh && sudo docker container restart garage-pi >/dev/null 2>&1\n*/5 * * * * ~/dynudns/dynu.sh >/dev/null 2>&1" | sudo crontab -
sudo docker container restart garage-pi