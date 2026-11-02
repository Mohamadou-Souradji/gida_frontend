# Gida Jari - frontend Angular servi par Caddy
# Etape 1 : build de production
FROM node:22-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY . .
RUN npx ng build --configuration production

# Etape 2 : serveur web Caddy (HTTPS automatique Let's Encrypt)
FROM caddy:2-alpine
COPY --from=build /build/dist/gida-jari-frontend/browser /srv
# Le Caddyfile est fourni par deploy/Caddyfile (monte en lecture seule par docker-compose)
