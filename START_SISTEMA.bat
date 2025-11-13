@echo off
echo ========================================
echo   AI WEB WEAVER - INICIAR SISTEMA
echo ========================================
echo.

echo [1/3] Iniciando Backend...
start "AI Weaver Backend" powershell -NoExit -Command "cd cli; .\backend-simple.ps1"
timeout /t 3 /nobreak >nul

echo [2/3] Abrindo Dashboard...
start "" "cli\project-dashboard.html"
timeout /t 2 /nobreak >nul

echo [3/3] Iniciando Frontend (opcional)...
echo.
echo Para iniciar o frontend, execute em outro terminal:
echo   npm run dev
echo.

echo ========================================
echo   SISTEMA INICIADO!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Dashboard: Aberto no navegador
echo Frontend: Execute 'npm run dev' manualmente
echo.
echo Pressione qualquer tecla para sair...
pause >nul
