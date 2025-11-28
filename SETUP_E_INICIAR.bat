@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     🚀 AI WEB WEAVER - SETUP COMPLETO 🚀                  ║
echo ║                                                            ║
echo ║     Instalando dependências e iniciando sistema...        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verifica se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado!
    echo    Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version
echo.

REM Cria workspace
if not exist "workspace" (
    echo 📁 Criando workspace...
    mkdir workspace
    echo ✅ Workspace criado
) else (
    echo ✅ Workspace já existe
)
echo.

REM Instala dependências do backend
echo ╔════════════════════════════════════════════════════════════╗
echo ║   📦 INSTALANDO DEPENDÊNCIAS DO BACKEND 📦                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do backend...
    cd backend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do backend!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Dependências do backend instaladas!
) else (
    echo ✅ Dependências do backend já instaladas
)
echo.

REM Instala dependências do frontend
echo ╔════════════════════════════════════════════════════════════╗
echo ║   📦 INSTALANDO DEPENDÊNCIAS DO FRONTEND 📦               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

if not exist "node_modules" (
    echo 📦 Instalando dependências do frontend...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao instalar dependências do frontend!
        pause
        exit /b 1
    )
    echo ✅ Dependências do frontend instaladas!
) else (
    echo ✅ Dependências do frontend já instaladas
)
echo.

REM Verifica .env
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado!
    echo 📝 Criando .env com configurações padrão...
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env encontrado
)
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     ✅ SETUP COMPLETO! INICIANDO SISTEMA... ✅            ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🔧 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:5173
echo 📁 Workspace: %cd%\workspace
echo.
echo ⚠️  IMPORTANTE: Aguarde os serviços iniciarem!
echo.

REM Inicia backend
start "AI Web Weaver - Backend" cmd /k "cd backend && npm run dev"

REM Aguarda 5 segundos
timeout /t 5 /nobreak >nul

REM Inicia frontend
start "AI Web Weaver - Frontend" cmd /k "npm run dev"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     🎉 SISTEMA INICIADO COM SUCESSO! 🎉                   ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📖 Próximos passos:
echo.
echo    1. Aguarde backend e frontend iniciarem (janelas separadas)
echo    2. Abra http://localhost:5173 no navegador
echo    3. Faça login ou registre-se
echo    4. Teste: "Forje o Nexus Bank"
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
