# Dockerfile para React (Create React App)

# Etapa 1: Build de la aplicación
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx (para React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
