@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║     🚀 AI WEB WEAVER - SISTEMA COMPLETO 🚀                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 Verificando estrutura...
echo.

REM Cria workspace se não existir
if not exist "workspace" (
    echo 📁 Criando workspace...
    mkdir workspace
    echo ✅ Workspace criado
) else (
    echo ✅ Workspace já existe
)
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║              🚀 INICIANDO SERVIÇOS 🚀                      ║
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

REM Aguarda 3 segundos
timeout /t 3 /nobreak >nul

REM Inicia frontend
start "AI Web Weaver - Frontend" cmd /k "npm run dev"

echo.
echo ✅ Serviços iniciados!
echo.
echo 📖 Próximos passos:
echo    1. Aguarde backend e frontend iniciarem (janelas separadas)
echo    2. Abra http://localhost:5173 no navegador
echo    3. Faça login ou registre-se
echo    4. Teste: "Forje o Nexus Bank"
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
