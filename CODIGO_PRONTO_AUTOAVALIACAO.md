# 💻 Código Pronto - Implementação da Auto-Avaliação

## 🚀 Copie e Cole Este Código

### **Arquivo 1: services/GeminiService.ts**

**Adicionar esta função ANTES da função `generateAiResponse`:**

```typescript
/**
 * ============================================
 * SISTEMA DE AUTO-AVALIAÇÃO AUTOMÁTICA
 * ============================================
 * 
 * Avalia código com ExcellenceCore e refina automaticamente
 * se score < 85/100
 */
async function evaluateAndRefineCode(
  generatedCode: string,
  originalPrompt: string,
  responseType: AiResponseType,
  modelId: string,
  retryCount: number = 0
): Promise<{ content: string; excellenceReport: ExcellenceReport }> {
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 AVALIAÇÃO DE EXCELÊNCIA (Tentativa ${retryCount + 1}/3)`);
  console.log(`${'='.repeat(60)}\n`);
  
  // 1. Avaliar código com ExcellenceCore
  const report = ExcellenceEngine.evaluate(generatedCode, HTML_EXCELLENCE_CRITERIA);
  
  console.log(`📈 Score Total: ${report.overallScore}/100`);
  console.log(`🎯 Score Mínimo: ${HTML_EXCELLENCE_CRITERIA.minimumScore}/100`);
  console.log(`✅ Aprovado: ${report.passed ? 'SIM' : 'NÃO'}\n`);
  
  // Exibir scores por critério
  report.checks.forEach(check => {
    const icon = check.result.passed ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.result.score}/100`);
  });
  
  // 2. Se passou ou já tentou 3 vezes, retornar
  if (report.passed || retryCount >= 2) {
    if (!report.passed) {
      console.warn(`\n⚠️ AVISO: Score ${report.overallScore}/100 após ${retryCount + 1} tentativas.`);
      console.warn(`Entregando código mesmo sem atingir score mínimo.\n`);
    } else {
      console.log(`\n🎉 CÓDIGO APROVADO! Score: ${report.overallScore}/100\n`);
    }
    
    return {
      content: generatedCode,
      excellenceReport: report
    };
  }
  
  // 3. Se não passou, refinar automaticamente
  console.log(`\n🔄 REFINANDO CÓDIGO AUTOMATICAMENTE...\n`);
  console.log(`Problemas encontrados:`);
  report.improvements.slice(0, 5).forEach(improvement => {
    console.log(`  • ${improvement}`);
  });
  console.log('');
  
  const refinementPrompt = `
${CORE_PRINCIPLE.mantra}

🎯 ANÁLISE DE QUALIDADE DO CÓDIGO GERADO:

📊 SCORE ATUAL: ${report.overallScore}/100
📊 SCORE MÍNIMO NECESSÁRIO: ${HTML_EXCELLENCE_CRITERIA.minimumScore}/100
❌ STATUS: NÃO APROVADO

🔍 PROBLEMAS IDENTIFICADOS:
${report.improvements.slice(0, 10).map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

📝 CÓDIGO ATUAL:
\`\`\`html
${generatedCode}
\`\`\`

🎯 TAREFA CRÍTICA:
Refine o código HTML para corrigir TODOS os problemas identificados acima.

REQUISITOS OBRIGATÓRIOS:
1. Mantenha TODA a funcionalidade existente
2. Mantenha o design e estilo visual
3. Corrija TODOS os problemas de acessibilidade (PRIORIDADE MÁXIMA)
4. Adicione meta tags faltantes
5. Melhore estrutura semântica
6. Garanta responsividade
7. Otimize performance
8. Implemente segurança básica

O código refinado DEVE atingir score mínimo de ${HTML_EXCELLENCE_CRITERIA.minimumScore}/100.

NÃO adicione comentários explicativos no código.
NÃO remova funcionalidades existentes.
NÃO mude o propósito do código.
APENAS corrija os problemas identificados.
`;

  try {
    // 4. Gerar código refinado
    console.log(`🤖 Chamando Gemini para refinar código...\n`);
    
    const refinedResponse = await generateAiResponse(
      refinementPrompt,
      generatedCode,
      [],
      responseType,
      modelId
    );
    
    if (!refinedResponse?.content) {
      console.error('❌ Falha ao refinar código - resposta vazia');
      return {
        content: generatedCode,
        excellenceReport: report
      };
    }
    
    console.log(`✅ Código refinado gerado com sucesso\n`);
    
    // 5. Avaliar código refinado recursivamente
    return await evaluateAndRefineCode(
      refinedResponse.content,
      originalPrompt,
      responseType,
      modelId,
      retryCount + 1
    );
    
  } catch (error) {
    console.error('❌ Erro ao refinar código:', error);
    return {
      content: generatedCode,
      excellenceReport: report
    };
  }
}
```

---

**Modificar a função `generateAiResponse` existente:**

**Procurar por:** O local onde o código HTML é retornado (provavelmente no final da função)

**ANTES (código atual):**
```typescript
// ... código de geração ...

return {
  content: generatedCode,
  // ... outros campos
};
```

**DEPOIS (código modificado):**
```typescript
// ... código de geração ...

// Extrair código HTML da resposta
let generatedCode = extractCodeFromResponse(response);

// 🛡️ VALIDAÇÃO BÁSICA COM HTML QUALITY GUARD
console.log('\n🛡️ Validando estrutura HTML básica...');
const validation = HTMLQualityGuard.validateHTML(generatedCode);

if (!validation.isValid) {
  console.warn('⚠️ HTML básico inválido. Problemas encontrados:');
  validation.errors.forEach(error => console.warn(`  ${error}`));
  
  console.log('🔧 Tentando corrigir automaticamente...');
  generatedCode = HTMLQualityGuard.fixBasicIssues(generatedCode);
  
  // Validar novamente
  const revalidation = HTMLQualityGuard.validateHTML(generatedCode);
  if (!revalidation.isValid) {
    console.error('❌ Não foi possível corrigir HTML. Usando HTML de emergência.');
    generatedCode = HTMLQualityGuard.getEmergencyHTML(userPrompt);
  } else {
    console.log('✅ HTML corrigido com sucesso!');
  }
} else {
  console.log('✅ HTML básico válido!');
}

// 🎯 AUTO-AVALIAÇÃO AUTOMÁTICA COM EXCELLENCE CORE
console.log('\n🎯 Iniciando auto-avaliação de excelência...');
const result = await evaluateAndRefineCode(
  generatedCode,
  userPrompt,
  responseType,
  modelId
);

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ CÓDIGO FINAL PRONTO`);
console.log(`📊 Score: ${result.excellenceReport.overallScore}/100`);
console.log(`${'='.repeat(60)}\n`);

// Retornar código refinado com report
return {
  content: result.content,
  excellenceReport: result.excellenceReport,
  // ... outros campos existentes
};
```

---

### **Arquivo 2: store/useAppStore.ts**

**Adicionar no tipo `AppState`:**

```typescript
interface AppState {
  // ... estados existentes ...
  
  // 🎯 NOVO: Excellence Report
  currentExcellenceReport: ExcellenceReport | null;
  setCurrentExcellenceReport: (report: ExcellenceReport | null) => void;
}
```

**Adicionar na implementação do store:**

```typescript
const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // ... estados existentes ...
    
    // 🎯 NOVO: Excellence Report
    currentExcellenceReport: null,
    
    setCurrentExcellenceReport: (report) => {
      set((state) => {
        state.currentExcellenceReport = report;
      });
    },
    
    // Modificar handleAiCommand para salvar o report
    handleAiCommand: async (prompt, currentCode, attachments, action) => {
      try {
        // ... código existente de geração ...
        
        const response = await generateAiResponse(
          prompt,
          currentCode,
          attachments,
          responseType,
          modelId
        );
        
        // 🎯 NOVO: Salvar excellence report se disponível
        if (response.excellenceReport) {
          console.log('💾 Salvando Excellence Report no store...');
          set((state) => {
            state.currentExcellenceReport = response.excellenceReport;
          });
        }
        
        // Atualizar código no editor
        set((state) => {
          state.htmlCode = response.content;
        });
        
        // ... resto do código existente ...
        
      } catch (error) {
        console.error('Erro ao gerar código:', error);
        // ... tratamento de erro existente ...
      }
    }
  }))
);
```

---

### **Arquivo 3: src/App.tsx**

**Adicionar no início do componente:**

```typescript
export const App = (): JSX.Element => {
  // ... código existente ...
  
  // 🎯 NOVO: Pegar Excellence Report do store
  const { currentExcellenceReport, setCurrentExcellenceReport } = useAppStore();
  
  // ... resto do código ...
```

**Adicionar no JSX, logo após o CommandBar:**

```typescript
{/* 🎯 PAINEL DE SCORE DE EXCELÊNCIA */}
{currentExcellenceReport && (
  <div className="mx-2 my-2">
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          📊 Score de Excelência
          <span className={`text-2xl font-bold ${
            currentExcellenceReport.overallScore >= 90 ? 'text-green-600' :
            currentExcellenceReport.overallScore >= 70 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {currentExcellenceReport.overallScore}/100
            {currentExcellenceReport.overallScore >= 90 ? ' 🚀' :
             currentExcellenceReport.overallScore >= 70 ? ' ⚡' : ' 🔧'}
          </span>
        </h3>
        <button 
          onClick={() => setCurrentExcellenceReport(null)} 
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {currentExcellenceReport.checks.map((check, index) => (
          <div key={index} className="text-center">
            <div className={`text-xl font-bold ${
              check.result.score >= 90 ? 'text-green-600' :
              check.result.score >= 70 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {check.result.score}
            </div>
            <div className="text-xs text-gray-600">{check.name}</div>
          </div>
        ))}
      </div>

      {currentExcellenceReport.improvements.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <h4 className="font-semibold text-green-800 mb-2">
            ✅ Melhorias Aplicadas ({currentExcellenceReport.improvements.length}):
          </h4>
          <div className="flex flex-wrap gap-1">
            {currentExcellenceReport.improvements.slice(0, 5).map((improvement, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {improvement.replace(/[*_]/g, '').substring(0, 50)}
              </span>
            ))}
            {currentExcellenceReport.improvements.length > 5 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                +{currentExcellenceReport.improvements.length - 5} mais
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600 text-center">
        {currentExcellenceReport.passed ? 
          '✅ Código aprovado pelo Excellence Core' : 
          '⚠️ Código entregue após máximo de tentativas'}
      </div>
    </div>
  </div>
)}
```

---

## 🧪 Teste Rápido

**Após implementar, teste com:**

```typescript
// No console do navegador:
console.log('🧪 Testando sistema de auto-avaliação...');

// Gerar código simples
// Prompt: "Crie uma landing page"

// Verificar logs no console:
// ✅ Deve aparecer: "📊 AVALIAÇÃO DE EXCELÊNCIA"
// ✅ Deve aparecer: Score e critérios
// ✅ Se score < 85: "🔄 REFINANDO CÓDIGO AUTOMATICAMENTE"
// ✅ Deve aparecer: "✅ CÓDIGO FINAL PRONTO"
```

---

## 📋 Checklist de Implementação

- [ ] Copiar função `evaluateAndRefineCode` para `GeminiService.ts`
- [ ] Modificar `generateAiResponse` para chamar avaliação
- [ ] Adicionar `currentExcellenceReport` em `useAppStore.ts`
- [ ] Modificar `handleAiCommand` para salvar report
- [ ] Adicionar painel de score em `App.tsx`
- [ ] Testar geração de código
- [ ] Verificar logs no console
- [ ] Verificar painel de score no UI
- [ ] Testar com código simples
- [ ] Testar com código complexo

---

## 🎯 Resultado Esperado

### **Console:**
```
🎯 Iniciando auto-avaliação de excelência...

============================================================
📊 AVALIAÇÃO DE EXCELÊNCIA (Tentativa 1/3)
============================================================

📈 Score Total: 72/100
🎯 Score Mínimo: 85/100
✅ Aprovado: NÃO

❌ Estrutura Semântica: 85/100
❌ Meta Tags Essenciais: 70/100
❌ Acessibilidade: 60/100
✅ Responsividade: 80/100
✅ Performance: 75/100
✅ Segurança: 90/100
✅ UX e Estética: 85/100

🔄 REFINANDO CÓDIGO AUTOMATICAMENTE...

Problemas encontrados:
  • **Meta Tags Essenciais:** Falta meta viewport
  • **Acessibilidade:** 3 imagens sem alt
  • **Acessibilidade:** 2 inputs sem labels

🤖 Chamando Gemini para refinar código...

✅ Código refinado gerado com sucesso

============================================================
📊 AVALIAÇÃO DE EXCELÊNCIA (Tentativa 2/3)
============================================================

📈 Score Total: 89/100
🎯 Score Mínimo: 85/100
✅ Aprovado: SIM

✅ Estrutura Semântica: 85/100
✅ Meta Tags Essenciais: 95/100
✅ Acessibilidade: 92/100
✅ Responsividade: 80/100
✅ Performance: 75/100
✅ Segurança: 90/100
✅ UX e Estética: 85/100

🎉 CÓDIGO APROVADO! Score: 89/100

============================================================
✅ CÓDIGO FINAL PRONTO
📊 Score: 89/100
============================================================
```

### **UI:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Score de Excelência  89/100 ⚡                    × │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  85        95        92        80                        │
│  Estrutura Meta Tags Acessib.  Respons.                 │
│                                                          │
│  75        90        85                                  │
│  Perform.  Segurança UX/UI                               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ ✅ Melhorias Aplicadas (3):                             │
│                                                          │
│  Meta viewport adicionado                                │
│  Alt adicionado em 3 imagens                             │
│  Labels adicionados em 2 inputs                          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ ✅ Código aprovado pelo Excellence Core                 │
└─────────────────────────────────────────────────────────┘
```

---

**Criado em:** 13 de Novembro de 2025  
**Status:** 💻 CÓDIGO PRONTO PARA IMPLEMENTAÇÃO  
**Prioridade:** 🔥 COPIAR E COLAR AGORA
