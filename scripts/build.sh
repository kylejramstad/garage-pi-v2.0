#!/bin/bash
cd ./garage-pi-v2/ssl
ip=$(host myip.opendns.com 208.67.220.222 | grep -oP "^myip\.opendns\.com.* \K(\d{1,3}\.){3}(\d{1,3})")
sudo ./create.sh $ip $1 $2 $3 $4 $5 $6 $7
cd ..
sudo docker build -t bugman000/garage-pi-v2 .
sudo docker run --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 -d bugman000/garage-pi-v2
#(sudo crontab -l 2>/dev/null; echo "* 3 * * * sudo docker exec garage-pi /bin/bash /code/scripts/update.sh && sudo docker container restart garage-pi") | sudo crontab -