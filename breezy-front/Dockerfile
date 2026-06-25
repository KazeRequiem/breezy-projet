# ── Étape 1 : build du front ──────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite lit .env.production automatiquement pendant le build
RUN npm run build

# ── Étape 2 : service statique via nginx ──────────────────
FROM nginx:alpine
# Config nginx adaptée à une SPA React (fallback index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
