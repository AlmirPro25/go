@echo off
echo ╔════════════════════════════════════════╗
echo ║   📦 INSTALANDO DEPENDÊNCIAS 📦       ║
echo ╚════════════════════════════════════════╝
echo.

echo 📦 Instalando dependências do backend...
cd backend
call npm install
cd ..
echo ✅ Backend pronto!
echo.

echo 📦 Instalando dependências do frontend...
call npm install
echo ✅ Frontend pronto!
echo.

echo ╔════════════════════════════════════════╗
echo ║   ✅ TUDO INSTALADO COM SUCESSO! ✅   ║
echo ╚════════════════════════════════════════╝
echo.
echo Agora execute: INICIAR_TUDO.bat
echo.
pause
