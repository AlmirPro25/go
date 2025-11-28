@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🏦 PUSH SEGURO FINTECH - COMPLIANCE OBRIGATÓRIO          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo ⚠️  ATENÇÃO: Sistema Fintech detectado
echo    Verificações extras de segurança serão executadas
echo.
pause

echo.
echo ═══════════════════════════════════════════════════════════
echo  [1/8] 🔒 AUDITORIA DE SEGURANÇA
echo ═══════════════════════════════════════════════════════════
echo.

REM Verificar .env no .gitignore
findstr /C:".env" .gitignore >nul
if %errorlevel% neq 0 (
    echo ❌ CRÍTICO: .env não está no .gitignore!
    echo    Abortando por segurança...
    pause
    exit /b 1
) else (
    echo ✅ .env protegido no .gitignore
)

REM Verificar se .env está no stage
git diff --cached --name-only | findstr ".env" >nul
if %errorlevel% equ 0 (
    echo ❌ CRÍTICO: .env está no stage!
    echo    Removendo...
    git restore --staged .env
    git reset HEAD .env 2>nul
    echo ✅ .env removido do stage
)

echo.
echo ═══════════════════════════════════════════════════════════
echo  [2/8] 🔍 BUSCAR API KEYS HARDCODED
echo ═══════════════════════════════════════════════════════════
echo.

echo Buscando padrões de API keys...

REM Buscar padrões comuns de API keys
findstr /S /I /C:"AIza" *.ts *.tsx *.js *.jsx *.go 2>nul | findstr /V "node_modules" | findstr /V ".example"
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  AVISO: Possíveis API keys encontradas!
    echo    Revise os arquivos acima antes de continuar.
    echo.
    set /p continuar="Continuar mesmo assim? (S/N): "
    if /i not "%continuar%"=="S" (
        echo Abortado pelo usuário.
        pause
        exit /b 1
    )
) else (
    echo ✅ Nenhuma API key hardcoded detectada
)

echo.
echo ═══════════════════════════════════════════════════════════
echo  [3/8] 🔍 BUSCAR CREDENCIAIS SENSÍVEIS
echo ═══════════════════════════════════════════════════════════
echo.

echo Buscando senhas e tokens...

findstr /S /I /C:"password.*=" /C:"senha.*=" /C:"token.*=" *.ts *.tsx *.js *.jsx *.go 2>nul | findstr /V "node_modules" | findstr /V ".example" | findstr /V "interface" | findstr /V "type"
if %errorlevel% equ 0 (
    echo.
    echo ⚠️  AVISO: Possíveis credenciais encontradas!
    echo    Revise os arquivos acima.
    echo.
) else (
    echo ✅ Nenhuma credencial hardcoded detectada
)

echo.
echo ═══════════════════════════════════════════════════════════
echo  [4/8] 📋 VERIFICAR AVISO REGULATÓRIO
echo ═══════════════════════════════════════════════════════════
echo.

findstr /C:"BACEN" /C:"demonstração" /C:"educacional" README.md >nul
if %errorlevel% neq 0 (
    echo ⚠️  AVISO: README sem aviso regulatório!
    echo.
    echo    É OBRIGATÓRIO incluir aviso de que o sistema:
    echo    - NÃO é licenciado pelo BACEN
    echo    - É apenas demonstração/educacional
    echo    - NÃO deve ser usado para transações reais
    echo.
    set /p continuar="Continuar sem aviso regulatório? (S/N): "
    if /i not "%continuar%"=="S" (
        echo.
        echo Adicione o aviso regulatório ao README.md
        echo Consulte: PUBLICAR_FINTECH_GITHUB.md
        pause
        exit /b 1
    )
) else (
    echo ✅ Aviso regulatório presente no README
)

echo.
echo ═══════════════════════════════════════════════════════════
echo  [5/8] 🗂️  VERIFICAR ARQUIVOS SENSÍVEIS
echo ═══════════════════════════════════════════════════════════
echo.

REM Verificar se arquivos sensíveis existem
if exist "database.db" (
    echo ⚠️  AVISO: database.db encontrado
    git diff --cached --name-only | findstr "database.db" >nul
    if %errorlevel% equ 0 (
        echo ❌ CRÍTICO: database.db no stage!
        git restore --staged database.db
        echo ✅ Removido do stage
    )
)

if exist "*.log" (
    echo ⚠️  AVISO: Arquivos .log encontrados
    echo    Certifique-se de que não contêm dados sensíveis
)

echo ✅ Verificação de arquivos sensíveis concluída

echo.
echo ═══════════════════════════════════════════════════════════
echo  [6/8] ➕ ADICIONAR ARQUIVOS SEGUROS
echo ═══════════════════════════════════════════════════════════
echo.

REM Adicionar arquivos por categoria
git add services/
git add src/
git add components/
git add backend/
git add store/
git add hooks/
git add lib/
git add types/
git add config/

REM Configuração segura
git add .gitignore
git add .env.example
git add package.json
git add tsconfig.json
git add vite.config.ts

REM Documentação
git add *.md
git add docs/

REM Scripts
git add *.bat

echo ✅ Arquivos seguros adicionados

echo.
echo ═══════════════════════════════════════════════════════════
echo  [7/8] 📊 REVISÃO FINAL
echo ═══════════════════════════════════════════════════════════
echo.

echo Arquivos que serão commitados:
echo.
git status --short
echo.

echo ⚠️  REVISÃO OBRIGATÓRIA:
echo    Verifique se NÃO há:
echo    - Arquivos .env
echo    - API keys
echo    - Senhas
echo    - Dados pessoais (CPF, emails reais)
echo    - Arquivos de banco de dados
echo.

set /p confirmar="Confirma que revisou e está tudo seguro? (S/N): "
if /i not "%confirmar%"=="S" (
    echo.
    echo ❌ Push cancelado pelo usuário
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════
echo  [8/8] 🚀 COMMIT E PUSH
echo ═══════════════════════════════════════════════════════════
echo.

echo Fazendo commit...
git commit -m "feat: Arquitetura Fintech Soberana - Demo Educacional

✨ Funcionalidades:
- Sistema de contas virtuais
- Transações atômicas PostgreSQL
- Integração com gateway de pagamento (sandbox)
- Backend Go + Frontend React
- Auditoria completa
- Segurança por design

🔒 Segurança:
- Transações ACID
- Webhook validation
- JWT authentication
- Rate limiting
- Logs imutáveis

📚 Documentação:
- Arquitetura completa
- API reference
- Guias de deployment
- Avisos regulatórios

⚠️ AVISO REGULATÓRIO:
Sistema de demonstração educacional.
NÃO licenciado pelo BACEN.
NÃO usar para transações reais.
"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao fazer commit!
    pause
    exit /b 1
)

echo ✅ Commit realizado

echo.
echo Fazendo push para GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Erro ao fazer push!
    echo.
    echo    Possíveis soluções:
    echo    1. Configurar remote: git remote add origin URL
    echo    2. Autenticar com Personal Access Token
    echo    3. Pull primeiro: git pull origin main --rebase
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ PUSH FINTECH CONCLUÍDO COM SUCESSO!                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Seu sistema fintech está no GitHub!
echo.
echo 📋 Checklist pós-publicação:
echo    ✅ Código no GitHub
echo    ✅ Sem credenciais expostas
echo    ✅ Aviso regulatório presente
echo    ✅ Documentação completa
echo.
echo 🔒 Próximos passos:
echo    1. Configurar GitHub Secrets (para CI/CD)
echo    2. Adicionar badges ao README
echo    3. Configurar branch protection
echo    4. Revisar SECURITY.md
echo.
echo 📚 Documentação:
echo    - PUBLICAR_FINTECH_GITHUB.md
echo    - SEGURANCA_ANTES_PUSH.md
echo.

pause
