#FROM node:18-alpine
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install nodemon for dev hot reload
RUN npm install -g nodemon

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
