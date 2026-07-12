# 🛒 Ecommerce Full Stack

Aplicación de comercio electrónico Full Stack desarrollada con una arquitectura cliente-servidor moderna utilizando React, Node.js, Express, Prisma y PostgreSQL.

El proyecto implementa autenticación con JWT, panel de administración, catálogo de productos, carrito de compras, checkout, gestión de pedidos, sistema de reseñas, perfil de usuario con avatar, favoritos y una interfaz completamente responsive enfocada en una experiencia de usuario moderna.

---

# 🚀 Highlights

- 🔐 Autenticación segura mediante JWT.
- 👤 Perfil de usuario completo con avatar y direcciones.
- 🛍️ Catálogo de productos con búsqueda y filtros.
- ❤️ Sistema de favoritos.
- 🛒 Carrito sincronizado mediante Context API.
- 📦 Checkout completo.
- 📄 Historial y detalle de pedidos.
- ⭐ Sistema de reseñas con calificación promedio.
- 🛠️ Panel administrativo completo.
- 📊 Dashboard administrativo con estadísticas y gráficos.
- ☁️ Gestión de imágenes mediante Cloudinary.
- 🎨 Interfaz moderna, responsive y optimizada para UX/UI.
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
- Recharts
- React CountUp
- CSS3

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Multer
- Cloudinary
- Zod
- Swagger
- Jest

---

# ✨ Funcionalidades

## Usuarios

- Registro.
- Inicio de sesión.
- Autenticación JWT.
- Protección de rutas privadas.
- Perfil de usuario.
- Cambio de contraseña.
- Cambio de avatar.
- Gestión de direcciones.
- Roles (USER / ADMIN).

---

## Productos

- Catálogo.
- Búsqueda.
- Filtros.
- Productos destacados.
- Detalle del producto.
- Productos relacionados.
- Control de stock.

---

## Favoritos

- Agregar productos a favoritos.
- Eliminar favoritos.
- Sincronización en tiempo real.
- Página dedicada de favoritos.

---

## Carrito

- Agregar productos.
- Actualizar cantidades.
- Eliminar productos.
- Validación de stock.
- Sincronización mediante Context API.
- Contador dinámico.

---

## Checkout

- Resumen del pedido.
- Selección de dirección.
- Gestión de direcciones durante el checkout.
- Confirmación de compra.
- Creación de órdenes.

---

## Órdenes

- Historial de pedidos.
- Detalle del pedido.
- Estados de la orden.
- Resumen de compra.

Estados soportados:

- Pending
- Paid
- Processing
- Shipped
- Delivered
- Cancelled

---

## Reseñas

- Crear reseñas.
- Editar reseñas propias.
- Una reseña por usuario y producto.
- Promedio automático.
- Cantidad de reseñas.
- Actualización dinámica.

---

## Panel Administrativo

### Dashboard

- Estadísticas generales.
- Estado de órdenes.
- Ingresos.
- Evolución mensual de ventas.
- Productos con poco stock.
- Productos más guardados.
- Productos mejor calificados.
- Últimas órdenes.
- Últimas reseñas.

### Gestión de usuarios

- Listado de usuarios.
- Avatar de usuario.
- Roles.
- Estados.

### Gestión de productos

- CRUD completo.
- Subida de imágenes.
- Gestión de stock.
- Categorías.

### Gestión de órdenes

- Listado.
- Actualización de estados.
- Consulta de detalles.

### Gestión de reseñas

- Visualización.
- Administración.

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

# 📁 Estructura

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

# 🔐 Seguridad

- JWT Authentication.
- Hash de contraseñas con bcrypt.
- Middleware de autorización.
- Validación de datos con Zod.
- Protección de rutas administrativas.
- Validación de propiedad de recursos (productos, reseñas, direcciones).

---

# ☁️ Gestión de imágenes

Las imágenes se almacenan utilizando Cloudinary.

Incluye:

- Imágenes de productos.
- Avatar de usuario.
- Eliminación automática de imágenes antiguas al reemplazarlas.

---

# 🎨 Experiencia de Usuario

La aplicación fue optimizada siguiendo principios modernos de UX/UI.

Incluye:

- Diseño completamente responsive.
- Dashboard administrativo moderno.
- Animaciones suaves.
- Empty states personalizados.
- Skeleton loaders.
- Estados de carga.
- Estados de error.
- Confirmaciones mediante SweetAlert2.
- Componentes reutilizables.
- Navegación consistente.
- Diseño uniforme en todos los módulos.

---

# 🧪 Testing

El backend incluye pruebas de integración desarrolladas con Jest para funcionalidades como:

- Autenticación.
- Productos.
- Carrito.
- Órdenes.

---

# 📖 Documentación

La API cuenta con documentación mediante Swagger para facilitar las pruebas de todos los endpoints.

---

# ⚙️ Instalación

## Clonar repositorio

```bash
git clone https://github.com/Juan-EstebanGL/Ecommerce-App.git
```

## Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` tomando como referencia `.env.example`.

Ejecutar migraciones:

```bash
npx prisma migrate dev
```

Generar cliente Prisma:

```bash
npx prisma generate
```

Iniciar servidor:

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
| Prisma ORM | ORM |
| JWT | Autenticación |
| Cloudinary | Gestión de imágenes |
| Recharts | Dashboard |
| React CountUp | KPIs |
| SweetAlert2 | Alertas |
| Context API | Estado global |
| Zod | Validación |
| Swagger | Documentación |
| Jest | Testing |

---

# 👨‍💻 Autor

**Juan Esteban Gómez Londoño**

Tecnólogo en Análisis y Desarrollo de Software

📧 **Correo:** juangomezlon@gmail.com

💼 **LinkedIn:** https://www.linkedin.com/in/juan-esteban-g%C3%B3mez-londo%C3%B1o-a0315b3ab/

🐙 **GitHub:** https://github.com/Juan-EstebanGL
