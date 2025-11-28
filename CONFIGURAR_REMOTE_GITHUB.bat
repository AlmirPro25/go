@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🔗 CONFIGURAR REMOTE DO GITHUB                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Este script ajuda a configurar o repositório remoto do GitHub.
echo.

REM Verificar se já existe remote
git remote -v | findstr "origin" >nul
if %errorlevel% equ 0 (
    echo ℹ️  Remote 'origin' já configurado:
    echo.
    git remote -v
    echo.
    echo Deseja remover e reconfigurar? (S/N)
    set /p resposta=
    if /i "%resposta%"=="S" (
        git remote remove origin
        echo ✅ Remote removido
    ) else (
        echo ℹ️  Mantendo configuração atual
        pause
        exit /b 0
    )
)

echo.
echo ═══════════════════════════════════════════════════════════
echo  CRIAR REPOSITÓRIO NO GITHUB
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Acesse: https://github.com/new
echo 2. Nome sugerido: ai-web-weaver
echo 3. Descrição: Sistema avançado de geração de código com IA
echo 4. Escolha: Público ou Privado
echo 5. NÃO inicializar com README (já temos)
echo 6. Criar repositório
echo 7. Copiar a URL do repositório
echo.
echo Exemplo de URL:
echo https://github.com/SEU-USUARIO/ai-web-weaver.git
echo.
echo ═══════════════════════════════════════════════════════════
echo.

set /p repo_url="Cole a URL do seu repositório: "

if "%repo_url%"=="" (
    echo.
    echo ❌ URL não fornecida!
    pause
    exit /b 1
)

echo.
echo Configurando remote com URL: %repo_url%
git remote add origin %repo_url%

if %errorlevel% neq 0 (
    echo.
    echo ❌ Erro ao configurar remote!
    pause
    exit /b 1
)

echo.
echo ✅ Remote configurado com sucesso!
echo.
echo Verificando configuração:
git remote -v
echo.

echo ═══════════════════════════════════════════════════════════
echo  PRÓXIMOS PASSOS
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Execute: PUSH_SEGURO_GITHUB.bat
echo    OU
echo 2. Execute manualmente:
echo    git push -u origin main
echo.

pause
