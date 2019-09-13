#!/bin/bash
cd ./ssl
sudo ./create.sh $1 $2 $3 $4
cd ..
sudo docker build .
