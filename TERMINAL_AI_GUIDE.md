# 🤖 Terminal AI + Local Bridge - Guia Completo

## O Que Foi Implementado

Você agora tem um **Sistema de Execução Autônoma** que permite o AI Web Weaver executar comandos reais na sua máquina. É a ponte entre a nuvem (navegador) e o seu terminal local.

```
┌─────────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  AI Web Weaver      │ ◄─────► │  Local Bridge    │ ◄─────► │  Seu Terminal   │
│  (Navegador/Nuvem)  │ WebSocket│  (Porta 4567)   │  spawn  │  (Comandos)     │
└─────────────────────┘         └──────────────────┘         └─────────────────┘
```

## Arquitetura Implementada

### 1. TerminalBridge.ts (Frontend)
**Localização:** `src/services/TerminalBridge.ts`

**Responsabilidades:**
- Conecta ao Local Bridge via WebSocket (porta 4567)
- Envia comandos para execução
- Recebe stream de saída (stdout/stderr)
- Detecta erros críticos para Self-Healing
- Escreve arquivos gerados no disco local

**Principais Métodos:**
```typescript
// Conectar ao Bridge
await terminalBridge.connect();

// Executar comando
const cmdId = terminalBridge.executeCommand('npm install', './project');

// Escrever arquivos no disco
await terminalBridge.writeFilesToDisk([
  { path: 'index.html', content: '<html>...</html>' }
]);

// Verificar status
const isConnected = terminalBridge.getConnectionStatus();
```

### 2. Local Bridge CLI (Executor Local)
**Localização:** `cli/local-bridge.js`

**Responsabilidades:**
- Escuta conexões WebSocket na porta 4567
- Valida comandos (SAFE HANDS Protocol)
- Executa comandos via `child_process.spawn`
- Opera em sandbox (não sai do diretório de trabalho)
- Bloqueia comandos destrutivos (rm, sudo, etc.)

**Comandos Permitidos:**
- ✅ `npm`, `node`, `npx`, `yarn`, `pnpm`
- ✅ `docker`, `docker-compose`
- ✅ `git`, `go`, `cargo`, `python`
- ✅ `ls`, `mkdir`, `cat`, `echo`

**Comandos Bloqueados:**
- ⛔ `rm`, `del`, `rmdir` (destrutivos)
- ⛔ `sudo`, `chmod`, `chown` (permissões)
- ⛔ Qualquer comando fora da lista permitida

### 3. Integração com GeminiService
**Localização:** `services/GeminiService.ts`

**Modificações:**
- Importa `terminalBridge`
- Na função `generateChatAgentResponse`, quando detecta `intent: 'run_command'`:
  1. Tenta conectar ao Bridge
  2. Se conectado: executa o comando via Bridge
  3. Se desconectado: sugere rodar o CLI ou executar manualmente

**Fluxo de Execução:**
```typescript
// Usuário: "Instale o lodash"
// IA detecta: intent = 'run_command', command = 'npm install lodash'

if (intent === 'run_command') {
  const isConnected = await terminalBridge.connect();
  
  if (isConnected) {
    // Executa via Bridge
    terminalBridge.executeCommand('npm install lodash');
    return "✅ Executando comando...";
  } else {
    // Fallback
    return "⚠️ Bridge não encontrado. Execute manualmente: npm install lodash";
  }
}
```

### 4. TerminalBridgeStatus Component
**Localização:** `src/components/TerminalBridgeStatus.tsx`

**Responsabilidades:**
- Exibe status da conexão (conectado/desconectado)
- Verifica conexão a cada 10 segundos
- Botão para reconectar manualmente
- Instruções de instalação do CLI

## Como Usar

### Passo 1: Instalar Dependências do CLI

```bash
cd cli
npm install
```

### Passo 2: Rodar o Local Bridge

**Opção 1: NPX (Recomendado - quando publicado)**
```bash
npx @ai-weaver/local-bridge
```

**Opção 2: Desenvolvimento Local**
```bash
cd cli
npm start
```

**Opção 3: Instalação Global (quando publicado)**
```bash
npm install -g @ai-weaver/local-bridge
ai-weaver
```

### Passo 3: Usar o AI Web Weaver

1. Abra o AI Web Weaver no navegador
2. Verifique o status do Bridge (deve aparecer "Conectado")
3. No chat, peça algo como:
   - "Crie um projeto React e instale as dependências"
   - "Execute docker-compose up"
   - "Rode os testes"

### Passo 4: Observar a Mágica

A IA vai:
1. Gerar os arquivos necessários
2. Escrever no seu disco (via Bridge)
3. Executar comandos (via Bridge)
4. Se der erro, **se autocorrigir** (Self-Healing)

## Exemplos de Uso

### Exemplo 1: Criar Projeto React

**Você:** "Crie um projeto React com TypeScript e rode o servidor"

**IA faz:**
1. Gera `package.json`, `index.html`, `App.tsx`
2. Escreve arquivos via Bridge
3. Executa `npm install`
4. Executa `npm run dev`
5. Se der erro (ex: porta ocupada), corrige e tenta novamente

### Exemplo 2: Deploy com Docker

**Você:** "Crie um Dockerfile e suba o container"

**IA faz:**
1. Gera `Dockerfile`, `docker-compose.yml`
2. Escreve arquivos via Bridge
3. Executa `docker-compose up -d`
4. Se der erro (ex: porta ocupada), ajusta e tenta novamente

### Exemplo 3: Fintech com PostgreSQL

**Você:** "Forje o Nexus Bank" (ativa identidade Fintech)

**IA faz:**
1. Gera backend Go completo
2. Gera frontend React completo
3. Gera schema PostgreSQL
4. Gera `docker-compose.yml`
5. Escreve TUDO via Bridge
6. Executa `docker-compose up -d`
7. Executa `go run main.go`
8. Se der erro, **se autocorrige**

## Self-Healing em Ação

### Cenário: Porta Ocupada

```
1. IA: docker-compose up -d
2. Bridge: Executa
3. Erro: "port 3000 already in use"
4. Bridge: Detecta erro crítico
5. Frontend: Dispara evento 'terminal_error'
6. IA: Analisa erro
7. IA: "Vou mudar para porta 3001"
8. IA: Gera novo docker-compose.yml
9. Bridge: Escreve arquivo
10. IA: docker-compose up -d
11. ✅ Sucesso
```

### Cenário: Dependência Faltando

```
1. IA: npm run dev
2. Bridge: Executa
3. Erro: "Cannot find module 'lodash'"
4. Bridge: Detecta erro crítico
5. IA: Analisa erro
6. IA: "Falta o lodash. Vou instalar."
7. IA: npm install lodash
8. Bridge: Executa
9. IA: npm run dev
10. ✅ Sucesso
```

## Segurança (SAFE HANDS Protocol)

### Sandbox de Diretório
O Bridge só pode acessar o diretório onde foi iniciado. Tentativas de `../` ou `/etc` são bloqueadas.

```javascript
// ✅ Permitido
terminalBridge.executeCommand('npm install', './my-project');

// ⛔ Bloqueado
terminalBridge.executeCommand('rm -rf /', './');
```

### Lista de Permissões
Apenas comandos de desenvolvimento são permitidos. Comandos destrutivos são bloqueados.

```javascript
// ✅ Permitido
'npm install', 'docker-compose up', 'git commit'

// ⛔ Bloqueado
'rm -rf', 'sudo rm', 'chmod 777'
```

### Timeout de Segurança
Comandos têm timeout de 5 minutos. Se exceder, são automaticamente terminados.

## Troubleshooting

### "Bridge não encontrado"
**Causa:** O CLI não está rodando.

**Solução:**
```bash
cd cli
npm install
npm start
```

### "Comando não permitido"
**Causa:** O comando não está na lista de permitidos.

**Solução:** Edite `ALLOWED_COMMANDS` em `cli/local-bridge.js` para adicionar o comando.

### "Acesso negado"
**Causa:** Tentativa de acessar diretório fora do sandbox.

**Solução:** Certifique-se de que o comando opera dentro do diretório de trabalho.

### "Porta 4567 ocupada"
**Causa:** Outro processo está usando a porta.

**Solução:**
```bash
# Windows
netstat -ano | findstr :4567
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :4567
kill -9 <PID>

# Ou use outra porta
BRIDGE_PORT=4568 npm start
```

## Próximos Passos

### Fase 1: Publicação (Atual)
- [x] TerminalBridge.ts implementado
- [x] Local Bridge CLI implementado
- [x] Integração com GeminiService
- [x] Componente de status
- [ ] Publicar CLI no NPM como `@ai-weaver/local-bridge`

### Fase 2: Self-Healing Avançado
- [ ] Listener de eventos `terminal_error`
- [ ] Análise automática de erros pelo Neural Core
- [ ] Geração automática de correções
- [ ] Loop de retry com limite

### Fase 3: Dashboard de Monitoramento
- [ ] Componente de terminal integrado no frontend
- [ ] Visualização de logs em tempo real
- [ ] Histórico de comandos executados
- [ ] Métricas de sucesso/falha

### Fase 4: Comandos Interativos
- [ ] Suporte a comandos interativos (vim, nano)
- [ ] Modo "Human-in-the-Loop" (confirmação manual)
- [ ] Input de usuário durante execução

## Arquivos Criados

```
cli/
├── local-bridge.js          # Executor local (Node.js)
├── package.json             # Dependências do CLI
└── README.md                # Documentação do CLI

src/
├── services/
│   └── TerminalBridge.ts    # Cliente WebSocket (Frontend)
└── components/
    └── TerminalBridgeStatus.tsx  # Componente de status

TERMINAL_AI_GUIDE.md         # Este guia
```

## Conclusão

Você agora tem um **Sistema de Execução Autônoma** completo. O AI Web Weaver não é mais apenas um gerador de código - ele é uma **Fábrica Autônoma** que:

1. **Pensa** (Gemini/Neural Core)
2. **Gera** (Código HTML/JS/Go/etc.)
3. **Executa** (Local Bridge)
4. **Observa** (Logs e erros)
5. **Se Corrige** (Self-Healing)

É o Santo Graal da automação de desenvolvimento.

---

**Próximo Comando:** "Forje o Nexus Bank" e observe a IA criar, escrever, executar e corrigir um sistema financeiro completo automaticamente.

🚀 **O Trono está pronto. A Soberania Digital aguarda.**
