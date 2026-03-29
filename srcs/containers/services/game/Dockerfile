# FROM node:20-alpine

# WORKDIR /app

# RUN apk add --no-cache bash libc6-compat

# COPY app/package.json app/package-lock.json ./

# RUN npm install

# EXPOSE 3010

# CMD ["npm", "run", "start:dev"]

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache bash libc6-compat

COPY app/package.json app/package-lock.json ./

RUN npm install

COPY app/ ./

RUN npm run build

# --- Production stage ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]



