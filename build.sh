#!/bin/bash
cd ./ssl
sudo ./create.sh $1 $2 $3 $4 $5 $6 $7 $8
cd ..
sudo docker build -t bugman000/garage-pi-v2 .
sudo docker run --restart=always --device=/dev/mem:/dev/mem --name=garage-pi --privileged --publish 443:443 -d bugman000/garage-pi-v2
(sudo crontab -l 2>/dev/null; echo "* 3 * * * sudo docker exec garage-pi /bin/bash /code/update.sh && sudo docker container restart garage-pi") | sudo crontab -