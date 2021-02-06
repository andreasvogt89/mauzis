FROM node:14.15.4

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
CMD [ "node", "src/index.js" ]