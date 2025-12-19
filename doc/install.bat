@echo off
REM ============================================
REM Script de Instalacion Automatizada - Windows CMD
REM Sistema de Asistencia con Reconocimiento Facial
REM ============================================

setlocal enabledelayedexpansion

echo ================================================
echo    INSTALACION AUTOMATICA DEL SISTEMA
echo ================================================
echo.

REM ============================================
REM 1. VERIFICAR REQUISITOS
REM ============================================
echo [1/7] Verificando requisitos previos...
echo.

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado
    echo Descarga Node.js 20 LTS desde: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detectado

REM Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm no esta instalado
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [OK] npm %NPM_VERSION% detectado
echo.

REM ============================================
REM 2. VERIFICAR POSTGRESQL
REM ============================================
echo [2/7] Verificando PostgreSQL...
echo.

where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] PostgreSQL no esta instalado
    echo Descarga PostgreSQL 16 desde:
    echo https://www.postgresql.org/download/windows/
    echo.
    set /p CONTINUE="Deseas continuar sin PostgreSQL? (s/n): "
    if /i not "!CONTINUE!"=="s" (
        exit /b 1
    )
) else (
    echo [OK] PostgreSQL detectado
)
echo.

REM ============================================
REM 3. CONFIGURAR BASE DE DATOS
REM ============================================
echo [3/7] Configurando base de datos...
echo.

set /p DB_NAME="Nombre de la base de datos [asistencia_db]: "
if "!DB_NAME!"=="" set DB_NAME=asistencia_db

set /p DB_USER="Usuario de PostgreSQL [asistencia_user]: "
if "!DB_USER!"=="" set DB_USER=asistencia_user

set /p DB_PASSWORD="Contrasena para %DB_USER%: "
if "!DB_PASSWORD!"=="" set DB_PASSWORD=admin123

echo.
echo Creando base de datos...

REM Crear script SQL temporal
echo CREATE DATABASE %DB_NAME%; > temp_create_db.sql
echo CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%'; >> temp_create_db.sql
echo GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%; >> temp_create_db.sql

REM Ejecutar script
set PGPASSWORD=postgres
psql -U postgres -h localhost -f temp_create_db.sql 2>nul

if %errorlevel% equ 0 (
    echo [OK] Base de datos '%DB_NAME%' creada
) else (
    echo [ADVERTENCIA] Error al crear la base de datos
    echo Verifica que PostgreSQL este corriendo y que el usuario 'postgres' exista
)

del temp_create_db.sql
echo.

REM ============================================
REM 4. CREAR ESTRUCTURA DE PROYECTO
REM ============================================
echo [4/7] Creando estructura de directorios...
echo.

if not exist backend mkdir backend
if not exist frontend mkdir frontend
if not exist docs mkdir docs

echo [OK] Estructura de directorios creada
echo.

REM ============================================
REM 5. CONFIGURAR BACKEND (NestJS)
REM ============================================
echo [5/7] Configurando backend NestJS...
echo Este proceso puede tardar varios minutos...
echo.

cd backend

REM Instalar NestJS CLI globalmente
echo Instalando NestJS CLI...
call npm install -g @nestjs/cli

REM Crear proyecto NestJS
echo Creando proyecto NestJS...
call nest new . --skip-git --package-manager npm

REM Instalar dependencias necesarias
echo Instalando dependencias del backend...
call npm install @prisma/client prisma
call npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
call npm install class-validator class-transformer
call npm install @nestjs/config
call npm install @nestjs/schedule
call npm install pdfkit
call npm install -D @types/pdfkit @types/bcrypt @types/passport-jwt prisma

REM Crear directorio de Prisma
if not exist prisma mkdir prisma

REM Crear archivo .env
echo DATABASE_URL="postgresql://%DB_USER%:%DB_PASSWORD%@localhost:5432/%DB_NAME%?schema=public" > .env
echo JWT_SECRET=%RANDOM%%RANDOM%%RANDOM%%RANDOM% >> .env
echo JWT_EXPIRES_IN=7d >> .env
echo PORT=3000 >> .env

echo [OK] Backend configurado
echo.

cd ..

REM ============================================
REM 6. CONFIGURAR FRONTEND (Vue 3)
REM ============================================
echo [6/7] Configurando frontend Vue 3...
echo Este proceso puede tardar varios minutos...
echo.

cd frontend

REM Crear proyecto Vue 3 con Vite
echo Creando proyecto Vue 3...
call npm create vite@latest . -- --template vue

REM Instalar dependencias
echo Instalando dependencias base...
call npm install

REM Instalar bibliotecas adicionales
echo Instalando bibliotecas adicionales...
call npm install vue-router@4
call npm install axios
call npm install bootstrap@5
call npm install sweetalert2
call npm install @fortawesome/fontawesome-free

REM Crear estructura de directorios
if not exist src\components mkdir src\components
if not exist src\views mkdir src\views
if not exist src\services mkdir src\services
if not exist src\router mkdir src\router
if not exist src\composables mkdir src\composables

echo [OK] Frontend configurado
echo.

cd ..

REM ============================================
REM 7. APLICAR MIGRACIONES DE PRISMA
REM ============================================
echo [7/7] Configurando Prisma...
echo.

cd backend

REM Copiar schema.prisma si existe
if exist "..\schema.prisma" (
    copy "..\schema.prisma" "prisma\schema.prisma" >nul
    echo [OK] Schema de Prisma copiado
    
    REM Generar cliente Prisma
    echo Generando cliente Prisma...
    call npx prisma generate
    
    REM Ejecutar migraciones
    echo Ejecutando migraciones...
    call npx prisma migrate dev --name init
) else (
    echo [ADVERTENCIA] Archivo schema.prisma no encontrado
    echo Copia manualmente el archivo schema.prisma a backend\prisma\
)

REM Aplicar scripts SQL
if exist "..\database-scripts.sql" (
    echo Aplicando scripts SQL...
    set PGPASSWORD=%DB_PASSWORD%
    psql -U %DB_USER% -d %DB_NAME% -h localhost -f "..\database-scripts.sql" 2>nul
    if %errorlevel% equ 0 (
        echo [OK] Scripts SQL aplicados
    )
)

cd ..

REM ============================================
REM RESUMEN FINAL
REM ============================================
echo.
echo ================================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ================================================
echo.
echo Configuracion de la base de datos:
echo   - Base de datos: %DB_NAME%
echo   - Usuario: %DB_USER%
echo   - Host: localhost
echo   - Puerto: 5432
echo.
echo Proximos pasos:
echo   En una terminal CMD:
echo     cd backend
echo     npm run start:dev
echo.
echo   En otra terminal CMD:
echo     cd frontend
echo     npm run dev
echo.
echo El sistema estara disponible en:
echo   - Backend: http://localhost:3000
echo   - Frontend: http://localhost:5173
echo.
echo Credenciales por defecto (admin):
echo   - Usuario: admin
echo   - Contrasena: admin123 (cambiar en produccion)
echo.
echo ================================================
echo.

pause
