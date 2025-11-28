@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║        🧠 INICIANDO NEURAL CORE - ORQUESTRADOR 🧠            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo 📥 Instalando dependências pela primeira vez...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependências OK!
echo.
echo 🚀 Iniciando Neural Core em modo desenvolvimento...
echo.
echo 📡 Servidor estará disponível em: http://localhost:3000
echo 🔑 API Key configurada: ✅
echo.
echo ⚠️  Para parar o servidor, pressione Ctrl+C
echo.

call npm run dev

pause
