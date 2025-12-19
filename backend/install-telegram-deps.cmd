@echo off
echo ========================================
echo INSTALANDO DEPENDENCIAS DE TELEGRAM BOT
echo ========================================
echo.

cd backend

echo [1/4] Instalando node-telegram-bot-api...
call npm install node-telegram-bot-api @types/node-telegram-bot-api

echo.
echo [2/4] Instalando qrcode (generacion de QR)...
call npm install qrcode @types/qrcode

echo.
echo [3/4] Instalando axios (para webhooks)...
call npm install axios

echo.
echo [4/4] Instalando crypto (generacion de tokens)...
echo (ya incluido en Node.js)

echo.
echo ========================================
echo INSTALACION COMPLETADA
echo ========================================
echo.
echo Dependencias instaladas:
echo - node-telegram-bot-api (bot de Telegram)
echo - qrcode (generacion de codigos QR)
echo - axios (webhooks HTTP)
echo.
echo SIGUIENTE: Crear bot en Telegram con @BotFather
echo.
pause
