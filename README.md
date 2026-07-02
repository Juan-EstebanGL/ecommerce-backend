# 🛒 Ecommerce Full Stack

Aplicación de comercio electrónico desarrollada siguiendo una arquitectura cliente-servidor. El proyecto implementa autenticación con JWT, gestión de productos, carrito de compras, proceso de checkout y administración de órdenes, utilizando tecnologías modernas tanto en el frontend como en el backend.

---

## 🚀 Tecnologías

### Frontend
- React
- Vite
- React Router
- Axios
- Context API
- CSS3

### Backend
- Node.js
- Express.js
- Prisma ORM
- JWT (JSON Web Token)
- Zod
- Swagger
- Jest

### Base de datos
- PostgreSQL

### Herramientas
- Git
- GitHub

---

# ✨ Características

- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Gestión de productos.
- Carrito de compras.
- Proceso de Checkout.
- Gestión de órdenes.
- Estados de las órdenes:
  - Pending
  - Paid
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- Validación de datos con Zod.
- Documentación de la API con Swagger.
- Pruebas de integración con Jest.
- Arquitectura organizada por capas.

---

# 🏗️ Arquitectura

```
Frontend (React)
        │
        ▼
   API REST (Express)
        │
        ▼
    Controllers
        │
        ▼
     Services
        │
        ▼
    Prisma ORM
        │
        ▼
    PostgreSQL
```

---

# 📁 Estructura del proyecto

```
Ecommerce-App
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── validations
│   │   ├── app.js
│   │   └── server.js
│   └── tests
│
└── frontend
    ├── src
    │   ├── api
    │   ├── assets
    │   ├── components
    │   ├── context
    │   ├── hooks
    │   ├── pages
    │   └── routes
```

---

# 🔐 Autenticación

La autenticación se implementó utilizando **JWT (JSON Web Tokens)**.

El flujo consiste en:

- Registro de usuarios.
- Inicio de sesión.
- Generación del token.
- Validación mediante middleware.
- Protección de rutas privadas.
- Control de acceso para administradores.

---

# 🧪 Testing

El backend incluye pruebas de integración desarrolladas con **Jest**, cubriendo funcionalidades como:

- Autenticación.
- Productos.
- Carrito.
- Órdenes.

---

# 📖 Documentación de la API

La API cuenta con documentación mediante **Swagger**, facilitando las pruebas y consulta de los diferentes endpoints.

---

# ⚙️ Instalación

## Clonar el repositorio

```bash
git clone https://github.com/Juan-estebanGL/Ecommerce-App.git
```

---

## Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` tomando como referencia `.env.example`.

Ejecutar las migraciones:

```bash
npx prisma migrate dev
```

Iniciar el servidor:

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📌 Tecnologías principales

| Tecnología | Uso |
|------------|----------------|
| React | Frontend |
| Vite | Bundler |
| Node.js | Backend |
| Express | API REST |
| PostgreSQL | Base de datos |
| Prisma ORM | Acceso a datos |
| JWT | Autenticación |
| Zod | Validación |
| Swagger | Documentación |
| Jest | Testing |

---

# 🚀 Próximas mejoras

- Integración de pasarela de pagos.
- Panel administrativo más completo.
- Paginación de productos.
- Filtros y búsqueda avanzada.
- Despliegue en la nube.
- Docker.

---

# 👨‍💻 Autor

**Juan Esteban Gómez**

Tecnólogo en Análisis y Desarrollo de Software (ADSO) apasionado por el desarrollo Full Stack, enfocado en construir aplicaciones escalables utilizando React, Node.js y PostgreSQL.

📧 Correo: **juangomezlon@gmail.com**

💼 LinkedIn: **https://www.linkedin.com/in/juan-esteban-gomez-londo%C3%B1o-a0315b3ab/**

🐙 GitHub: **https://github.com/Juan-EstebanGL**
