# 🛒 LlevaloPe - Plataforma E-Commerce Enterprise

> **Tu Tienda Online, Sin Límites** — Plataforma peruana de e-commerce moderna, escalable y profesional.

---

## 📐 Arquitectura del Proyecto

```
llevalope/
├── docker-compose.yml          # Orquestación Docker
├── .env                        # Variables de entorno
│
├── frontend/                   # Next.js 15 + TypeScript
│   ├── src/
│   │   ├── app/               # App Router Next.js 15
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── auth/          # Login / Registro
│   │   │   ├── productos/     # Catálogo + detalle
│   │   │   ├── carrito/       # Carrito de compras
│   │   │   ├── checkout/      # Proceso de compra
│   │   │   ├── cuenta/        # Panel del cliente
│   │   │   ├── admin/         # Panel administrativo
│   │   │   └── ayuda/         # Centro de ayuda
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   ├── home/          # Hero, Categorías, Productos
│   │   │   ├── productos/     # CardProducto, Detalle
│   │   │   ├── carrito/       # Carrito components
│   │   │   └── admin/         # Componentes admin
│   │   ├── store/             # Zustand (auth, carrito)
│   │   ├── lib/               # Axios API client
│   │   ├── types/             # TypeScript types
│   │   └── styles/            # CSS global + Tailwind
│   └── Dockerfile
│
├── backend/                    # NestJS + TypeScript
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── app.module.ts      # Módulo raíz
│   │   ├── auth/              # JWT Auth (login/registro)
│   │   ├── usuarios/          # Gestión de usuarios
│   │   ├── productos/         # CRUD productos + búsqueda
│   │   ├── categorias/        # Categorías
│   │   ├── pedidos/           # Gestión de pedidos
│   │   ├── proveedores/       # Cadena de suministro
│   │   ├── inventario/        # Control de stock
│   │   ├── soporte/           # Tickets de soporte
│   │   ├── reportes/          # Dashboard analytics
│   │   └── common/            # Prisma, Guards, Filters
│   ├── prisma/
│   │   └── schema.prisma      # Modelos de BD
│   └── Dockerfile
│
└── database/
    └── seeds/
        └── init.sql           # Estructura + datos iniciales
```

---

## 🚀 Inicio Rápido

### Paso 1: Crear archivos .env a partir de .env.example

Antes de ejecutar el proyecto, copia los archivos de ejemplo de variables de entorno:

**Windows (PowerShell):**
```powershell
# Archivo .env en la raíz
Copy-Item .env.example .env

# Archivo .env en backend
Copy-Item backend\.env.example backend\.env
```

**Windows (CMD):**
```cmd
REM Archivo .env en la raíz
copy .env.example .env

REM Archivo .env en backend
copy backend\.env.example backend\.env
```

**macOS / Linux (Bash/Zsh):**
```bash
# Archivo .env en la raíz
cp .env.example .env

# Archivo .env en backend
cp backend/.env.example backend/.env
```

Después de copiarlos, edita los archivos `.env` según tus credenciales (si es necesario).

---

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar / extraer el proyecto
cd llevalope

# 2. Levantar todo con Docker
docker-compose up -d

# 4. Abrir en el navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Base de datos: localhost:5432
```

### Opción 2: Desarrollo Local

#### Requisitos previos
- Node.js 20+
- PostgreSQL 15+
- npm o yarn

#### Base de datos (Windows + PostgreSQL local)
1) Instala PostgreSQL (15+). Durante el instalador, define la contraseña del usuario `postgres` como `postgres` para que el proyecto arranque sin cambios.

2) Ejecuta estos comandos en PowerShell desde la carpeta raíz del proyecto:
```powershell
# Ruta completa de psql.exe (ajusta el 16 si instalaste otra version)
$psql = "$env:ProgramFiles\PostgreSQL\16\bin\psql.exe"

# Verifica que psql funciona
& $psql --version

# Crear base de datos
& $psql -U postgres -c "CREATE DATABASE llevalope;"

# Ejecutar script de inicializacion con la ruta completa del archivo
& $psql -U postgres -d llevalope -f (Resolve-Path ".\database\seeds\init.sql")
```

#### Backend (NestJS)
```bash
cd backend

# Instalar dependencias
npm install

# Variables de entorno
# El archivo backend/.env ya incluye valores por defecto para PostgreSQL local:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/llevalope
# Si tu contraseña de postgres es distinta, actualiza solo ese valor.

# Generar cliente Prisma
npx prisma generate

# Sincronizar esquema (si no usas init.sql)
npx prisma db push

# Iniciar en desarrollo
npm run start:dev
```

#### Frontend (Next.js)
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev
```

---

## 🔑 Credenciales por Defecto

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Administrador | admin@llevalope.pe | Admin123! |
| Cliente demo | maria@ejemplo.com | Admin123! |

---

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|---------|-----|-------------|
| Tienda | http://localhost:3000 | Homepage principal |
| Productos | http://localhost:3000/productos | Catálogo |
| Carrito | http://localhost:3000/carrito | Carrito de compras |
| Login | http://localhost:3000/auth/iniciar-sesion | Autenticación |
| Panel Admin | http://localhost:3000/admin | Dashboard admin |
| API REST | http://localhost:3001/api | Backend NestJS |

---

## 📡 API REST — Endpoints Principales

### Autenticación
```
POST   /api/auth/registrar          Registro de usuario
POST   /api/auth/iniciar-sesion     Login
GET    /api/auth/perfil             Perfil del usuario autenticado
```

### Productos
```
GET    /api/productos               Listar (con paginación y filtros)
GET    /api/productos/destacados    Productos destacados
GET    /api/productos/ofertas       Productos en oferta
GET    /api/productos/:slug         Detalle de producto
POST   /api/productos               Crear producto (admin)
PUT    /api/productos/:id           Actualizar producto (admin)
DELETE /api/productos/:id           Eliminar producto (admin)
```

### Pedidos
```
POST   /api/pedidos                 Crear pedido
GET    /api/pedidos/mis-pedidos     Pedidos del usuario
GET    /api/pedidos/:id             Detalle del pedido
GET    /api/pedidos/admin           Todos los pedidos (admin)
PATCH  /api/pedidos/:id/estado      Actualizar estado
```

### Usuarios
```
GET    /api/usuarios                Listar usuarios (admin)
PATCH  /api/usuarios/perfil         Actualizar perfil
GET    /api/usuarios/carrito        Ver carrito
PATCH  /api/usuarios/carrito        Agregar al carrito
GET    /api/usuarios/direcciones    Direcciones del usuario
```

### Proveedores y Supply Chain
```
GET    /api/proveedores             Listar proveedores
POST   /api/proveedores             Crear proveedor
GET    /api/proveedores/ordenes     Órdenes de compra
POST   /api/proveedores/ordenes     Crear orden de compra
```

### Inventario
```
GET    /api/inventario/stock-bajo   Productos con bajo stock
GET    /api/inventario/movimientos  Historial de movimientos
POST   /api/inventario/ajustar      Ajustar stock manualmente
```

### Soporte
```
POST   /api/soporte/tickets         Crear ticket
GET    /api/soporte/mis-tickets     Tickets del usuario
GET    /api/soporte/admin/tickets   Todos los tickets (admin)
POST   /api/soporte/tickets/:id/responder  Responder ticket
PATCH  /api/soporte/tickets/:id/estado     Actualizar estado
```

### Reportes y Analytics
```
GET    /api/reportes/dashboard          Resumen general
GET    /api/reportes/ventas-por-dia     Ventas por día
GET    /api/reportes/productos-mas-vendidos  Top productos
```

---

## 🎨 Paleta de Colores

| Color | HEX | Uso |
|-------|-----|-----|
| Azul Oscuro | #0D1B2A | Fondo principal, textos |
| Azul Corporativo | #1B263B | Navbar, sidebar |
| Verde Azulado | #006D77 | Acentos, botones |
| Dorado Premium | #D4AF37 | CTAs, highlights |
| Blanco Suave | #F5F3EE | Fondo crema |
| Gris Elegante | #7A7D85 | Textos secundarios |

---

## 🛡️ Seguridad Implementada

- ✅ JWT (JSON Web Tokens) con expiración configurable
- ✅ Roles y permisos: ADMIN, GERENTE, OPERADOR, CLIENTE, PROVEEDOR
- ✅ Guards de autenticación en todas las rutas protegidas
- ✅ Rate limiting con ThrottlerModule
- ✅ Validación de DTOs con class-validator
- ✅ Sanitización automática con ValidationPipe
- ✅ CORS configurado para dominios permitidos
- ✅ Bcrypt para contraseñas (10 rounds)

---

## 📦 Base de Datos — Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| usuarios | Clientes, admins, operadores |
| productos | Catálogo completo |
| categorias | Árbol de categorías |
| marcas | Marcas de productos |
| pedidos | Órdenes de compra de clientes |
| items_pedido | Detalle de productos por pedido |
| proveedores | Proveedores de la cadena |
| ordenes_compra | Órdenes de abastecimiento |
| inventario | Movimientos de stock |
| tickets_soporte | Sistema de soporte |
| cupones | Códigos de descuento |
| banners | Banners promocionales |
| notificaciones | Notificaciones de usuario |

---

## 🔧 Variables de Entorno

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=llevalope
DB_USER=postgres
DB_PASSWORD=sa

# JWT
JWT_SECRET=llevalope_jwt_secret_super_seguro_2024
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=LlevaloPe
```

---

## 🏗️ Funcionalidades Implementadas

### ✅ Frontend
- [x] Homepage con hero, categorías, productos y sección de confianza
- [x] Catálogo de productos con filtros y paginación
- [x] Carrito de compras con Zustand (persiste en localStorage)
- [x] Sistema de autenticación (login/registro)
- [x] Panel de administración con dashboard
- [x] Gestión de productos en admin
- [x] Diseño responsive (mobile-first)
- [x] Animaciones con Framer Motion
- [x] Paleta de colores LlevaloPe implementada en Tailwind

### ✅ Backend
- [x] API REST completa con NestJS
- [x] Autenticación JWT con roles
- [x] CRUD completo de productos
- [x] Gestión de pedidos con historial
- [x] Módulo de proveedores y órdenes de compra
- [x] Control de inventario con movimientos
- [x] Sistema de tickets de soporte
- [x] Dashboard de reportes y métricas
- [x] Rate limiting y validaciones
- [x] Prisma ORM con PostgreSQL

### ✅ Base de Datos
- [x] Esquema completo con 18 tablas
- [x] Enums en español
- [x] Índices optimizados
- [x] Datos de semillas iniciales
- [x] Triggers para timestamps
- [x] Relaciones con integridad referencial

---

## 📈 Escalabilidad

La plataforma está diseñada para escalar:
- **Horizontal**: Múltiples instancias de backend detrás de un load balancer
- **Base de datos**: PostgreSQL con soporte para réplicas de lectura
- **Cache**: Integración lista para Redis
- **CDN**: Imágenes optimizadas con Next.js Image
- **Modular**: Cada módulo es independiente y puede desplegarse por separado

---

**LlevaloPe** — Hecho con ❤️ para el mercado peruano
