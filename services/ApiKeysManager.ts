// services/ApiKeysManager.ts
// Sistema de Gerenciamento de API Keys Pré-configuradas
// Funciona como um "System Prompt de APIs" - conhecimento permanente de APIs disponíveis

/**
 * ======================================================
 * SISTEMA DE API KEYS PRÉ-CONFIGURADAS
 * ======================================================
 * 
 * Este sistema mantém um catálogo de APIs disponíveis e suas chaves,
 * permitindo que aplicativos gerados automaticamente usem essas APIs
 * sem precisar de configuração manual.
 * 
 * FUNCIONALIDADES:
 * 1. Armazenar chaves de API de forma segura
 * 2. Fornecer chaves para aplicativos gerados
 * 3. Validar e testar chaves
 * 4. Gerenciar múltiplas APIs (Gemini, OpenAI, etc)
 */

export interface ApiKeyConfig {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic' | 'custom';
  key: string;
  description: string;
  endpoint?: string;
  model?: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface ApiCatalog {
  google: {
    gemini: {
      name: 'Google Gemini';
      models: string[];
      endpoint: string;
      documentation: string;
      example: string;
    };
  };
  openai: {
    gpt: {
      name: 'OpenAI GPT';
      models: string[];
      endpoint: string;
      documentation: string;
      example: string;
    };
  };
  anthropic: {
    claude: {
      name: 'Anthropic Claude';
      models: string[];
      endpoint: string;
      documentation: string;
      example: string;
    };
  };
}

export class ApiKeysManager {
  private static STORAGE_KEY = 'ai_web_weaver_api_keys';
  
  /**
   * CATÁLOGO DE APIs DISPONÍVEIS
   * Este é o "conhecimento permanente" do sistema sobre APIs de IA
   */
  private static API_CATALOG: ApiCatalog = {
    google: {
      gemini: {
        name: 'Google Gemini',
        models: [
          'gemini-2.5-pro',
          'gemini-2.5-flash',
          'gemini-2.5-flash-lite'
        ],
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        documentation: 'https://ai.google.dev/docs',
        example: `
// Exemplo de uso do Gemini em um app gerado
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "SUA_CHAVE_AQUI" });
const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

async function gerarResposta(prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}
        `
      }
    },
    openai: {
      gpt: {
        name: 'OpenAI GPT',
        models: [
          'gpt-4-turbo',
          'gpt-4',
          'gpt-3.5-turbo'
        ],
        endpoint: 'https://api.openai.com/v1',
        documentation: 'https://platform.openai.com/docs',
        example: `
// Exemplo de uso do OpenAI em um app gerado
async function gerarResposta(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SUA_CHAVE_AQUI'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
        `
      }
    },
    anthropic: {
      claude: {
        name: 'Anthropic Claude',
        models: [
          'claude-3-opus',
          'claude-3-sonnet',
          'claude-3-haiku'
        ],
        endpoint: 'https://api.anthropic.com/v1',
        documentation: 'https://docs.anthropic.com',
        example: `
// Exemplo de uso do Claude em um app gerado
async function gerarResposta(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'SUA_CHAVE_AQUI',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}
        `
      }
    }
  };

  /**
   * Obter todas as chaves de API armazenadas
   */
  static getAllKeys(): ApiKeyConfig[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erro ao carregar API keys:', error);
      return [];
    }
  }

  /**
   * Adicionar ou atualizar uma chave de API
   */
  static saveKey(config: Omit<ApiKeyConfig, 'id' | 'createdAt' | 'usageCount'>): ApiKeyConfig {
    const keys = this.getAllKeys();
    
    // Verificar se já existe uma chave para este provider
    const existingIndex = keys.findIndex(k => k.provider === config.provider);
    
    const newKey: ApiKeyConfig = {
      id: existingIndex >= 0 ? keys[existingIndex].id : `api_${Date.now()}`,
      ...config,
      createdAt: existingIndex >= 0 ? keys[existingIndex].createdAt : new Date(),
      usageCount: existingIndex >= 0 ? keys[existingIndex].usageCount : 0
    };

    if (existingIndex >= 0) {
      keys[existingIndex] = newKey;
    } else {
      keys.push(newKey);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    return newKey;
  }

  /**
   * Obter chave de API por provider
   */
  static getKeyByProvider(provider: ApiKeyConfig['provider']): ApiKeyConfig | null {
    const keys = this.getAllKeys();
    return keys.find(k => k.provider === provider && k.isActive) || null;
  }

  /**
   * Obter chave de API ativa (primeira disponível)
   */
  static getActiveKey(): ApiKeyConfig | null {
    const keys = this.getAllKeys();
    return keys.find(k => k.isActive) || null;
  }

  /**
   * Registrar uso de uma chave
   */
  static recordUsage(keyId: string): void {
    const keys = this.getAllKeys();
    const key = keys.find(k => k.id === keyId);
    
    if (key) {
      key.usageCount++;
      key.lastUsed = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    }
  }

  /**
   * Remover uma chave de API
   */
  static removeKey(keyId: string): void {
    const keys = this.getAllKeys();
    const filtered = keys.filter(k => k.id !== keyId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Ativar/Desativar uma chave
   */
  static toggleKey(keyId: string, isActive: boolean): void {
    const keys = this.getAllKeys();
    const key = keys.find(k => k.id === keyId);
    
    if (key) {
      key.isActive = isActive;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keys));
    }
  }

  /**
   * Obter catálogo de APIs disponíveis
   */
  static getApiCatalog(): ApiCatalog {
    return this.API_CATALOG;
  }

  /**
   * Gerar código de integração para um app
   * Esta função é usada quando o sistema gera um app que precisa de IA
   */
  static generateIntegrationCode(provider: ApiKeyConfig['provider'], useStoredKey: boolean = true): string {
    const key = useStoredKey ? this.getKeyByProvider(provider) : null;
    const apiKey = key?.key || 'SUA_CHAVE_API_AQUI';

    switch (provider) {
      case 'google':
        return `
// ============================================
// INTEGRAÇÃO GOOGLE GEMINI
// ============================================
// Esta integração foi gerada automaticamente pelo AI Web Weaver
// API Key: ${useStoredKey && key ? '✅ Configurada' : '⚠️ Não configurada'}

class GeminiAI {
  constructor(apiKey) {
    this.apiKey = apiKey || '${apiKey}';
    this.endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  async gerarResposta(prompt) {
    try {
      const response = await fetch(\`\${this.endpoint}?key=\${this.apiKey}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API: ' + response.statusText);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      throw error;
    }
  }

  async gerarRespostaStream(prompt, onChunk) {
    try {
      const response = await fetch(\`\${this.endpoint}?key=\${this.apiKey}&alt=sse\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates[0].content.parts[0].text;
            onChunk(text);
          }
        }
      }
    } catch (error) {
      console.error('Erro no streaming:', error);
      throw error;
    }
  }
}

// Instância global da IA
const ai = new GeminiAI('${apiKey}');

// Exemplo de uso:
// const resposta = await ai.gerarResposta('Olá, como você está?');
// console.log(resposta);
`;

      case 'openai':
        return `
// ============================================
// INTEGRAÇÃO OPENAI GPT
// ============================================
// Esta integração foi gerada automaticamente pelo AI Web Weaver
// API Key: ${useStoredKey && key ? '✅ Configurada' : '⚠️ Não configurada'}

class OpenAI {
  constructor(apiKey) {
    this.apiKey = apiKey || '${apiKey}';
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
  }

  async gerarResposta(prompt, model = 'gpt-4-turbo') {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiKey}\`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API: ' + response.statusText);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      throw error;
    }
  }

  async gerarRespostaStream(prompt, onChunk, model = 'gpt-4-turbo') {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiKey}\`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          stream: true
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const data = JSON.parse(line.slice(6));
            const text = data.choices[0]?.delta?.content || '';
            if (text) onChunk(text);
          }
        }
      }
    } catch (error) {
      console.error('Erro no streaming:', error);
      throw error;
    }
  }
}

// Instância global da IA
const ai = new OpenAI('${apiKey}');

// Exemplo de uso:
// const resposta = await ai.gerarResposta('Olá, como você está?');
// console.log(resposta);
`;

      case 'anthropic':
        return `
// ============================================
// INTEGRAÇÃO ANTHROPIC CLAUDE
// ============================================
// Esta integração foi gerada automaticamente pelo AI Web Weaver
// API Key: ${useStoredKey && key ? '✅ Configurada' : '⚠️ Não configurada'}

class ClaudeAI {
  constructor(apiKey) {
    this.apiKey = apiKey || '${apiKey}';
    this.endpoint = 'https://api.anthropic.com/v1/messages';
  }

  async gerarResposta(prompt, model = 'claude-3-sonnet-20240229') {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error('Erro na API: ' + response.statusText);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      throw error;
    }
  }
}

// Instância global da IA
const ai = new ClaudeAI('${apiKey}');

// Exemplo de uso:
// const resposta = await ai.gerarResposta('Olá, como você está?');
// console.log(resposta);
`;

      default:
        return '// Provider não suportado';
    }
  }

  /**
   * Validar uma chave de API
   */
  static async validateKey(provider: ApiKeyConfig['provider'], apiKey: string): Promise<boolean> {
    try {
      switch (provider) {
        case 'google':
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'test' }] }]
              })
            }
          );
          return geminiResponse.ok;

        case 'openai':
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          return openaiResponse.ok;

        case 'anthropic':
          const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              max_tokens: 10,
              messages: [{ role: 'user', content: 'test' }]
            })
          });
          return claudeResponse.ok;

        default:
          return false;
      }
    } catch (error) {
      console.error('Erro ao validar chave:', error);
      return false;
    }
  }
}

// Instância singleton
export const apiKeysManager = ApiKeysManager;
