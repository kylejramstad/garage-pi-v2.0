# Slim is used to keep the size of the image as small as possible
FROM arm32v7/node:19-buster-slim

# This is where the garage-pi code will be placed
RUN mkdir /code
WORKDIR /code

# Copy over everything into the container
COPY . /code

# Install
RUN ./scripts/install.sh

CMD ["npm", "start"]