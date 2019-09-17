#!/bin/bash
# Must be run on the raspberry pi and not inside of the container
git -c user.name=test -c user.email=test@test.com stash
git pull
git stash pop