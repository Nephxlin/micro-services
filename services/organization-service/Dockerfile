FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src

RUN npm install
RUN npm run build

EXPOSE 8003

CMD ["npm", "start"]