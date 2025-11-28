/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║              🛡️ VALIDADORES - SEGURANÇA E INTEGRIDADE 🛡️                    ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

/**
 * Schema de validação para requisição de geração
 */
export const GenerateRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt não pode estar vazio')
    .max(1000000, 'Prompt muito longo (máximo: 1MB)'),
  
  modelName: z.string()
    .optional()
    .default('gemini-2.5-flash'),
  
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({
      text: z.string()
    }))
  }))
    .optional()
    .default([]),
  
  temperature: z.number()
    .min(0)
    .max(2)
    .optional()
    .default(0.7),
  
  maxOutputTokens: z.number()
    .min(1)
    .max(8192)
    .optional()
    .default(8192),
  
  topP: z.number()
    .min(0)
    .max(1)
    .optional()
    .default(0.95),
  
  topK: z.number()
    .min(1)
    .max(100)
    .optional()
    .default(40),
  
  stream: z.boolean()
    .optional()
    .default(false)
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Schema de validação para análise de contexto
 */
export const AnalyzeContextRequestSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt não pode estar vazio')
    .max(100000, 'Prompt muito longo para análise')
});

export type AnalyzeContextRequest = z.infer<typeof AnalyzeContextRequestSchema>;

/**
 * Valida e sanitiza o prompt
 */
export function sanitizePrompt(prompt: string): string {
  // Remove caracteres de controle perigosos
  let sanitized = prompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limita espaços em branco consecutivos
  sanitized = sanitized.replace(/\s{10,}/g, ' '.repeat(10));
  
  // Trim
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Valida se o modelo é suportado
 */
export function isValidModel(modelName: string): boolean {
  const supportedModels = [
    // Modelos mais recentes (2025)
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
    // Modelos anteriores (compatibilidade)
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  
  return supportedModels.includes(modelName);
}
