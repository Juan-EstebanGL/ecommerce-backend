# 🛒 Ecommerce Full Stack

Aplicación de comercio electrónico desarrollada siguiendo una arquitectura cliente-servidor. El proyecto implementa autenticación con JWT, gestión de productos, carrito de compras, proceso de checkout, administración de órdenes y sistema de reseñas para productos, utilizando tecnologías modernas tanto en el frontend como en el backend. La aplicación cuenta con una interfaz moderna, completamente responsive y una arquitectura organizada para facilitar su escalabilidad y mantenimiento.

---

## 🚀 Highlights

- 🔐 Autenticación completa mediante JWT.
- 🛒 Ecommerce Full Stack desarrollado con React, Node.js, Express y PostgreSQL.
- ⭐ Sistema de reseñas para productos con promedio y actualización en tiempo real.
- 📦 Gestión completa de productos, carrito, checkout y órdenes.
- 👤 Perfil de usuario.
- ⚡ Actualización reactiva del carrito mediante Context API.
- 🎨 Interfaz moderna, responsive y con microinteracciones.
- 📖 API documentada con Swagger.
- 🧪 Testing de integración con Jest.

---

# 🚀 Tecnologías

## Frontend

- React
- Vite
- React Router
- Axios
- Context API
- SweetAlert2
- CSS3

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT (JSON Web Token)
- Zod
- Swagger
- Jest

## Base de datos

- PostgreSQL

## Herramientas

- Git
- GitHub

---

# ✨ Características

- Registro e inicio de sesión de usuarios.
- Autenticación segura mediante JWT.
- Protección de rutas privadas.
- Gestión de productos.
- Catálogo con búsqueda y filtros.
- Carrito de compras en tiempo real.
- Checkout con validaciones.
- Gestión completa de órdenes.
- Perfil de usuario.
- Sistema de reseñas para productos.
- Creación y edición de reseñas propias.
- Promedio y cantidad de reseñas calculados automáticamente.
- Actualización reactiva del carrito mediante Context API.
- Componentes reutilizables.
- Interfaz moderna y completamente responsive.
- Alertas y confirmaciones mediante SweetAlert2.
- Validaciones tanto en frontend como en backend.
- Arquitectura organizada por capas.

## Estados de las órdenes

- Pending
- Paid
- Processing
- Shipped
- Delivered
- Cancelled

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
    │   ├── routes
    │   ├── utils
    │   └── index.css
```

---

# 🔐 Autenticación

La autenticación se implementó utilizando JWT (JSON Web Tokens).

El flujo consiste en:

- Registro de usuarios.
- Inicio de sesión.
- Generación del token.
- Almacenamiento del token en el cliente.
- Validación mediante middleware.
- Protección de rutas privadas.
- Cierre de sesión.
- Redirección automática al login cuando la sesión finaliza.

---

# 🛒 Carrito de compras

El carrito utiliza Context API para mantener el estado sincronizado en toda la aplicación.

Características:

- Actualización en tiempo real del contador del carrito.
- Agregar productos.
- Modificar cantidades.
- Validaciones de stock.
- Eliminación de productos.
- Checkout integrado.
- Sincronización automática entre todas las vistas.

---

# ⭐ Sistema de reseñas

Los usuarios autenticados pueden valorar los productos.

Características:

- Crear una reseña.
- Editar la propia reseña.
- Una única reseña por usuario y producto.
- Promedio de calificaciones calculado automáticamente.
- Cantidad total de reseñas.
- Actualización dinámica sin recargar la página.

---

# 🎨 Experiencia de usuario

La interfaz fue desarrollada priorizando una experiencia moderna y responsive.

Incluye:

- Diseño completamente responsive.
- Navbar profesional con menú adaptativo.
- Footer moderno.
- Componentes reutilizables.
- Loader y estados de carga.
- Confirmaciones y notificaciones con SweetAlert2.
- Microanimaciones y transiciones.
- Validaciones visuales en formularios.
- Diseño consistente en todas las páginas.

---

# 🧪 Testing

El backend incluye pruebas de integración desarrolladas con Jest, cubriendo funcionalidades como:

- Autenticación.
- Productos.
- Carrito.
- Órdenes.

---

# 📖 Documentación de la API

La API cuenta con documentación mediante Swagger, facilitando las pruebas y consulta de los diferentes endpoints.

---

# ⚙️ Instalación

## Clonar el repositorio

```bash
git clone https://github.com/Juan-estebanGL/Ecommerce-App.git
```

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

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📌 Tecnologías principales

| Tecnología | Uso |
|------------|-----|
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
| SweetAlert2 | Alertas y confirmaciones |
| Context API | Estado global |

---

# 🚀 Próximas mejoras

- Recuperación de contraseña.
- Eliminación de reseñas.
- Integración de pasarela de pagos.
- Panel administrativo.
- Gestión de imágenes para productos.
- Wishlist (Favoritos).
- Paginación de productos.
- Filtros y búsqueda avanzada.
- Docker.
- CI/CD.
- Despliegue en la nube.

---

# 👨‍💻 Autor

Juan Esteban Gómez Londoño

Tecnólogo en Análisis y Desarrollo de Software (ADSO) apasionado por el desarrollo Full Stack, enfocado en construir aplicaciones escalables utilizando React, Node.js y PostgreSQL.

📧 Correo: juangomezlon@gmail.com

💼 LinkedIn: https://www.linkedin.com/in/juan-esteban-g%C3%B3mez-londo%C3%B1o-a0315b3ab/

🐙 GitHub: https://github.com/Juan-EstebanGL
