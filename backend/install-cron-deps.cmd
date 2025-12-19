@echo off
echo ========================================
echo INSTALANDO DEPENDENCIAS DE CRON JOBS
echo ========================================
echo.

cd backend

echo [1/2] Instalando @nestjs/schedule (cron jobs)...
call npm install @nestjs/schedule

echo.
echo [2/2] Instalando date-fns (manejo de fechas)...
call npm install date-fns

echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo Dependencias instaladas:
echo - @nestjs/schedule (cron jobs)
echo - date-fns (utilidades de fechas)
echo.
echo SIGUIENTE: Copiar archivos del modulo
echo.
pause
