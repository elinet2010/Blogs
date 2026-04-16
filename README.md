# Proyecto blogs

Aplicación web de listado y detalle de publicaciones construida con **Next.js** y **TypeScript**. Los datos remotos provienen de la API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com); las ediciones, publicaciones nuevas y elementos ocultos se persisten **solo en el navegador** (Zustand + `localStorage`).

## Requisitos

- **Node.js** 20 o superior recomendado
- **npm** (o `pnpm` / `yarn` si adaptás los comandos)

## Instalación

```bash
npm install
```

No hace falta archivo `.env` para desarrollo: la API es pública por HTTPS.

## Scripts

| Comando | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo en [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la build (ejecutar después de `build`) |
| `npm run lint` | ESLint con la configuración de Next.js |
| `npm run test` | Pruebas unitarias (Vitest, una ejecución) |
| `npm run test:watch` | Vitest en modo observación |
| `npm run test:coverage` | Tests con informe de cobertura (`coverage/`) |

## Cómo usar la aplicación

### Rutas principales

- **`/`** — Inicio con acceso al listado.
- **`/listado`** — Listado de posts con filtros por texto, autor (usuario 1–10) y orden; parámetros en la URL (`q`, `autor`, `orden`). Scroll infinito para cargar más páginas desde la API.
- **`/listado/nuevo`** — Formulario para crear una publicación: primero se envía un **POST** a JSONPlaceholder y, si la respuesta es correcta, se guarda una copia local con id negativo (la API de demo no persiste en servidor).
- **`/listado/[id]`** — Detalle de un post; si la API no tiene ese id (por ejemplo posts solo locales), se resuelve desde el almacenamiento local.

Categorías en inicio enlazan a `/listado?categoria=...` y fijan un autor según la categoría.

### Datos locales

- Clave de persistencia en `localStorage`: **`posts-app-storage`**.
- Incluye posts locales, ids ocultados y ediciones aplicadas al título/cuerpo.

### API

- Lectura y paginación: `GET https://jsonplaceholder.typicode.com/posts` (con `_start`, `_limit`, opcionalmente `userId`).
- Alta desde “Nueva publicación”: `POST` al mismo recurso `/posts`. La respuesta es real por red pero **no deja datos guardados** en el servidor de JSONPlaceholder; la app confía en la copia local para listado y detalle.

## Stack técnico

- **Next.js** (App Router), **React**, **TypeScript**
- Estado y persistencia: **Zustand** (`persist` → `localStorage`)
- Estilos: **CSS Modules** (sin Tailwind en esta versión)
- Imágenes de ejemplo: **Picsum** (dominio permitido en `next.config.ts`)
- Tests: **Vitest**, **Testing Library**, cobertura v8

## Despliegue

1. Generá la build: `npm run build`.
2. Arrancá en producción: `npm run start` (puerto por defecto 3000).

En plataformas como [Vercel](https://vercel.com) o [Netlify](https://www.netlify.com), conectá el repositorio y usá el comando de build `npm run build` y el directorio de salida estándar de Next.js (Vercel lo detecta automáticamente).

## Estructura relevante

- `app/` — Rutas y layouts (`page.tsx`, `layout.tsx`).
- `components/` — UI por dominio (listado, detalle, navegación, formularios).
- `data/` — Cliente HTTP, filtros, categorías, utilidades de posts visibles.
- `store/` — Store de Zustand del listado y acciones async (p. ej. más páginas, crear post vía API + local).

## Licencia

Privado / según definas para el repositorio.
