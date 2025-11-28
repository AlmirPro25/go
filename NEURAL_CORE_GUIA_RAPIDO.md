# 🚀 Neural Core - Guia Rápido de Uso

## ✅ INTEGRAÇÃO COMPLETA!

O Neural Core foi integrado como **amplificador opcional** no seu sistema.  
**Nada foi removido. Tudo continua funcionando.**

---

## 🎮 Como Usar

### Modo 1: Normal (Padrão) - Como Sempre Funcionou

```bash
# .env
VITE_USE_NEURAL_CORE=false

# Rodar normalmente
npm run dev
```

**O que acontece:**
- ✅ Sistema funciona exatamente como antes
- ✅ GeminiService.ts usa lógica do frontend
- ✅ Manifestos aplicados localmente
- ✅ Zero dependências externas

---

### Modo 2: Amplificado - Com Neural Core

```bash
# Terminal 1: Subir Neural Core
cd neural-core
npm install
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY
npm run dev

# Terminal 2: Ativar no frontend
# .env
VITE_USE_NEURAL_CORE=true
VITE_NEURAL_CORE_URL=http://localhost:3000

# Rodar frontend
npm run dev
```

**O que acontece:**
- 🧠 Sistema tenta usar Neural Core primeiro
- 🎯 Neural Core detecta contexto e injeta protocolos
- ⚡ Se Neural Core falhar, usa modo normal automaticamente
- 🏆 Código gerado com protocolos avançados

---

## 🔍 Como Saber Qual Modo Está Ativo?

Abra o console do navegador:

**Modo Normal:**
```
⚡ Usando modo normal (frontend)
🧠 Consultando Knowledge Base...
```

**Modo Amplificado:**
```
🧠 Neural Core: Tentando amplificação...
✅ Neural Core ativado! Protocolos: ["ARTISAN_DIGITAL_MANIFESTO", "FULLSTACK_PRO_PROTOCOL", "EXCELLENCE_CRITERIA"]
```

**Fallback Automático:**
```
🧠 Neural Core: Tentando amplificação...
⚠️ Neural Core indisponível, usando modo normal...
⚡ Usando modo normal (frontend)
```

---

## 🧪 Testar Neural Core

### 1. Verificar se está rodando

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "service": "neural-core",
  "version": "2.0.0"
}
```

### 2. Testar detecção de contexto

```bash
curl -X POST http://localhost:3000/api/analyze-context \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Crie um banco digital com PIX"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "context": {
    "isGame": false,
    "isFintech": true,
    "isFullstack": true,
    "isSingleFile": false
  }
}
```

### 3. Testar geração de código

No seu app, digite:
```
Crie um app de pizzaria com backend
```

**Com Neural Core ativo, você verá no console:**
```
🧠 Neural Core: Tentando amplificação...
✅ Neural Core ativado! Protocolos: [
  "ARTISAN_DIGITAL_MANIFESTO",
  "FULLSTACK_PRO_PROTOCOL",
  "EXCELLENCE_CRITERIA"
]
```

---

## 📊 Comparação de Resultados

### Teste 1: "Crie um botão vermelho"

**Modo Normal:**
- Gera HTML simples
- Rápido
- Funciona perfeitamente

**Modo Amplificado:**
- Gera HTML com estrutura semântica
- Acessibilidade completa
- Responsivo por padrão
- Score de excelência aplicado

### Teste 2: "Crie um banco digital"

**Modo Normal:**
- Gera HTML com simulação de banco
- Pode não incluir backend

**Modo Amplificado:**
- 🏦 FINTECH_ARCHITECT_PROTOCOL ativado
- Gera backend Go + PostgreSQL
- Modelo de contas virtuais
- Transações atômicas
- Avisos regulatórios BACEN
- Arquitetura completa

### Teste 3: "Crie um jogo de plataforma"

**Modo Normal:**
- Gera jogo básico com Canvas

**Modo Amplificado:**
- 🎮 GAME_DEV_PROTOCOL ativado
- Game loop profissional (60 FPS)
- Sistema de física e colisões
- Áudio e feedback
- Progressão e recompensas

---

## 🎯 Quando Usar Cada Modo?

### Use Modo Normal quando:
- ✅ Projetos simples (landing pages, botões, componentes)
- ✅ Prototipagem rápida
- ✅ Não quer dependências externas
- ✅ Desenvolvimento offline

### Use Modo Amplificado quando:
- 🏆 Projetos complexos (fullstack, fintechs, jogos)
- 🏆 Precisa de arquitetura profissional
- 🏆 Quer protocolos avançados
- 🏆 Precisa de compliance (BACEN, etc)

---

## 🔧 Troubleshooting

### Erro: "Neural Core indisponível"

**Causa:** Neural Core não está rodando

**Solução:**
```bash
cd neural-core
npm run dev
```

### Erro: "Failed to fetch"

**Causa:** URL incorreta ou CORS

**Solução:**
```bash
# Verificar URL no .env
VITE_NEURAL_CORE_URL=http://localhost:3000

# Verificar se Neural Core está rodando
curl http://localhost:3000/health
```

### Sistema sempre usa modo normal

**Causa:** Flag desligada

**Solução:**
```bash
# .env
VITE_USE_NEURAL_CORE=true  # ← Mudar para true
```

---

## 📈 Próximos Passos

### 1. Testar Ambos os Modos (10 min)

```bash
# Teste 1: Modo normal
VITE_USE_NEURAL_CORE=false npm run dev
# Digite: "Crie um botão vermelho"

# Teste 2: Modo amplificado
# Terminal 1: cd neural-core && npm run dev
# Terminal 2: VITE_USE_NEURAL_CORE=true npm run dev
# Digite: "Crie um banco digital com PIX"
```

### 2. Comparar Resultados

- Veja a diferença no código gerado
- Compare os logs do console
- Avalie qual modo prefere para cada tipo de projeto

### 3. Decidir Estratégia

**Opção A: Sempre Normal**
```bash
VITE_USE_NEURAL_CORE=false
```

**Opção B: Sempre Amplificado**
```bash
VITE_USE_NEURAL_CORE=true
```

**Opção C: Híbrido Inteligente** (Recomendado)
- Criar toggle na UI para escolher por projeto
- Ou detectar automaticamente baseado no prompt

---

## 🎉 Conclusão

**Você agora tem o melhor dos dois mundos:**

✅ **Modo Normal:** Rápido, simples, sem dependências  
✅ **Modo Amplificado:** Inteligente, profissional, protocolos avançados  
✅ **Fallback Automático:** Se Neural Core falhar, continua funcionando  
✅ **Zero Risco:** Nada foi removido, tudo continua funcionando  

**Seu sistema foi AMPLIFICADO, não substituído!** 🚀

---

## 📚 Documentação Completa

- **`neural-core/README.md`** - Documentação técnica do Neural Core
- **`INTEGRACAO_NEURAL_CORE_OPCIONAL.md`** - Filosofia da integração
- **`NEURAL_CORE_IMPLEMENTADO.md`** - Detalhes da implementação

---

**Status:** ✅ INTEGRADO E FUNCIONANDO  
**Modo Padrão:** Normal (frontend)  
**Modo Opcional:** Amplificado (Neural Core)  
**Fallback:** Automático
