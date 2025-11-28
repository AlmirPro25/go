@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║        🧠 NEURAL CORE - INICIALIZAÇÃO RÁPIDA 🧠              ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0\neural-core"

if not exist ".env" (
    echo ❌ Arquivo .env não encontrado!
    echo 📝 Criando .env com API Key...
    copy .env.example .env
    echo.
    echo ⚠️  ATENÇÃO: Configure sua GEMINI_API_KEY no arquivo neural-core\.env
    echo.
    pause
    exit /b 1
)

echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo 📥 Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
)

echo.
echo ✅ Tudo pronto!
echo.
echo 🚀 Iniciando Neural Core...
echo 📡 Servidor: http://localhost:3000
echo 🔑 API Key: Configurada
echo.
echo 💡 DICA: Abra outro terminal e execute:
echo    npm run dev
echo    (para iniciar o frontend)
echo.
echo ⚠️  Para parar, pressione Ctrl+C
echo.

call npm run dev

pause
