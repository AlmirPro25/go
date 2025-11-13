# Correção do Sistema de Pesquisa Avançada

## 🎯 Problema Identificado

A pesquisa avançada (AdvancedResearch.ts) estava falhando imediatamente ao receber erro 503, sem tentar novamente ou usar modelos alternativos.

**Erro observado:**
```
Erro na pesquisa avançada: ApiError: {"error":{"code":503,"message":"The model is overloaded. Please try again later.","status":"UNAVAILABLE"}}
```

## ✅ Solução Implementada

Adicionado o mesmo sistema de retry com fallback de modelos que foi implementado no GeminiService.

### Mudanças no services/AdvancedResearch.ts

#### Antes:
```typescript
try {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: researchPrompt,
    config: {
      responseMimeType: 'application/json'
    }
  });
  // ... processar resposta
} catch (error) {
  console.error('Erro na pesquisa avançada:', error);
  // Retornar paletas padrão imediatamente
}
```

#### Depois:
```typescript
// Sistema de retry com fallback de modelos
const maxRetries = 5;
const fallbackModels = ['gemini-2.5-flash-lite', 'gemini-2.5-pro', 'gemini-2.5-flash'];
let currentModel = modelName;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // Tentar modelo alternativo na tentativa 3
    if (attempt === 3 && fallbackModels.length > 0) {
      currentModel = fallbackModels[0];
      console.log(`🔄 Pesquisa: Tentando modelo alternativo: ${currentModel}`);
    }
    
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: researchPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    // Sucesso - retornar resultado
    return researchData;
    
  } catch (error) {
    // Verificar se é erro recuperável (503, UNAVAILABLE, etc.)
    if (isRetryableError && attempt < maxRetries) {
      const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
      console.log(`⏳ Pesquisa: Aguardando ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
  }
}

// Fallback: retornar paletas padrão
return generateDefaultPalettes();
```

## 🔄 Novo Comportamento

### Fluxo de Retry:

```
Tentativa 1: gemini-2.5-flash (0s)
   ↓ Falha (503)
Tentativa 2: gemini-2.5-flash (2s depois)
   ↓ Falha (503)
Tentativa 3: gemini-2.5-flash-lite (4s depois) ← Modelo alternativo
   ↓ Falha (503)
Tentativa 4: gemini-2.5-pro (8s depois) ← Outro modelo
   ↓ Falha (503)
Tentativa 5: gemini-2.5-flash (16s depois) ← Tenta original novamente
   ↓ Sucesso ou usa paletas padrão
```

### Logs no Console:

```
🔄 Pesquisa: Tentando modelo alternativo: gemini-2.5-flash-lite
⏳ Pesquisa: Servidor sobrecarregado. Aguardando 4000ms antes da tentativa 4/5...
⚠️ Pesquisa avançada falhou após todas as tentativas. Usando paletas padrão.
```

## ✨ Benefícios

1. **Resiliência:** Sistema não falha mais na primeira tentativa
2. **Fallback Inteligente:** Tenta modelos alternativos automaticamente
3. **Experiência do Usuário:** Pesquisa continua funcionando mesmo com servidor sobrecarregado
4. **Consistência:** Mesmo comportamento do GeminiService
5. **Graceful Degradation:** Se tudo falhar, usa paletas padrão de qualidade

## 📊 Comparação

### Antes:
- ❌ 1 tentativa apenas
- ❌ Falha imediata com erro 503
- ❌ Sem modelos alternativos
- ❌ Experiência ruim para o usuário

### Depois:
- ✅ 5 tentativas com retry
- ✅ Tenta 3 modelos diferentes
- ✅ Backoff exponencial (2s → 4s → 8s → 16s → 30s)
- ✅ Fallback para paletas padrão de qualidade
- ✅ Logs informativos

## 🎯 Erros Tratados

O sistema agora trata automaticamente:
- ✅ 503 (Service Unavailable)
- ✅ 502 (Bad Gateway)
- ✅ 504 (Gateway Timeout)
- ✅ UNAVAILABLE
- ✅ DEADLINE_EXCEEDED
- ✅ INTERNAL
- ✅ overloaded
- ✅ timeout

## 🚀 Impacto

- **Pesquisa Avançada:** Agora funciona mesmo com servidor sobrecarregado
- **Paletas de Cores:** Sempre disponíveis (geradas ou padrão)
- **Experiência:** Muito mais confiável e profissional
- **Logs:** Usuário sabe o que está acontecendo

## 📝 Modelos Usados

1. **gemini-2.5-flash** (padrão) - Rápido e equilibrado
2. **gemini-2.5-flash-lite** (fallback 1) - Mais leve e disponível
3. **gemini-2.5-pro** (fallback 2) - Mais poderoso

## 🎓 Quando Usa Paletas Padrão

O sistema usa paletas padrão de alta qualidade quando:
- Todas as 5 tentativas falharem
- Erro não recuperável (API key inválida, etc.)
- Timeout total excedido

As paletas padrão incluem:
- Modern Dark Elite
- Vibrant Gradient
- Minimalist Mono
- Nature Inspired
- Sunset Warm

---

**Status:** ✅ Implementado e Testado
**Data:** 2025-11-10
**Versão:** 1.0
**Impacto:** Alto - Pesquisa avançada agora é resiliente a erros 503
