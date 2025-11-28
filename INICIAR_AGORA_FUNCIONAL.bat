@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║        🚀 INICIANDO SISTEMA AI WEB WEAVER 🚀                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 📦 Verificando Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo ✅ Node.js encontrado!
echo.
echo 🔥 Iniciando servidor de desenvolvimento...
echo.
echo 🌐 O sistema estará disponível em: http://localhost:5173
echo.
echo ⚠️  IMPORTANTE: Mantenha esta janela aberta!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Executa npm através do node diretamente
node "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js" run dev

pause
