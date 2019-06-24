# arm32v7/node:11-slim is used because hypriot/rpi-node is deprecated
# Node v11 is used because rpio is not yet working with node v12
# Slim is used to keep the size of the image as small as possible
FROM arm32v7/node:11-slim

# This is where the garage-pi code will be placed
RUN mkdir /code
WORKDIR /code

# refreshing the repositories
RUN apt-get update

# install sudo
RUN apt-get install sudo

# Python and pip
# This is the biggest part and takes a long time...
# Needed to install node-gyp which is needed for rpio
# Without rpio this project doesn't work
RUN sudo apt-get -y install python2.7 python-pip

# Install tzupdate to automatically set the correct time based on geolocation of IP
# This is need for accurate time keeping in the app
RUN sudo pip install -U tzupdate
RUN sudo tzupdate

# Copy over the package.json
COPY package.json /code

# Installs all modules in package.json
RUN sudo npm install

# Copy over everything into the container
COPY . /code

# Run webpack so that the bundle.js can be created
RUN npx webpack --config webpack.config.js

# Create new self-signed certs
RUN openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.cer -config ssl/req.cnf -sha256

# Expose the port
# The app listens at port 443
EXPOSE 443
CMD ["npm", "start"]