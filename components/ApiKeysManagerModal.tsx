// components/ApiKeysManagerModal.tsx
// Interface para gerenciar API Keys pré-configuradas

import React, { useState, useEffect } from 'react';
import { apiKeysManager, type ApiKeyConfig } from '@/services/ApiKeysManager';

interface ApiKeysManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysManagerModal: React.FC<ApiKeysManagerModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<ApiKeyConfig[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({
    provider: 'google' as ApiKeyConfig['provider'],
    name: '',
    key: '',
    description: '',
    model: '',
    isActive: true
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    }
  }, [isOpen]);

  const loadKeys = () => {
    setKeys(apiKeysManager.getAllKeys());
  };

  const handleAddKey = async () => {
    if (!newKey.key.trim()) {
      alert('Por favor, insira uma chave de API');
      return;
    }

    // Validar chave
    setIsValidating(true);
    setValidationResult(null);

    const isValid = await apiKeysManager.validateKey(newKey.provider, newKey.key);

    if (isValid) {
      apiKeysManager.saveKey({
        provider: newKey.provider,
        name: newKey.name || getProviderName(newKey.provider),
        key: newKey.key,
        description: newKey.description,
        model: newKey.model,
        isActive: newKey.isActive
      });

      setValidationResult({ success: true, message: '✅ Chave válida e salva com sucesso!' });
      
      setTimeout(() => {
        setShowAddForm(false);
        setNewKey({
          provider: 'google',
          name: '',
          key: '',
          description: '',
          model: '',
          isActive: true
        });
        setValidationResult(null);
        loadKeys();
      }, 2000);
    } else {
      setValidationResult({ success: false, message: '❌ Chave inválida. Verifique e tente novamente.' });
    }

    setIsValidating(false);
  };

  const handleRemoveKey = (keyId: string) => {
    if (confirm('Tem certeza que deseja remover esta chave?')) {
      apiKeysManager.removeKey(keyId);
      loadKeys();
    }
  };

  const handleToggleKey = (keyId: string, isActive: boolean) => {
    apiKeysManager.toggleKey(keyId, isActive);
    loadKeys();
  };

  const getProviderName = (provider: ApiKeyConfig['provider']): string => {
    const names = {
      google: 'Google Gemini',
      openai: 'OpenAI GPT',
      anthropic: 'Anthropic Claude',
      custom: 'Custom API'
    };
    return names[provider];
  };

  const getProviderIcon = (provider: ApiKeyConfig['provider']): string => {
    const icons = {
      google: '🔷',
      openai: '🟢',
      anthropic: '🟣',
      custom: '⚙️'
    };
    return icons[provider];
  };

  const maskApiKey = (key: string): string => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🔑 Gerenciador de API Keys
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Configure suas chaves de API para usar em aplicativos gerados
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-times text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Lista de Keys */}
          {keys.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Chaves Configuradas</h3>
              <div className="space-y-3">
                {keys.map(key => (
                  <div
                    key={key.id}
                    className="bg-slate-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-3xl">{getProviderIcon(key.provider)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-semibold">{key.name}</h4>
                          {key.isActive && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Ativa
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{key.description || 'Sem descrição'}</p>
                        <p className="text-slate-500 text-xs mt-1 font-mono">
                          {maskApiKey(key.key)}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Usos: {key.usageCount}</span>
                          {key.lastUsed && (
                            <span>Último uso: {new Date(key.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleKey(key.id, !key.isActive)}
                        className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                          key.isActive
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {key.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleRemoveKey(key.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md text-sm transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão Adicionar */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-plus"></i>
              Adicionar Nova Chave de API
            </button>
          )}

          {/* Formulário de Adicionar */}
          {showAddForm && (
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">➕ Nova Chave de API</h3>
              
              <div className="space-y-4">
                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Provider
                  </label>
                  <select
                    value={newKey.provider}
                    onChange={(e) => setNewKey({ ...newKey, provider: e.target.value as ApiKeyConfig['provider'] })}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="google">🔷 Google Gemini</option>
                    <option value="openai">🟢 OpenAI GPT</option>
                    <option value="anthropic">🟣 Anthropic Claude</option>
                  </select>
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome (opcional)
                  </label>
                  <input
                    type="text"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    placeholder={getProviderName(newKey.provider)}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Chave */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Chave de API *
                  </label>
                  <input
                    type="password"
                    value={newKey.key}
                    onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newKey.description}
                    onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                    placeholder="Para que você vai usar esta chave?"
                    rows={2}
                    className="w-full bg-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Resultado da Validação */}
                {validationResult && (
                  <div className={`p-3 rounded-lg ${
                    validationResult.success
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {validationResult.message}
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddKey}
                    disabled={isValidating}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Validando...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check"></i>
                        Validar e Salvar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setValidationResult(null);
                    }}
                    disabled={isValidating}
                    className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-info-circle"></i>
              Como funciona?
            </h4>
            <ul className="text-slate-300 text-sm space-y-1">
              <li>• Configure suas chaves de API aqui</li>
              <li>• Quando gerar um app que usa IA, o sistema usará automaticamente suas chaves</li>
              <li>• As chaves são armazenadas localmente no seu navegador</li>
              <li>• Você pode ter múltiplas chaves e ativar/desativar conforme necessário</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
