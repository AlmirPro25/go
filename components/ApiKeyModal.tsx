// components/ApiKeyModal.tsx
// Modal para configuração de API Key com tutorial

import React, { useState, useEffect } from 'react';
import { ApiKeyManager } from '../services/ApiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyAdded: () => void;
  showLimitReached?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onClose, 
  onKeyAdded,
  showLimitReached = false 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState(ApiKeyManager.getStats());

  useEffect(() => {
    if (isOpen) {
      setStats(ApiKeyManager.getStats());
      setApiKey(ApiKeyManager.getUserKey() || '');
    }
  }, [isOpen]);

  const handleSave = async () => {
    console.log('🔄 Iniciando salvamento da API Key...');
    
    if (!apiKey.trim()) {
      console.log('❌ Chave vazia');
      setValidationError('Por favor, insira uma chave API válida');
      return;
    }

    console.log('🔍 Validando chave:', apiKey.substring(0, 10) + '...');
    setIsValidating(true);
    setValidationError('');

    try {
      // TESTE: Pular validação temporariamente para debug
      let isValid = false;
      
      if (apiKey.startsWith('AIza') && apiKey.length > 30) {
        console.log('✅ Formato válido, pulando validação online para teste');
        isValid = true;
      } else {
        console.log('🔍 Fazendo validação completa...');
        isValid = await ApiKeyManager.validateKey(apiKey);
      }
      
      console.log('✅ Resultado da validação:', isValid);
      
      if (isValid) {
        console.log('💾 Salvando chave válida...');
        ApiKeyManager.setUserKey(apiKey);
        // Também adicionar ao pool para ajudar outros usuários
        ApiKeyManager.addContributedKey(apiKey);
        console.log('🎉 Chave salva com sucesso!');
        onKeyAdded();
        onClose();
      } else {
        console.log('❌ Chave inválida');
        setValidationError('Chave API inválida. Verifique se está correta.');
      }
    } catch (error) {
      console.error('💥 Erro ao validar chave:', error);
      setValidationError('Erro ao validar chave. Tente novamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveKey = () => {
    ApiKeyManager.removeUserKey();
    setApiKey('');
    setStats(ApiKeyManager.getStats());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              🔑 Configurar API Key do Gemini
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          {showLimitReached && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-800 font-semibold">
                  Limite de 3 gerações gratuitas atingido!
                </span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Adicione sua API Key do Google Gemini para continuar usando o sistema sem limitações.
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status atual */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Status Atual:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sua chave:</span>
                <span className={`ml-2 font-semibold ${stats.hasUserKey ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.hasUserKey ? '✅ Configurada' : '❌ Não configurada'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Gerações restantes:</span>
                <span className="ml-2 font-semibold text-blue-600">
                  {stats.hasUserKey ? '∞ Ilimitadas' : `${stats.remainingUses} de 3`}
                </span>
              </div>
            </div>
          </div>

          {/* Input da API Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sua Chave API do Google Gemini:
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isValidating}
              />
              {stats.hasUserKey && (
                <button
                  onClick={handleRemoveKey}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Remover chave"
                >
                  🗑️
                </button>
              )}
            </div>
            {validationError && (
              <p className="text-red-600 text-sm mt-2">❌ {validationError}</p>
            )}
          </div>

          {/* Tutorial */}
          <div className="mb-6">
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>{showTutorial ? '🔽' : '▶️'}</span>
              Como obter sua API Key (Tutorial)
            </button>
            
            {showTutorial && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">📋 Passo a passo:</h4>
                <ol className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">1.</span>
                    <div>
                      Acesse: <a 
                        href="https://makersuite.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-900"
                      >
                        Google AI Studio
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Faça login com sua conta Google</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Clique em "Create API Key"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">4.</span>
                    <span>Copie a chave gerada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">5.</span>
                    <span>Cole aqui no campo acima</span>
                  </li>
                </ol>
                
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <h5 className="font-semibold text-green-800">✅ Benefícios:</h5>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• 1000 requests gratuitos por dia</li>
                    <li>• Acesso aos modelos mais avançados</li>
                    <li>• Sem limitações de uso no sistema</li>
                    <li>• Seus dados ficam seguros (direto com Google)</li>
                    <li>• Ajuda outros usuários (sua chave entra no pool)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Informações do sistema */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🌟 Como funciona nosso sistema:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• <strong>3 gerações gratuitas</strong> para testar o sistema</p>
              <p>• <strong>Pool inteligente:</strong> {stats.totalPoolKeys} chaves disponíveis</p>
              <p>• <strong>Sua chave ajuda:</strong> Quando você adiciona sua chave, ela também ajuda outros usuários</p>
              <p>• <strong>Sem limitações:</strong> Com sua própria chave, use à vontade</p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isValidating || !apiKey.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isValidating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Validando...
                </span>
              ) : (
                '🚀 Salvar e Usar Sistema Completo'
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};