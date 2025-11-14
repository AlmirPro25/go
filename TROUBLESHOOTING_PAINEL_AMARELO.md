# 🔧 Troubleshooting - Painel Amarelo Não Aparece

## 🎯 O Que Verificar

### **1. Abrir Console do Navegador (F12)**

Pressione **F12** e vá na aba **Console**. Procure por:

```
🎯 Iniciando sistema híbrido de auto-avaliação...
📊 FASE 1: Avaliando com UnifiedQualitySystem...
✅ FASE 1 concluída. Score: XX
🤖 FASE 2: Gerando crítica conversacional com IA...
✅ FASE 2 concluída. Crítica gerada.
🎯 FASE 3: Combinando sistemas...
📊 Painel híbrido gerado com sucesso!
```

### **2. Se NÃO aparecer nenhuma mensagem:**

O sistema híbrido não está sendo chamado. Verifique:

- ✅ Você está gerando código HTML? (não apenas texto)
- ✅ O código tem `<!DOCTYPE html>`?
- ✅ Aguardou 2 segundos após a geração?

### **3. Se aparecer erro:**

Copie o erro e me envie para eu corrigir.

### **4. Se aparecer as mensagens mas o painel não aparecer:**

O problema está no componente visual. Verifique:

- ✅ O componente `AutoCritiquePanel` existe em `src/App.tsx`?
- ✅ A variável `autoCritiqueResult` está sendo lida do store?

---

## 🧪 Teste Rápido

### **Passo 1: Limpar cache**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### **Passo 2: Gerar código simples**
Digite no prompt:
```
Crie uma landing page simples
```

### **Passo 3: Abrir console (F12)**
Veja se aparecem as mensagens de log

### **Passo 4: Aguardar 2 segundos**
O painel amarelo deve aparecer

---

## 🔍 Verificações Adicionais

### **Verificar se autoCritiqueResult está sendo setado:**

No console, digite:
```javascript
useAppStore.getState().autoCritiqueResult
```

Se retornar `null`, o sistema não está funcionando.
Se retornar uma string com markdown, o sistema está funcionando mas o painel não está renderizando.

### **Verificar se o componente AutoCritiquePanel existe:**

Procure no arquivo `src/App.tsx` por:
```typescript
{autoCritiqueResult && (
  <AutoCritiquePanel
    critique={autoCritiqueResult}
    isLoading={isLoadingCritique}
    onClose={() => set({ autoCritiqueResult: null })}
  />
)}
```

---

## 🚨 Possíveis Problemas

### **Problema 1: Timeout muito curto**
O sistema aguarda 2 segundos. Se a IA demorar mais, pode não funcionar.

**Solução:** Aumentar o timeout de 2000 para 5000ms

### **Problema 2: Erro na chamada da IA**
A função `critiqueGeneratedSite` pode estar falhando.

**Solução:** Verificar se a API Key do Gemini está configurada

### **Problema 3: Componente não renderiza**
O `AutoCritiquePanel` pode não estar no lugar certo.

**Solução:** Verificar se está dentro do componente correto

---

## 📊 O Que Deve Acontecer

### **Fluxo Correto:**

```
1. Você digita: "Crie uma landing page"
   ↓
2. Sistema gera o código HTML
   ↓
3. Aguarda 2 segundos
   ↓
4. Console mostra:
   🎯 Iniciando sistema híbrido...
   📊 FASE 1: Avaliando...
   ✅ FASE 1 concluída. Score: 89
   🤖 FASE 2: Gerando crítica...
   ✅ FASE 2 concluída.
   🎯 FASE 3: Combinando...
   📊 Painel híbrido gerado!
   ↓
5. Painel amarelo aparece com:
   - Score geral
   - Métricas detalhadas
   - Análise da IA
   - Melhorias técnicas
   - Recomendações
```

---

## 🔧 Correção Rápida

Se nada funcionar, tente esta versão simplificada:

### **Opção 1: Apenas UnifiedQualitySystem (sem IA)**

Remova a chamada da IA e use apenas o score:

```typescript
// Apenas FASE 1
const { unifiedQualitySystem } = await import('../services/UnifiedQualitySystem');
const report = unifiedQualitySystem.evaluate(finalCode);

const critique = `
## 📊 Auto-Avaliação

### Score: ${report.overallScore}/100 ${report.passed ? '✅' : '⚠️'}

### Métricas:
- Acessibilidade: ${report.metrics.accessibility}/100
- Performance: ${report.metrics.performance}/100
- Segurança: ${report.metrics.security}/100
`;

set({ autoCritiqueResult: critique });
```

### **Opção 2: Apenas critiqueGeneratedSite (sem score)**

Remova o UnifiedQualitySystem e use apenas a IA:

```typescript
// Apenas FASE 2
const aiCritique = await critiqueGeneratedSite(
    finalCode,
    actualPrompt,
    projectPlan,
    selectedTextModel
);

set({ autoCritiqueResult: aiCritique });
```

---

## 📞 Me Envie

Se nada funcionar, me envie:

1. **Print do console** (F12 → Console)
2. **Mensagem de erro** (se houver)
3. **O que você digitou** no prompt
4. **Se o código foi gerado** corretamente

Assim eu posso te ajudar melhor! 🚀
