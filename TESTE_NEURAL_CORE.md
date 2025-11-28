# 🧪 Teste Rápido - Neural Core

## 🚀 Teste em 5 Minutos

### Passo 1: Subir Neural Core (2 min)

```bash
cd neural-core
npm install
cp .env.example .env
```

Edite `neural-core/.env`:
```bash
GEMINI_API_KEY=sua_chave_aqui
```

```bash
npm run dev
```

**Você deve ver:**
```
╔══════════════════════════════════════════════════════════════╗
║        🧠 NEURAL CORE - ORQUESTRADOR INTELIGENTE 🧠          ║
╚══════════════════════════════════════════════════════════════╝

🚀 Servidor rodando em: http://localhost:3000
🔑 API Key configurada: ✅
🧠 Protocolos carregados:
   ✅ ARTISAN_DIGITAL_MANIFESTO
   ✅ FINTECH_ARCHITECT_PROTOCOL
   ✅ FULLSTACK_PRO_PROTOCOL
   ✅ GAME_DEV_PROTOCOL
   ✅ EXCELLENCE_CRITERIA

✨ Neural Core pronto para injetar sabedoria!
```

---

### Passo 2: Ativar no Frontend (1 min)

Edite `.env` na raiz do projeto:
```bash
VITE_USE_NEURAL_CORE=true
VITE_NEURAL_CORE_URL=http://localhost:3000
```

---

### Passo 3: Rodar Frontend (1 min)

```bash
npm run dev
```

---

### Passo 4: Testar (1 min)

Abra o app e digite:

**Teste 1: Projeto Simples**
```
Crie um botão vermelho
```

**Console esperado:**
```
🧠 Neural Core: Tentando amplificação...
✅ Neural Core ativado! Protocolos: ["ARTISAN_DIGITAL_MANIFESTO", "EXCELLENCE_CRITERIA"]
```

**Teste 2: Projeto Fullstack**
```
Crie um app de pizzaria com backend
```

**Console esperado:**
```
🧠 Neural Core: Tentando amplificação...
✅ Neural Core ativado! Protocolos: [
  "ARTISAN_DIGITAL_MANIFESTO",
  "FULLSTACK_PRO_PROTOCOL",
  "EXCELLENCE_CRITERIA"
]
```

**Teste 3: Fintech**
```
Crie um banco digital com PIX
```

**Console esperado:**
```
🧠 Neural Core: Tentando amplificação...
✅ Neural Core ativado! Protocolos: [
  "ARTISAN_DIGITAL_MANIFESTO",
  "FINTECH_ARCHITECT_PROTOCOL",
  "EXCELLENCE_CRITERIA"
]
```

---

## ✅ Checklist de Sucesso

- [ ] Neural Core rodando em `http://localhost:3000`
- [ ] Health check retorna `{ status: "ok" }`
- [ ] Frontend mostra "Neural Core ativado" no console
- [ ] Código gerado é mais completo que antes
- [ ] Protocolos aparecem no console

---

## 🔄 Voltar ao Modo Normal

Se quiser desligar o Neural Core:

```bash
# .env
VITE_USE_NEURAL_CORE=false
```

Reinicie o frontend. Pronto! Sistema volta ao normal.

---

## 🎯 Resultado Esperado

**Antes (Modo Normal):**
```
Prompt: "Crie um banco digital"
Resultado: HTML com simulação de banco
```

**Depois (Modo Amplificado):**
```
Prompt: "Crie um banco digital"
Neural Core detecta: isFintech = true
Neural Core injeta: FINTECH_ARCHITECT_PROTOCOL
Resultado: 
  - Backend Go + Gin
  - PostgreSQL com transações ACID
  - Modelo de contas virtuais
  - Webhooks Mercado Pago
  - Avisos regulatórios BACEN
  - Docker Compose completo
```

---

**Teste concluído! 🎉**

Seu sistema agora tem um cérebro adicional que pode ser ligado/desligado quando quiser.
