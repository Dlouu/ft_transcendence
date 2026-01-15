FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash libc6-compat

# 1️⃣ Copier UNIQUEMENT les manifests
COPY app/package.json app/package-lock.json ./

# 2️⃣ Installer les dépendances (vite inclus)
RUN npm install

# 3️⃣ Copier le reste du code
# COPY app/ .

EXPOSE 5173

CMD ["npm", "run", "dev"]

# COPY ./tools/script.sh /

# RUN chmod +x /script.sh

# CMD [ "/script.sh" ]
