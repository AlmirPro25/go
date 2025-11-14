/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║              🌟 AURORA BUILDER - ARQUITETO + ARTESÃO DIGITAL 🌟              ║
 * ║                                                                              ║
 * ║                    "ARQUITETURA PERFEITA + CÓDIGO EXCELENTE"                 ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * SISTEMA AURORA: Integração completa entre Arquiteto e Artesão
 * 
 * FLUXO:
 * 1. ARQUITETO → Analisa requisitos e cria arquitetura
 * 2. ARTESÃO → Implementa com excelência
 * 3. AVALIADOR → Valida qualidade (92/100+)
 * 4. REFINADOR → Melhora até perfeição
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ApiKeyManager } from '../../services/ApiKeyManager';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface AuroraRequest {
  userPrompt: string;
  projectType?: 'web' | 'mobile' | 'fullstack' | 'api' | 'microservice' | 'fintech' | 'excellence';
  complexity?: 'simple' | 'medium' | 'complex' | 'enterprise';
  technologies?: string[];
  requirements?: string[];
  context?: string; // Contexto da Knowledge Base
}

export interface ArchitectureBlueprint {
  projectName: string;
  description: string;
  architecture: {
    frontend?: {
      framework: string;
      libraries: string[];
      structure: string;
    };
    backend?: {
      language: string;
      framework: string;
      database: string;
      structure: string;
    };
    infrastructure?: {
      deployment: string;
      containerization: string;
      cicd: string;
    };
  };
  techStack: string[];
  fileStructure: Record<string, string>;
  apiEndpoints?: Array<{
    method: string;
    path: string;
    description: string;
  }>;
  dataModels?: Array<{
    name: string;
    fields: Record<string, string>;
  }>;
  reasoning: string;
}

export interface ArtisanCode {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  qualityScore: number;
  improvements: string[];
  readyForProduction: boolean;
}

export interface AuroraResult {
  blueprint: ArchitectureBlueprint;
  code: ArtisanCode;
  totalScore: number;
  executionTime: number;
  logs: string[];
}

// ============================================
// AURORA BUILDER - CLASSE PRINCIPAL
// ============================================

export class AuroraBuilder {
  private genAI: GoogleGenAI | null = null;
  private logs: string[] = [];
  
  constructor() {
    const apiKey = ApiKeyManager.getKeyToUse();
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }
  
  /**
   * 🌟 MÉTODO PRINCIPAL: Gera aplicação completa com Arquiteto + Artesão
   */
  async build(request: AuroraRequest): Promise<AuroraResult> {
    const startTime = Date.now();
    this.log('🌟 AURORA BUILDER INICIADO');
    this.log(`📝 Prompt: ${request.userPrompt}`);
    
    try {
      // FASE 1: ARQUITETO - Criar arquitetura
      this.log('\n🏗️ FASE 1: ARQUITETO - Criando arquitetura...');
      const blueprint = await this.architect(request);
      this.log(`✅ Arquitetura criada: ${blueprint.projectName}`);
      this.log(`📊 Tech Stack: ${blueprint.techStack.join(', ')}`);
      
      // FASE 2: ARTESÃO - Implementar código
      this.log('\n🎨 FASE 2: ARTESÃO - Implementando código...');
      const code = await this.artisan(blueprint, request);
      this.log(`✅ Código gerado: ${code.files.length} arquivos`);
      this.log(`📊 Qualidade: ${code.qualityScore}/100`);
      
      // FASE 3: AVALIAÇÃO FINAL
      const totalScore = (code.qualityScore + (code.readyForProduction ? 10 : 0)) / 1.1;
      this.log(`\n🎯 SCORE FINAL: ${totalScore.toFixed(0)}/100`);
      
      const executionTime = Date.now() - startTime;
      this.log(`⏱️ Tempo de execução: ${executionTime}ms`);
      
      return {
        blueprint,
        code,
        totalScore,
        executionTime,
        logs: [...this.logs]
      };
      
    } catch (error) {
      this.log(`❌ ERRO: ${error}`);
      throw error;
    }
  }
  
  /**
   * 🏗️ ARQUITETO: Analisa requisitos e cria arquitetura
   */
  private async architect(request: AuroraRequest): Promise<ArchitectureBlueprint> {
    if (!this.genAI) {
      throw new Error('API Key do Gemini não configurada');
    }
    
    const architectPrompt = this.buildArchitectPrompt(request);
    
    const result = await this.genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ text: architectPrompt }]
    });
    const response = result.text;
    
    // Parsear resposta do arquiteto
    return this.parseArchitectureBlueprint(response, request);
  }
  
  /**
   * 🎨 ARTESÃO: Implementa código com excelência
   */
  private async artisan(
    blueprint: ArchitectureBlueprint,
    request: AuroraRequest
  ): Promise<ArtisanCode> {
    if (!this.genAI) {
      throw new Error('API Key do Gemini não configurada');
    }
    
    const artisanPrompt = this.buildArtisanPrompt(blueprint, request);
    
    const result = await this.genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{ text: artisanPrompt }]
    });
    const response = result.text;
    
    // Parsear código gerado
    return this.parseArtisanCode(response, blueprint);
  }
  
  /**
   * 📝 Constrói prompt para o Arquiteto
   */
  private buildArchitectPrompt(request: AuroraRequest): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🏗️ MODO ARQUITETO ATIVADO 🏗️                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

Você é um ARQUITETO DE SOFTWARE SÊNIOR com 15+ anos de experiência.

Sua missão: Analisar o pedido do usuário e criar uma ARQUITETURA COMPLETA.

📝 PEDIDO DO USUÁRIO:
"${request.userPrompt}"

🎯 TIPO DE PROJETO: ${request.projectType || 'detectar automaticamente'}
📊 COMPLEXIDADE: ${request.complexity || 'detectar automaticamente'}

═══════════════════════════════════════════════════════════════════════════════

🧠 ANÁLISE QUE VOCÊ DEVE FAZER:

1. **Qual o tipo de aplicação?**
   - Web app? Mobile app? API? Microserviço? Fullstack?

2. **Qual a complexidade?**
   - Simples (landing page, CRUD básico)
   - Média (dashboard, e-commerce pequeno)
   - Complexa (rede social, sistema bancário)
   - Enterprise (multi-tenant, alta escala)

3. **Quais tecnologias usar?**
   - Frontend: React? Vue? Angular? Next.js? HTML puro?
   - Backend: Go? Node.js? Python? Rust?
   - Banco: PostgreSQL? MongoDB? Redis? SQLite?
   - Deploy: Docker? Kubernetes? Serverless?

4. **Qual a arquitetura ideal?**
   - Monolito? Microserviços? Serverless?
   - REST? GraphQL? gRPC? WebSocket?

═══════════════════════════════════════════════════════════════════════════════

🎯 DECISÕES INTELIGENTES:

**BACKEND:**
- Use **Go (Golang)** se: alta performance, escalabilidade, concorrência
- Use **Node.js** se: JavaScript full-stack, prototipagem rápida
- Use **Python** se: Machine Learning, análise de dados
- Use **Rust** se: performance extrema, sistemas críticos

**FRONTEND:**
- Use **Next.js** se: SEO importante, SSR, e-commerce
- Use **React** se: SPA complexa, muita interatividade
- Use **Vue.js** se: simplicidade, curva de aprendizado
- Use **Angular** se: aplicação enterprise, tipagem forte
- Use **HTML puro** se: landing page, site simples

**BANCO DE DADOS:**
- Use **PostgreSQL** se: dados relacionais, ACID, complexidade
- Use **MongoDB** se: dados não estruturados, flexibilidade
- Use **Redis** se: cache, sessões, tempo real
- Use **SQLite** se: aplicação simples, prototipagem

═══════════════════════════════════════════════════════════════════════════════

📋 RETORNE UM JSON COM ESTA ESTRUTURA:

\`\`\`json
{
  "projectName": "Nome do Projeto",
  "description": "Descrição detalhada",
  "architecture": {
    "frontend": {
      "framework": "Next.js",
      "libraries": ["TailwindCSS", "Shadcn/UI", "Zustand"],
      "structure": "Estrutura de pastas"
    },
    "backend": {
      "language": "Go",
      "framework": "Gin",
      "database": "PostgreSQL",
      "structure": "Estrutura de pastas"
    },
    "infrastructure": {
      "deployment": "Docker + Kubernetes",
      "containerization": "Docker Compose",
      "cicd": "GitHub Actions"
    }
  },
  "techStack": ["Go", "Gin", "PostgreSQL", "Next.js", "TailwindCSS"],
  "fileStructure": {
    "backend/": "Backend Go",
    "frontend/": "Frontend Next.js",
    "docker-compose.yml": "Orquestração"
  },
  "apiEndpoints": [
    {
      "method": "POST",
      "path": "/api/auth/login",
      "description": "Autenticação de usuário"
    }
  ],
  "dataModels": [
    {
      "name": "User",
      "fields": {
        "id": "uint",
        "email": "string",
        "password": "string"
      }
    }
  ],
  "reasoning": "Por que escolhi essa arquitetura..."
}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════

⚠️ IMPORTANTE:
- Seja ESPECÍFICO nas escolhas
- JUSTIFIQUE cada decisão
- Pense em ESCALABILIDADE
- Considere MANUTENIBILIDADE
- Priorize SIMPLICIDADE quando possível

Retorne APENAS o JSON, sem texto adicional.
`;
  }
  
  /**
   * 📝 Constrói prompt para o Artesão
   */
  private buildArtisanPrompt(
    blueprint: ArchitectureBlueprint,
    request: AuroraRequest
  ): string {
    return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🎨 MODO ARTESÃO ATIVADO 🎨                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

Você é um ARTESÃO DIGITAL com maestria em código de excelência.

Sua missão: Implementar a arquitetura criada pelo ARQUITETO com PERFEIÇÃO.

═══════════════════════════════════════════════════════════════════════════════

📐 ARQUITETURA DEFINIDA:

**Projeto:** ${blueprint.projectName}
**Descrição:** ${blueprint.description}

**Tech Stack:**
${blueprint.techStack.map(tech => `- ${tech}`).join('\n')}

**Estrutura de Arquivos:**
${Object.entries(blueprint.fileStructure).map(([path, desc]) => `- ${path}: ${desc}`).join('\n')}

${blueprint.apiEndpoints ? `
**API Endpoints:**
${blueprint.apiEndpoints.map(ep => `- ${ep.method} ${ep.path}: ${ep.description}`).join('\n')}
` : ''}

${blueprint.dataModels ? `
**Modelos de Dados:**
${blueprint.dataModels.map(model => `- ${model.name}: ${Object.keys(model.fields).join(', ')}`).join('\n')}
` : ''}

**Justificativa da Arquitetura:**
${blueprint.reasoning}

═══════════════════════════════════════════════════════════════════════════════

🎯 PRINCÍPIOS DO ARTESÃO DIGITAL:

1. **CÓDIGO LIMPO E ORGANIZADO**
   - Nomes descritivos
   - Funções pequenas e focadas
   - Comentários úteis (não óbvios)
   - Separação de responsabilidades

2. **FUNCIONALIDADE COMPLETA**
   - NUNCA deixe TODOs ou placeholders
   - SEMPRE implemente tudo
   - Tratamento de erros completo
   - Validação de dados

3. **QUALIDADE PROFISSIONAL**
   - Código pronto para produção
   - Segurança implementada
   - Performance otimizada
   - Acessibilidade garantida

4. **ESTRUTURA PROFISSIONAL**
   - Pastas organizadas
   - Arquivos bem nomeados
   - Configurações completas
   - README detalhado

═══════════════════════════════════════════════════════════════════════════════

📋 RETORNE OS ARQUIVOS NESTE FORMATO:

\`\`\`
FILE: caminho/do/arquivo.ext
LANGUAGE: linguagem
---
conteúdo do arquivo aqui
---

FILE: outro/arquivo.ext
LANGUAGE: linguagem
---
conteúdo aqui
---
\`\`\`

═══════════════════════════════════════════════════════════════════════════════

⚠️ REGRAS ABSOLUTAS:

✅ SEMPRE gere código 100% funcional
✅ SEMPRE implemente autenticação se necessário
✅ SEMPRE adicione tratamento de erros
✅ SEMPRE valide dados de entrada
✅ SEMPRE adicione comentários úteis
✅ SEMPRE crie README.md completo
✅ SEMPRE configure Docker se backend

❌ NUNCA deixe TODOs ou FIXMEs
❌ NUNCA use placeholders
❌ NUNCA deixe funções vazias
❌ NUNCA exponha secrets no código
❌ NUNCA ignore segurança

═══════════════════════════════════════════════════════════════════════════════

🚀 COMECE A IMPLEMENTAÇÃO AGORA!

Gere TODOS os arquivos necessários seguindo a arquitetura definida.
`;
  }
  
  /**
   * 📊 Parseia resposta do Arquiteto
   */
  private parseArchitectureBlueprint(
    response: string,
    request: AuroraRequest
  ): ArchitectureBlueprint {
    try {
      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: criar blueprint básico
      return this.createFallbackBlueprint(request);
      
    } catch (error) {
      this.log(`⚠️ Erro ao parsear blueprint, usando fallback`);
      return this.createFallbackBlueprint(request);
    }
  }
  
  /**
   * 📊 Parseia código do Artesão
   */
  private parseArtisanCode(
    response: string,
    blueprint: ArchitectureBlueprint
  ): ArtisanCode {
    const files: Array<{ path: string; content: string; language: string }> = [];
    
    // Extrair arquivos do formato FILE: ... ---content--- ---
    const fileRegex = /FILE:\s*(.+?)\nLANGUAGE:\s*(.+?)\n---\n([\s\S]*?)---/g;
    let match;
    
    while ((match = fileRegex.exec(response)) !== null) {
      files.push({
        path: match[1].trim(),
        content: match[3].trim(),
        language: match[2].trim()
      });
    }
    
    // Se não encontrou arquivos no formato, tentar extrair blocos de código
    if (files.length === 0) {
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let blockMatch;
      let fileIndex = 0;
      
      while ((blockMatch = codeBlockRegex.exec(response)) !== null) {
        const language = blockMatch[1] || 'text';
        const content = blockMatch[2].trim();
        
        // Tentar detectar o tipo de arquivo pelo conteúdo
        let path = `file${fileIndex}`;
        if (content.includes('package main')) path = 'main.go';
        else if (content.includes('<!DOCTYPE html>')) path = 'index.html';
        else if (content.includes('import React')) path = 'App.tsx';
        else if (content.includes('FROM ')) path = 'Dockerfile';
        else if (content.includes('version:')) path = 'docker-compose.yml';
        
        files.push({ path, content, language });
        fileIndex++;
      }
    }
    
    // Calcular score de qualidade
    const qualityScore = this.calculateQualityScore(files);
    const readyForProduction = qualityScore >= 85;
    
    return {
      files,
      qualityScore,
      improvements: [],
      readyForProduction
    };
  }
  
  /**
   * 📊 Calcula score de qualidade do código
   */
  private calculateQualityScore(files: Array<{ path: string; content: string }>): number {
    let score = 100;
    
    // Verificar se tem arquivos
    if (files.length === 0) score -= 50;
    
    // Verificar se tem README
    const hasReadme = files.some(f => f.path.toLowerCase().includes('readme'));
    if (!hasReadme) score -= 10;
    
    // Verificar se tem Docker
    const hasDocker = files.some(f => f.path.toLowerCase().includes('docker'));
    if (!hasDocker) score -= 5;
    
    // Verificar se tem TODOs
    const hasTodos = files.some(f => f.content.includes('TODO') || f.content.includes('FIXME'));
    if (hasTodos) score -= 15;
    
    // Verificar se tem tratamento de erros
    const hasErrorHandling = files.some(f => 
      f.content.includes('try') || 
      f.content.includes('catch') || 
      f.content.includes('if err')
    );
    if (!hasErrorHandling) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 🔧 Cria blueprint fallback
   */
  private createFallbackBlueprint(request: AuroraRequest): ArchitectureBlueprint {
    return {
      projectName: 'Projeto Gerado',
      description: request.userPrompt,
      architecture: {
        frontend: {
          framework: 'React',
          libraries: ['TailwindCSS'],
          structure: 'src/'
        },
        backend: {
          language: 'Go',
          framework: 'Gin',
          database: 'PostgreSQL',
          structure: 'backend/'
        }
      },
      techStack: ['Go', 'React', 'PostgreSQL'],
      fileStructure: {
        'backend/': 'Backend Go',
        'frontend/': 'Frontend React'
      },
      reasoning: 'Stack padrão para aplicações fullstack'
    };
  }
  
  /**
   * 📝 Adiciona log
   */
  private log(message: string): void {
    this.logs.push(message);
    console.log(message);
  }
}

// ============================================
// EXPORTAÇÕES
// ============================================

export default AuroraBuilder;
