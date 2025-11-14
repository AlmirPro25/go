/**
 * Sistema de Auto-Avaliação Inteligente da IA
 * A IA se auto-avalia, se pontua e se auto-corrige
 */

import { GoogleGenAI } from "@google/genai";
import { ApiKeyManager } from './ApiKeyManager';

interface SelfEvaluationResult {
  selfAnalysis: string;
  qualityScore: number;
  detectedIssues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
  }>;
  needsImprovement: boolean;
  improvementPlan: string[];
}

interface SelfCorrectionResult {
  improvedCode: string;
  changesApplied: string[];
  finalScore: number;
  iterationsUsed: number;
}

// Função para obter instância do GoogleGenAI com chave dinâmica
function getGeminiInstance(): GoogleGenAI {
  const apiKey = ApiKeyManager.getKeyToUse();
  if (!apiKey) {
    throw new Error('Nenhuma API Key disponível. Configure sua chave do Gemini.');
  }
  return new GoogleGenAI({ apiKey });
}

export class AISelfEvaluationSystem {

  /**
   * Prompt para a IA se auto-avaliar
   */
  private buildSelfEvaluationPrompt(generatedCode: string, originalPrompt: string): string {
    return `**SISTEMA DE AUTO-AVALIAÇÃO INTELIGENTE**

Você acabou de gerar o seguinte código baseado na solicitação do usuário:

**SOLICITAÇÃO ORIGINAL:**
"${originalPrompt}"

**CÓDIGO GERADO:**
\`\`\`
${generatedCode}
\`\`\`

**SUA MISSÃO AGORA É SE AUTO-AVALIAR:**

1. **ANÁLISE CRÍTICA:** Analise seu próprio código com olhar crítico
2. **AUTO-PONTUAÇÃO:** Se dê uma nota de 0 a 100 baseada nos critérios abaixo
3. **DETECÇÃO DE PROBLEMAS:** Identifique todos os problemas no seu código
4. **PLANO DE MELHORIA:** Crie um plano específico para melhorar

**CRITÉRIOS DE AVALIAÇÃO (0-100 pontos):**

🔍 **FUNCIONALIDADE (0-25 pontos):**
- Código realmente funciona? (+25)
- Tem funcionalidades simuladas? (-15)
- Tem placeholders críticos? (-10)
- Implementação completa? (+10)

🏗️ **QUALIDADE TÉCNICA (0-25 pontos):**
- Estrutura bem organizada? (+10)
- Boas práticas seguidas? (+10)
- Tratamento de erros? (+5)

🔒 **SEGURANÇA & PRODUÇÃO (0-25 pontos):**
- Autenticação real implementada? (+10)
- Validação de dados? (+5)
- Configurações de segurança? (+10)

🎨 **COMPLETUDE & UX (0-25 pontos):**
- Interface completa e funcional? (+15)
- Experiência do usuário boa? (+10)

**PENALIZAÇÕES CRÍTICAS:**
- Imagens Base64 no código: -30 pontos
- "Aqui você implementaria": -20 pontos
- "Simule a resposta": -25 pontos
- Lorem Ipsum: -10 pontos

**FORMATO DE RESPOSTA OBRIGATÓRIO:**
\`\`\`json
{
  "selfAnalysis": "Análise detalhada e honesta do meu próprio código...",
  "qualityScore": 85,
  "detectedIssues": [
    {
      "type": "simulation_detected",
      "severity": "high",
      "description": "Encontrei simulação na linha X",
      "suggestion": "Implementar funcionalidade real usando Y"
    }
  ],
  "needsImprovement": true,
  "improvementPlan": [
    "Substituir simulação por implementação real",
    "Adicionar validação de dados",
    "Melhorar tratamento de erros"
  ]
}
\`\`\`

**SEJA RIGOROSO E HONESTO NA SUA AUTO-AVALIAÇÃO!**
Não seja condescendente consigo mesmo. Se há problemas, admita e corrija.`;
  }

  /**
   * Prompt para a IA se auto-corrigir
   */
  private buildSelfCorrectionPrompt(
    originalCode: string, 
    evaluation: SelfEvaluationResult, 
    originalPrompt: string
  ): string {
    return `**SISTEMA DE AUTO-CORREÇÃO INTELIGENTE**

Você se auto-avaliou e detectou problemas no seu código. Agora é hora de se auto-corrigir.

**CÓDIGO ATUAL:**
\`\`\`
${originalCode}
\`\`\`

**SUA AUTO-AVALIAÇÃO:**
- **Pontuação atual:** ${evaluation.qualityScore}/100
- **Análise:** ${evaluation.selfAnalysis}

**PROBLEMAS DETECTADOS:**
${evaluation.detectedIssues.map(issue => 
  `- **${issue.type}** (${issue.severity}): ${issue.description}
    → Sugestão: ${issue.suggestion}`
).join('\n')}

**PLANO DE MELHORIA:**
${evaluation.improvementPlan.map((plan, i) => `${i + 1}. ${plan}`).join('\n')}

**SUA MISSÃO:**
Reescreva o código aplicando TODAS as melhorias identificadas. 

**OBJETIVOS:**
- Atingir pontuação mínima de 90/100
- Eliminar TODOS os problemas detectados
- Implementar TODAS as sugestões do plano
- Manter a funcionalidade original da solicitação: "${originalPrompt}"

**REGRAS CRÍTICAS:**
- NUNCA mantenha simulações ou placeholders
- SEMPRE implemente funcionalidades reais
- SEMPRE adicione tratamento de erros
- SEMPRE use dados realistas

**RESPOSTA:**
Forneça apenas o código corrigido, completo e funcional.`;
  }

  /**
   * Chama a API do Gemini para auto-avaliação
   */
  private async callGeminiAPI(prompt: string, modelName: string = 'gemini-2.5-flash'): Promise<string> {
    try {
      const ai = getGeminiInstance();
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ text: prompt }]
      });
      return result.text || '';
    } catch (error) {
      console.error('Erro na API do Gemini:', error);
      throw error;
    }
  }

  /**
   * Executa auto-avaliação da IA
   */
  async performSelfEvaluation(
    generatedCode: string, 
    originalPrompt: string
  ): Promise<SelfEvaluationResult> {
    try {
      const prompt = this.buildSelfEvaluationPrompt(generatedCode, originalPrompt);
      const response = await this.callGeminiAPI(prompt, 'gemini-2.5-flash');
      
      // Parse da resposta JSON
      const evaluationData = JSON.parse(response);
      
      return {
        selfAnalysis: evaluationData.selfAnalysis || 'Análise não disponível',
        qualityScore: evaluationData.qualityScore || 0,
        detectedIssues: evaluationData.detectedIssues || [],
        needsImprovement: evaluationData.needsImprovement || false,
        improvementPlan: evaluationData.improvementPlan || []
      };
      
    } catch (error: unknown) {
      console.error('Erro na auto-avaliação:', error);
      return {
        selfAnalysis: 'Erro na auto-avaliação',
        qualityScore: 0,
        detectedIssues: [{
          type: 'system_error',
          severity: 'critical',
          description: 'Falha no sistema de auto-avaliação',
          suggestion: 'Revisar manualmente o código'
        }],
        needsImprovement: true,
        improvementPlan: ['Revisão manual necessária']
      };
    }
  }

  /**
   * Executa auto-correção baseada na avaliação
   */
  async performSelfCorrection(
    code: string, 
    evaluation: SelfEvaluationResult, 
    originalPrompt: string
  ): Promise<SelfCorrectionResult> {
    const maxIterations = 3;
    let currentCode = code;
    let currentScore = evaluation.qualityScore;
    let iterationsUsed = 0;
    const changesApplied: string[] = [];
    
    console.log(`🔧 Iniciando auto-correção. Score inicial: ${currentScore}/100`);
    
    for (let i = 0; i < maxIterations; i++) {
      iterationsUsed++;
      
      try {
        const correctionPrompt = this.buildSelfCorrectionPrompt(currentCode, evaluation, originalPrompt);
        const correctedCode = await this.callGeminiAPI(correctionPrompt, 'gemini-2.5-flash');
        
        // Auto-avaliar o código corrigido
        const newEvaluation = await this.performSelfEvaluation(correctedCode, originalPrompt);
        
        // Verificar se houve melhoria
        if (newEvaluation.qualityScore > currentScore) {
          currentCode = correctedCode;
          currentScore = newEvaluation.qualityScore;
          changesApplied.push(`Iteração ${iterationsUsed}: Score ${currentScore}/100`);
          
          console.log(`✅ Melhoria detectada! Novo score: ${currentScore}/100`);
          
          // Atualizar avaliação para próxima iteração
          evaluation = newEvaluation;
          
          // Se atingiu score satisfatório, parar
          if (currentScore >= 90) {
            console.log(`🎯 Score alvo atingido: ${currentScore}/100`);
            break;
          }
        } else {
          console.log(`⚠️ Sem melhoria na iteração ${iterationsUsed}`);
          break;
        }
        
      } catch (error: unknown) {
        console.error(`Erro na iteração ${iterationsUsed}:`, error);
        changesApplied.push(`Iteração ${iterationsUsed}: Erro - ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        break;
      }
    }
    
    console.log(`🏁 Auto-correção finalizada. Score final: ${currentScore}/100`);
    
    return {
      improvedCode: currentCode,
      changesApplied,
      finalScore: currentScore,
      iterationsUsed
    };
  }

  /**
   * Fluxo completo: Auto-avaliação → Auto-pontuação → Auto-correção
   */
  async executeFullSelfImprovementCycle(
    generatedCode: string,
    originalPrompt: string,
    targetScore: number = 90
  ): Promise<{
    originalScore: number;
    finalCode: string;
    finalScore: number;
    evaluationDetails: SelfEvaluationResult;
    correctionDetails: SelfCorrectionResult;
    cycleSuccessful: boolean;
  }> {
    console.log('🚀 Iniciando ciclo completo de auto-melhoria da IA');
    
    // Fase 1: Auto-avaliação
    console.log('📊 Fase 1: Auto-avaliação');
    const evaluation = await this.performSelfEvaluation(generatedCode, originalPrompt);
    const originalScore = evaluation.qualityScore;
    
    // Verificar se precisa de melhoria
    if (!evaluation.needsImprovement && evaluation.qualityScore >= targetScore) {
      console.log('✨ Código já atende aos critérios de qualidade!');
      return {
        originalScore,
        finalCode: generatedCode,
        finalScore: evaluation.qualityScore,
        evaluationDetails: evaluation,
        correctionDetails: {
          improvedCode: generatedCode,
          changesApplied: ['Nenhuma correção necessária'],
          finalScore: evaluation.qualityScore,
          iterationsUsed: 0
        },
        cycleSuccessful: true
      };
    }
    
    // Fase 2: Auto-correção
    console.log('🔧 Fase 2: Auto-correção');
    const correction = await this.performSelfCorrection(generatedCode, evaluation, originalPrompt);
    
    const cycleSuccessful = correction.finalScore >= targetScore;
    
    console.log(`🎯 Ciclo ${cycleSuccessful ? 'CONCLUÍDO' : 'PARCIAL'}`);
    console.log(`📈 Melhoria: ${originalScore} → ${correction.finalScore} pontos`);
    
    return {
      originalScore,
      finalCode: correction.improvedCode,
      finalScore: correction.finalScore,
      evaluationDetails: evaluation,
      correctionDetails: correction,
      cycleSuccessful
    };
  }
}

// Instância global do sistema de auto-avaliação
export const aiSelfEvaluationSystem = new AISelfEvaluationSystem();

// Função helper para uso direto
export async function executeAISelfImprovement(
  generatedCode: string,
  originalPrompt: string,
  targetScore: number = 90
) {
  return aiSelfEvaluationSystem.executeFullSelfImprovementCycle(
    generatedCode,
    originalPrompt,
    targetScore
  );
}
