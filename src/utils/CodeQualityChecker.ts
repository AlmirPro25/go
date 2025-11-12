/**
 * CodeQualityChecker.ts
 * 
 * Sistema avançado para verificar a qualidade e completude do código gerado.
 * Trabalha em conjunto com o SimulationDetector e AntiSimulationSystem para
 * garantir que o código gerado seja de alta qualidade, completo e pronto para produção.
 */

import { simulationDetector } from './SimulationDetector';

export interface CodeQualityMetric {
  name: string;
  description: string;
  weight: number; // Peso da métrica na pontuação final (0-10)
  check: (code: string, filePath: string) => {
    passed: boolean;
    score: number; // 0-100
    details: string;
  };
}

export interface CodeQualityReport {
  overallScore: number; // 0-100
  metrics: {
    name: string;
    passed: boolean;
    score: number;
    details: string;
  }[];
  recommendations: string[];
  isProductionReady: boolean;
}

export class CodeQualityChecker {
  private metrics: CodeQualityMetric[] = [
    // Verificação de simulação
    {
      name: 'Ausência de Simulação',
      description: 'Verifica se o código não contém simulações ou placeholders',
      weight: 10,
      check: (code, filePath) => {
        const result = simulationDetector.detectSimulations(code, filePath);
        return {
          passed: result.score >= 90,
          score: result.score,
          details: result.detected 
            ? `Detectadas ${result.matches.length} simulações. Pontuação: ${result.score}/100` 
            : 'Nenhuma simulação detectada'
        };
      }
    },
    
    // Verificação de integração de API
    {
      name: 'Integração de APIs',
      description: 'Verifica se o código contém integrações reais com APIs',
      weight: 8,
      check: (code, filePath) => {
        const hasRealApiIntegrations = simulationDetector.hasRealApiIntegrations(code);
        return {
          passed: hasRealApiIntegrations,
          score: hasRealApiIntegrations ? 100 : 0,
          details: hasRealApiIntegrations 
            ? 'Integrações reais de API detectadas' 
            : 'Nenhuma integração real de API detectada'
        };
      }
    },
    
    // Verificação de implementação de segurança
    {
      name: 'Implementação de Segurança',
      description: 'Verifica se o código contém implementações reais de segurança',
      weight: 9,
      check: (code, filePath) => {
        const hasRealSecurityImplementations = simulationDetector.hasRealSecurityImplementations(code);
        return {
          passed: hasRealSecurityImplementations,
          score: hasRealSecurityImplementations ? 100 : 0,
          details: hasRealSecurityImplementations 
            ? 'Implementações reais de segurança detectadas' 
            : 'Nenhuma implementação real de segurança detectada'
        };
      }
    },
    
    // Verificação de tratamento de erros
    {
      name: 'Tratamento de Erros',
      description: 'Verifica se o código contém tratamento adequado de erros',
      weight: 7,
      check: (code, filePath) => {
        // Padrões para detectar tratamento de erros
        const errorHandlingPatterns = [
          /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/gs, // try-catch blocks
          /\.catch\s*\([^)]*\)\s*\{[^}]*\}/gs, // Promise.catch
          /if\s*\([^)]*error[^)]*\)\s*\{[^}]*\}/gs, // if error condition
          /throw\s+new\s+\w+Error\([^)]*\)/gs, // throw new Error
          /next\s*\(\s*error\s*\)/gs, // Express error handling
          /res\.status\s*\(\s*\d{3}\s*\)\.\w+\s*\([^)]*\)/gs // HTTP error responses
        ];
        
        const matches = errorHandlingPatterns.flatMap(pattern => {
          const matches = code.match(pattern) || [];
          return matches;
        });
        
        const score = Math.min(100, matches.length * 20); // 5 ou mais padrões = 100%
        
        return {
          passed: score >= 60,
          score,
          details: matches.length > 0 
            ? `Detectados ${matches.length} padrões de tratamento de erros` 
            : 'Tratamento de erros insuficiente ou ausente'
        };
      }
    },
    
    // Verificação de validação de dados
    {
      name: 'Validação de Dados',
      description: 'Verifica se o código contém validação adequada de dados de entrada',
      weight: 7,
      check: (code, filePath) => {
        // Padrões para detectar validação de dados
        const validationPatterns = [
          /validate\([^)]*\)/g,
          /validation\.[^(]*\([^)]*\)/g,
          /\w+\.isEmail\(\)/g,
          /\w+\.isLength\(\{[^}]*\}\)/g,
          /joi\.[^(]*\([^)]*\)/g,
          /yup\.[^(]*\([^)]*\)/g,
          /zod\.[^(]*\([^)]*\)/g,
          /if\s*\([^)]*\!\w+[^)]*\)\s*\{[^}]*return[^}]*\}/gs, // Verificações de nulidade
          /\w+\s*instanceof\s*\w+/g,
          /typeof\s+\w+\s*===\s*['"]\w+['"]\s*/g
        ];
        
        const matches = validationPatterns.flatMap(pattern => {
          const matches = code.match(pattern) || [];
          return matches;
        });
        
        const score = Math.min(100, matches.length * 20); // 5 ou mais padrões = 100%
        
        return {
          passed: score >= 60,
          score,
          details: matches.length > 0 
            ? `Detectados ${matches.length} padrões de validação de dados` 
            : 'Validação de dados insuficiente ou ausente'
        };
      }
    },
    
    // Verificação de documentação
    {
      name: 'Documentação',
      description: 'Verifica se o código contém documentação adequada',
      weight: 5,
      check: (code, filePath) => {
        // Padrões para detectar documentação
        const docPatterns = [
          /\/\*\*[\s\S]*?\*\//g, // JSDoc comments
          /\/\/\s*[A-Z].*\n/g, // Single line comments starting with capital letter
          /\/\/\s*@\w+/g, // Annotation comments
          /\/\*[\s\S]*?\*\//g // Multi-line comments
        ];
        
        const matches = docPatterns.flatMap(pattern => {
          const matches = code.match(pattern) || [];
          return matches;
        });
        
        // Calcula a proporção de linhas de código vs. documentação
        const codeLines = code.split('\n').length;
        const docLines = matches.join('').split('\n').length;
        const docRatio = docLines / codeLines;
        
        // Ideal: 15-30% do código é documentação
        const score = docRatio < 0.05 ? 30 : // Muito pouca documentação
                     docRatio < 0.15 ? 70 : // Documentação abaixo do ideal
                     docRatio < 0.3 ? 100 : // Documentação ideal
                     docRatio < 0.5 ? 80 : // Documentação acima do ideal
                     50; // Excesso de documentação
        
        return {
          passed: score >= 70,
          score,
          details: `Proporção de documentação: ${(docRatio * 100).toFixed(1)}% (${docLines}/${codeLines} linhas)`
        };
      }
    },
    
    // Verificação de complexidade
    {
      name: 'Complexidade',
      description: 'Verifica a complexidade ciclomática do código',
      weight: 6,
      check: (code, filePath) => {
        // Contagem simplificada de estruturas de controle como proxy para complexidade ciclomática
        const controlStructures = [
          /if\s*\([^)]*\)/g,
          /else\s*\{/g,
          /for\s*\([^)]*\)/g,
          /while\s*\([^)]*\)/g,
          /switch\s*\([^)]*\)/g,
          /case\s+[^:]*:/g,
          /\?/g, // Operador ternário
          /\|\|/g, // OR lógico
          /&&/g // AND lógico
        ];
        
        const matches = controlStructures.flatMap(pattern => {
          const matches = code.match(pattern) || [];
          return matches;
        });
        
        // Estima a complexidade com base no número de estruturas de controle por linha de código
        const codeLines = code.split('\n').length;
        const complexityDensity = matches.length / codeLines;
        
        // Ideal: 0.05-0.15 estruturas de controle por linha
        const score = complexityDensity < 0.05 ? 90 : // Código muito simples
                     complexityDensity < 0.15 ? 100 : // Complexidade ideal
                     complexityDensity < 0.25 ? 70 : // Complexidade moderada
                     complexityDensity < 0.35 ? 50 : // Alta complexidade
                     30; // Complexidade excessiva
        
        return {
          passed: score >= 70,
          score,
          details: `Densidade de complexidade: ${complexityDensity.toFixed(2)} estruturas/linha (${matches.length} em ${codeLines} linhas)`
        };
      }
    },
    
    // Verificação de configuração automática
    {
      name: 'Configuração Automática',
      description: 'Verifica se o código inclui configuração automática via variáveis de ambiente',
      weight: 6,
      check: (code, filePath) => {
        // Padrões para detectar uso de variáveis de ambiente e configuração automática
        const envPatterns = [
          /process\.env\.\w+/g,
          /dotenv\.config\(\)/g,
          /config\(\)/g,
          /new\s+\w+Config\([^)]*\)/g,
          /\w+\.config\([^)]*\)/g,
          /import\s+.*?config.*?from/g,
          /require\(['"].*?config.*?['"]\)/g
        ];
        
        const matches = envPatterns.flatMap(pattern => {
          const matches = code.match(pattern) || [];
          return matches;
        });
        
        // Verifica se há uso de variáveis de ambiente com fallbacks
        const envWithFallback = (code.match(/process\.env\.\w+\s*\|\|\s*['"][^'"]*['"]\s*/g) || []).length;
        
        // Calcula pontuação com base no número de padrões encontrados e uso de fallbacks
        const score = Math.min(100, matches.length * 15 + envWithFallback * 10);
        
        return {
          passed: score >= 60,
          score,
          details: matches.length > 0 
            ? `Detectados ${matches.length} padrões de configuração via variáveis de ambiente (${envWithFallback} com fallbacks)` 
            : 'Configuração automática insuficiente ou ausente'
        };
      }
    },
    
    // Verificação de código pronto para produção
    {
      name: 'Prontidão para Produção',
      description: 'Verifica se o código está pronto para ambiente de produção',
      weight: 8,
      check: (code, filePath) => {
        // Padrões para detectar código pronto para produção
        const prodReadyPatterns = [
          /NODE_ENV\s*===\s*['"]production['"]\s*/g, // Verificação de ambiente
          /process\.env\.NODE_ENV\s*===\s*['"]production['"]\s*/g,
          /helmet\(\)/g, // Segurança
          /cors\(\{[^}]*\}\)/g, // CORS configurado
          /rateLimit\(\{[^}]*\}\)/g, // Rate limiting
          /compression\(\)/g, // Compressão
          /morgan\(['"]\w+['"]\)/g, // Logging
          /\.env\.example/g, // Exemplo de variáveis de ambiente
          /Dockerfile/g, // Docker
          /docker-compose/g,
          /\.dockerignore/g,
          /\.gitignore/g,
          /\.eslintrc/g, // Linting
          /\.prettierrc/g, // Formatação
          /jest\.config/g, // Testes
          /test\(['"][^'"]*['"]\s*,\s*\(?\s*\)?\s*=>\s*\{/g, // Testes
          /describe\(['"][^'"]*['"]\s*,\s*\(?\s*\)?\s*=>\s*\{/g, // Testes
          /it\(['"][^'"]*['"]\s*,\s*\(?\s*\)?\s*=>\s*\{/g // Testes
        ];
        
        const matches = prodReadyPatterns.flatMap(pattern => {
          const matches = code.match(pattern) || [];
          return matches;
        });
        
        const score = Math.min(100, matches.length * 10);
        
        return {
          passed: score >= 60,
          score,
          details: matches.length > 0 
            ? `Detectados ${matches.length} padrões de código pronto para produção` 
            : 'Código não está adequadamente preparado para produção'
        };
      }
    }
  ];

  /**
   * Verifica a qualidade do código e gera um relatório detalhado
   */
  public checkCodeQuality(code: string, filePath: string = 'unknown'): CodeQualityReport {
    const metricResults = this.metrics.map(metric => {
      const result = metric.check(code, filePath);
      return {
        name: metric.name,
        passed: result.passed,
        score: result.score,
        details: result.details
      };
    });

    // Calcula a pontuação geral ponderada
    const totalWeight = this.metrics.reduce((sum, metric) => sum + metric.weight, 0);
    const weightedScore = metricResults.reduce((sum, result, index) => {
      return sum + (result.score * this.metrics[index].weight);
    }, 0) / totalWeight;

    // Determina se o código está pronto para produção
    const isProductionReady = weightedScore >= 80 && 
                             metricResults.filter(r => !r.passed).length <= 1; // No máximo uma métrica pode falhar

    // Gera recomendações com base nas métricas que falharam
    const recommendations = this.generateRecommendations(metricResults);

    return {
      overallScore: Math.round(weightedScore),
      metrics: metricResults,
      recommendations,
      isProductionReady
    };
  }

  /**
   * Gera recomendações específicas com base nas métricas que falharam
   */
  private generateRecommendations(metricResults: CodeQualityReport['metrics']): string[] {
    const recommendations: string[] = [];

    // Recomendações para cada métrica que falhou
    metricResults.forEach(result => {
      if (!result.passed) {
        switch (result.name) {
          case 'Ausência de Simulação':
            recommendations.push('Elimine todas as simulações e placeholders no código, substituindo-os por implementações reais.');
            break;
          case 'Integração de APIs':
            recommendations.push('Implemente integrações reais com APIs externas usando bibliotecas apropriadas e variáveis de ambiente para configuração.');
            break;
          case 'Implementação de Segurança':
            recommendations.push('Adicione medidas de segurança como autenticação JWT, validação de entrada, proteção contra XSS e CSRF, e use bibliotecas como helmet e cors.');
            break;
          case 'Tratamento de Erros':
            recommendations.push('Implemente tratamento de erros abrangente usando try-catch, Promise.catch() e middleware de erro para Express.');
            break;
          case 'Validação de Dados':
            recommendations.push('Adicione validação de dados de entrada usando bibliotecas como Joi, Yup ou Zod, e implemente verificações de tipo e formato.');
            break;
          case 'Documentação':
            recommendations.push('Melhore a documentação do código adicionando comentários JSDoc para funções, classes e módulos importantes.');
            break;
          case 'Complexidade':
            recommendations.push('Reduza a complexidade do código refatorando funções longas em funções menores e mais específicas, e simplifique estruturas de controle aninhadas.');
            break;
          case 'Configuração Automática':
            recommendations.push('Implemente configuração automática usando variáveis de ambiente com valores padrão sensatos e documentação clara.');
            break;
          case 'Prontidão para Produção':
            recommendations.push('Prepare o código para produção adicionando configurações específicas para ambiente de produção, logging, monitoramento e otimizações de desempenho.');
            break;
        }
      }
    });

    // Recomendações gerais se a pontuação for baixa
    const overallScore = metricResults.reduce((sum, result) => sum + result.score, 0) / metricResults.length;
    if (overallScore < 60) {
      recommendations.unshift('O código precisa de melhorias significativas antes de estar pronto para produção. Foque nas áreas críticas identificadas abaixo.');
    } else if (overallScore < 80) {
      recommendations.unshift('O código está quase pronto para produção, mas precisa de algumas melhorias nas áreas identificadas abaixo.');
    }

    return recommendations;
  }

  /**
   * Verifica se o código está pronto para produção
   */
  public isProductionReady(code: string, filePath: string = 'unknown'): boolean {
    const report = this.checkCodeQuality(code, filePath);
    return report.isProductionReady;
  }
}

// Exporta uma instância singleton para uso em toda a aplicação
export const codeQualityChecker = new CodeQualityChecker();