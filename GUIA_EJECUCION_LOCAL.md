# 📋 Guía de Ejecución Local de LlevaloPe

Este proyecto es una aplicación full-stack con backend en NestJS y frontend en Next.js, usando PostgreSQL con Prisma.

---

## 📦 Requisitos previos
1. **Node.js 18+** y **npm 10+** instalados.
2. **PostgreSQL 14+** instalado y corriendo en tu equipo.
3. (Opcional) Docker si prefieres usar una base de datos en contenedor.

---

## 🚀 Paso 1: Configurar la Base de Datos
### Opción A: Usar Docker (simplificado)
Ejecuta en la carpeta raíz del proyecto (llevalope/):
```bash
docker-compose up -d postgres
```

### Opción B: Usar PostgreSQL local
1. Crea una base de datos llamada `llevalope` en tu PostgreSQL:
   ```sql
   CREATE DATABASE llevalope;
   ```
2. Verifica que el archivo `.env` (en la carpeta llevalope/) tenga la URL correcta para tu base de datos:
   ```env
   DATABASE_URL="postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/llevalope?schema=public"
   ```
   Por defecto es: `postgresql://postgres:sa@localhost:5432/llevalope?schema=public`

---

## 🚀 Paso 2: Configurar y ejecutar el Backend
1. Ve a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Generar el cliente Prisma (si no lo tienes):
   ```bash
   npx prisma generate
   ```
3. Aplicar las migraciones de la base de datos (o `db push` para modo rápido):
   ```bash
   npx prisma db push
   ```
4. (Opcional) Sembrar la base de datos con datos de prueba:
   ```bash
   npx prisma db seed
   ```
   O si quieres crear un usuario administrador:
   ```bash
   npx ts-node src/scripts/seed-admin.ts
   ```
5. Iniciar el servidor backend (modo desarrollo):
   ```bash
   npm run start:dev
   ```
   El backend estará en **http://localhost:3001/api**

---

## 🚀 Paso 3: Instalar y ejecutar el Frontend
1. Ve a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias (si no lo hiciste):
   ```bash
   npm install
   ```
3. Iniciar el servidor Next.js (modo desarrollo):
   ```bash
   npm run dev
   ```
   El frontend estará en **http://localhost:3000** (o el puerto que aparezca en la consola).

---

## 🔑 Credenciales de Prueba
Si usas el script de seed, las credenciales del usuario admin serán:
- **Correo**: `admin@llevalope.pe`
- **Contraseña**: `Admin123!`

---

## 🛠️ Problemas Comunes
1. **Error de módulo no encontrado en frontend**: Borra `node_modules` y `package-lock.json` y ejecuta `npm install` de nuevo.
2. **Error de conexión a la base de datos**: Asegúrate que PostgreSQL esté corriendo y la URL en el `.env` sea correcta.
3. **Puerto 3000/3001 ocupado**: Modifica los puertos en el archivo `.env` o usa un puerto diferente.

---

## 📁 Estructura del Proyecto
```
llevalope/
├── backend/        # NestJS + Prisma
├── frontend/       # Next.js
├── database/       # Seeds de BD
├── docker-compose.yml
└── .env            # Variables de entorno
```
