FROM node:18-alpine

WORKDIR /app

# Install dependencies required for Prisma
RUN apk add --no-cache \
    openssl \
    libc6-compat

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"] 