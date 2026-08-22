# Etapa 1: Build de la aplicación React con Vite usando pnpm
FROM node:20-alpine AS build

WORKDIR /app

# Instalar pnpm v9 compatible con Node 20
RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Etapa 2: Servir los archivos estáticos con Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
