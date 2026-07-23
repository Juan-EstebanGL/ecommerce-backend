# backend/Dockerfile
# Imagen base oficial de Node.js LTS (versión 22 slim)
FROM node:22-slim

# Instala herramientas de compilación para módulos nativos (bcrypt)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Nodemon para hot reload en desarrollo
RUN npm install -g nodemon

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos de dependencias primero (aprovecha cache de Docker)
COPY package*.json ./
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./

# Instala dependencias (incluye devDependencies para prisma generate)
RUN npm install

# Genera Prisma Client (no conecta a la DB, solo genera código)
# Se usa un DATABASE_URL dummy porque prisma.config.ts lo requiere al resolver el datasource,
# pero prisma generate solo genera código TypeScript/JS, nunca abre conexión.
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN DATABASE_URL=$DATABASE_URL npx prisma generate

# Copia el resto del código fuente
COPY . .

# Puerto donde corre Express
EXPOSE 3000

# Comando por defecto (puede sobrescribirse en docker-compose para desarrollo)
CMD ["node", "src/server.js"]
