# 🚀 AI Web Weaver CLI

CLI completo em PowerShell para instalar, debugar e gerenciar aplicações geradas pelo AI Web Weaver.

## 📋 Índice

- [Instalação](#instalação)
- [Comandos](#comandos)
- [Backend Server](#backend-server)
- [Exemplos de Uso](#exemplos-de-uso)
- [API REST](#api-rest)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Instalação

### Método 1: Instalação Automática (Recomendado)

```powershell
# Execute como Administrador
cd cli
.\install.ps1
```

### Método 2: Instalação Manual

```powershell
# 1. Copiar arquivo CLI
Copy-Item aiweaver.ps1 -Destination "$env:ProgramFiles\AIWebWeaver\"

# 2. Adicionar ao PATH
$env:Path += ";$env:ProgramFiles\AIWebWeaver"

# 3. Criar alias no perfil
Add-Content $PROFILE "function aiweaver { & '$env:ProgramFiles\AIWebWeaver\aiweaver.ps1' @args }"
```

### Verificar Instalação

```powershell
aiweaver help
```

---

## 📚 Comandos Disponíveis

### ✅ Comandos Implementados

Todos os comandos abaixo estão **100% funcionais** no terminal integrado:

#### 📋 Informações

- `aiweaver help` - Ajuda completa
- `aiweaver version` - Versão do sistema
- `aiweaver status` - Status do sistema

#### 📱 Gerenciamento

- `aiweaver list` - Listar apps
- `aiweaver start <id>` - Iniciar app
- `aiweaver stop <id>` - Parar app
- `aiweaver remove <id>` - Remover app

#### 🔍 Análise

- `aiweaver logs <id> [linhas]` - Ver logs
- `aiweaver analyze <id>` - Analisar código
- `aiweaver debug <id>` - Debug completo

#### 🛠️ Utilitários

- `aiweaver clear` - Limpar terminal

**📚 Referência Completa:** Veja `cli/COMMANDS.md` para detalhes de cada comando.

---

## 🌐 Comandos em Português

Todos os comandos têm aliases em português:

```bash
ajuda              # help
versao             # version
listar             # list
iniciar <id>       # start
parar <id>         # stop
remover <id>       # remove
analisar <id>      # analyze
debugar <id>       # debug
limpar             # clear
```

---

## 📚 Comandos Detalhados

### `install` - Instalar App

Instala um app gerado pelo AI Web Weaver.

```powershell
aiweaver install <arquivo> [nome]
```

**Exemplos:**
```powershell
# Instalar app HTML
aiweaver install meu-app.html

# Instalar com nome customizado
aiweaver install app.html "Meu Dashboard"

# Instalar app fullstack
aiweaver install projeto-completo.zip
```

**O que acontece:**
- ✅ Cria diretório único para o app
- ✅ Detecta tipo de app (single-file, node, fullstack)
- ✅ Extrai dependências automaticamente
- ✅ Registra no banco de dados
- ✅ Gera ID único para gerenciamento

---

### `start` - Iniciar App

Inicia um app instalado.

```powershell
aiweaver start <app-id>
```

**Exemplos:**
```powershell
# Iniciar app
aiweaver start abc123

# Iniciar com watch mode (auto-reload)
aiweaver start abc123 --watch

# Iniciar em porta customizada
aiweaver start abc123 --port 8080
```

**Comportamento por tipo:**
- **Single-File HTML**: Servidor HTTP simples
- **Node Backend**: `npm start` ou `npm run dev`
- **Fullstack**: Inicia backend e frontend simultaneamente

---

### `debug` - Debug App

Inicia app em modo debug com análise de código.

```powershell
aiweaver debug <app-id>
```

**Exemplos:**
```powershell
# Debug básico
aiweaver debug abc123

# Debug verbose (logs detalhados)
aiweaver debug abc123 --verbose

# Debug com breakpoints
aiweaver debug abc123 --inspect
```

**Recursos de Debug:**
- 📊 Análise estática de código
- 🔍 Detecção de problemas
- 📝 Logs em tempo real
- 🐛 Sugestões de correção
- ⚡ Performance profiling

**Análise Inclui:**
```
✅ Linhas de código
✅ Funções e variáveis
✅ APIs externas detectadas
✅ Problemas de qualidade
✅ Score de excelência (0-100)
✅ Sugestões de melhoria
```

---

### `list` - Listar Apps

Lista todos os apps instalados.

```powershell
aiweaver list
```

**Output:**
```
📱 APPS INSTALADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 Meu Dashboard
   ID: abc123
   Tipo: single-file-html
   Porta: 3000
   Status: installed
   Instalado: 2025-01-13 10:30:00

🔹 API Backend
   ID: def456
   Tipo: node-backend
   Porta: 3001
   Status: running
   Instalado: 2025-01-13 11:00:00
```

---

### `remove` - Remover App

Remove um app instalado.

```powershell
aiweaver remove <app-id>
```

**Exemplos:**
```powershell
# Remover app
aiweaver remove abc123

# Remover com confirmação
aiweaver remove abc123 --confirm

# Remover e limpar logs
aiweaver remove abc123 --clean
```

---

### `logs` - Ver Logs

Mostra logs de um app.

```powershell
aiweaver logs <app-id>
```

**Exemplos:**
```powershell
# Ver últimas 50 linhas
aiweaver logs abc123

# Ver últimas 100 linhas
aiweaver logs abc123 --lines 100

# Monitorar em tempo real
aiweaver logs abc123 --follow

# Filtrar por nível
aiweaver logs abc123 --level error
```

---

### `analyze` - Analisar Código

Analisa um arquivo sem instalar.

```powershell
aiweaver analyze <arquivo>
```

**Exemplos:**
```powershell
# Análise básica
aiweaver analyze app.html

# Análise detalhada
aiweaver analyze app.html --detailed

# Exportar relatório
aiweaver analyze app.html --export report.json
```

**Relatório de Análise:**
```json
{
  "lines": 450,
  "functions": 12,
  "variables": 35,
  "externalApis": ["https://api.example.com"],
  "issues": [
    "Console.log encontrado (remover em produção)",
    "2 imagens sem atributo alt"
  ],
  "score": 85,
  "recommendations": [
    "Adicionar alt em imagens",
    "Remover console.log",
    "Adicionar meta viewport"
  ]
}
```

---

## 🌐 Backend Server

O CLI inclui um backend server completo em PowerShell com API REST.

### Iniciar Backend

```powershell
.\backend-server.ps1
```

**Ou com porta customizada:**
```powershell
.\backend-server.ps1 -Port 5000
```

**Ou em modo debug:**
```powershell
.\backend-server.ps1 -Debug
```

### Endpoints da API

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "00:15:30"
}
```

---

#### Listar Apps
```http
GET /api/apps
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "apps": [
    {
      "id": "abc123",
      "name": "Meu Dashboard",
      "type": "single-file-html",
      "port": 3000,
      "status": "installed"
    }
  ]
}
```

---

#### Detalhes do App
```http
GET /api/apps/:id
```

**Response:**
```json
{
  "success": true,
  "app": {
    "id": "abc123",
    "name": "Meu Dashboard",
    "type": "single-file-html",
    "port": 3000,
    "sizeBytes": 45678,
    "sizeMB": 0.04,
    "installedAt": "2025-01-13 10:30:00"
  }
}
```

---

#### Instalar App
```http
POST /api/apps
Content-Type: application/json

{
  "name": "Meu App",
  "fileName": "index.html",
  "content": "<!DOCTYPE html>...",
  "type": "single-file-html",
  "port": 3000
}
```

**Response:**
```json
{
  "success": true,
  "message": "App instalado com sucesso",
  "app": {
    "id": "xyz789",
    "name": "Meu App"
  }
}
```

---

#### Iniciar App
```http
POST /api/apps/:id/start
```

**Response:**
```json
{
  "success": true,
  "message": "App iniciado com sucesso",
  "url": "http://localhost:3000",
  "jobId": 12345
}
```

---

#### Parar App
```http
POST /api/apps/:id/stop
```

---

#### Ver Logs
```http
GET /api/apps/:id/logs?lines=50
```

**Response:**
```json
{
  "success": true,
  "logs": [
    "[2025-01-13 10:30:00] [info] App iniciado",
    "[2025-01-13 10:30:05] [info] Request: /"
  ]
}
```

---

#### Analisar Código
```http
GET /api/apps/:id/analyze
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "lines": 450,
    "functions": 12,
    "score": 85,
    "issues": ["Console.log encontrado"],
    "externalApis": ["https://api.example.com"]
  }
}
```

---

#### Remover App
```http
DELETE /api/apps/:id
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Instalar e Iniciar App HTML

```powershell
# 1. Instalar
$appId = aiweaver install meu-app.html "Dashboard de Vendas"

# 2. Iniciar
aiweaver start $appId

# 3. Abrir no navegador
# Automaticamente abre em http://localhost:3000
```

---

### Exemplo 2: Debug de App com Problemas

```powershell
# 1. Instalar app
aiweaver install app-com-bugs.html

# 2. Listar para pegar ID
aiweaver list

# 3. Debug detalhado
aiweaver debug abc123 --verbose

# Output mostra:
# ❌ Console.log encontrado (linha 45)
# ❌ 3 imagens sem alt (linhas 120, 145, 200)
# ⚠️  Meta viewport ausente
# Score: 65/100
```

---

### Exemplo 3: Monitorar App em Produção

```powershell
# Terminal 1: Iniciar app
aiweaver start abc123

# Terminal 2: Monitorar logs
aiweaver logs abc123 --follow

# Terminal 3: Backend server para API
.\backend-server.ps1
```

---

### Exemplo 4: Integração com Frontend

```javascript
// Frontend fazendo requisições para o backend CLI

// Listar apps
fetch('http://localhost:5000/api/apps')
  .then(res => res.json())
  .then(data => console.log(data.apps));

// Instalar novo app
fetch('http://localhost:5000/api/apps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Novo App',
    fileName: 'index.html',
    content: htmlContent,
    type: 'single-file-html'
  })
})
.then(res => res.json())
.then(data => console.log('App instalado:', data.app.id));

// Iniciar app
fetch(`http://localhost:5000/api/apps/${appId}/start`, {
  method: 'POST'
})
.then(res => res.json())
.then(data => window.open(data.url));
```

---

## 🔧 Troubleshooting

### Problema: "Comando não encontrado"

**Solução:**
```powershell
# Recarregar perfil
. $PROFILE

# Ou reiniciar PowerShell
```

---

### Problema: "Porta já em uso"

**Solução:**
```powershell
# Usar porta diferente
aiweaver start abc123 --port 8080

# Ou matar processo na porta
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

### Problema: "Permissão negada"

**Solução:**
```powershell
# Executar como Administrador
Start-Process powershell -Verb RunAs

# Ou ajustar política de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Problema: "App não inicia"

**Solução:**
```powershell
# 1. Ver logs
aiweaver logs abc123

# 2. Debug detalhado
aiweaver debug abc123 --verbose

# 3. Verificar dependências
aiweaver analyze abc123
```

---

## 📁 Estrutura de Arquivos

```
$HOME\.aiweaver\
├── apps\                    # Apps instalados
│   ├── abc123\
│   │   └── index.html
│   └── def456\
│       ├── package.json
│       └── src\
├── logs\                    # Logs dos apps
│   ├── abc123.log
│   └── abc123-debug.log
├── temp\                    # Arquivos temporários
├── config.json              # Configuração global
└── apps.db                  # Banco de dados (JSON)
```

---

## 🎯 Recursos Avançados

### Auto-Reload (Watch Mode)

```powershell
aiweaver start abc123 --watch
```

Recarrega automaticamente quando arquivos mudam.

---

### Performance Profiling

```powershell
aiweaver debug abc123 --profile
```

Mostra métricas de performance:
- Tempo de carregamento
- Uso de memória
- Requisições HTTP
- Tempo de renderização

---

### Exportar App

```powershell
aiweaver export abc123 --output meu-app.zip
```

Cria arquivo ZIP com:
- Código fonte
- Dependências
- Configuração
- README

---

### Backup e Restore

```powershell
# Backup
aiweaver backup --output backup.zip

# Restore
aiweaver restore backup.zip
```

---

## 🚀 Próximos Passos

1. **Instale o CLI**: `.\install.ps1`
2. **Teste com um app**: `aiweaver install exemplo.html`
3. **Inicie o backend**: `.\backend-server.ps1`
4. **Explore a API**: Teste os endpoints REST
5. **Integre com seu frontend**: Use a API para gerenciar apps

---

## 📞 Suporte

- **Issues**: Abra uma issue no GitHub
- **Documentação**: Veja `docs/` para mais detalhes
- **Exemplos**: Veja `examples/` para casos de uso

---

**Feito com ❤️ para AI Web Weaver**
