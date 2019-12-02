# arm32v7/node:11-slim is used because hypriot/rpi-node is deprecated
# Node v11 is used because rpio is not yet working with node v12
# Slim is used to keep the size of the image as small as possible
FROM arm32v7/node:11-slim

# This is where the garage-pi code will be placed
RUN mkdir /code
WORKDIR /code

# Copy over everything into the container
COPY . /code

# Install
RUN ./scripts/install.sh

CMD ["npm", "start"]