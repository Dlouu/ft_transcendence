# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache bash libc6-compat

COPY app/package.json app/package-lock.json* ./

RUN npm install

COPY app/ ./

RUN npm run build

# --- Production stage ---
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
