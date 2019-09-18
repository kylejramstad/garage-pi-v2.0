#!/bin/bash
cd ..
git -c user.name=test -c user.email=test@test.com stash
git pull
git stash pop