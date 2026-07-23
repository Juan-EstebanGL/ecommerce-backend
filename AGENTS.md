# AGENTS.md

# E-Commerce Project — AI Development Guide

Este documento define las reglas, habilidades y criterios de desarrollo que cualquier agente de IA (OpenCode, Claude Code, Codex, etc.) debe seguir al trabajar sobre este proyecto.

---

# 1. Proyecto

Aplicación Full Stack de comercio electrónico desarrollada con una arquitectura cliente-servidor moderna.

## Stack Tecnológico

### Frontend

- React
- React Router
- CSS
- Vite

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication

---

# 2. Objetivos del Proyecto

El proyecto implementa:

- Autenticación completa
- Verificación de correo
- Recuperación de contraseña
- Panel de administración
- Catálogo de productos
- Carrito de compras
- Checkout
- Gestión de pedidos
- Sistema de favoritos
- Sistema de reseñas
- Perfil de usuario
- Avatar
- Dashboard administrativo
- Responsive Design

Todo cambio debe mantener la calidad del código y la consistencia visual del proyecto.

---

# 3. Reglas Generales del Proyecto

Estas reglas tienen prioridad sobre cualquier otra recomendación.

## Arquitectura

- Mantener la arquitectura actual.
- No introducir cambios innecesarios.
- No romper funcionalidades existentes.
- No modificar código que no esté relacionado con la tarea.

---

## Calidad del Código

Siempre priorizar:

- Código limpio
- Código legible
- Componentes reutilizables
- Bajo acoplamiento
- Alta cohesión

Evitar duplicación de código.

---

## Frontend

Nunca crear páginas con estilos aislados.

Toda la interfaz debe pertenecer al mismo Design System.

No crear componentes duplicados.

Reutilizar componentes siempre que sea posible.

Mantener una identidad visual consistente entre:

- Tienda
- Panel administrativo
- Autenticación
- Perfil
- Checkout

---

## CSS

Evitar continuar creciendo un único archivo `index.css`.

Cuando se realice la refactorización visual del proyecto, dividir los estilos por responsabilidad.

Ejemplo esperado:

styles/

base/

layout/

components/

pages/

themes/

Cada componente deberá tener su propio archivo CSS cuando sea apropiado.

---

## Backend

Mantener:

- CommonJS
- Prisma 7
- PostgreSQL
- JWT
- Express

No migrar tecnologías sin que sea solicitado explícitamente.

---

## Seguridad

Nunca escribir:

- API Keys
- Passwords
- Secrets
- Tokens

directamente en el código.

Siempre utilizar variables de entorno.

---

## Git

No modificar:

README

LICENSE

Docker

Configuraciones

a menos que la tarea lo requiera.

---

## Reutilización de Componentes

Antes de crear un nuevo componente, siempre verificar si ya existe uno reutilizable.

Si existe uno similar:

- reutilizarlo
- extenderlo
- generalizarlo

Evitar duplicar componentes por pequeñas diferencias visuales.

Todo componente nuevo debe aportar una funcionalidad realmente distinta.

---

## Reutilización del Design System

Antes de escribir nuevo CSS, comprobar si el Design System ya proporciona una solución equivalente.

Priorizar siempre:

- variables CSS existentes
- componentes reutilizables
- utilidades globales
- clases compartidas

Evitar crear nuevos estilos cuando una solución ya exista.

Cada cambio debe fortalecer el Design System, nunca fragmentarlo.

---

## Refactorización Continua

Cada modificación del frontend debe dejar el proyecto más limpio que antes.

Siempre que sea posible:

- reducir duplicación
- mover estilos al Design System
- simplificar componentes
- mejorar reutilización

No aumentar nuevamente el tamaño de archivos monolíticos como index.css.

La deuda técnica debe disminuir progresivamente en cada refactorización.

# 4. Design System (Obligatorio)

## Objetivo

Mantener una identidad visual consistente, escalable y profesional en toda la aplicación.

Todo cambio visual deberá respetar este Design System antes de crear nuevos componentes o estilos.

No se permiten estilos aislados ni decisiones visuales improvisadas.

---

# Principios

El frontend debe transmitir una identidad moderna y premium.

Priorizar:

* claridad visual
* consistencia
* simplicidad
* excelente experiencia de usuario
* animaciones suaves
* accesibilidad
* responsive real

Cada componente debe sentirse parte del mismo sistema.

No deben existir páginas con estilos completamente diferentes.

---

# Arquitectura CSS

Está prohibido continuar utilizando un único archivo gigantesco como:

index.css

Debe migrarse progresivamente hacia una estructura modular.

Ejemplo:

src/

styles/

base/

reset.css

variables.css

typography.css

animations.css

utilities.css

layout/

container.css

grid.css

navbar.css

footer.css

components/

buttons.css

cards.css

forms.css

inputs.css

tables.css

badges.css

modals.css

pagination.css

alerts.css

dashboard.css

pages/

home.css

products.css

product-detail.css

cart.css

checkout.css

favorites.css

orders.css

profile.css

admin/

dashboard.css

products.css

categories.css

orders.css

users.css

reports.css

theme/

light.css

dark.css

index.css

El nuevo index.css solamente deberá importar los demás archivos.

Nunca contener cientos o miles de líneas.

---

# Variables CSS

Todos los colores deben vivir únicamente en variables CSS.

Ejemplo:

:root{

--primary

--secondary

--accent

--success

--warning

--danger

--background

--surface

--surface-2

--border

--text

--text-secondary

--shadow-sm

--shadow-md

--shadow-lg

--radius-sm

--radius-md

--radius-lg

--transition

}

Está prohibido escribir colores hex directamente en componentes salvo casos muy excepcionales.

---

# Espaciado

Utilizar una escala consistente.

Ejemplo:

4px

8px

12px

16px

20px

24px

32px

40px

48px

64px

Nunca utilizar márgenes o paddings aleatorios.

---

# Border Radius

Definir únicamente algunos radios estándar.

Ejemplo:

6px

10px

14px

20px

Nunca mezclar radios completamente distintos.

---

# Sombras

Crear únicamente sombras reutilizables.

shadow-sm

shadow-md

shadow-lg

No inventar nuevas sombras en cada componente.

---

# Tipografía

Mantener una jerarquía consistente.

Definir:

Display

H1

H2

H3

H4

Body

Small

Caption

No modificar tamaños arbitrariamente entre páginas.

---

# Componentes Base

Todo componente reutilizable deberá compartir el mismo estilo.

Ejemplos:

Botones

Inputs

Selects

Textarea

Cards

Tables

Badges

Tags

Dropdowns

Sidebar

Navbar

Pagination

Modal

Toast

Skeleton

Loading

Empty State

No duplicar componentes con pequeñas diferencias.

Si un componente cambia, debe actualizarse para todos.

---

# Iconografía

Utilizar un único sistema de iconos.

Mantener el mismo grosor visual.

No mezclar múltiples librerías.

---

# Animaciones

Todas las animaciones deben utilizar las variables del sistema.

Evitar:

animaciones exageradas

rebotes innecesarios

duraciones largas

Priorizar:

opacity

transform

scale

translate

Nunca utilizar transition: all.

---

# Responsive

Todo componente debe funcionar correctamente en:

Desktop

Laptop

Tablet

Mobile

No crear versiones independientes.

Utilizar un sistema consistente de breakpoints.

---

# Accesibilidad

Todos los formularios deberán tener:

label

focus visible

aria-label cuando aplique

contraste suficiente

estados hover

estados disabled

estados loading

---

# Consistencia

Cuando se modifique un componente reutilizable:

NO actualizar solamente una página.

Buscar todas sus apariciones.

Actualizar todo el proyecto.

---

# Refactorización

Durante futuras mejoras del frontend:

Se debe aprovechar cada modificación para mover estilos al Design System.

Nunca aumentar nuevamente el tamaño de index.css.

Cada refactorización debe dejar el proyecto más limpio que antes.

---

# Nuevos Componentes

Antes de crear un nuevo componente debe verificarse si ya existe uno similar.

Si existe:

extenderlo

generalizarlo

reutilizarlo

No duplicar código.

---

# Objetivo Final

El proyecto debe parecer un producto comercial listo para producción.

Toda decisión visual debe sentirse parte de un único lenguaje de diseño.

La prioridad siempre será:

Consistencia > Cantidad de efectos > Complejidad.

# 5. Skill — Frontend Design

## Properties

| Property | Value |
|----------|-------|
| name | frontend-design |
| description | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics. |
| license | Complete terms in LICENSE.txt |
| keywords | web-design, ui-design, ux-design, visual-design, typography, color, layout, animation |

---

## Purpose

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

Implement real working code with exceptional attention to aesthetic details and creative choices.

---

## Design Thinking

Before coding, understand the context and commit to a bold aesthetic direction.

### Purpose

What problem does this interface solve?

Who uses it?

### Tone

Pick an extreme:

- Brutally minimal
- Maximalist chaos
- Retro-futuristic
- Organic
- Luxury
- Editorial
- Brutalist
- Art Deco
- Soft
- Industrial

Do not average multiple styles.

Commit to one.

---

### Constraints

Respect:

- Framework
- Accessibility
- Performance
- Responsiveness

---

### Differentiation

Ask:

> What makes this interface unforgettable?

Every page should have at least one memorable visual characteristic.

---

## Implementation

Create interfaces that are:

- Production-ready
- Functional
- Cohesive
- Visually striking
- Carefully refined

---

## Frontend Aesthetic Guidelines

### Typography

Choose distinctive fonts.

Avoid generic fonts such as:

- Arial
- Roboto
- Inter

Use intentional font pairings.

---

### Color

Commit to one visual identity.

Use CSS variables.

Prefer bold palettes over generic gradients.

---

### Motion

Animations should communicate something.

Prefer:

- stagger
- reveal
- hover
- transitions
- scroll interactions

Avoid decorative animation overload.

---

### Layout

Encourage:

- asymmetry
- overlapping elements
- strong hierarchy
- negative space
- unique composition

Avoid cookie-cutter layouts.

---

### Visual Details

Use:

- textures
- meshes
- grain
- patterns
- shadows
- depth
- overlays

Build atmosphere instead of flat interfaces.

---

### Avoid

Never generate:

- Material UI looking interfaces
- Tailwind UI clones
- Shadcn examples
- Default AI dashboards
- Purple gradients on white backgrounds
- Repeated visual patterns

Every page should feel intentionally designed.

---

### Complexity

Match implementation complexity with the chosen aesthetic.

Minimalism requires precision.

Maximalism requires refinement.

---

# 6. Skill — UI Design System

## Properties

| Property | Value |
|----------|-------|
| name | ui-design-system |
| description | UI design system toolkit for Senior UI Designer including design token generation, component documentation, responsive design calculations, and developer handoff tools. |
| keywords | design-system, ui-design, responsive, accessibility, components, css |

---

## Core Capabilities

- Design token generation
- Typography system
- Color system
- Spacing system
- Component architecture
- Accessibility
- Responsive calculations
- Documentation

---

## Available Script

design_token_generator.py

Supports:

- JSON
- CSS
- SCSS

Generates:

- Colors
- Typography
- Shadows
- Animations
- Breakpoints
- Spacing

---

# 7. Skill — Web Interface Guidelines

## Properties

| Property | Value |
|----------|-------|
| description | Review UI code for Vercel Web Interface Guidelines compliance |
| keywords | accessibility, ui-design, ux-design, performance |

---

## Accessibility

Review:

- aria-label
- labels
- semantic HTML
- keyboard navigation
- headings
- images
- focus
- live regions

---

## Focus States

Ensure:

- focus-visible
- visible keyboard navigation
- accessible interactions

---

## Forms

Validate:

- autocomplete
- labels
- input types
- paste support
- spellcheck
- inline errors
- placeholders
- loading states

---

## Animation

Respect:

- prefers-reduced-motion
- transform
- opacity

Avoid:

transition: all

---

## Typography

Use:

- …
- smart quotes
- tabular numbers
- balanced headings

---

## Content Handling

Support:

- empty states
- long text
- truncation
- responsive behavior

---

## Images

Always define:

- width
- height
- loading
- priority

---

## Performance

Check:

- virtualization
- DOM reads
- font preload
- preconnect
- render cost

---

## Navigation

Ensure:

- URL state
- Link components
- confirmation dialogs
- deep linking

---

## Touch

Check:

- touch-action
- overscroll
- drag behavior
- tap highlight

---

## Layout

Support:

- safe areas
- overflow
- flex
- grid

Avoid JS layout calculations whenever possible.

---

## Dark Mode

Verify:

- color-scheme
- theme-color
- native controls

---

## Internationalization

Always use:

- Intl.DateTimeFormat
- Intl.NumberFormat

Never hardcode locale formats.

---

## Hydration

Prevent hydration mismatches.

---

## Hover States

All interactive elements must provide visual feedback.

---

## Copywriting

Prefer:

- Active voice
- Clear actions
- Specific labels
- Helpful error messages

---

## Output Format

Group findings by file.

Example:

```
src/Button.jsx:42 - missing aria-label
src/Input.jsx:18 - missing label
src/Card.jsx:71 - transition: all
```

Keep reports concise and actionable.

---

# 8. Final Principle

Before implementing any solution, think like:

- Senior Software Engineer
- Senior UI/UX Designer
- Product Designer
- Frontend Architect

The objective is not only to make the application work.

The objective is to build a product that could be shipped to production with professional quality, clean architecture, excellent user experience, and a distinctive visual identity.