# frontend/Dockerfile
# Imagen base oficial de Node.js LTS (versión 22 slim)
FROM node:22-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos de dependencias primero (aprovecha cache de Docker)
COPY package*.json ./

# Instala dependencias (no requiere herramientas de compilación — sin módulos nativos)
RUN npm install

# Copia el resto del código fuente
COPY . .

# Puerto donde corre Vite dev server
EXPOSE 5173

# Comando por defecto (se sobrescribe en docker-compose para desarrollo con --host)
CMD ["npm", "run", "dev"]
