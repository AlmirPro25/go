@echo off
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║        🧪 TESTANDO NEURAL CORE 🧪                            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set NEURAL_CORE_URL=http://localhost:3000

echo 1️⃣  Testando Health Check...
echo.
curl -s %NEURAL_CORE_URL%/health
echo.
echo.

echo 2️⃣  Testando Análise de Contexto - Fintech...
echo.
curl -s -X POST %NEURAL_CORE_URL%/api/analyze-context ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\": \"Crie um banco digital com PIX\"}"
echo.
echo.

echo 3️⃣  Testando Análise de Contexto - Jogo...
echo.
curl -s -X POST %NEURAL_CORE_URL%/api/analyze-context ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\": \"Crie um jogo de plataforma\"}"
echo.
echo.

echo ✅ Testes concluídos!
echo.
echo 💡 Se todos os testes passaram, o Neural Core está funcionando!
echo.
pause
