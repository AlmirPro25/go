/**
 * ============================================
 * TERMINAL INTEGRADO - COMPONENTE
 * ============================================
 * 
 * Terminal inteligente integrado ao modo chat
 * com suporte a CLI PowerShell e análise de IA
 */

import React, { useState, useRef, useEffect } from 'react';
import { terminalMaestro, type TerminalCommand, type TerminalAnalysis, type MaestroResponse } from '@/services/TerminalMaestro';

interface IntegratedTerminalProps {
    projectFiles?: string[];
    onCommandExecuted?: (command: string, output: string) => void;
}

interface TerminalLine {
    id: string;
    type: 'command' | 'output' | 'error' | 'info' | 'suggestion';
    content: string;
    timestamp: Date;
    analysis?: TerminalAnalysis;
}

export const IntegratedTerminal: React.FC<IntegratedTerminalProps> = ({
    projectFiles = [],
    onCommandExecuted
}) => {
    const [lines, setLines] = useState<TerminalLine[]>([
        {
            id: '0',
            type: 'info',
            content: '🚀 Terminal AI Web Weaver CLI - Digite "help" para ver comandos',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
    
    // Verificar status do backend
    useEffect(() => {
        checkBackendStatus();
        const interval = setInterval(checkBackendStatus, 10000); // Verificar a cada 10s
        return () => clearInterval(interval);
    }, []);
    
    // Auto-scroll para o final
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [lines]);
    
    // Carregar sugestões quando input muda
    useEffect(() => {
        if (input.length > 2) {
            loadSuggestions();
        } else {
            setShowSuggestions(false);
        }
    }, [input]);
    
    const checkBackendStatus = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/health');
            if (response.ok) {
                setBackendStatus('online');
            } else {
                setBackendStatus('offline');
            }
        } catch (error) {
            setBackendStatus('offline');
        }
    };
    
    const loadSuggestions = async () => {
        const lastCommand = commandHistory[commandHistory.length - 1];
        const lastOutput = lines.filter(l => l.type === 'output').slice(-1)[0]?.content;
        
        const suggestions = await terminalMaestro.suggestNextCommand({
            lastCommand,
            lastOutput,
            projectFiles
        });
        
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
    };
    
    const addLine = (type: TerminalLine['type'], content: string, analysis?: TerminalAnalysis) => {
        const newLine: TerminalLine = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date(),
            analysis
        };
        
        setLines(prev => [...prev, newLine]);
    };
    
    const executeCommand = async (command: string) => {
        if (!command.trim()) return;
        
        // Adicionar comando ao terminal
        addLine('command', `$ ${command}`);
        
        // Adicionar ao histórico
        setCommandHistory(prev => [...prev, command]);
        setHistoryIndex(-1);
        
        setIsExecuting(true);
        
        try {
            // 1. Interpretar comando com IA
            addLine('info', '🤖 Analisando comando...');
            const interpretation = await terminalMaestro.interpretCommand(command);
            
            if (!interpretation.understood) {
                addLine('error', `❌ ${interpretation.explanation}`);
                setIsExecuting(false);
                return;
            }
            
            addLine('info', `💡 ${interpretation.explanation}`);
            
            // 2. Verificar se precisa confirmação
            if (interpretation.needsConfirmation && interpretation.risks) {
                addLine('info', `⚠️  Riscos: ${interpretation.risks.join(', ')}`);
                addLine('info', '⚠️  Digite "confirm" para confirmar ou qualquer outra coisa para cancelar');
                setIsExecuting(false);
                return;
            }
            
            // 3. Executar comando via backend
            if (backendStatus === 'offline') {
                addLine('error', '❌ Backend CLI offline. Inicie: .\\cli\\backend-server.ps1');
                setIsExecuting(false);
                return;
            }
            
            addLine('info', '⚡ Executando comando...');
            
            const result = await executeViaBackend(interpretation.cliCommand || command);
            
            // 4. Mostrar output
            if (result.success) {
                addLine('output', result.output);
                
                // 5. Analisar output com IA
                const analysis = await terminalMaestro.analyzeOutput(
                    command,
                    result.output,
                    result.exitCode || 0
                );
                
                if (analysis.hasError) {
                    addLine('error', `❌ ${analysis.errorMessage}`);
                    if (analysis.suggestion) {
                        addLine('suggestion', `💡 Sugestão: ${analysis.suggestion}`);
                    }
                    if (analysis.autoFixCommand) {
                        addLine('suggestion', `🔧 Correção automática: ${analysis.autoFixCommand}`);
                    }
                } else {
                    addLine('info', '✅ Comando executado com sucesso!');
                }
                
                // 6. Registrar no histórico do maestro
                terminalMaestro.addToHistory({
                    id: Date.now().toString(),
                    command,
                    output: result.output,
                    exitCode: result.exitCode || 0,
                    timestamp: new Date().toISOString(),
                    duration: result.duration || 0,
                    type: 'cli'
                });
                
                // 7. Callback
                if (onCommandExecuted) {
                    onCommandExecuted(command, result.output);
                }
            } else {
                addLine('error', `❌ Erro: ${result.error}`);
            }
        } catch (error: any) {
            addLine('error', `❌ Erro ao executar: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };
    
    const executeViaBackend = async (command: string): Promise<any> => {
        try {
            // Executar comando via endpoint /api/execute
            const response = await fetch('http://localhost:5000/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    command: command
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    output: data.output || 'Comando executado',
                    exitCode: data.exitCode || 0,
                    duration: data.duration || 0
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Erro desconhecido',
                    exitCode: 1
                };
            }
        } catch (error: any) {
            // Fallback se backend estiver offline
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return {
                    success: false,
                    error: 'Backend offline. Inicie o servidor:\n\ncd cli\n.\\backend-server.ps1',
                    exitCode: 1
                };
            }
            
            return {
                success: false,
                error: error.message,
                exitCode: 1
            };
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(input);
            setInput('');
            setShowSuggestions(false);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex === -1 
                    ? commandHistory.length - 1 
                    : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = historyIndex + 1;
                if (newIndex >= commandHistory.length) {
                    setHistoryIndex(-1);
                    setInput('');
                } else {
                    setHistoryIndex(newIndex);
                    setInput(commandHistory[newIndex]);
                }
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (suggestions.length > 0) {
                setInput(suggestions[0]);
                setShowSuggestions(false);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };
    
    const clearTerminal = () => {
        setLines([{
            id: Date.now().toString(),
            type: 'info',
            content: '🚀 Terminal limpo',
            timestamp: new Date()
        }]);
    };
    
    const getLineColor = (type: TerminalLine['type']) => {
        switch (type) {
            case 'command': return 'text-sky-400';
            case 'output': return 'text-slate-300';
            case 'error': return 'text-red-400';
            case 'info': return 'text-blue-400';
            case 'suggestion': return 'text-green-400';
            default: return 'text-slate-300';
        }
    };
    
    const getLineIcon = (type: TerminalLine['type']) => {
        switch (type) {
            case 'command': return '❯';
            case 'error': return '❌';
            case 'info': return 'ℹ️';
            case 'suggestion': return '💡';
            default: return '';
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-lg border border-slate-700">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 rounded-t-lg">
                <div className="flex items-center gap-3">
                    <i className="fa-solid fa-terminal text-sky-400"></i>
                    <span className="text-sm font-semibold text-slate-200">Terminal AI Web Weaver CLI</span>
                    <div className={`flex items-center gap-1 text-xs ${
                        backendStatus === 'online' ? 'text-green-400' :
                        backendStatus === 'offline' ? 'text-red-400' :
                        'text-yellow-400'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            backendStatus === 'online' ? 'bg-green-400' :
                            backendStatus === 'offline' ? 'bg-red-400' :
                            'bg-yellow-400 animate-pulse'
                        }`}></div>
                        <span>
                            {backendStatus === 'online' ? 'Backend Online' :
                             backendStatus === 'offline' ? 'Backend Offline' :
                             'Verificando...'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearTerminal}
                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                        title="Limpar terminal"
                    >
                        <i className="fa-solid fa-broom mr-1"></i>
                        Limpar
                    </button>
                    <button
                        onClick={checkBackendStatus}
                        className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                        title="Verificar status"
                    >
                        <i className="fa-solid fa-rotate mr-1"></i>
                        Status
                    </button>
                </div>
            </div>
            
            {/* Terminal Output */}
            <div 
                ref={terminalRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
            >
                {lines.map(line => (
                    <div key={line.id} className={`${getLineColor(line.type)} flex items-start gap-2`}>
                        <span className="flex-shrink-0 w-4">{getLineIcon(line.type)}</span>
                        <span className="flex-1 whitespace-pre-wrap break-words">{line.content}</span>
                    </div>
                ))}
                
                {isExecuting && (
                    <div className="text-yellow-400 flex items-center gap-2">
                        <i className="fa-solid fa-spinner animate-spin"></i>
                        <span>Executando...</span>
                    </div>
                )}
            </div>
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2 bg-slate-800 border-t border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">💡 Sugestões (Tab para autocompletar):</div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setInput(suggestion);
                                    setShowSuggestions(false);
                                    inputRef.current?.focus();
                                }}
                                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Input */}
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-slate-800 border-t border-slate-700 rounded-b-lg">
                <span className="text-sky-400 font-mono">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite um comando ou use linguagem natural..."
                    className="flex-1 bg-transparent text-slate-200 font-mono text-sm focus:outline-none placeholder-slate-500"
                    disabled={isExecuting}
                    autoFocus
                />
                <button
                    onClick={() => {
                        executeCommand(input);
                        setInput('');
                    }}
                    disabled={!input.trim() || isExecuting}
                    className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                    {isExecuting ? (
                        <i className="fa-solid fa-spinner animate-spin"></i>
                    ) : (
                        <i className="fa-solid fa-paper-plane"></i>
                    )}
                </button>
            </div>
        </div>
    );
};
