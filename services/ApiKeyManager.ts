// services/ApiKeyManager.ts
// Sistema inteligente de gerenciamento de API Keys

import { GoogleGenAI } from "@google/genai";

export class ApiKeyManager {
  // Pool de chaves do sistema (suas chaves)
  private static readonly SYSTEM_KEYS: string[] = [
    // Adicione suas chaves aqui
    import.meta.env.VITE_GEMINI_API_KEY || '', // Chave principal do .env
    // 'AIzaSyA...', // Sua chave 2
    // 'AIzaSyB...', // Sua chave 3
  ].filter(key => key.length > 0);

  // Limite de gerações gratuitas
  private static readonly FREE_LIMIT = 3;

  // Chave do usuário atual
  static getUserKey(): string | null {
    return localStorage.getItem('user_api_key');
  }

  // Salvar chave do usuário
  static setUserKey(key: string): void {
    console.log('🔑 Salvando chave do usuário...');
    localStorage.setItem('user_api_key', key);
    // Resetar contador quando usuário adiciona sua própria chave
    localStorage.setItem('usage_count', '0');
    console.log('✅ Chave salva com sucesso!');
  }

  // Verificar se usuário tem chave própria
  static hasUserKey(): boolean {
    const key = this.getUserKey();
    return key !== null && key.length > 0;
  }

  // Obter chaves contribuídas por outros usuários
  static getContributedKeys(): string[] {
    const keys = localStorage.getItem('contributed_keys');
    return keys ? JSON.parse(keys) : [];
  }

  // Adicionar chave contribuída ao pool
  static addContributedKey(key: string): void {
    console.log('🌟 Adicionando chave ao pool para ajudar outros usuários...');
    const contributedKeys = this.getContributedKeys();
    if (!contributedKeys.includes(key)) {
      contributedKeys.push(key);
      localStorage.setItem('contributed_keys', JSON.stringify(contributedKeys));
      console.log('✅ Chave adicionada ao pool!');
    }
  }

  // Obter todas as chaves disponíveis (sistema + contribuídas)
  static getAllAvailableKeys(): string[] {
    return [
      ...this.SYSTEM_KEYS,
      ...this.getContributedKeys()
    ].filter(key => key.length > 0);
  }

  // Obter chave aleatória do pool
  static getRandomPoolKey(): string | null {
    const availableKeys = this.getAllAvailableKeys();
    if (availableKeys.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    return availableKeys[randomIndex];
  }

  // Obter chave para usar (prioridade: usuário > pool)
  static getKeyToUse(): string | null {
    // Se usuário tem chave própria, usar ela
    if (this.hasUserKey()) {
      return this.getUserKey();
    }
    
    // Senão, usar chave do pool
    return this.getRandomPoolKey();
  }

  // Contador de uso (para usuários sem chave)
  static getUsageCount(): number {
    return parseInt(localStorage.getItem('usage_count') || '0');
  }

  static incrementUsage(): void {
    const current = this.getUsageCount();
    localStorage.setItem('usage_count', (current + 1).toString());
  }

  static hasReachedLimit(): boolean {
    // Se usuário tem chave própria, sem limite
    if (this.hasUserKey()) return false;
    
    // Senão, verificar limite de 3 gerações
    return this.getUsageCount() >= this.FREE_LIMIT;
  }

  static getRemainingUses(): number {
    if (this.hasUserKey()) return Infinity;
    return Math.max(0, this.FREE_LIMIT - this.getUsageCount());
  }

  // Validar se uma chave é válida
  static async validateKey(key: string): Promise<boolean> {
    console.log('🔍 Validando chave API...');
    
    // Validação básica do formato
    if (!key || !key.startsWith('AIza') || key.length < 30) {
      console.log('❌ Formato de chave inválido');
      return false;
    }

    try {
      console.log('📡 Testando chave com Google AI...');
      const ai = new GoogleGenAI({ apiKey: key });
      
      // Usar a nova API do GoogleGenAI
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [{ text: "Hello" }] }
      });
      
      console.log('✅ Resposta recebida:', response ? 'OK' : 'Vazia');
      
      // Se chegou até aqui e tem resposta, a chave é válida
      return response && response.text !== undefined;
    } catch (error: any) {
      console.error('❌ Erro na validação:', error.message);
      
      // Se o erro for de quota ou rate limit, ainda é uma chave válida
      if (error.message?.includes('quota') || error.message?.includes('rate')) {
        console.log('⚠️ Chave válida mas com limite atingido');
        return true;
      }
      
      return false;
    }
  }

  // Remover chave do usuário
  static removeUserKey(): void {
    localStorage.removeItem('user_api_key');
    localStorage.setItem('usage_count', '0');
  }

  // Verificar se pode fazer geração
  static canGenerate(): { allowed: boolean; reason?: string; remaining?: number } {
    if (this.hasUserKey()) {
      return { allowed: true };
    }

    if (this.hasReachedLimit()) {
      return { 
        allowed: false, 
        reason: 'Limite de 3 gerações gratuitas atingido. Adicione sua API Key para continuar.',
        remaining: 0
      };
    }

    return { 
      allowed: true, 
      remaining: this.getRemainingUses() 
    };
  }

  // Estatísticas do sistema
  static getStats() {
    return {
      hasUserKey: this.hasUserKey(),
      usageCount: this.getUsageCount(),
      remainingUses: this.getRemainingUses(),
      totalPoolKeys: this.getAllAvailableKeys().length,
      systemKeys: this.SYSTEM_KEYS.length,
      contributedKeys: this.getContributedKeys().length
    };
  }
}