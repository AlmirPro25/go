# 🔄 Guia de Migração - Frontend para Neural Core

## 📋 Checklist de Migração

### ✅ Fase 1: Setup do Neural Core

- [ ] Instalar dependências do Neural Core
- [ ] Configurar `.env` com `GEMINI_API_KEY`
- [ ] Testar servidor com `npm run dev`
- [ ] Verificar health check: `curl http://localhost:3000/health`

### ✅ Fase 2: Limpeza do Frontend

- [ ] Remover manifestos pesados do `GeminiService.ts`
- [ ] Remover importação direta do `@google/genai`
- [ ] Atualizar função `generateAiResponse` para usar fetch
- [ ] Remover lógica de detecção de contexto
- [ ] Atualizar `.env` do frontend com `VITE_NEURAL_CORE_URL`

### ✅ Fase 3: Testes

- [ ] Testar geração de código simples
- [ ] Testar detecção de contexto (game, fintech, fullstack)
- [ ] Verificar que manifestos estão sendo aplicados
- [ ] Confirmar que API Key não está mais exposta

---

## 🔧 Passo a Passo Detalhado

### 1. Instalar Neural Core

```bash
cd neural-core
npm install
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY
npm run dev
```

Verifique se está rodando:
```bash
curl http://localhost:3000/health
```

### 2. Atualizar Frontend

#### 2.1. Atualizar `.env` do Frontend

```bash
# .env (na raiz do projeto)
VITE_NEURAL_CORE_URL=http://localhost:3000
```

#### 2.2. Criar Novo Cliente Neural Core

Crie o arquivo `services/NeuralCoreClient.ts`:

```typescript
/**
 * Cliente para comunicação com o Neural Core
 */

const NEURAL_CORE_URL = import.meta.env.VITE_NEURAL_CORE_URL || 'http://localhost:3000';

export interface GenerateRequest {
  prompt: string;
  modelName?: string;
  history?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GenerateResponse {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    detectedContext: {
      isGame: boolean;
      isFintech: boolean;
      isFullstack: boolean;
      isSingleFile: boolean;
    };
    appliedProtocols: string[];
    duration: number;
    model: string;
    promptLength: number;
    enrichedPromptLength: number;
    responseLength: number;
  };
}

/**
 * Gera código usando o Neural Core
 */
export async function generateWithNeuralCore(
  request: GenerateRequest
): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${NEURAL_CORE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao gerar código');
    }

    return await response.json();

  } catch (error: any) {
    console.error('❌ Erro ao chamar Neural Core:', error);
    return {
      success: false,
      error: error.message || 'Erro ao conectar com Neural Core'
    };
  }
}

/**
 * Analisa o contexto do prompt sem gerar código
 */
export async function analyzeContext(prompt: string) {
  try {
    const response = await fetch(`${NEURAL_CORE_URL}/api/analyze-context`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Erro ao analisar contexto');
    }

    return await response.json();

  } catch (error: any) {
    console.error('❌ Erro ao analisar contexto:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### 2.3. Atualizar `GeminiService.ts`

**ANTES (pesado):**
```typescript
import { GoogleGenAI } from "@google/genai";

const ARTISAN_DIGITAL_MANIFESTO = `
╔══════════════════════════════════════════════════════════════════════════════╗
║              🚀 DIRETIVA SUPREMA: APLICATIVOS VIVOS E FUNCIONAIS 🚀          ║
... (500+ linhas de manifestos)
`;

export async function generateAiResponse(prompt: string, ...) {
  const genAI = new GoogleGenAI(apiKey); // API Key exposta!
  const enrichedPrompt = ARTISAN_DIGITAL_MANIFESTO + prompt; // Lógica no frontend
  // ...
}
```

**DEPOIS (leve):**
```typescript
import { generateWithNeuralCore } from './NeuralCoreClient';

export async function generateAiResponse(
  prompt: string,
  modelName: string = 'gemini-2.0-flash-exp',
  temperature: number = 0.7
) {
  // O Neural Core cuida de TUDO: manifestos, detecção, enriquecimento
  const response = await generateWithNeuralCore({
    prompt,
    modelName,
    temperature
  });

  if (!response.success) {
    throw new Error(response.error || 'Erro ao gerar código');
  }

  return {
    code: response.text,
    metadata: response.metadata
  };
}
```

#### 2.4. Remover Código Desnecessário

**Arquivos para limpar:**

1. `services/GeminiService.ts`
   - ❌ Remover `ARTISAN_DIGITAL_MANIFESTO`
   - ❌ Remover `FINTECH_ARCHITECT_PROTOCOL`
   - ❌ Remover `FULLSTACK_PRO_PROTOCOL`
   - ❌ Remover `GAME_DEV_PROTOCOL`
   - ❌ Remover funções de detecção de contexto
   - ❌ Remover importação do `@google/genai`

2. `services/ExcellenceCore.ts`
   - ✅ Manter (ainda usado para avaliação local)
   - Mas pode ser movido para o Neural Core no futuro

### 3. Testar Migração

#### 3.1. Teste Básico

```typescript
// No console do navegador
const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Crie um botão vermelho'
  })
});

const data = await response.json();
console.log(data);
```

#### 3.2. Teste de Contexto

```typescript
// Teste detecção de jogo
const gameResponse = await fetch('http://localhost:3000/api/analyze-context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Crie um jogo de plataforma'
  })
});

const gameData = await gameResponse.json();
console.log(gameData.context); // { isGame: true, ... }

// Teste detecção de fintech
const fintechResponse = await fetch('http://localhost:3000/api/analyze-context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Crie um banco digital'
  })
});

const fintechData = await fintechResponse.json();
console.log(fintechData.context); // { isFintech: true, ... }
```

### 4. Deploy

#### 4.1. Deploy do Neural Core

**Opção 1: Railway**
```bash
cd neural-core
railway login
railway init
railway up
```

**Opção 2: Render**
```bash
# Criar novo Web Service no Render
# Conectar ao repositório
# Build Command: npm install && npm run build
# Start Command: npm start
# Adicionar variável de ambiente: GEMINI_API_KEY
```

**Opção 3: Docker**
```bash
cd neural-core
docker-compose up -d
```

#### 4.2. Atualizar Frontend para Produção

```bash
# .env.production
VITE_NEURAL_CORE_URL=https://seu-neural-core.railway.app
```

---

## 📊 Comparação Antes vs Depois

### Antes (Frontend Pesado)

```
Frontend Bundle:
├── GeminiService.ts (500KB)
│   ├── ARTISAN_MANIFESTO (150KB)
│   ├── FINTECH_PROTOCOL (100KB)
│   ├── FULLSTACK_PROTOCOL (80KB)
│   ├── GAME_PROTOCOL (70KB)
│   └── Lógica de detecção (100KB)
├── @google/genai (200KB)
└── Outros (500KB)
TOTAL: ~1.5MB

Segurança: ❌ API Key exposta
Performance: ❌ Bundle pesado
Manutenção: ❌ Lógica duplicada
Consistência: ❌ Prompts podem variar
```

### Depois (Neural Core)

```
Frontend Bundle:
├── NeuralCoreClient.ts (5KB)
└── Outros (500KB)
TOTAL: ~505KB (-66%)

Backend (Neural Core):
├── Manifestos centralizados
├── Detecção inteligente
├── Cache de contexto
└── Logs auditáveis

Segurança: ✅ API Key no servidor
Performance: ✅ Bundle 66% menor
Manutenção: ✅ Lógica centralizada
Consistência: ✅ Prompts sempre iguais
```

---

## 🎯 Benefícios da Migração

### 1. Segurança 🔒
- API Key NUNCA exposta no frontend
- Validação centralizada
- Rate limiting no servidor
- Logs auditáveis

### 2. Performance ⚡
- Frontend 66% mais leve
- Carregamento mais rápido
- Menos processamento no cliente
- Cache de contexto (futuro)

### 3. Manutenibilidade 🔧
- Manifestos em um único lugar
- Atualização sem rebuild do frontend
- Versionamento de protocolos
- Testes centralizados

### 4. Consistência 🎯
- Todos os usuários recebem mesmos protocolos
- Sem variação por cache do navegador
- Rollback fácil de protocolos
- A/B testing de manifestos

---

## 🚨 Troubleshooting

### Erro: "Failed to fetch"

**Causa:** CORS ou Neural Core não está rodando

**Solução:**
```bash
# Verificar se Neural Core está rodando
curl http://localhost:3000/health

# Verificar CORS no .env do Neural Core
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Erro: "API Key inválida"

**Causa:** `GEMINI_API_KEY` não configurada no Neural Core

**Solução:**
```bash
cd neural-core
cp .env.example .env
# Edite .env e adicione sua chave
```

### Erro: "Prompt muito longo"

**Causa:** Prompt excede 1MB

**Solução:**
- Reduza o tamanho do prompt
- Ou aumente o limite no `validators.ts`

---

## ✅ Checklist Final

- [ ] Neural Core rodando em `http://localhost:3000`
- [ ] Health check retorna `{ status: "ok" }`
- [ ] Frontend atualizado com `NeuralCoreClient.ts`
- [ ] `GeminiService.ts` limpo (sem manifestos)
- [ ] Testes passando
- [ ] Bundle do frontend reduzido
- [ ] API Key não está mais no frontend
- [ ] Deploy do Neural Core funcionando
- [ ] Frontend em produção apontando para Neural Core

---

**Migração completa! 🎉**

Agora você tem um sistema profissional com:
- 🧠 Inteligência centralizada
- 🔒 Segurança máxima
- ⚡ Performance otimizada
- 🔧 Manutenção simplificada
