@echo off
chcp 65001 >nul
cls

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║        🚀 AI WEB WEAVER - SISTEMA INICIANDO 🚀              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Abrindo em: http://localhost:5173
echo.
echo ⚠️  Mantenha esta janela aberta!
echo.

REM Chama npm.cmd diretamente (funciona no CMD)
call npm.cmd run dev

pause
