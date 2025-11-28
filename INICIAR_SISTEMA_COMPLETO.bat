@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     🚀 AI WEB WEAVER - SISTEMA AUTÔNOMO COMPLETO 🚀       ║
echo ║                                                            ║
echo ║              Backend + Frontend + Terminal AI              ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 Verificando dependências...
echo.

REM Verifica se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado!
    echo    Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

REM Verifica se npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm não encontrado!
    pause
    exit /b 1
)

echo ✅ npm encontrado:
npm --version
echo.

REM Cria diretório workspace se não existir
if not exist "workspace" (
    echo 📁 Criando diretório workspace...
    mkdir workspace
    echo ✅ Diretório workspace criado
    echo.
)

REM Instala dependências do backend se necessário
if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do backend...
    cd backend
    call npm install
    cd ..
    echo ✅ Dependências do backend instaladas
    echo.
)

REM Instala dependências do frontend se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependências do frontend...
    call npm install
    echo ✅ Dependências do frontend instaladas
    echo.
)

echo ╔════════════════════════════════════════════════════════════╗
echo ║                  🚀 INICIANDO SISTEMA 🚀                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🔧 Backend rodando em: http://localhost:5000
echo 🌐 Frontend rodando em: http://localhost:5173
echo 📁 Workspace: %cd%\workspace
echo.
echo ⚠️  IMPORTANTE: Mantenha esta janela aberta!
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Inicia backend em uma nova janela
start "AI Web Weaver - Backend" cmd /k "cd backend && npm run dev"

REM Aguarda 3 segundos para o backend iniciar
timeout /t 3 /nobreak >nul

REM Inicia frontend em uma nova janela
start "AI Web Weaver - Frontend" cmd /k "npm run dev"

echo ✅ Sistema iniciado com sucesso!
echo.
echo 📖 Próximos passos:
echo    1. Aguarde o backend e frontend iniciarem (janelas separadas)
echo    2. Abra http://localhost:5173 no navegador
echo    3. Faça login ou registre-se
echo    4. Comece a usar o Terminal AI!
echo.
echo 💡 Comandos de teste:
echo    - "Liste os arquivos do projeto"
echo    - "Instale o axios"
echo    - "Crie um projeto React"
echo    - "Forje o Nexus Bank" (Fintech completa!)
echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo Pressione qualquer tecla para fechar esta janela...
echo (O backend e frontend continuarão rodando)
pause >nul
