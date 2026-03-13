FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash libc6-compat

COPY app/package.json app/package-lock.json ./

RUN npm install

EXPOSE 3010

# CMD ["npm", "run", "start:dev"]

