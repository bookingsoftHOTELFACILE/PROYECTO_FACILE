# Etapa 1: Build de la aplicación React con Vite usando npm
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifesto e instalar dependencias con npm (sin lockfile de pnpm)
COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Etapa 2: Servir los archivos estáticos con Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
