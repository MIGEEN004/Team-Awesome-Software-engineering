FROM node:20

WORKDIR /usr/src/app

# Copy package files and install dependencies first
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]