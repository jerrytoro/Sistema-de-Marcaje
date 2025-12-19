# 🚀 Guía Rápida de Instalación
## Sistema de Asistencia con Reconocimiento Facial

---

## 📦 ARCHIVOS A DESCARGAR

Descarga SOLO estos 4 archivos esenciales:

1. ✅ **schema.prisma** - Schema de la base de datos
2. ✅ **database-scripts.sql** - Funciones y vistas SQL
3. ✅ **install.sh** (Linux/Mac) o **install.ps1** (Windows) - Script de instalación automática
4. ✅ **.env.example** - Plantilla de variables de entorno

**Opcional (solo para referencia)**:
- DATABASE_DOCUMENTATION.md
- REPORTES_MENSUALES.md
- EJEMPLO_REPORTE_PDF.md

---

## ⚡ INSTALACIÓN RÁPIDA

### 🐧 Linux / macOS

```bash
# 1. Dar permisos de ejecución al script
chmod +x install.sh

# 2. Ejecutar script de instalación (hace TODO automáticamente)
./install.sh

# El script hará:
# ✓ Verificar Node.js
# ✓ Instalar PostgreSQL
# ✓ Crear base de datos
# ✓ Crear estructura de proyecto
# ✓ Instalar NestJS backend
# ✓ Instalar Vue 3 frontend
# ✓ Aplicar migraciones de Prisma
# ✓ Configurar todo
```

### 🪟 Windows

```powershell
# 1. Abrir PowerShell como Administrador

# 2. Permitir ejecución de scripts (solo primera vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Ejecutar script de instalación
.\install.ps1

# El script hará lo mismo que en Linux
```

---

## 📋 REQUISITOS PREVIOS

### Instalar ANTES de ejecutar el script:

1. **Node.js 20 LTS**
   - Descarga: https://nodejs.org/
   - Verificar: `node -v` (debe ser v18+)

2. **PostgreSQL 16** (el script puede instalarlo automáticamente en Linux/Mac)
   - Linux: El script lo instala
   - macOS: El script lo instala (requiere Homebrew)
   - Windows: Descargar desde https://www.postgresql.org/download/windows/

---

## 🎯 DESPUÉS DE LA INSTALACIÓN

### 1. Iniciar Backend

```bash
cd backend
npm run start:dev
```

✅ Backend corriendo en: **http://localhost:3000**

### 2. Iniciar Frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

✅ Frontend corriendo en: **http://localhost:5173**

---

## 🔑 CREDENCIALES POR DEFECTO

**Usuario administrador**:
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANTE**: Cambiar en producción

---

## 📂 ESTRUCTURA DEL PROYECTO FINAL

```
proyecto/
├── backend/               # NestJS
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   ├── .env
│   └── package.json
│
├── frontend/              # Vue 3
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── router/
│   └── package.json
│
└── docs/                  # Documentación
```

---

## 🛠️ INSTALACIÓN MANUAL (si el script falla)

### Paso 1: Instalar PostgreSQL

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS**:
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows**:
- Descargar instalador desde PostgreSQL.org
- Seguir wizard de instalación

### Paso 2: Crear Base de Datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE asistencia_db;
CREATE USER asistencia_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE asistencia_db TO asistencia_user;
\q
```

### Paso 3: Crear Proyecto Backend

```bash
# Crear directorio
mkdir backend && cd backend

# Instalar NestJS CLI
npm install -g @nestjs/cli

# Crear proyecto
nest new . --skip-git --package-manager npm

# Instalar dependencias
npm install @prisma/client prisma
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install class-validator class-transformer
npm install @nestjs/config @nestjs/schedule
npm install pdfkit
npm install -D @types/pdfkit @types/bcrypt @types/passport-jwt

# Crear directorio de Prisma
mkdir prisma

# Copiar schema.prisma a backend/prisma/

# Crear .env
echo 'DATABASE_URL="postgresql://asistencia_user:tu_password@localhost:5432/asistencia_db?schema=public"' > .env
echo 'JWT_SECRET="tu_secreto_jwt"' >> .env
echo 'PORT=3000' >> .env

# Generar y aplicar migraciones
npx prisma generate
npx prisma migrate dev --name init

# Aplicar scripts SQL
psql -U asistencia_user -d asistencia_db -f ../database-scripts.sql
```

### Paso 4: Crear Proyecto Frontend

```bash
# Crear directorio
cd ..
mkdir frontend && cd frontend

# Crear proyecto Vue 3
npm create vite@latest . -- --template vue

# Instalar dependencias
npm install
npm install vue-router@4 axios bootstrap@5 sweetalert2 @fortawesome/fontawesome-free

# Crear estructura
mkdir -p src/{components,views,services,router,composables}
```

---

## 🔍 VERIFICAR INSTALACIÓN

### 1. Verificar Base de Datos

```bash
psql -U asistencia_user -d asistencia_db
\dt
# Debe mostrar las tablas: usuarios, funcionarios, asistencias, etc.
\q
```

### 2. Verificar Backend

```bash
cd backend
npm run start:dev
# Debe iniciar sin errores en http://localhost:3000
```

### 3. Verificar Frontend

```bash
cd frontend
npm run dev
# Debe abrir en http://localhost:5173
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "PostgreSQL no está corriendo"

```bash
# Linux
sudo systemctl start postgresql

# macOS
brew services start postgresql@16

# Windows
# Abrir "Servicios" y buscar PostgreSQL, iniciar servicio
```

### Error: "Cannot connect to database"

- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos existe

### Error: "Prisma schema not found"

```bash
# Asegurarse de que schema.prisma esté en backend/prisma/
cp schema.prisma backend/prisma/
cd backend
npx prisma generate
```

### Error: "Port 3000 already in use"

```bash
# Cambiar puerto en backend/.env
PORT=3001
```

---

## 📞 PRÓXIMOS PASOS

Una vez instalado correctamente:

1. ✅ **Base de datos funcionando**
2. ✅ **Backend corriendo**
3. ✅ **Frontend corriendo**

**Ahora puedes proceder a**:
- Desarrollar módulos del backend
- Crear componentes del frontend
- Implementar reconocimiento facial
- Configurar n8n para notificaciones

---

## 📚 COMANDOS ÚTILES

### Backend (NestJS)

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Generar módulo
nest g module nombre

# Generar controlador
nest g controller nombre

# Generar servicio
nest g service nombre
```

### Frontend (Vue 3)

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

### Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Abrir Prisma Studio (GUI)
npx prisma studio
```

---

## ⏱️ TIEMPO ESTIMADO DE INSTALACIÓN

- **Con script automático**: 5-10 minutos
- **Manual**: 15-20 minutos

---

## ✅ CHECKLIST FINAL

Marca cuando completes cada paso:

- [ ] Node.js instalado
- [ ] PostgreSQL instalado
- [ ] Base de datos creada
- [ ] Backend configurado
- [ ] Frontend configurado
- [ ] Migraciones aplicadas
- [ ] Scripts SQL ejecutados
- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] Acceso a http://localhost:3000 y http://localhost:5173

---

**¡Listo para desarrollar! 🎉**

Si todo está marcado, tu entorno está completamente configurado y puedes comenzar a desarrollar el sistema.

---

**Versión**: 1.0.0  
**Fecha**: Diciembre 2025  
**Sistema**: Control de Asistencia con Reconocimiento Facial
