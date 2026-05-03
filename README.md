# Floristería Deco Imperio — Plataforma E-commerce

Plataforma e-commerce completa para **Floristería Deco Imperio**, ubicada en Bello, Niquía (Antioquia, Colombia). Construida con Next.js 14+, Prisma, PostgreSQL y diseño editorial artesanal.

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS 4 con paleta personalizada |
| Animaciones | Framer Motion |
| Backend | Next.js API Routes |
| ORM | Prisma 7 |
| Base de datos | PostgreSQL 16 |
| Auth | NextAuth.js v5 (credentials + roles) |
| Estado carrito | Zustand (persistido en localStorage) |
| Formularios | React Hook Form + Zod |
| Notificaciones | Sonner |
| Tipografías | Playfair Display + Inter (Google Fonts) |

---

## Instalación rápida

### 1. Requisitos previos
- Node.js 20+
- Docker Desktop (para PostgreSQL)

### 2. Instalar y configurar
```bash
cp .env.example .env
npm install
```

### 3. Levantar la base de datos
```bash
docker-compose up -d
```
PostgreSQL en `localhost:5432` · pgAdmin en `http://localhost:5050`

### 4. Crear tablas y datos demo
```bash
npm run db:push    # Aplica el schema
npm run seed       # 24+ productos, ocasiones, categorías y usuarios
```

### 5. Iniciar
```bash
npm run dev
```

Disponible en **http://localhost:3000**

---

## Credenciales demo

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| Administrador | admin@decoimperio.com | admin123 | ADMIN |
| Vendedor | vendedor@decoimperio.com | vendedor123 | SELLER |
| Florista | florista@decoimperio.com | florista123 | FLORIST |
| Cliente | cliente@test.com | cliente123 | CLIENT |

Panel admin: **http://localhost:3000/admin**

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          # Sitio público
│   │   ├── page.tsx       # Home editorial
│   │   ├── tienda/        # Catálogo con filtros
│   │   ├── producto/[slug]/ # Detalle de producto
│   │   ├── carrito/       # Carrito
│   │   ├── checkout/      # Pago (4 pasos)
│   │   ├── mi-cuenta/     # Panel del cliente
│   │   ├── login/
│   │   ├── registro/
│   │   ├── nosotros/
│   │   └── contacto/
│   ├── admin/             # Panel administrativo
│   │   ├── page.tsx       # Dashboard + KPIs
│   │   ├── pedidos/       # Gestión y avance de estados
│   │   ├── productos/     # CRUD de productos
│   │   ├── clientes/
│   │   ├── reportes/
│   │   └── pos/           # Punto de venta en mostrador
│   └── api/               # API Routes
├── components/
│   ├── ui/                # Button, Input, Card, Badge
│   ├── layout/            # Navbar, Footer, WhatsApp flotante
│   ├── home/              # Hero, Ocasiones, BestSellers, Proceso, Testimonios, Mapa
│   ├── shop/              # Catálogo y detalle de producto
│   ├── cart/              # Drawer + página de carrito
│   ├── checkout/          # Flujo de compra
│   ├── account/           # Panel del cliente con timeline de estados
│   ├── auth/              # Login y registro
│   └── admin/             # Dashboard, pedidos, sidebar
├── lib/
│   ├── auth.ts            # NextAuth con roles
│   ├── prisma.ts          # Cliente singleton
│   └── utils.ts           # formatCOP, slugify, WhatsApp URL, etc.
├── store/
│   └── cart.ts            # Zustand store (persiste en localStorage)
└── types/
    └── next-auth.d.ts     # Tipos extendidos
prisma/
├── schema.prisma          # Modelos completos
└── seed.ts                # 24+ productos + usuarios demo
```

---

## Variables de entorno

Ver `.env.example` para el listado completo.

```env
DATABASE_URL="postgresql://decoimperio:decoimperio_secret@localhost:5432/decoimperio_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""   # Opcional
```

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run seed         # Cargar datos demo
npm run db:push      # Aplicar schema
npm run db:migrate   # Crear migración
npm run db:studio    # GUI de la base de datos
docker-compose up -d # Levantar PostgreSQL + pgAdmin
```

---

## Flujo de un pedido

```
RECEIVED → PROCESSING → READY → IN_ROUTE → DELIVERED
  (Admin)    (Florista)  (Admin)  (Repartidor) (Repartidor)
```

El cliente ve el estado en tiempo real en `/mi-cuenta`.

---

## Negocio

**Floristería Deco Imperio** · Av 33 No. 54-52, Medellín · +57 321 503 9845
