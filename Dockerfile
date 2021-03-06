FROM node:current-alpine
WORKDIR /usr/src/app

ENV NODE_ENV production

ENV TZ Europe/Rome

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]