# AGENTS.md — E-Commerce Reconstruction Guide (Soft Glass Edition)

Este documento es la guía OBLIGATORIA para cualquier agente de IA (OpenCode, Claude Code, ChatGPT, etc.). 
Define las reglas para ejecutar una **RECONSTRUCCIÓN COMPLETA DE INTERFAZ Y ARQUITECTURA (UX/UI & Code Quality)** y NO una simple migración CSS.

---

# 1. Filosofía de Trabajo: Reconstrucción Radical JSX/CSS

⚠️ **DIRECTIVA PRINCIPAL PARA EL AGENTE:**
Tu objetivo NO es aplicar `backdrop-filter: blur()` sobre los componentes actuales.
Las pantallas actuales son maquetados planos y simétricos. Debes Reconstruir completamente la estructura visual del JSX cuando sea necesario, preservando siempre la lógica de negocio, el flujo funcional y la accesibilidad.

Cuando se te pida trabajar en una vista (Login, Catálogo, Carrito, Dashboard, Checkout):
1. **MODIFICA EL JSX:** Cambia la estructura del DOM, rompe las cuadrículas genéricas, agrega contenedores flotantes, paneles laterales tipo Drawer y héroes dinámicos.
2. **MODIFICA EL CSS:** Elimina las tarjetas blancas planas y reemplázalas por superficies de cristal flotantes sobre fondos con luz ambiental.
3. **PRESERVA LA LÓGICA:** Mantén intactos los `useState`, `useEffect`, llamadas a la API, autenticación JWT y contexto de React/Prisma.

---

# 2. Proyecto y Stack Tecnológico

- **Frontend:** React, React Router, Vite, CSS Modular (estructurado dentro de `src/styles/`), SweetAlert2 (js) para alertas.
- **Backend:** Node.js, Express, Prisma 7, PostgreSQL, JWT Authentication, Zod (validaciones), Cloudinary (imágenes), Resend (emails).

## Comandos

- **Backend tests:** `npm test` (en `backend/`, sobre base `.env.test` — los tests DEBEN quedar 45/45).
- **Frontend lint:** `npm run lint` (en `frontend/` — DEBE quedar en 0 errores).
- **Frontend build:** `npm run build` (en `frontend/`).
- El backend en `NODE_ENV=production` exige `JWT_SECRET` de al menos 32 caracteres (validado en `src/config/env.js`).

## Arquitectura Backend (patrón consolidado en Fase 3)

- **`src/controllers/`**: handlers HTTP delgados. Toda validación se hace con el wrapper `validate(schema, data)` de `src/validations/validation.helper.js` (lanza `AppError` 400 con el mensaje Zod). Los handlers NO contienen lógica de negocio ni `safeParse` manual.
- **`src/services/`**: lógica de negocio. Cada servicio importa Prisma y puede usar helpers compartidos.
- **`src/utils/`**: helpers reutilizables (`pagination.js` → `paginate`, `ownership.js` → `assertOwnerOrAdmin`, `productListItem.js` → `productListItemSelect`/`formatProductListItem`).
- **`src/validations/`**: schemas Zod por recurso; `common.js` exporta `positiveInteger`.
- **`src/constants/order.js`**: `ORDER_STATUS` y `ORDER_STATUS_LIST` (única fuente de verdad de estados de orden).
- **`src/services/auth.service.js`**: lógica de autenticación centralizada (register/login/verify/reset). Los controllers de auth solo responden `{statusCode, body}`.
- **`src/services/cloudinary.service.js`**: `uploadImage(buffer, mimetype, folder)` y `deleteImage(publicId)` — no usar `cloudinary.uploader` fuera de este archivo.
- **`src/services/email.service.js`**: `sendSafe()` para envíos no críticos (silencia errores de Resend).
- **Compras atómicas:** `prisma.$transaction` en checkout y en operaciones de direcciones con `isDefault`.
- **Errores Prisma:** NO usar `try/catch` por `P2025` en servicios — el `error.middleware.js` ya normaliza P2025 → 404, P2002 → 409, P2003 → 409.

## Contrato de la API (IMPORTANTE — corregido en Fase 3)

- Todas las respuestas de error usan `{ "message": "Mensaje descriptivo" }` con el status HTTP adecuado.
- Los errores operativos se lanzan con `AppError(mensaje, statusCode)` (ver `src/utils/AppError.js`).
- La validación Zod produce errores 400 con `{ "message": <mensaje del primer issue> }`.
- **NO migrar a `{ success, error }`**: el frontend y los tests consumen `{ message }`.
- Los endpoints de auth devuelven `{statusCode, body}` desde el service; el controller responde `res.status(statusCode).json(body)`.

## Seguridad aplicada (Fase 2)

- **Rate limiting** en auth (`src/middleware/rateLimit.middleware.js`) — no deshabilitar.
- **JWT** firmados con `JWT_SECRET` (32+ chars en producción) y payload mínimo `{ userId, role }`.
- **Emails** de verificación/restablecimiento: token aleatorio hasheado en BD con expiración.
- **Swagger** (`/api-docs`) y rutas de desarrollo (`/test`, `/auth/dev`) SOLO se cargan en `NODE_ENV=development`.
- **Contraseñas:** mínimo 8 caracteres (backend Zod y frontend `utils/validators.js`).

## Convenciones Frontend

- **Validadores:** usar `src/utils/validators.js` (NO definir regex/validadores inline en páginas).
- **Labels de estado de orden:** `src/utils/orderLabels.js` (`ORDER_STATUS_LABELS`).
- **Errores de verificación/reset:** `src/utils/errorMessages.js`.
- **Constantes de imagen:** `src/utils/imageUpload.js` (`ACCEPTED_IMAGE_TYPES`, `MAX_IMAGE_SIZE`).
- **Panel lateral de auth:** componente compartido `src/components/AuthSidePanel.jsx`.

---

# 3. Directivas de Rediseño "Soft Glass Floating"

### A. Atmósfera y Lienzo (El Fondo es Todo)
- **Prohibido usar fondos planos (`#fff`, `#f5f5f5`, `#000`).**
- En el `body` o contenedor principal de cada página, implementa mallas de gradientes dinámicos (`radial-gradient` o `conic-gradient`) con tonos fríos/médium (turquesa, cian, violeta profundo, azul medianoche) y luces difusas ambientales.
- El cristal solo funciona si hay elementos visuales o colores pasando por detrás de él.

### B. Paneles Flotantes y Cristales (Glassmorphism)
- **Efecto Cristal Claro:** `background: rgba(255, 255, 255, 0.45); backdrop-filter: blur(16px) saturate(180%);`
- **Efecto Cristal Oscuro / Dashboard Sidebar:** `background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(20px);`
- **Bordes Iluminados:** Todo panel glass DEBE llevar `border: 1px solid rgba(255, 255, 255, 0.35);` o bordes en degradado sutil.
- **Elevación y Sombra:** Usar sombras amables y profundas (`box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08)`), nunca sombras negras duras.
- **Paneles Separados del Borde:** Las barras laterales, modales y tarjetas no tocan las esquinas del viewport; **flotan** con margenes y `border-radius` pronunciados (16px - 24px).

### C. Rediseño Específico por Pantallas
- **Login / Auth:** Elimina la división 50/50 estática. Integra el formulario dentro de una tarjeta Glass flotante centrada u offset sobre una composición de luces fluorescentes orgánicas.
- **Catálogo:** Transforma los filtros y la barra de búsqueda en una **barra flotante tipo Dock / Command Bar** de vidrio. Las tarjetas de productos deben tener efectos de inclinación/hover suave (`transform: translateY(-4px)`), imágenes libres de recuadros blancos rígidos y botones flotantes para favoritos.
- **Carrito de Compras:** Convierte la vista en un layout asimétrico de 2 columnas o un **Drawer lateral deslizable de cristal**, con resúmenes numéricos claros y micro-interacciones al eliminar o cambiar cantidades.
- **Dashboard / Admin:** Reemplaza la barra lateral sólida por una **sidebar de vidrio suspendida**. Los widgets de gráficos deben integrarse en panelería Glass semi-transparente.

---

# 4. Habilidades e Ingeniería (Core Skills)

## A. Frontend Design & UX (Anthropic Directive)
- **Tipografía:** Establecer jerarquías tipográficas marcadas (*display fonts* para títulos y números de precio, tipografía limpia para cuerpo).
- **Animaciones y Movimiento:**
  - Aplicar micro-interacciones en botones e inputs (`transform`, `opacity`).
  - **Prohibido:** Usar `transition: all`. Define explícitamente las propiedades animadas.
  - Soportar `prefers-reduced-motion`.

## B. Vercel React Best Practices
- **Rendimiento:** Evitar re-renders innecesarios en listas (Catálogo/Carrito). Pasar componentes pesados a estructuras memoizadas si aplica.
- **Manejo de Estados de UI:** Toda pantalla con fetching debe incluir:
  - Estado de carga (*Skeleton Loaders* con efecto de brillo/glass).
  - Estado vacío (*Empty State* ilustrado para carrito sin productos o búsquedas sin resultados).
  - Manejo visual de errores con mensajes claros.

## C. Backend, API & PostgreSQL (Prisma)
- **Consultas Eficientes:** En las rutas de productos, órdenes y dashboard, usar `select` en Prisma para traer solo las columnas necesarias.
- **Transacciones en Checkout:** Usar `prisma.$transaction` al procesar compras para actualizar stock y crear la orden atómicamente.
- **Error Handling Pattern:** Todas las respuestas de error de la API Express usan el contrato `{ "message": "Mensaje descriptivo" }` (ver sección 2). NO usar `{ success, error }`.

# 5. Criterios Avanzados de Reconstrucción Visual

---

## Criterio de Éxito Visual

La tarea **NO** se considera terminada porque:

* el proyecto compile correctamente;
* el CSS haya sido movido al Design System;
* se hayan eliminado líneas del antiguo `index.css`;
* existan nuevos archivos CSS.

La tarea solamente estará terminada cuando el resultado visual parezca una aplicación completamente diferente.

Antes de finalizar cualquier pantalla el agente deberá preguntarse:

> "Si comparo una captura del ANTES y una captura del DESPUÉS, ¿parecen dos aplicaciones distintas?"

Si la respuesta es **NO**, entonces el rediseño aún no es suficiente.

---

## Libertad para Reconstruir el Layout

El agente tiene permiso para modificar completamente:

* JSX
* Layout
* Grid
* Distribución
* Jerarquía visual
* Orden de componentes
* Espaciado
* Tamaños
* Navegación visual

Siempre que:

* no cambie la lógica del negocio;
* no rompa la funcionalidad;
* no modifique las rutas;
* no altere las llamadas a la API;
* no afecte el estado global;
* mantenga la accesibilidad.

La lógica permanece.

La interfaz puede reconstruirse completamente.

---

## Inspiración Visual Obligatoria

El diseño debe inspirarse en productos de calidad comercial como:

* Linear
* Raycast
* Arc Browser
* Stripe Dashboard
* Vercel Dashboard
* Apple VisionOS
* Framer
* Craft Docs
* Notion Calendar

No deben copiarse visualmente.

Deben servir como referencia de:

* composición;
* jerarquía;
* ritmo visual;
* refinamiento;
* micro-interacciones;
* calidad del producto.

---

## Prohibiciones

Está prohibido:

* reutilizar el mismo layout cambiando únicamente colores;
* aplicar únicamente Glassmorphism sobre componentes antiguos;
* mantener cuadrículas Bootstrap tradicionales;
* crear interfaces completamente centradas;
* utilizar tarjetas blancas planas;
* usar layouts excesivamente simétricos;
* generar interfaces genéricas similares a plantillas IA.

Cada página debe sentirse diseñada específicamente para este proyecto.

---

## Regla de Composición

Toda pantalla deberá construirse utilizando como mínimo tres niveles visuales.

### Nivel 1

Fondo ambiental.

Radial gradients, iluminación difusa, profundidad.

### Nivel 2

Paneles flotantes.

Glass panels, Dock, Sidebar, Floating Cards.

### Nivel 3

Contenido.

Información, acciones y navegación.

Nunca colocar directamente el contenido sobre un fondo plano.

Siempre debe existir profundidad visual.

---

## Filosofía de Diseño

Cada página debe diseñarse como si fuera una Landing Page profesional.

NO como un CRUD tradicional.

La experiencia debe transmitir calidad comercial.

---

## Mejora Continua de UX

El agente debe mejorar constantemente la experiencia del usuario.

En cada rediseño deberá preguntarse:

* ¿Puede simplificarse?
* ¿Puede reducirse el número de clics?
* ¿Puede destacarse mejor la acción principal?
* ¿Puede organizarse mejor la información?
* ¿Puede mejorar la lectura?
* ¿Puede mejorar la navegación?
* ¿Puede hacerse sentir más moderna?

No limitarse únicamente a cambiar colores o estilos.

El objetivo siempre será mejorar tanto la experiencia de usuario (UX) como la interfaz (UI).
