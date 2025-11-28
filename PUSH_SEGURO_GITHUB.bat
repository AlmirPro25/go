@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🚀 PUSH SEGURO PARA GITHUB - AI WEB WEAVER               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/6] 🔒 Verificando segurança...
echo.

REM Verificar se .env está no .gitignore
findstr /C:".env" .gitignore >nul
if %errorlevel% neq 0 (
    echo ⚠️  AVISO: .env não está no .gitignore!
    echo    Adicionando agora...
    echo .env >> .gitignore
    echo    ✅ .env adicionado ao .gitignore
) else (
    echo ✅ .env está protegido no .gitignore
)

echo.
echo [2/6] 📋 Removendo .env do stage (se estiver)...
git restore --staged .env 2>nul
git reset HEAD .env 2>nul
echo ✅ .env removido do stage

echo.
echo [3/6] ➕ Adicionando arquivos seguros...
echo.

REM Adicionar arquivos por categoria
git add services/
git add src/
git add components/
git add backend/
git add neural-core/
git add proxy-server/
git add cli/
git add aurora-build/
git add store/
git add hooks/
git add lib/
git add types/
git add config/

REM Adicionar arquivos de configuração seguros
git add .gitignore
git add .env.example
git add package.json
git add package-lock.json
git add tsconfig.json
git add vite.config.ts
git add index.html

REM Adicionar documentação
git add *.md
git add *.txt

REM Adicionar scripts
git add *.bat

echo ✅ Arquivos adicionados ao stage

echo.
echo [4/6] 📊 Verificando o que será commitado...
echo.
git status --short
echo.

echo [5/6] 💾 Fazendo commit...
echo.
git commit -m "feat: Sistema completo integrado com Mesh Network, Neural Core e Self-Healing

✨ Funcionalidades Principais:
- Arquitetura híbrida implementada
- Mesh Network distribuído
- Neural Core com Gemini 2.5
- Self-Healing Engine
- Terminal AI integrado
- Backend Go + Frontend React
- Proxy server Hono
- Manifestos TDD e arquitetura

📚 Documentação:
- Guias de início rápido
- Manuais de integração
- Scripts de inicialização
- Testes e exemplos

🔒 Segurança:
- API Keys protegidas
- .env no .gitignore
- Configuração via variáveis de ambiente
"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao fazer commit!
    echo    Verifique os erros acima.
    pause
    exit /b 1
)

echo ✅ Commit realizado com sucesso!

echo.
echo [6/6] 🚀 Fazendo push para GitHub...
echo.

REM Verificar se remote existe
git remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  AVISO: Remote 'origin' não configurado!
    echo.
    echo    Configure o remote primeiro:
    echo    git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
    echo.
    pause
    exit /b 1
)

echo Fazendo push para origin/main...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Erro ao fazer push!
    echo.
    echo    Possíveis soluções:
    echo    1. Verificar autenticação (usar Personal Access Token)
    echo    2. Fazer pull primeiro: git pull origin main --rebase
    echo    3. Forçar push (CUIDADO): git push origin main --force
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ PUSH CONCLUÍDO COM SUCESSO!                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Seu sistema está no GitHub!
echo.
echo 📋 Próximos passos:
echo    1. Acesse seu repositório no GitHub
echo    2. Verifique se todos os arquivos estão lá
echo    3. Configure GitHub Pages (se aplicável)
echo    4. Adicione badges ao README
echo    5. Configure GitHub Actions (opcional)
echo.
echo 🔗 Documentação criada:
echo    - PUBLICAR_NO_GITHUB.md
echo    - SEGURANCA_ANTES_PUSH.md
echo.

pause
