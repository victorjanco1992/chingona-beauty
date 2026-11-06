# Chingona Beauty

## 1. Neon
Crea el proyecto en Neon y copia la cadena **pooled** (`DATABASE_URL`) y la **directa** (`DIRECT_URL`).

## 2. Backend (Vercel)
- Root Directory: `backend`
- Variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CORS_ORIGIN` (URL del frontend), `WHATSAPP_NUMBER` (opcional).
- El build ejecuta `prisma generate && prisma db push` y crea las tablas.
- Crear el administrador (una vez, local, con `.env` apuntando a Neon):
  `cd backend && npm install && ADMIN_EMAIL=tu@correo ADMIN_PASSWORD=tuclave npm run seed`

## 3. Frontend (Render, Static Site)
- Se configura con `render.yaml` (o Root `frontend`, build `npm install && npm run build`, publish `dist`, rewrite `/*` → `/index.html`).
- Variable: `VITE_API_URL` = URL del backend en Vercel.

## 4. Uso
- Panel privado: `/admin/login`. Carga categorías, productos y define el WhatsApp en Ajustes.

## Local
- Backend: `cd backend && cp .env.example .env && npm i && npm run db:push && npm run dev`
- Frontend: `cd frontend && cp .env.example .env && npm i && npm run dev` (con `VITE_API_URL=http://localhost:4000`)
# chingona-beauty
