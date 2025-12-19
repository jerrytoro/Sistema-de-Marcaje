@echo off
echo ========================================
echo INSTALANDO DEPENDENCIAS DE RECONOCIMIENTO FACIAL
echo ========================================
echo.

cd backend

echo [1/5] Instalando @vladmandic/face-api...
call npm install @vladmandic/face-api

echo.
echo [2/5] Instalando canvas (para procesamiento de imagenes)...
call npm install canvas

echo.
echo [3/5] Instalando @tensorflow/tfjs-node (CPU)...
call npm install @tensorflow/tfjs-node

echo.
echo [4/5] Instalando multer (para subida de archivos)...
call npm install multer @types/multer --save-dev

echo.
echo [5/5] Instalando sharp (procesamiento de imagenes)...
call npm install sharp

echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo Dependencias instaladas:
echo - @vladmandic/face-api (reconocimiento facial)
echo - canvas (procesamiento)
echo - @tensorflow/tfjs-node (IA)
echo - multer (subida de archivos)
echo - sharp (optimizacion de imagenes)
echo.
pause
