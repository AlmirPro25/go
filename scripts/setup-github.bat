@echo off
REM ============================================
REM Script de Setup para GitHub (Windows)
REM AI Web Weaver
REM ============================================

echo.
echo ========================================
echo   AI Web Weaver - Setup GitHub
echo ========================================
echo.

REM Verificar se Git esta instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Git nao esta instalado!
    echo Instale o Git: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [OK] Git instalado
echo.

REM Verificar se ja e um repositorio Git
if exist ".git" (
    echo [AVISO] Repositorio Git ja existe
    set /p continuar="Deseja continuar? (s/n): "
    if /i not "%continuar%"=="s" exit /b 1
) else (
    echo [INFO] Inicializando repositorio Git...
    git init
    echo [OK] Repositorio inicializado
)

echo.

REM Verificar .env
if exist ".env" (
    echo [AVISO] Arquivo .env encontrado!
    echo Certifique-se de que esta no .gitignore
    
    findstr /C:".env" .gitignore >nul 2>&1
    if errorlevel 1 (
        echo [ERRO] .env NAO esta no .gitignore!
        echo Adicione '.env' ao .gitignore antes de continuar
        pause
        exit /b 1
    ) else (
        echo [OK] .env esta no .gitignore
    )
)

echo.

REM Verificar API keys
echo [INFO] Verificando API keys no codigo...
git grep -i "AIza" -- ":!*.md" ":!.env.example" ":!setup-github.bat" >nul 2>&1
if not errorlevel 1 (
    echo [ERRO] POSSIVEL API KEY ENCONTRADA NO CODIGO!
    echo Revise os arquivos antes de fazer push
    git grep -i "AIza" -- ":!*.md" ":!.env.example" ":!setup-github.bat"
    echo.
    set /p continuar="Deseja continuar mesmo assim? (s/n): "
    if /i not "%continuar%"=="s" exit /b 1
) else (
    echo [OK] Nenhuma API key encontrada
)

echo.

REM Adicionar arquivos
echo [INFO] Adicionando arquivos ao Git...
git add .

REM Verificar status
echo.
echo [INFO] Status do repositorio:
git status --short

echo.
set /p commit="Deseja fazer o commit inicial? (s/n): "
if /i "%commit%"=="s" (
    git commit -m "feat: initial commit - AI Web Weaver com Excellence Core" -m "- Excellence Core: Sistema de excelencia programavel" -m "- Single-File Apps: Aplicativos portateis" -m "- 7 Personas especializadas" -m "- Geracao buildless com Vue.js e React" -m "- Score medio de qualidade: 90/100"
    echo [OK] Commit realizado
) else (
    echo [INFO] Commit pulado
    pause
    exit /b 0
)

echo.

REM Configurar remote
echo [INFO] Configurar remote do GitHub
echo.
set /p github_user="Digite seu username do GitHub: "

if "%github_user%"=="" (
    echo [ERRO] Username nao pode ser vazio
    pause
    exit /b 1
)

set /p repo_name="Digite o nome do repositorio [ai-web-weaver]: "
if "%repo_name%"=="" set repo_name=ai-web-weaver

set remote_url=https://github.com/%github_user%/%repo_name%.git

echo.
echo Remote URL: %remote_url%
echo.

REM Verificar se remote ja existe
git remote | findstr /C:"origin" >nul 2>&1
if not errorlevel 1 (
    echo [AVISO] Remote 'origin' ja existe
    for /f "tokens=*" %%i in ('git remote get-url origin') do set current_url=%%i
    echo URL atual: %current_url%
    echo.
    set /p atualizar="Deseja atualizar? (s/n): "
    if /i "%atualizar%"=="s" (
        git remote set-url origin "%remote_url%"
        echo [OK] Remote atualizado
    )
) else (
    git remote add origin "%remote_url%"
    echo [OK] Remote adicionado
)

echo.

REM Renomear branch para main
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo [INFO] Renomeando branch para 'main'...
    git branch -M main
    echo [OK] Branch renomeada
)

echo.

REM Push
echo [INFO] Fazer push para o GitHub?
echo [AVISO] Certifique-se de que o repositorio foi criado no GitHub primeiro!
echo.
echo Acesse: https://github.com/new
echo Nome do repositorio: %repo_name%
echo.
set /p push="Repositorio criado no GitHub? (s/n): "

if /i "%push%"=="s" (
    echo [INFO] Fazendo push...
    
    git push -u origin main
    if not errorlevel 1 (
        echo.
        echo [OK] Push realizado com sucesso!
        echo.
        echo ========================================
        echo   Seu projeto esta no GitHub!
        echo ========================================
        echo.
        echo URL: https://github.com/%github_user%/%repo_name%
        echo.
        echo Proximos passos:
        echo 1. Adicione topics no repositorio
        echo 2. Configure descricao e website
        echo 3. Crie uma release (v1.0.0)
        echo 4. Compartilhe nas redes sociais!
    ) else (
        echo.
        echo [ERRO] Erro no push
        echo.
        echo Possiveis causas:
        echo 1. Repositorio nao existe no GitHub
        echo 2. Sem permissao de acesso
        echo 3. Problemas de autenticacao
        echo.
        echo Tente manualmente:
        echo git push -u origin main
    )
) else (
    echo.
    echo [INFO] Push pulado
    echo.
    echo Para fazer push manualmente:
    echo git push -u origin main
)

echo.
echo ========================================
echo   Setup concluido!
echo ========================================
echo.
pause
