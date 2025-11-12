

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    generateAiResponse,
    generateAiResponseStream,
    generateContextualModification,
    generateBrainstormingIdeas,
    suggestThemeColorsFromDescription,
    applyThemeColorsToHtml,
    analyzeHtmlElement,
    critiqueGeneratedSite,
    generateReadmeForProject,
    explainCodeSnippet,
    suggestRefactoring,
    generateTestSuggestions,
    debugCodeWithAi,
    generateChatAgentResponse,
    performSpecializedResearch,
    postProcessHtmlWithMedia,
    generateWithPersona,
    getAvailablePersonas,
    recommendPersonaForPrompt,
    type ProjectFile,
    type GroundingSource,
    type ResearchFinding,
    type AiChatAgentResponse,
    type AiServicePhase,
    type AiPersona,
} from '@/services/GeminiService';
import { AiResponseType } from '@/services/GeminiServiceEnhanced';
import { ArtisanValidator } from '@/services/ArtisanValidator';
import {
    generateProductionReadyCode,
    generateFrontendOnly,
    generateBackendOnly,
    connectFrontendBackend,
    antiSimulationSystem
} from '@/services/AntiSimulationSystem';

// Helper function para detectar tipo de projeto
function detectProjectTypeFromPrompt(prompt: string): 'fullstack' | 'frontend' | 'backend' | 'clone' | 'mobile' {
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('clone') || promptLower.includes('replica') || promptLower.includes('igual ao')) {
        return 'clone';
    }

    if (promptLower.includes('e-commerce') || promptLower.includes('loja') ||
        promptLower.includes('dashboard') || promptLower.includes('admin') ||
        promptLower.includes('blog') || promptLower.includes('cms') ||
        promptLower.includes('sistema') || promptLower.includes('plataforma') ||
        promptLower.includes('app') || promptLower.includes('aplicativo')) {
        return 'fullstack';
    }

    if (promptLower.includes('api') || promptLower.includes('backend') ||
        promptLower.includes('servidor') || promptLower.includes('banco de dados')) {
        return 'backend';
    }

    if (promptLower.includes('mobile') || promptLower.includes('react native') ||
        promptLower.includes('flutter')) {
        return 'mobile';
    }

    return 'frontend';
}

// CONFIGURAÇÃO: Sistema Frontend-First por padrão
const FRONTEND_FIRST_MODE = true; // Ativar geração Frontend-first por padrão

// Helper function para verificar se deve usar modo Frontend-first
function shouldUseFrontendFirst(prompt: string): boolean {
    if (!FRONTEND_FIRST_MODE) return false;
    
    const projectType = detectProjectTypeFromPrompt(prompt);
    return projectType === 'fullstack';
}

// Configuração global do sistema de geração
interface GenerationConfig {
    frontendFirst: boolean;
    pauseAfterFrontend: boolean; // Para implementação futura
    showProgressInEditor: boolean;
}

const DEFAULT_GENERATION_CONFIG: GenerationConfig = {
    frontendFirst: true,
    pauseAfterFrontend: false, // Futuro: pausar após frontend para revisão
    showProgressInEditor: true
};
import { performAdvancedResearch, type ColorPalette, type DesignResearch } from '@/services/AdvancedResearch';
import type { editor } from 'monaco-editor';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { AttachmentFile } from '@/components/CommandBar';
import type { BrainstormingMode } from '@/components/BrainstormingModal';
import type { ThemeColors } from '@/components/ThemeCustomizerModal';
import type { LastFailedOperationDetails } from '@/components/AiErrorFallbackModal';
import { type ConsoleMessage } from '@/components/PreviewConsole';
import { type TerminalHistoryEntry } from '@/components/ChatView';
import { type EvolutionStep, type EvolutionSubStep } from '@/components/EvolutionTracker';
import { type DetailedStatus, type EditorTab, type TechStack, type EditorInteractionState } from '@/types/ProjectStructure';
import { stackTemplates } from '@/config/stackTemplates';
import { get } from 'http';
import { get } from 'http';
import { get } from 'http';
import { get } from 'http';
import { header } from 'express-validator';


// Constants
export const WIP_LOCAL_STORAGE_KEY = 'aiWebWeaverProjectState_WIP';
export const SNAPSHOTS_LOCAL_STORAGE_KEY = 'aiWebWeaverProjectSnapshots';
export const CHATS_LOCAL_STORAGE_KEY = 'aiWebWeaverChatSessions';
export const MAX_PROMPT_HISTORY = 10;
export const MAX_AI_RETRIES = 1;

// Type Definitions
export type AppPhase =
    | 'IDLE' | 'AWAITING_INITIAL_PLAN' | 'PERFORMING_RESEARCH' | 'PLAN_DISPLAYED'
    | 'REFINING_PLAN' | 'GENERATING_CODE_FROM_PLAN' | 'CODE_GENERATED'
    | 'AWAITING_CODE_MODIFICATION' | 'FETCHING_URL' | 'RESETTING'
    | 'CONTEXTUAL_AI_PANEL_OPEN' | 'LOGGING_INTERACTION' | 'BRAINSTORMING'
    | 'THEMING_CUSTOMIZATION' | 'TASK_MANAGER_OPEN' | 'CRITIQUING_SITE'
    | 'UNDOING_AI_OPERATION' | 'SAVING_PROJECT' | 'LOADING_PROJECT'
    | 'EXPORTING_PROJECT' | 'MANAGING_SNAPSHOTS' | 'AI_CODE_INSIGHT'
    | 'AI_ERROR_STATE' | 'AI_FALLBACK_OPTIONS' | 'SUGGESTING_TESTS'
    | 'AI_DEBUGGING' | 'CHAT_IDLE' | 'CHAT_GENERATING_RESPONSE' | 'CHAT_TERMINAL_BUSY'
    | 'GENERATING_BACKEND' | 'GENERATING_FRONTEND';

export const textModelOptions: { id: string; name: string; isDefault?: boolean }[] = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Padrão e Rápido)', isDefault: true },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Avançado e Detalhado)' },
    { id: 'gemini-robotics-er-1.5-preview', name: 'Gemini Robotics ER 1.5 Preview (Robótica)' },
    { id: 'learnlm-2.0-flash-experimental', name: 'LearnLM 2.0 Flash Experimental (Educação)' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Leve e Rápido)' },
    { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite Latest (Última Versão Leve)' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest (Última Versão)' },
    { id: 'aiwebweaver-finetuned-v1', name: 'AIWebWeaver v1 (Finetuned - Simulado)' },
];

export interface InteractionLogData {
    interactionId: string;
    timestamp: string;
    userPrompt: string;
    initialGeminiCode: string;
    finalUserCode: string;
    modelVersionUsed: string;
    feedbackSignal?: 'reset' | 'finalized_by_user' | 'new_generation_started' | 'contextual_edit' | 'contextual_analysis' | 'brainstorm_session' | 'theme_applied' | 'theme_colors_suggested' | 'site_critique' | 'undo_ai_operation' | 'load_url_content' | 'code_explanation' | 'code_refactor_suggestion' | 'ai_error_fallback_used' | 'github_connection_attempt' | 'github_publish_attempt' | 'vercel_deploy_attempt' | 'test_suggestion_generated' | 'ai_code_debug_attempt';
    userRating?: 'liked' | 'disliked';
    isGoodForTraining?: boolean;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
}

export interface StoredProjectState {
    htmlCode: string;
    projectPlan: string | null;
    initialPlanPrompt: string;
    selectedTextModel: string;
    loggedInteractions: InteractionLogData[];
    tasks: Task[];
    promptHistory?: string[];
    projectId: string;
    researchFindings?: ResearchFinding[] | null;
}

export type AppMode = 'editor' | 'chat';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp: string;
    suggestion?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
}

export interface StoredChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
}

export interface StoredProjectSnapshot extends StoredProjectState {
    snapshotId: string;
    snapshotName: string;
    snapshotTimestamp: string;
    snapshotDescription?: string;
}

export interface UserProfile {
    id: string;
    email: string;
}

export const initialHtmlBase = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Web Weaver - De Ideia a Império. Em Minutos.</title>
    <meta name="description" content="AI Web Weaver é a primeira fábrica de negócios digitais do mundo, transformando suas ideias em aplicativos web completos e prontos para o mercado com o poder da inteligência artificial.">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Satoshi:wght@400;500;700&family=Clash+Display:wght@600&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --color-background: #0D0C1D;
            --color-primary: #5C67F2;
            --color-secondary: #C471ED;
            --color-accent: #00BFFF;
            --color-text: #E0E0E0;
            --color-text-muted: #A0A0A0;
            --font-heading: 'Clash Display', sans-serif;
            --font-body: 'Satoshi', sans-serif;
        }

        body {
            background-color: var(--color-background);
            color: var(--color-text);
            font-family: var(--font-body);
            overflow-x: hidden;
        }

        .font-heading { font-family: var(--font-heading); }
        .font-body { font-family: var(--font-body); }

        .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-gradient-text {
            background: linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
            animation: gradient-flow 8s ease infinite;
            background-size: 200% auto;
        }

        @keyframes gradient-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .cta-button {
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            z-index: 1;
        }
        .cta-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, var(--color-accent) 0%, var(--color-primary) 100%);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.4s ease, height 0.4s ease;
            z-index: -1;
        }
        .cta-button:hover::before {
            width: 300px;
            height: 300px;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 191, 255, 0.2);
        }

        .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .fade-in-up.visible {
            opacity: 1;
            transform: translateY(0);
        }

        #hero-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: 0.4;
        }

    </style>
</head>
<body data-aid="body-main">

    <div id="app-container" data-aid="div-app-container" class="relative">

        <!-- HEADER -->
        <header data-aid="header-main" role="banner" class="fixed top-0 left-0 right-0 z-50 glass-effect">
            <nav data-aid="nav-main" class="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="#" data-aid="link-logo" class="text-2xl font-heading font-bold" aria-label="AI Web Weaver - Página Inicial">
                    AI Web Weaver
                </a>
                <div data-aid="div-desktop-nav" class="hidden md:flex items-center space-x-8">
                    <a href="#features" data-aid="link-nav-features" class="hover:text-white transition-colors">Funcionalidades</a>
                    <a href="#showcase" data-aid="link-nav-showcase" class="hover:text-white transition-colors">Exemplos</a>
                    <a href="#cta" data-aid="link-nav-cta" class="bg-white/10 px-4 py-2 rounded-md hover:bg-white/20 transition-colors">Acesso Beta</a>
                </div>
                <button data-aid="button-mobile-menu-toggle" id="mobile-menu-button" class="md:hidden focus:outline-none" aria-label="Abrir menu de navegação">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-4 6h4"></path></svg>
                </button>
            </nav>
            <!-- Mobile Menu -->
            <div data-aid="div-mobile-menu" id="mobile-menu" class="hidden md:hidden">
                <a href="#features" data-aid="link-mobile-nav-features" class="block py-2 px-6 text-sm hover:bg-white/5">Funcionalidades</a>
                <a href="#showcase" data-aid="link-mobile-nav-showcase" class="block py-2 px-6 text-sm hover:bg-white/5">Exemplos</a>
                <a href="#cta" data-aid="link-mobile-nav-cta" class="block py-2 px-6 text-sm hover:bg-white/5">Acesso Beta</a>
            </div>
        </header>

        <main data-aid="main-content" role="main">

            <!-- HERO SECTION -->
            <section data-aid="section-hero" id="hero" role="region" aria-labelledby="hero-title" class="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-20">
                <canvas id="hero-canvas" data-aid="canvas-hero-background"></canvas>
                <div data-aid="div-hero-content" class="relative z-10 px-4">
                    <h1 data-aid="h1-hero-title" id="hero-title" class="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4">
                        De Ideia a <span class="hero-gradient-text">Império</span>.
                        <br class="hidden md:block">
                        Em Minutos.
                    </h1>
                    <p data-aid="p-hero-subtitle" class="max-w-3xl mx-auto text-lg md:text-xl text-text-muted mb-8">
                        AI Web Weaver é a primeira fábrica de negócios digitais do mundo. Descreva sua visão e nossa IA constrói, integra e prepara para o deploy um ecossistema web completo.
                    </p>
                    <a href="#cta" data-aid="a-hero-cta" class="cta-button inline-block bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg">
                        Construir o Futuro Agora
                    </a>
                </div>
            </section>

            <!-- HOW IT WORKS SECTION -->
            <section data-aid="section-how-it-works" id="how-it-works" role="region" aria-labelledby="how-it-works-title" class="py-20 md:py-32">
                <div data-aid="div-how-it-works-container" class="container mx-auto px-6 text-center">
                    <h2 data-aid="h2-how-it-works-title" id="how-it-works-title" class="font-heading text-4xl md:text-5xl font-bold mb-4 fade-in-up">A Mágica em 3 Passos</h2>
                    <p data-aid="p-how-it-works-subtitle" class="max-w-2xl mx-auto text-text-muted mb-16 fade-in-up" style="transition-delay: 100ms;">Simplicidade radical para resultados exponenciais.</p>
                    <div data-aid="div-steps-grid" class="grid md:grid-cols-3 gap-8 md:gap-12">
                        <!-- Step 1 -->
                        <div data-aid="div-step-1" class="fade-in-up" style="transition-delay: 200ms;">
                            <div data-aid="div-step-1-icon-wrapper" class="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">1</div>
                            <h3 data-aid="h3-step-1-title" class="text-2xl font-bold mb-2">Descreva</h3>
                            <p data-aid="p-step-1-desc" class="text-text-muted">Use linguagem natural para detalhar seu aplicativo, suas funcionalidades, e o público-alvo. Pense em negócio, não em código.</p>
                        </div>
                        <!-- Step 2 -->
                        <div data-aid="div-step-2" class="fade-in-up" style="transition-delay: 350ms;">
                            <div data-aid="div-step-2-icon-wrapper" class="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">2</div>
                            <h3 data-aid="h3-step-2-title" class="text-2xl font-bold mb-2">Construa</h3>
                            <p data-aid="p-step-2-desc" class="text-text-muted">Nossa IA projeta a arquitetura, escreve o front-end e back-end, configura o banco de dados e integra APIs em tempo real.</p>
                        </div>
                        <!-- Step 3 -->
                        <div data-aid="div-step-3" class="fade-in-up" style="transition-delay: 500ms;">
                            <div data-aid="div-step-3-icon-wrapper" class="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white text-3xl font-bold">3</div>
                            <h3 data-aid="h3-step-3-title" class="text-2xl font-bold mb-2">Exporte</h3>
                            <p data-aid="p-step-3-desc" class="text-text-muted">Receba um repositório completo, com código limpo, documentação e instruções de deploy. Seu negócio, pronto para escalar.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- FEATURES SECTION -->
            <section data-aid="section-features" id="features" role="region" aria-labelledby="features-title" class="py-20 md:py-32 bg-black/20">
                <div data-aid="div-features-container" class="container mx-auto px-6">
                    <div class="text-center">
                        <h2 data-aid="h2-features-title" id="features-title" class="font-heading text-4xl md:text-5xl font-bold mb-4 fade-in-up">Uma Fábrica, Não uma Ferramenta</h2>
                        <p data-aid="p-features-subtitle" class="max-w-2xl mx-auto text-text-muted mb-16 fade-in-up" style="transition-delay: 100ms;">Construímos ecossistemas digitais completos, não apenas páginas.</p>
                    </div>
                    <div data-aid="div-features-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <!-- Feature 1 -->
                        <div data-aid="div-feature-1" class="feature-card glass-effect p-8 rounded-2xl fade-in-up" style="transition-delay: 200ms;">
                            <h3 data-aid="h3-feature-1-title" class="text-2xl font-bold mb-3">Full-Stack Real</h3>
                            <p data-aid="p-feature-1-desc" class="text-text-muted">Front-end reativo, back-end robusto e banco de dados relacional. Tudo conectado e pronto para produção.</p>
                        </div>
                        <!-- Feature 2 -->
                        <div data-aid="div-feature-2" class="feature-card glass-effect p-8 rounded-2xl fade-in-up" style="transition-delay: 300ms;">
                            <h3 data-aid="h3-feature-2-title" class="text-2xl font-bold mb-3">IA Arquitetural</h3>
                            <p data-aid="p-feature-2-desc" class="text-text-muted">Nossa IA não apenas escreve código, ela projeta sistemas escaláveis e seguros, escolhendo a melhor tecnologia para cada tarefa.</p>
                        </div>
                        <!-- Feature 3 -->
                        <div data-aid="div-feature-3" class="feature-card glass-effect p-8 rounded-2xl fade-in-up" style="transition-delay: 400ms;">
                            <h3 data-aid="h3-feature-3-title" class="text-2xl font-bold mb-3">Integrações Nativas</h3>
                            <p data-aid="p-feature-3-desc" class="text-text-muted">Precisa de pagamentos, autenticação ou e-mails? A IA integra Stripe, Auth0, SendGrid e mais, de forma automática.</p>
                        </div>
                        <!-- Feature 4 -->
                        <div data-aid="div-feature-4" class="feature-card glass-effect p-8 rounded-2xl fade-in-up" style="transition-delay: 500ms;">
                            <h3 data-aid="h3-feature-4-title" class="text-2xl font-bold mb-3">Design System Inteligente</h3>
                            <p data-aid="p-feature-4-desc" class="text-text-muted">Gera interfaces belas, responsivas e acessíveis, com um sistema de design coeso e componentes reutilizáveis.</p>
                        </div>
                        <!-- Feature 5 -->
                        <div data-aid="div-feature-5" class="feature-card glass-effect p-8 rounded-2xl fade-in-up" style="transition-delay: 600ms;">
                            <h3 data-aid="h3-feature-5-title" class="text-2xl font-bold mb-3">Deploy com Um Clique</h3>
                            <p data-aid="p-feature-5-desc" class="text-text-muted">Seu projeto vem com arquivos de configuração para Vercel, Netlify e Docker, pronto para ir ao ar instantaneamente.</p>
                        </div>
                        <!-- Feature 6 -->
                        <div data-aid="div-feature-6" class="feature-card glass-effect p-8 rounded-2xl fade-in-up" style="transition-delay: 700ms;">
                            <h3 data-aid="h3-feature-6-title" class="text-2xl font-bold mb-3">Código que Você Ama</h3>
                            <p data-aid="p-feature-6-desc" class="text-text-muted">Exportamos código limpo, comentado e seguindo as melhores práticas. Feito por IA, perfeito para humanos.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SHOWCASE SECTION -->
            <section data-aid="section-showcase" id="showcase" role="region" aria-labelledby="showcase-title" class="py-20 md:py-32">
                <div data-aid="div-showcase-container" class="container mx-auto px-6">
                    <div class="text-center">
                        <h2 data-aid="h2-showcase-title" id="showcase-title" class="font-heading text-4xl md:text-5xl font-bold mb-4 fade-in-up">Construído em Horas, Não Meses.</h2>
                        <p data-aid="p-showcase-subtitle" class="max-w-2xl mx-auto text-text-muted mb-16 fade-in-up" style="transition-delay: 100ms;">Exemplos de ecossistemas gerados pela AI Web Weaver.</p>
                    </div>
                    <div data-aid="div-showcase-grid" class="grid md:grid-cols-2 gap-8">
                        <!-- Showcase Item 1 -->
                        <div data-aid="div-showcase-item-1" class="fade-in-up" style="transition-delay: 200ms;">
                            <div data-aid="div-showcase-item-1-image-wrapper" class="relative overflow-hidden rounded-lg mb-4">
                                <img src="ai-img://img_1755467145589_4fhjz" alt="Dashboard de Análise de Dados de um SaaS" class="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-300">
                            </div>
                            <h3 data-aid="h3-showcase-item-1-title" class="text-xl font-bold">Plataforma SaaS de Análise</h3>
                            <p data-aid="p-showcase-item-1-desc" class="text-text-muted">Dashboard, autenticação, planos de assinatura e relatórios.</p>
                        </div>
                        <!-- Showcase Item 2 -->
                        <div data-aid="div-showcase-item-2" class="fade-in-up" style="transition-delay: 350ms;">
                            <div data-aid="div-showcase-item-2-image-wrapper" class="relative overflow-hidden rounded-lg mb-4">
                                <img src="ai-img://img_1755467149811_5icsf" alt="Loja Virtual de Moda de Luxo" class="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-300">
                            </div>
                            <h3 data-aid="h3-showcase-item-2-title" class="text-xl font-bold">E-commerce de Luxo</h3>
                            <p data-aid="p-showcase-item-2-desc" class="text-text-muted">Catálogo de produtos, carrinho, checkout com Stripe e painel de admin.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA SECTION -->
            <section data-aid="section-cta" id="cta" role="region" aria-labelledby="cta-title" class="py-20 md:py-32">
                <div data-aid="div-cta-container" class="container mx-auto px-6 text-center">
                    <div data-aid="div-cta-content" class="max-w-3xl mx-auto glass-effect rounded-2xl p-8 md:p-16 fade-in-up">
                        <h2 data-aid="h2-cta-title" id="cta-title" class="font-heading text-4xl md:text-5xl font-bold mb-4">O Futuro do Desenvolvimento Chegou.</h2>
                        <p data-aid="p-cta-subtitle" class="text-text-muted text-lg mb-8">Junte-se à revolução. Inscreva-se para o acesso beta exclusivo e seja um dos primeiros a transformar ideias em negócios com uma velocidade sem precedentes.</p>
                        <a href="#" data-aid="a-cta-main" class="cta-button inline-block bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg">
                            Solicitar Acesso Beta
                        </a>
                    </div>
                </div>
            </section>

        </main>
        
        <!-- FOOTER -->
        <footer data-aid="footer-main" role="contentinfo" class="py-8 border-t border-white/10">
            <div data-aid="div-footer-container" class="container mx-auto px-6 text-center text-text-muted">
                <p data-aid="p-copyright">&copy; 2024 AI Web Weaver. Todos os direitos reservados. Construindo o futuro da web.</p>
            </div>
        </footer>

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {

            // Mobile Menu Toggle
            const menuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            if (menuButton && mobileMenu) {
                menuButton.addEventListener('click', () => {
                    mobileMenu.classList.toggle('hidden');
                });
            }
            
            // Scroll Animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1
            });
            
            const elementsToAnimate = document.querySelectorAll('.fade-in-up');
            elementsToAnimate.forEach(el => observer.observe(el));

            // Hero Canvas Animation
            const canvas = document.getElementById('hero-canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                let width = canvas.width = window.innerWidth;
                let height = canvas.height = window.innerHeight;
                let particles = [];
                const particleCount = 100;

                class Particle {
                    constructor() {
                        this.x = Math.random() * width;
                        this.y = Math.random() * height;
                        this.size = Math.random() * 2 + 1;
                        this.speedX = Math.random() * 1 - 0.5;
                        this.speedY = Math.random() * 1 - 0.5;
                        this.color = 'rgba(92, 103, 242, ' + Math.random() + ')';
                    }
                    update() {
                        if (this.x > width || this.x < 0) this.speedX *= -1;
                        if (this.y > height || this.y < 0) this.speedY *= -1;
                        this.x += this.speedX;
                        this.y += this.speedY;
                    }
                    draw() {
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                function init() {
                    for (let i = 0; i < particleCount; i++) {
                        particles.push(new Particle());
                    }
                }

                function animate() {
                    ctx.clearRect(0, 0, width, height);
                    for (let i = 0; i < particles.length; i++) {
                        particles[i].update();
                        particles[i].draw();
                    }
                    connect();
                    requestAnimationFrame(animate);
                }

                function connect() {
                    let opacityValue = 1;
                    for (let a = 0; a < particles.length; a++) {
                        for (let b = a; b < particles.length; b++) {
                            let distance = Math.sqrt(
                                (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
                                (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y)
                            );
                            if (distance < 100) {
                                opacityValue = 1 - (distance/100);
                                ctx.strokeStyle = 'rgba(196, 113, 237, ' + opacityValue + ')';
                                ctx.lineWidth = 0.5;
                                ctx.beginPath();
                                ctx.moveTo(particles[a].x, particles[a].y);
                                ctx.lineTo(particles[b].x, particles[b].y);
                                ctx.stroke();
                            }
                        }
                    }
                }

                window.addEventListener('resize', () => {
                    width = canvas.width = window.innerWidth;
                    height = canvas.height = window.innerHeight;
                    particles = [];
                    init();
                });

                init();
                animate();
            }
        });
    </script>
</body>
</html>`;

interface AppState {
    appMode: AppMode;
    htmlCode: string;
    isLoadingAi: boolean;
    isPreviewFullscreen: boolean;
    projectPlan: string | null;
    projectPlanSources: GroundingSource[] | null;
    initialPlanPrompt: string;
    currentAppPhase: AppPhase;
    aiStatusMessage: string | null;
    selectedTextModel: string;
    currentProjectId: string;
    isContextualAiPanelOpen: boolean;
    contextualAiTargetElementInfo: { dataAid: string; tagName: string; outerHTML?: string } | null;
    contextualAiCommand: string;
    contextualAiError: string | null;
    isLoadingContextualAi: boolean;
    contextualAiPanelPosition: { top: number; left: number } | null;
    contextualQuickActions: { label: string; prompt: string }[];
    contextualAiAnalysisResults: string | null;
    isLoadingContextualAiAnalysis: boolean;
    isEvolutionTrackerOpen: boolean;
    evolutionTrackerProgress: EvolutionStep[];
    loggedInteractions: InteractionLogData[];
    lastUserPromptForLog: string;
    lastInitialGeminiCodeForLog: string;
    currentInteractionUserFeedback: 'liked' | 'disliked' | null;
    isModelPlaygroundOpen: boolean;
    playgroundPrompt: string;
    baseModelPlaygroundOutput: string;
    finetunedModelPlaygroundOutput: string;
    isPlaygroundGenerating: boolean;
    isBrainstormingModalOpen: boolean;
    brainstormingTopic: string;
    brainstormingMode: BrainstormingMode;
    brainstormingResults: string;
    isBrainstormingLoading: boolean;
    isThemeModalOpen: boolean;
    currentThemeDescription: string;
    currentThemeColors: ThemeColors;
    isSuggestingColors: boolean;
    isApplyingTheme: boolean;
    isTaskManagerOpen: boolean;
    tasks: Task[];
    isSiteCriticModalOpen: boolean;
    siteCritiqueResults: string | null;
    isLoadingSiteCritique: boolean;
    previousHtmlCode: string | null;
    canUndoLastAiOperation: boolean;
    lastMajorOperationDescriptionForUndo: string | null;
    promptHistory: string[];
    isSnapshotsModalOpen: boolean;
    projectSnapshots: StoredProjectSnapshot[];
    isAiCodeInsightModalOpen: boolean;
    selectedCodeForInsight: string | null;
    aiInsightResult: string | null;
    isLoadingAiInsight: boolean;
    currentInsightType: 'explanation' | 'refactoring' | null;
    selectedCodeLanguageHint: string;
    hasEditorSelection: boolean;
    isAiErrorFallbackModalOpen: boolean;
    lastFailedOperationDetails: LastFailedOperationDetails | null;
    isTestSuggestionModalOpen: boolean;
    testSuggestions: string | null;
    isLoadingTestSuggestions: boolean;
    isAiCodeDoctorModalOpen: boolean;
    aiCodeDoctorAnalysisResult: string | null;
    isLoadingAiCodeDoctor: boolean;
    aiCodeDoctorProblemRef: string | null;
    isApiKeyModalOpen: boolean;
    autoCritiqueResult: string | null;
    isLoadingCritique: boolean;
    
    // 📊 SISTEMA DE PONTUAÇÃO
    currentScore: {
        performance: number;
        accessibility: number;
        responsiveness: number;
        codeQuality: number;
        userExperience: number;
        totalScore: number;
        improvements: string[];
        metrics: any;
    } | null;
    scoreHistory: Array<{
        timestamp: number;
        score: number;
        improvements: string[];
    }>;

    // Estados para geração separada Frontend/Backend
    frontendCode: string | null;
    backendCode: string | null;
    isGeneratingFrontend: boolean;
    isGeneratingBackend: boolean;
    isConnectingFrontendBackend: boolean;
    frontendQualityScore: number;
    backendQualityScore: number;
    integrationGuide: string | null;
    // Chat state
    chats: ChatSession[];
    activeChatId: string | null;
    isGeneratingChatResponse: boolean;
    projectFiles: ProjectFile[];
    activeChatFile: string | null;
    consoleMessages: ConsoleMessage[];
    isConsoleOpen: boolean;
    consoleErrorCount: number;
    researchFindings: ResearchFinding[] | null;
    isResearchPanelOpen: boolean;
    terminalHistory: TerminalHistoryEntry[];
    isTerminalBusy: boolean;

    // Advanced Research & Color System
    designResearch: DesignResearch | null;
    isColorPaletteSelectorOpen: boolean;
    selectedColorPalette: ColorPalette | null;
    isPerformingAdvancedResearch: boolean;

    // Streaming state - preparando para multi-editor
    isCodeStreaming: boolean;
    streamingEditorId: string | null;
    streamingProgress: number; // 0-100
    streamingSpeed: number; // caracteres por segundo
    streamingAutoScroll: boolean;

    // Enhanced status system
    detailedStatus: DetailedStatus | null;

    // Multi-editor preparation (will be expanded later)
    editorTabs: EditorTab[];
    activeEditorId: string;
    editorInteractionState: EditorInteractionState;

    // AI Specialist system
    activeAiSpecialist: 'general' | 'frontend' | 'backend';
    isAiSpecialistPanelVisible: boolean;
    isAiThinkingVisible: boolean;

    // 🎭 Sistema de Personas de IA
    availablePersonas: AiPersona[];
    selectedPersona: AiPersona | null;
    isPersonaSelectorOpen: boolean;
    recommendedPersona: AiPersona | null;
    isGeneratingWithPersona: boolean;

    // New Editor Modal
    isNewEditorModalOpen: boolean;
    isCreatingEditor: boolean;

    // Tech Stack Modal
    isTechStackModalOpen: boolean;
}

interface AppActions {
    // General Actions
    init: () => void;
    setAppMode: (mode: AppMode) => void;
    setHtmlCode: (code: string) => void;
    setIsPreviewFullscreen: (isFullscreen: boolean) => void;
    setSelectedTextModel: (modelId: string) => void;
    setHasEditorSelection: (hasSelection: boolean) => void;
    addPromptToHistory: (prompt: string) => void;

    // AI Command Actions
    handleAiCommand: (prompt: string, currentCode: string, attachments?: AttachmentFile[], action?: 'GENERATE_CODE_FROM_PLAN' | 'REFINE_PLAN', forceFullStack?: boolean, arquitetaUnica?: boolean, artesaoMundos?: boolean) => Promise<void>;
    handleAiCommandWithAntiSimulation: (prompt: string, currentCode: string, attachments?: AttachmentFile[], action?: 'GENERATE_CODE_FROM_PLAN' | 'REFINE_PLAN', forceFullStack?: boolean, arquitetaUnica?: boolean, artesaoMundos?: boolean) => Promise<void>;
    
    // Nova função FullStack com streaming
    handleFullStackStreamingGeneration: (prompt: string, currentCode: string, attachments?: AttachmentFile[]) => Promise<void>;
    
    // Nova função Arquiteta Única
    handleArquitetaUnicaGeneration: (prompt: string, currentCode: string, attachments?: AttachmentFile[]) => Promise<void>;
    
    // Nova função Artesão de Mundos 3D
    handleArtesaoMundosGeneration: (prompt: string, currentCode: string, attachments?: AttachmentFile[]) => Promise<void>;
    handleFetchUrl: (url: string, currentCode: string) => Promise<void>;

    // Geração Separada Frontend/Backend
    generateFrontendOnly: (prompt: string, currentCode?: string) => Promise<void>;
    generateBackendOnly: (prompt: string, frontendCode?: string) => Promise<void>;
    connectFrontendBackend: (userPrompt: string) => Promise<void>;
    saveFrontendCode: () => void;
    saveBackendCode: () => void;
    loadSeparatedCodes: () => void;

    // UI Feedback & Logging
    logInteraction: (logData: Omit<InteractionLogData, 'userRating' | 'isGoodForTraining'>, userRatingValue: 'liked' | 'disliked' | null) => void;
    handleLikeInteraction: () => void;
    handleDislikeInteraction: () => void;
    handleFinalizeInteraction: (currentCode: string) => void;

    // Project Management
    handleResetProject: () => void;
    handleUndoLastAiOperation: () => void;
    saveWipProject: (currentCode: string) => void;
    handleExportProject: (currentCode: string) => Promise<void>;

    // Snapshots
    openSnapshotsModal: () => void;
    closeSnapshotsModal: () => void;
    handleSaveSnapshot: (name: string, description: string | undefined, currentCode: string) => void;
    handleLoadSnapshot: (snapshotId: string) => void;
    handleDeleteSnapshot: (snapshotId: string) => void;
    handleRenameSnapshot: (snapshotId: string, newName: string, newDescription?: string) => void;

    // Modals & Panels
    toggleEvolutionTracker: () => void;
    toggleConsole: () => void;
    setConsoleMessages: (messages: ConsoleMessage[]) => void;
    setConsoleErrorCount: (count: number) => void;

    // Contextual AI Panel
    openContextualAiPanel: (info: { dataAid: string; tagName: string; outerHTML?: string }, position: { top: number; left: number } | null) => void;
    closeContextualAiPanel: () => void;
    setContextualAiCommand: (command: string) => void;
    handleContextualQuickAction: (prompt: string) => void;
    handleContextualAiSubmit: (currentCode: string) => Promise<string | null>;
    handleAnalyzeElementWithAi: (currentCode: string) => Promise<void>;

    // Auto-Critique & Scoring System
    critiqueGeneratedCode: () => Promise<void>;
    handleApplyCritiqueRefinement: () => Promise<void>;
    autoApplyCritiqueImprovements: (critique: string) => Promise<void>;
    calculateImprovementScore: (oldCode: string, newCode: string, critique: string) => Promise<any>;
    analyzePerformance: (code: string) => any;
    analyzeAccessibility: (code: string) => any;
    analyzeResponsiveness: (code: string) => any;
    analyzeCodeQuality: (code: string) => any;
    analyzeUserExperience: (code: string) => any;

    // Other Modals... (Brainstorming, Theme, etc.)
    // Brainstorming
    openBrainstormingModal: () => void;
    closeBrainstormingModal: () => void;
    setBrainstormingTopic: (topic: string) => void;
    setBrainstormingMode: (mode: BrainstormingMode) => void;
    handleGenerateBrainstormIdeas: () => Promise<void>;

    // Theme Customizer
    openThemeModal: () => void;
    closeThemeModal: () => void;
    setCurrentThemeDescription: (description: string) => void;
    setCurrentThemeColors: (colors: ThemeColors) => void;
    handleSuggestThemeColors: () => Promise<void>;
    handleApplyThemeColors: (currentCode: string) => Promise<string | null>;

    // Task Manager
    openTaskManager: () => void;
    closeTaskManager: () => void;
    handleAddTask: (text: string) => void;
    handleToggleTask: (taskId: string) => void;
    handleRemoveTask: (taskId: string) => void;

    // Site Critic
    openSiteCriticModal: (currentCode: string) => Promise<void>;
    closeSiteCriticModal: () => void;

    // AI Code Insight
    openAiCodeInsightModal: (selectedCode: string, languageHint: string) => void;
    closeAiCodeInsightModal: () => void;
    handleRequestCodeExplanation: () => Promise<void>;
    handleRequestRefactoringSuggestion: () => Promise<void>;

    // Test Suggestions
    openTestSuggestionModal: (currentCode: string) => Promise<void>;
    closeTestSuggestionModal: () => void;

    // AI Code Doctor
    openAiCodeDoctorModal: (initialProblem?: string) => void;
    closeAiCodeDoctorModal: () => void;
    setAiCodeDoctorProblem: (problem: string) => void;
    handleAiCodeDoctorSubmit: (currentCode: string, problem: string) => Promise<void>;

    // API Key Modal
    openApiKeyModal: () => void;
    closeApiKeyModal: () => void;

    // Error Fallback
    triggerFallbackModal: (details: Omit<LastFailedOperationDetails, 'originalErrorMessage'>, error: Error) => void;
    closeAiErrorFallbackModal: () => void;
    handleFallbackRetrySimplePrompt: (currentCode: string) => Promise<void>;
    // ... other fallback handlers

    // Chat Mode
    switchToChatMode: (currentCode: string) => void;
    switchToEditorMode: () => string; // returns reconstructed HTML
    handleNewChat: () => void;
    handleSelectChat: (id: string) => void;
    handleDeleteChat: (id: string) => void;
    handleRenameChat: (id: string, newTitle: string) => void;
    handleSendMessage: (prompt: string) => Promise<void>;
    setActiveChatFile: (path: string | null) => void;
    handleFileContentChange: (path: string, newContent: string) => void;
    executeTerminalCommand: (command: string) => Promise<void>;

    // Streaming actions
    startCodeStreaming: (editorId: string, speed?: number) => void;
    stopCodeStreaming: () => void;
    setStreamingAutoScroll: (enabled: boolean) => void;
    setStreamingSpeed: (speed: number) => void;
    updateStreamingProgress: (progress: number) => void;

    // Granular status actions
    setDetailedStatus: (operation: string, phase: string, message: string, progress?: number, estimatedTime?: number) => void;
    clearDetailedStatus: () => void;
    updateStatusProgress: (progress: number) => void;

    // Multi-editor actions
    createEditorTab: (name: string, stack: TechStack, aiSpecialist: 'general' | 'frontend' | 'backend') => void;
    closeEditorTab: (tabId: string) => void;
    setActiveEditor: (editorId: string) => void;
    renameEditorTab: (tabId: string, newName: string) => void;
    reorderEditorTabs: (fromIndex: number, toIndex: number) => void;
    updateEditorContent: (tabId: string, content: string) => void;
    markEditorDirty: (tabId: string, isDirty: boolean) => void;
    setEditorInteractionState: (state: Partial<EditorInteractionState>) => void;

    // AI Specialist actions
    setActiveAiSpecialist: (specialist: 'general' | 'frontend' | 'backend') => void;
    toggleAiSpecialistPanel: () => void;
    toggleAiThinking: () => void;

    // 🎭 Ações do Sistema de Personas
    loadAvailablePersonas: () => void;
    selectPersona: (persona: AiPersona | null) => void;
    togglePersonaSelector: () => void;
    generateWithSelectedPersona: (prompt: string, currentCode: string) => Promise<void>;
    recommendPersonaForCurrentPrompt: (prompt: string) => void;
    clearPersonaRecommendation: () => void;

    // New Editor Modal
    openNewEditorModal: () => void;
    closeNewEditorModal: () => void;

    // Tech Stack Modal
    openTechStackModal: () => void;
    closeTechStackModal: () => void;
    selectTechStack: (stack: TechStack, specialist: 'general' | 'frontend' | 'backend') => void;

    // Intelligent Generation Functions
    generateBackendOnly: (prompt: string, plan: string, attachments: Part[]) => Promise<void>;
    generateFrontendOnly: (prompt: string, plan: string, attachments: Part[]) => Promise<void>;
    generateFullStackIntelligent: (prompt: string, plan: string, attachments: Part[]) => Promise<void>;
    generateFullStackUnified: (prompt: string, plan: string, attachments: Part[]) => Promise<void>;
}

// --- Helper Functions ---
function isFullStackRequest(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    return (lowerPrompt.includes("backend") && (lowerPrompt.includes("frontend") || lowerPrompt.includes(" full ") || lowerPrompt.includes("completa"))) ||
        lowerPrompt.includes("full-stack") || lowerPrompt.includes("fullstack") ||
        lowerPrompt.includes("aplicação completa") ||
        lowerPrompt.includes("agente de ia") || lowerPrompt.includes("mcp") ||
        (lowerPrompt.includes("api") && (lowerPrompt.includes("banco de dados") || lowerPrompt.includes("autenticação") || lowerPrompt.includes("login")));
}

function combineFrontendAndBackend(frontendHtml: string, backendSnippets: string): string {
    if (!frontendHtml) return backendSnippets; // Should not happen, but a safeguard
    if (!backendSnippets) return frontendHtml;

    const parser = new DOMParser();
    const doc = parser.parseFromString(frontendHtml, 'text/html');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = backendSnippets; // This contains the <script type="text/plain">...</script> tags

    Array.from(tempDiv.children).forEach(child => {
        // The child is a SCRIPT element from the backend snippets
        doc.body.appendChild(child.cloneNode(true));
    });

    return `<!DOCTYPE html>\n` + doc.documentElement.outerHTML;
}

const parseFilesFromHtml = (htmlContent: string): ProjectFile[] => {
    if (!htmlContent.trim()) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const files: ProjectFile[] = [];

    const scriptElements = Array.from(doc.querySelectorAll('script[type="text/plain"]'));
    scriptElements.forEach(scriptEl => {
        const path = scriptEl.getAttribute('data-path');
        const id = scriptEl.getAttribute('id');
        let finalPath: string | null = null;

        if (path) {
            finalPath = path;
        } else if (id === 'init-script-sh') {
            finalPath = 'init-project.sh';
        }

        if (finalPath) {
            files.push({
                path: finalPath,
                content: scriptEl.textContent || ''
            });
            scriptEl.remove();
        }
    });

    files.unshift({
        path: 'index.html',
        content: doc.documentElement.outerHTML
    });

    return files;
};

const reconstructHtmlFromFiles = (files: ProjectFile[]): string => {
    const mainHtmlFile = files.find(f => f.path === 'index.html');
    if (!mainHtmlFile) {
        console.error("Could not find 'index.html' in project files to reconstruct editor view.");
        return files[0]?.content || '<!-- Error: index.html not found -->';
    }

    const otherFiles = files.filter(f => f.path !== 'index.html');
    const parser = new DOMParser();
    const doc = parser.parseFromString(mainHtmlFile.content, 'text/html');

    doc.querySelectorAll('script[type="text/plain"][data-path], script[id="init-script-sh"]').forEach(el => el.remove());

    otherFiles.forEach(file => {
        const scriptEl = doc.createElement('script');
        scriptEl.type = 'text/plain';
        if (file.path === 'init-project.sh') {
            scriptEl.id = 'init-script-sh';
        } else {
            scriptEl.setAttribute('data-path', file.path);
        }
        scriptEl.textContent = file.content;
        doc.body.appendChild(scriptEl);
    });

    return doc.documentElement.outerHTML;
};

const generateQuickActionsForTag = (tagName: string): { label: string; prompt: string }[] => {
    const baseActions = [
        { label: 'Alterar estilo', prompt: 'Modernize o estilo deste elemento com CSS. Faça com que pareça mais premium.' },
        { label: 'Adicionar animação', prompt: 'Adicione uma animação sutil de entrada (fade-in) a este elemento.' },
        { label: 'Melhorar Acessibilidade', prompt: 'Adicione os atributos ARIA apropriados e melhore a acessibilidade deste elemento.' },
        { label: 'Duplicar', prompt: 'Duplique este elemento exatamente ao lado do original.' },
        { label: 'Remover', prompt: 'Remova completamente este elemento e seu conteúdo.' },
    ];

    const tagSpecificActions: { [key: string]: { label: string; prompt: string }[] } = {
        'H1': [{ label: 'Alterar texto', prompt: 'Altere o texto para algo mais impactante e direto.' }],
        'H2': [{ label: 'Alterar texto', prompt: 'Altere o texto para um subtítulo que complemente o título principal.' }],
        'P': [{ label: 'Alterar texto', prompt: 'Reescreva este parágrafo para ser mais conciso e persuasivo.' }],
        'BUTTON': [
            { label: 'Alterar texto', prompt: 'Altere o texto do botão para uma chamada para ação mais clara (ex: "Saiba Mais").' },
            { label: 'Mudar para secundário', prompt: 'Altere o estilo deste botão para ser um botão de ação secundário (ex: com borda e fundo transparente).' }
        ],
        'A': [
            { label: 'Alterar texto', prompt: 'Altere o texto do link.' },
            { label: 'Adicionar ícone', prompt: 'Adicione um ícone apropriado ao lado do texto do link.' }
        ],
        'IMG': [
            { label: 'Alterar imagem', prompt: 'Substitua esta imagem por outra que represente "tecnologia e inovação".' },
            { label: 'Adicionar legenda', prompt: 'Adicione um elemento <figcaption> abaixo da imagem com um texto descritivo.' }
        ],
        'SECTION': [{ label: 'Alterar cor de fundo', prompt: 'Altere a cor de fundo desta seção para um tom de cinza escuro sutilmente diferente do restante da página.' }],
        'DIV': [{ label: 'Transformar em card', prompt: 'Estilize este div para se parecer com um card moderno, com borda, sombra e padding.' }],
    };

    const specific = tagSpecificActions[tagName.toUpperCase()] || [];
    // Return a combined list, with specific actions first, limited to a total of 5 for a clean UI
    return [...specific, ...baseActions].slice(0, 5);
};


export const useAppStore = create(immer<AppState & AppActions>((set, get) => ({
    // Initial State
    appMode: 'editor',
    htmlCode: initialHtmlBase,
    isLoadingAi: false,
    isPreviewFullscreen: false,
    projectPlan: null,
    projectPlanSources: null,
    initialPlanPrompt: '',
    currentAppPhase: 'IDLE',
    aiStatusMessage: '👋 Bem-vindo ao AI Web Weaver! Descreva seu projeto para começar.',
    selectedTextModel: textModelOptions.find(m => m.isDefault)?.id || 'gemini-2.5-flash',
    currentProjectId: uuidv4(),
    loggedInteractions: [],
    lastUserPromptForLog: '',
    lastInitialGeminiCodeForLog: '',
    currentInteractionUserFeedback: null,
    previousHtmlCode: null,
    canUndoLastAiOperation: false,
    lastMajorOperationDescriptionForUndo: null,
    promptHistory: [],
    projectSnapshots: [],
    hasEditorSelection: false,
    researchFindings: null,
    isResearchPanelOpen: false,
    tasks: [],

    // Modals & Panels State
    isContextualAiPanelOpen: false,
    contextualAiTargetElementInfo: null,
    contextualAiCommand: '',
    contextualAiError: null,
    isLoadingContextualAi: false,
    contextualAiPanelPosition: null,
    contextualQuickActions: [],
    contextualAiAnalysisResults: null,
    isLoadingContextualAiAnalysis: false,
    isEvolutionTrackerOpen: false,
    evolutionTrackerProgress: [],
    isModelPlaygroundOpen: false,
    playgroundPrompt: '',
    baseModelPlaygroundOutput: '',
    finetunedModelPlaygroundOutput: '',
    isPlaygroundGenerating: false,
    isBrainstormingModalOpen: false,
    brainstormingTopic: '',
    brainstormingMode: 'Section Ideas',
    brainstormingResults: '',
    isBrainstormingLoading: false,
    isThemeModalOpen: false,
    currentThemeDescription: '',
    currentThemeColors: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B', background: '#F9FAFB', text: '#1F2937' },
    isSuggestingColors: false,
    isApplyingTheme: false,
    isTaskManagerOpen: false,
    isSiteCriticModalOpen: false,
    siteCritiqueResults: null,
    isLoadingSiteCritique: false,
    isSnapshotsModalOpen: false,
    isAiCodeInsightModalOpen: false,
    selectedCodeForInsight: null,
    aiInsightResult: null,
    isLoadingAiInsight: false,
    currentInsightType: null,
    selectedCodeLanguageHint: 'html',
    isAiErrorFallbackModalOpen: false,
    lastFailedOperationDetails: null,
    isTestSuggestionModalOpen: false,
    testSuggestions: null,
    isLoadingTestSuggestions: false,
    isAiCodeDoctorModalOpen: false,
    aiCodeDoctorAnalysisResult: null,
    isLoadingAiCodeDoctor: false,
    aiCodeDoctorProblemRef: null,
    isApiKeyModalOpen: false,
    autoCritiqueResult: null,
    isLoadingCritique: false,
    
    // 📊 SISTEMA DE PONTUAÇÃO - ESTADO INICIAL
    currentScore: null,
    scoreHistory: [],

    // Estados para geração separada Frontend/Backend
    frontendCode: null,
    backendCode: null,
    isGeneratingFrontend: false,
    isGeneratingBackend: false,
    isConnectingFrontendBackend: false,
    frontendQualityScore: 0,
    backendQualityScore: 0,
    integrationGuide: null,

    // Console State
    consoleMessages: [],
    isConsoleOpen: false,
    consoleErrorCount: 0,

    // Chat State
    chats: [],
    activeChatId: null,
    isGeneratingChatResponse: false,
    projectFiles: [],
    activeChatFile: null,
    terminalHistory: [],
    isTerminalBusy: false,

    // Advanced Research & Color System
    designResearch: null,
    isColorPaletteSelectorOpen: false,
    selectedColorPalette: null,
    isPerformingAdvancedResearch: false,

    // Streaming initial state
    isCodeStreaming: false,
    streamingEditorId: null,
    streamingProgress: 0,
    streamingSpeed: 30,
    streamingAutoScroll: true,

    // Enhanced status system
    detailedStatus: null,

    // Multi-editor preparation
    editorTabs: [{
        id: 'main',
        name: 'Principal',
        stack: 'html5-vanilla' as TechStack,
        content: initialHtmlBase,
        isActive: true,
        isDirty: false,
        aiSpecialist: 'general' as const,
        createdAt: new Date(),
        lastModified: new Date(),
        language: 'html'
    }],
    activeEditorId: 'main',
    editorInteractionState: {
        canEdit: true,
        canNavigate: true,
        canSelect: true,
        isStreaming: false
    },

    // AI Specialist system
    activeAiSpecialist: 'general',
    isAiSpecialistPanelVisible: true,
    isAiThinkingVisible: true,

    // 🎭 Sistema de Personas de IA - Estado Inicial
    availablePersonas: [],
    selectedPersona: null,
    isPersonaSelectorOpen: false,
    recommendedPersona: null,
    isGeneratingWithPersona: false,

    // New Editor Modal
    isNewEditorModalOpen: false,
    isCreatingEditor: false,

    // Tech Stack Modal
    isTechStackModalOpen: false,

    // --- ACTIONS ---

    init: () => {
        // Load main project
        const savedStateString = localStorage.getItem(WIP_LOCAL_STORAGE_KEY);
        if (savedStateString) {
            try {
                const savedState: StoredProjectState = JSON.parse(savedStateString);
                set(savedState);
                set({ aiStatusMessage: "Projeto anterior carregado do armazenamento local." });
            } catch (e) {
                console.warn("Falha ao carregar estado do LocalStorage:", e);
                localStorage.removeItem(WIP_LOCAL_STORAGE_KEY);
            }
        }
        // Load snapshots
        const savedSnapshotsString = localStorage.getItem(SNAPSHOTS_LOCAL_STORAGE_KEY);
        if (savedSnapshotsString) {
            try {
                set({ projectSnapshots: JSON.parse(savedSnapshotsString) });
            } catch (e) { console.warn("Falha ao carregar snapshots.", e); }
        }
        // Load chats
        const savedChatsString = localStorage.getItem(CHATS_LOCAL_STORAGE_KEY);
        if (savedChatsString) {
            try {
                const savedChats: StoredChatSession[] = JSON.parse(savedChatsString);
                if (savedChats.length > 0) {
                    set({ chats: savedChats, activeChatId: savedChats[0].id });
                }
            } catch (e) { console.warn("Falha ao carregar chats.", e); }
        }

        // 🎭 Inicializar Sistema de Personas
        get().loadAvailablePersonas();
    },

    setAppMode: (mode) => set({ appMode: mode }),
    setHtmlCode: (code) => set({ htmlCode: code }),
    setIsPreviewFullscreen: (isFullscreen) => set({ isPreviewFullscreen: isFullscreen }),
    setSelectedTextModel: (modelId) => set({ selectedTextModel: modelId }),
    setHasEditorSelection: (hasSelection) => set({ hasEditorSelection: hasSelection }),

    addPromptToHistory: (prompt) => {
        if (!prompt.trim()) return;
        set(state => {
            state.promptHistory = [prompt, ...state.promptHistory.filter(p => p !== prompt)].slice(0, MAX_PROMPT_HISTORY);
        });
    },

    logInteraction: (logData, userRatingValue) => {
        // Implementation here...
    },

    handleResetProject: () => {
        // ... Reset logic
        set({
            htmlCode: initialHtmlBase,
            projectPlan: null,
            initialPlanPrompt: '',
            loggedInteractions: [],
            tasks: [],
            autoCritiqueResult: null,
            // ... reset all other relevant states
            currentProjectId: uuidv4(),
            aiStatusMessage: '🔄 Projeto resetado! Pronto para criar algo novo e incrível.'
        });
        localStorage.removeItem(WIP_LOCAL_STORAGE_KEY);
    },

    critiqueGeneratedCode: async () => {
        const { htmlCode, initialPlanPrompt, projectPlan, selectedTextModel } = get();
        console.log('🔬 Iniciando crítica automática...', { htmlCode: htmlCode.length, initialPlanPrompt });
        
        if (htmlCode === initialHtmlBase || !htmlCode.trim()) {
            console.log('❌ Crítica cancelada: código vazio ou inicial');
            return;
        }
        
        set({ 
            isLoadingCritique: true, 
            autoCritiqueResult: null, 
            aiStatusMessage: "🎭 FASE 1/4: Validação do Manifesto do Artesão Digital..." 
        });
        
        try {
            // FASE 1: VALIDAÇÃO DO MANIFESTO DO ARTESÃO DIGITAL
            console.log('🎭 Executando validação do Manifesto...');
            const artisanValidation = ArtisanValidator.validateCode(htmlCode, initialPlanPrompt || '');
            console.log('✅ Validação concluída:', artisanValidation);
            
            set({ 
                aiStatusMessage: `🔬 FASE 2/4: Manifesto validado (${artisanValidation.score}/100). Executando crítica IA...` 
            });
            
            // FASE 2: CRÍTICA TRADICIONAL DA IA
            const critique = await critiqueGeneratedSite(htmlCode, initialPlanPrompt, projectPlan, selectedTextModel);
            
            // FASE 3: COMBINAR VALIDAÇÃO DO MANIFESTO COM CRÍTICA DA IA
            const combinedCritique = `
🎭 **VALIDAÇÃO DO MANIFESTO DO ARTESÃO DIGITAL:**
${artisanValidation.summary}

**PONTUAÇÃO POR PRINCÍPIO:**
• Experiência Primeiro: ${artisanValidation.principleScores.experience}/100
• Estrutura Semântica: ${artisanValidation.principleScores.structure}/100  
• Estilo Adaptativo: ${artisanValidation.principleScores.style}/100
• Interatividade Reativa: ${artisanValidation.principleScores.interactivity}/100
• Resiliência: ${artisanValidation.principleScores.resilience}/100
• Entrega Completa: ${artisanValidation.principleScores.delivery}/100

**VIOLAÇÕES ENCONTRADAS:**
${artisanValidation.violations.map(v => `❌ ${v}`).join('\n')}

**SUGESTÕES DE MELHORIA:**
${artisanValidation.suggestions.map(s => `💡 ${s}`).join('\n')}

🤖 **ANÁLISE COMPLEMENTAR DA IA:**
${critique}
`;
            
            set({ 
                autoCritiqueResult: combinedCritique, 
                aiStatusMessage: "🎯 FASE 3/4: Análise completa. Aplicando correções automaticamente..." 
            });
            
            // FASE 4: AUTO-APLICAÇÃO DAS CORREÇÕES (apenas se score < 80)
            if (artisanValidation.score < 80) {
                await get().autoApplyCritiqueImprovements(combinedCritique);
            } else {
                set({ 
                    aiStatusMessage: `✅ Código aprovado pelo Manifesto! Pontuação: ${artisanValidation.score}/100 🎭`,
                    autoCritiqueResult: null // Limpar crítica se código está bom
                });
            }
            
        } catch (critiqueError) {
            console.error("Failed to get auto-critique:", critiqueError);
            set({ aiStatusMessage: "❌ Falha na auto-avaliação. Código mantido como está." });
        } finally {
            set({ isLoadingCritique: false });
        }
    },

    // 🚀 NOVA FUNÇÃO: AUTO-APLICAÇÃO INTELIGENTE
    autoApplyCritiqueImprovements: async (critique: string) => {
        const { htmlCode, selectedTextModel } = get();
        
        set({
            aiStatusMessage: "🔧 FASE 3/3: Aplicando melhorias automaticamente...",
            previousHtmlCode: htmlCode,
            canUndoLastAiOperation: true,
            lastMajorOperationDescriptionForUndo: "Auto-Correção Inteligente",
        });

        // PROMPT INTELIGENTE PARA AUTO-CORREÇÃO
        const autoFixPrompt = `
🤖 **VOCÊ É UM SISTEMA DE AUTO-CORREÇÃO INTELIGENTE**

**MISSÃO:** Aplicar AUTOMATICAMENTE as melhorias identificadas na avaliação.

**AVALIAÇÃO RECEBIDA:**
${critique}

**CÓDIGO ATUAL:**
${htmlCode}

**INSTRUÇÕES DE AUTO-CORREÇÃO:**
1. **ANALISAR** cada ponto da avaliação
2. **APLICAR** as correções necessárias
3. **MANTER** a identidade visual existente
4. **MELHORAR** sem quebrar funcionalidades
5. **OTIMIZAR** performance e acessibilidade

**REGRAS DE AUTO-CORREÇÃO:**
- ✅ Corrigir bugs identificados
- ✅ Melhorar responsividade
- ✅ Otimizar performance
- ✅ Aumentar acessibilidade
- ✅ Refinar UX/UI
- ❌ NÃO mudar cores/fontes drasticamente
- ❌ NÃO quebrar funcionalidades existentes
- ❌ NÃO alterar estrutura fundamental

**RETORNE APENAS O CÓDIGO HTML CORRIGIDO E MELHORADO.**
`;

        try {
            let finalCode = "";
            const stream = generateAiResponseStream(autoFixPrompt, 'refine_code_no_plan', selectedTextModel, false, null, htmlCode, null, []);
            
            for await (const chunk of stream) {
                finalCode += chunk.chunk;
                set({ htmlCode: finalCode });
            }

            // 🎨 SISTEMA DE GERAÇÃO AUTOMÁTICA DE IMAGENS
            let finalCodeWithImages = finalCode;
            if (finalCode.includes('ai-researched-image://')) {
                try {
                    const { processHtmlAndGenerateImages } = await import('../services/GeminiImageService');
                    const result = await processHtmlAndGenerateImages(finalCode, () => {});
                    finalCodeWithImages = result.htmlContent;
                } catch (imageError) {
                    console.error('Erro na geração de imagens:', imageError);
                }
            }

            // 📊 CALCULAR PONTUAÇÃO DE MELHORIA
            const improvementScore = await get().calculateImprovementScore(htmlCode, finalCodeWithImages, critique);
            
            // 📈 SALVAR NO HISTÓRICO
            const newScoreEntry = {
                timestamp: Date.now(),
                score: improvementScore.totalScore,
                improvements: improvementScore.improvements
            };
            
            set({ 
                htmlCode: finalCodeWithImages,
                aiStatusMessage: `✅ Auto-correção concluída! Pontuação: ${improvementScore.totalScore}/100 📊`,
                autoCritiqueResult: null, // Limpar crítica após aplicar
                currentScore: improvementScore,
                scoreHistory: [...get().scoreHistory, newScoreEntry]
            });

            // 🔄 NOVA AVALIAÇÃO APÓS CORREÇÕES (se necessário)
            if (improvementScore.totalScore < 85) {
                setTimeout(() => {
                    set({ aiStatusMessage: "🔄 Pontuação ainda baixa. Iniciando nova rodada de melhorias..." });
                    get().critiqueGeneratedCode();
                }, 2000);
            }

        } catch (error) {
            console.error('Erro na auto-correção:', error);
            set({ 
                htmlCode: get().previousHtmlCode || htmlCode,
                aiStatusMessage: "❌ Erro na auto-correção. Código restaurado." 
            });
        }
    },

    // 📊 SISTEMA DE PONTUAÇÃO INTELIGENTE
    calculateImprovementScore: async (oldCode: string, newCode: string, critique: string) => {
        const score = {
            performance: 0,
            accessibility: 0,
            responsiveness: 0,
            codeQuality: 0,
            userExperience: 0,
            totalScore: 0,
            improvements: [] as string[],
            metrics: {} as any
        };

        try {
            // 🚀 ANÁLISE DE PERFORMANCE
            const performanceMetrics = get().analyzePerformance(newCode);
            score.performance = performanceMetrics.score;
            score.metrics.performance = performanceMetrics;

            // ♿ ANÁLISE DE ACESSIBILIDADE
            const accessibilityMetrics = get().analyzeAccessibility(newCode);
            score.accessibility = accessibilityMetrics.score;
            score.metrics.accessibility = accessibilityMetrics;

            // 📱 ANÁLISE DE RESPONSIVIDADE
            const responsivenessMetrics = get().analyzeResponsiveness(newCode);
            score.responsiveness = responsivenessMetrics.score;
            score.metrics.responsiveness = responsivenessMetrics;

            // 🧹 ANÁLISE DE QUALIDADE DE CÓDIGO
            const codeQualityMetrics = get().analyzeCodeQuality(newCode);
            score.codeQuality = codeQualityMetrics.score;
            score.metrics.codeQuality = codeQualityMetrics;

            // 🎨 ANÁLISE DE EXPERIÊNCIA DO USUÁRIO
            const uxMetrics = get().analyzeUserExperience(newCode);
            score.userExperience = uxMetrics.score;
            score.metrics.userExperience = uxMetrics;

            // 📊 CÁLCULO DA PONTUAÇÃO TOTAL
            score.totalScore = Math.round(
                (score.performance * 0.25) +
                (score.accessibility * 0.20) +
                (score.responsiveness * 0.20) +
                (score.codeQuality * 0.20) +
                (score.userExperience * 0.15)
            );

            // 📈 IDENTIFICAR MELHORIAS
            if (score.performance > 80) score.improvements.push("✅ Performance otimizada");
            if (score.accessibility > 80) score.improvements.push("✅ Acessibilidade aprimorada");
            if (score.responsiveness > 80) score.improvements.push("✅ Responsividade melhorada");
            if (score.codeQuality > 80) score.improvements.push("✅ Código limpo e organizado");
            if (score.userExperience > 80) score.improvements.push("✅ UX/UI refinada");

            console.log('📊 PONTUAÇÃO DE MELHORIA:', score);
            return score;

        } catch (error) {
            console.error('Erro no cálculo de pontuação:', error);
            return { ...score, totalScore: 50 }; // Pontuação padrão em caso de erro
        }
    },

    // 🚀 ANÁLISE DE PERFORMANCE
    analyzePerformance: (code: string) => {
        let score = 100;
        const issues = [];

        // Verificar tamanho do código
        const codeSize = code.length;
        if (codeSize > 100000) { score -= 20; issues.push("Código muito extenso"); }
        else if (codeSize > 50000) { score -= 10; issues.push("Código grande"); }

        // Verificar otimizações
        if (!code.includes('loading="lazy"')) { score -= 15; issues.push("Falta lazy loading"); }
        if (code.includes('setInterval') && !code.includes('clearInterval')) { score -= 10; issues.push("Memory leaks potenciais"); }
        if ((code.match(/src="data:/g) || []).length > 5) { score -= 10; issues.push("Muitas imagens inline"); }
        if (!code.includes('defer') && !code.includes('async')) { score -= 5; issues.push("Scripts não otimizados"); }

        return { score: Math.max(0, score), issues, metrics: { codeSize, hasLazyLoading: code.includes('loading="lazy"') } };
    },

    // ♿ ANÁLISE DE ACESSIBILIDADE
    analyzeAccessibility: (code: string) => {
        let score = 100;
        const issues = [];

        // Verificar atributos alt
        const images = (code.match(/<img/g) || []).length;
        const alts = (code.match(/alt="/g) || []).length;
        if (images > alts) { score -= 20; issues.push(`${images - alts} imagens sem alt`); }

        // Verificar estrutura semântica
        if (!code.includes('<main')) { score -= 15; issues.push("Falta tag main"); }
        if (!code.includes('<header')) { score -= 10; issues.push("Falta tag header"); }
        if (!code.includes('<nav')) { score -= 10; issues.push("Falta tag nav"); }

        // Verificar ARIA
        if (!code.includes('aria-')) { score -= 15; issues.push("Falta atributos ARIA"); }
        if (!code.includes('role=')) { score -= 10; issues.push("Falta atributos role"); }

        // Verificar contraste (básico)
        if (code.includes('color: white') && code.includes('background: white')) { score -= 25; issues.push("Problema de contraste"); }

        return { score: Math.max(0, score), issues, metrics: { images, alts, hasAria: code.includes('aria-') } };
    },

    // 📱 ANÁLISE DE RESPONSIVIDADE
    analyzeResponsiveness: (code: string) => {
        let score = 100;
        const issues = [];

        // Verificar viewport
        if (!code.includes('viewport')) { score -= 30; issues.push("Falta meta viewport"); }

        // Verificar media queries
        const mediaQueries = (code.match(/@media/g) || []).length;
        if (mediaQueries === 0) { score -= 25; issues.push("Sem media queries"); }
        else if (mediaQueries < 2) { score -= 10; issues.push("Poucas media queries"); }

        // Verificar flexbox/grid
        if (!code.includes('flex') && !code.includes('grid')) { score -= 20; issues.push("Layout não responsivo"); }

        // Verificar unidades responsivas
        if (!code.includes('rem') && !code.includes('em') && !code.includes('vw') && !code.includes('vh')) { 
            score -= 15; issues.push("Unidades não responsivas"); 
        }

        return { score: Math.max(0, score), issues, metrics: { mediaQueries, hasFlexGrid: code.includes('flex') || code.includes('grid') } };
    },

    // 🧹 ANÁLISE DE QUALIDADE DE CÓDIGO
    analyzeCodeQuality: (code: string) => {
        let score = 100;
        const issues = [];

        // Verificar estrutura HTML
        if (!code.includes('<!DOCTYPE html>')) { score -= 20; issues.push("Falta DOCTYPE"); }
        if (!code.includes('<html lang=')) { score -= 10; issues.push("Falta lang attribute"); }

        // Verificar organização CSS
        const cssBlocks = (code.match(/<style>/g) || []).length;
        if (cssBlocks > 3) { score -= 10; issues.push("CSS fragmentado"); }

        // Verificar JavaScript
        if (code.includes('var ')) { score -= 15; issues.push("Uso de var (usar let/const)"); }
        if (code.includes('document.write')) { score -= 20; issues.push("Uso de document.write"); }

        // Verificar comentários
        const comments = (code.match(/<!--/g) || []).length + (code.match(/\/\*/g) || []).length;
        if (comments === 0 && code.length > 10000) { score -= 5; issues.push("Falta documentação"); }

        return { score: Math.max(0, score), issues, metrics: { cssBlocks, comments, hasDoctype: code.includes('<!DOCTYPE html>') } };
    },

    // 🎨 ANÁLISE DE EXPERIÊNCIA DO USUÁRIO
    analyzeUserExperience: (code: string) => {
        let score = 100;
        const issues = [];

        // Verificar interatividade
        const buttons = (code.match(/<button/g) || []).length;
        const clickEvents = (code.match(/onclick=/g) || []).length + (code.match(/addEventListener.*click/g) || []).length;
        if (buttons > 0 && clickEvents === 0) { score -= 15; issues.push("Botões sem funcionalidade"); }

        // Verificar feedback visual
        if (!code.includes('hover:') && !code.includes(':hover')) { score -= 10; issues.push("Falta feedback hover"); }
        if (!code.includes('transition') && !code.includes('animation')) { score -= 10; issues.push("Falta transições"); }

        // Verificar loading states
        if (code.includes('fetch') && !code.includes('loading')) { score -= 15; issues.push("Falta loading states"); }

        // Verificar formulários
        const forms = (code.match(/<form/g) || []).length;
        const validations = (code.match(/required/g) || []).length;
        if (forms > 0 && validations === 0) { score -= 10; issues.push("Formulários sem validação"); }

        return { score: Math.max(0, score), issues, metrics: { buttons, clickEvents, hasTransitions: code.includes('transition') } };
    },

    handleApplyCritiqueRefinement: async () => {
        const { autoCritiqueResult, htmlCode, selectedTextModel } = get();
        if (!autoCritiqueResult) return;

        set({
            isLoadingAi: true,
            aiStatusMessage: "✨ Aplicando melhorias e otimizações sugeridas pela IA...",
            currentAppPhase: 'AWAITING_CODE_MODIFICATION',
            previousHtmlCode: htmlCode,
            canUndoLastAiOperation: true,
            lastMajorOperationDescriptionForUndo: "Aplicar Crítica da IA",
            autoCritiqueResult: null,
        });

        const refinementPrompt = `Baseado na seguinte crítica, refine o código HTML fornecido. Apenas retorne o código HTML completo e atualizado.\n\nCRÍTICA:\n${autoCritiqueResult}`;

        try {
            let finalCode = "";
            const stream = generateAiResponseStream(refinementPrompt, 'refine_code_no_plan', selectedTextModel, false, null, htmlCode, null, []);
            for await (const chunk of stream) {
                finalCode += chunk.chunk;
                set({ htmlCode: finalCode });
            }

            // 🎨 SISTEMA DE GERAÇÃO AUTOMÁTICA DE IMAGENS
            let finalCodeWithImages = finalCode;
            if (finalCode.includes('ai-researched-image://')) {
                try {
                    console.log('🎨 Detectados placeholders de imagem, iniciando geração...');
                    
                    // Importar dinamicamente o serviço de imagens
                    const { processHtmlAndGenerateImages } = await import('../services/GeminiImageService');
                    
                    const result = await processHtmlAndGenerateImages(
                        finalCode,
                        (current, total, description) => {
                            console.log(`📸 Gerando imagem ${current}/${total}: ${description.substring(0, 30)}...`);
                        }
                    );
                    
                    finalCodeWithImages = result.htmlContent;
                    console.log(`✅ ${result.imagesGenerated} imagens geradas automaticamente!`);
                    
                } catch (imageError) {
                    console.error('⚠️ Erro na geração de imagens, continuando sem imagens:', imageError);
                    // Continuar sem imagens em caso de erro
                }
            }

            const finalCodeWithMedia = await postProcessHtmlWithMedia(finalCodeWithImages);

            set({
                htmlCode: finalCodeWithMedia,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: 'Código refinado com sucesso com base na auto-crítica!',
            });

            await get().critiqueGeneratedCode();

        } catch (error) {
            console.error("Erro ao aplicar refinamento da crítica:", error);
            set({ aiStatusMessage: `Erro ao aplicar melhorias: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
        } finally {
            set({ isLoadingAi: false });
        }
    },

    // NOVA FUNÇÃO: Sistema Anti-Simulação Integrado
    handleAiCommandWithAntiSimulation: async (prompt, currentCode, attachments, action, forceFullStack, arquitetaUnica, artesaoMundos) => {
        if (!prompt.trim() && !action && (!attachments || attachments.length === 0)) {
            set({ aiStatusMessage: "Por favor, insira uma instrução para a IA." });
            return;
        }

        const { selectedPersona, selectedTextModel, isAntiSimulationEnabled } = get();

        // VERIFICAR SE ANTI-SIMULAÇÃO ESTÁ HABILITADA
        if (!isAntiSimulationEnabled) {
            console.log('⚠️ Anti-simulação desabilitada. Usando sistema refinado menos restritivo.');
            
            // Usar sistema anti-simulação refinado (menos restritivo)
            const { AntiSimulationRefiner } = await import('../services/AntiSimulationRefiner');
            
            // Executar geração normal primeiro
            const result = await get().handleAiCommand(prompt, currentCode, attachments, action, forceFullStack, arquitetaUnica, artesaoMundos);
            
            // NOVO: Aplicar sistema de auto-avaliação inteligente da IA
            setTimeout(async () => {
                const currentCode = get().htmlCode;
                if (currentCode && currentCode.length > 100) {
                    console.log('🤖 Iniciando auto-avaliação inteligente da IA...');
                    
                    try {
                        // Importar sistema de auto-avaliação
                        const { aiSelfEvaluationSystem } = await import('../services/AISelfevaluationSystem');
                        
                        // Executar ciclo completo: Auto-avaliação → Auto-pontuação → Auto-correção
                        const selfImprovementResult = await aiSelfEvaluationSystem.executeFullSelfImprovementCycle(
                            currentCode,
                            prompt,
                            90 // Score mínimo desejado
                        );
                        
                        console.log(`📊 Auto-avaliação: ${selfImprovementResult.originalScore} → ${selfImprovementResult.finalScore} pontos`);
                        
                        // Aplicar código melhorado se houve melhoria significativa
                        if (selfImprovementResult.finalScore > selfImprovementResult.originalScore + 5) {
                            console.log('✨ IA se auto-corrigiu! Aplicando melhorias...');
                            set({ 
                                htmlCode: selfImprovementResult.finalCode,
                                aiStatusMessage: `🧠 IA se auto-avaliou e melhorou: ${selfImprovementResult.originalScore} → ${selfImprovementResult.finalScore} pontos`
                            });
                            
                            // Log das melhorias aplicadas
                            selfImprovementResult.correctionDetails.changesApplied.forEach(change => {
                                console.log(`🔧 ${change}`);
                            });
                        } else {
                            console.log('✅ Código já estava em boa qualidade segundo auto-avaliação da IA');
                        }
                        
                        // Fallback: Sistema universal de pontuação como backup
                        const { UniversalScoringSystem } = await import('../services/UniversalScoringSystem');
                        const backupScore = await UniversalScoringSystem.evaluateCodeAfterGeneration(
                            selfImprovementResult.finalCode, 
                            'ai-self-evaluation'
                        );
                        
                        if (backupScore.score < 75) {
                            console.log('🔄 Aplicando correção adicional via sistema universal...');
                            const finalCode = await UniversalScoringSystem.autoCorrectIfNeeded(
                                selfImprovementResult.finalCode, 
                                backupScore
                            );
                            
                            if (finalCode !== selfImprovementResult.finalCode) {
                                set({ htmlCode: finalCode });
                            }
                        }
                        
                    } catch (error) {
                        console.error('❌ Erro na auto-avaliação da IA:', error);
                        
                        // Fallback para sistema anterior em caso de erro
                        const { AntiSimulationRefiner } = await import('../services/AntiSimulationRefiner');
                        const refinementResult = await AntiSimulationRefiner.refineAntiSimulation(currentCode);
                        
                        if (!refinementResult.passed) {
                            console.log('🔧 Aplicando correções de simulação (fallback)...');
                            set({ htmlCode: refinementResult.refinedCode });
                        }
                    }
                }
            }, 1500); // Aumentado para 1.5s para dar tempo da IA processar
            
            return result;
        }

        // ===== NOVO: VERIFICAR SE DEVE USAR MODO ARQUITETA ÚNICA =====
        if (arquitetaUnica && !action) {
            console.log('🏗️ MODO ARQUITETA ÚNICA + ANTI-SIMULAÇÃO ATIVADO - App completo em 2 arquivos');
            await get().handleArquitetaUnicaGeneration(prompt, currentCode, attachments);
            return;
        }

        // ===== NOVO: VERIFICAR SE DEVE USAR MODO FULLSTACK =====
        if (forceFullStack && !action) {
            console.log('🔥 MODO FULLSTACK + ANTI-SIMULAÇÃO ATIVADO - Usando sistema Frontend-First com streaming');
            await get().handleFullStackStreamingGeneration(prompt, currentCode, attachments);
            return;
        }

        set(state => {
            state.isLoadingAi = true;
            state.previousHtmlCode = currentCode;
            state.lastMajorOperationDescriptionForUndo = `IA Anti-Simulação: ${action || prompt.substring(0, 30)}...`;
            state.canUndoLastAiOperation = true;
            state.projectPlanSources = null;
            state.researchFindings = null;
            state.isResearchPanelOpen = false;
            state.consoleMessages = [];
            state.consoleErrorCount = 0;
            state.currentInteractionUserFeedback = null;
            state.autoCritiqueResult = null;
        });

        let actualPrompt = action === 'GENERATE_CODE_FROM_PLAN' ? prompt : prompt;
        set({ lastUserPromptForLog: actualPrompt });

        try {
            // Detectar tipo de projeto
            const projectType = detectProjectTypeFromPrompt(actualPrompt);

            // Configurar status baseado no tipo
            if (projectType === 'fullstack') {
                set({
                    currentAppPhase: 'GENERATING_BACKEND',
                    aiStatusMessage: '🚀 SISTEMA ANTI-SIMULAÇÃO: Gerando aplicação fullstack REAL e FUNCIONAL...'
                });
                get().setDetailedStatus('Anti-Simulação', 'Backend Real', 'Criando APIs funcionais, banco de dados e autenticação...', 10, 40);
            } else if (projectType === 'clone') {
                set({
                    currentAppPhase: 'GENERATING_CODE_FROM_PLAN',
                    aiStatusMessage: '🎯 SISTEMA ANTI-SIMULAÇÃO: Criando clone EXATO e FUNCIONAL...'
                });
                get().setDetailedStatus('Anti-Simulação', 'Clone Funcional', 'Replicando interface e funcionalidades reais...', 10, 30);
            } else {
                set({
                    currentAppPhase: 'GENERATING_CODE_FROM_PLAN',
                    aiStatusMessage: '⚡ SISTEMA ANTI-SIMULAÇÃO: Gerando código PRODUCTION-READY...'
                });
                get().setDetailedStatus('Anti-Simulação', 'Código Real', 'Implementando funcionalidades completas...', 10, 25);
            }

            // ATIVAR streaming visual no editor (mesmo sem streaming real)
            set(state => {
                state.editorInteractionState.isStreaming = true;
            });

            // Simular progresso durante geração
            let progress = 10;
            const progressInterval = setInterval(() => {
                progress = Math.min(progress + 5, 75);
                get().updateStatusProgress(progress);
            }, 500);

            // Usar sistema anti-simulação
            const result = await generateProductionReadyCode(actualPrompt, {
                currentCode: currentCode === initialHtmlBase ? undefined : currentCode,
                projectType,
                techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind'],
                enforceIntegration: true,
                maxRetries: 3
            });

            // Parar simulação de progresso
            clearInterval(progressInterval);
            get().updateStatusProgress(80);

            // DESATIVAR streaming
            set(state => {
                state.editorInteractionState.isStreaming = false;
            });

            // Validar qualidade do código
            if (!result.isProductionReady) {
                set({ aiStatusMessage: '⚠️ Código não atende padrões production-ready. Regenerando...' });

                // Tentar novamente com prompt mais específico
                const enhancedPrompt = `${actualPrompt}

**ATENÇÃO: CÓDIGO ANTERIOR NÃO ERA PRODUCTION-READY!**

VOCÊ DEVE GERAR:
- Código 100% funcional
- Integrações reais (Stripe, banco de dados)
- Autenticação completa
- APIs funcionais
- Zero simulações ou placeholders

REGENERE AGORA COM QUALIDADE ENTERPRISE.`;

                const retryResult = await generateProductionReadyCode(enhancedPrompt, {
                    currentCode: currentCode === initialHtmlBase ? undefined : currentCode,
                    projectType,
                    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind'],
                    enforceIntegration: true,
                    maxRetries: 1
                });

                result.code = retryResult.code;
                result.isProductionReady = retryResult.isProductionReady;
            }

            get().updateStatusProgress(100);

            // Mostrar código gerado imediatamente no preview
            set({ htmlCode: result.code });

            // Atualizar editor Monaco também
            const editorRef = (window as any).globalEditorRef;
            if (editorRef?.current) {
                const model = editorRef.current.getModel();
                if (model) {
                    const fullRange = model.getFullModelRange();
                    editorRef.current.executeEdits('anti-simulation-generation', [{
                        range: fullRange,
                        text: result.code
                    }]);
                }
            }

            // 🎨 SISTEMA DE GERAÇÃO AUTOMÁTICA DE IMAGENS
            let finalCodeWithImages = result.code;
            if (result.code.includes('ai-researched-image://')) {
                try {
                    console.log('🎨 Detectados placeholders de imagem, iniciando geração...');
                    set({ aiStatusMessage: '🎨 Gerando imagens profissionais com IA...' });
                    
                    // Importar dinamicamente o serviço de imagens
                    const { processHtmlAndGenerateImages } = await import('../services/GeminiImageService');
                    
                    const imageResult = await processHtmlAndGenerateImages(
                        result.code,
                        (current, total, description) => {
                            console.log(`📸 Gerando imagem ${current}/${total}: ${description.substring(0, 30)}...`);
                            set({ aiStatusMessage: `🎨 Gerando imagem ${current}/${total}: ${description.substring(0, 40)}...` });
                        }
                    );
                    
                    finalCodeWithImages = imageResult.htmlContent;
                    console.log(`✅ ${imageResult.imagesGenerated} imagens geradas automaticamente!`);
                    
                    // Atualizar o HTML com as imagens geradas
                    set({ htmlCode: finalCodeWithImages });
                    
                    // Comprimir URLs para o editor (manter código limpo)
                    const { compressImageUrls } = await import('../services/ImageUrlExpander');
                    const compressedCodeForEditor = compressImageUrls(finalCodeWithImages);
                    
                    // Atualizar editor com código comprimido
                    if (editorRef?.current) {
                        const model = editorRef.current.getModel();
                        if (model) {
                            const fullRange = model.getFullModelRange();
                            editorRef.current.executeEdits('anti-simulation-images', [{
                                range: fullRange,
                                text: compressedCodeForEditor
                            }]);
                        }
                    }
                    
                } catch (imageError) {
                    console.error('⚠️ Erro na geração de imagens, continuando sem imagens:', imageError);
                    // Continuar sem imagens em caso de erro
                }
            }

            // Aplicar pós-processamento de mídia
            const finalCode = await postProcessHtmlWithMedia(finalCodeWithImages);

            // Atualizar estado com código gerado
            set({
                htmlCode: finalCode,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: `✅ CÓDIGO PRODUCTION-READY GERADO! Qualidade: ${result.integrationScore.toFixed(0)}% | Funcionalidades: ${result.hasRealFunctionality ? 'REAIS' : 'SIMULADAS'}`,
                isLoadingAi: false
            });

            // Limpar status detalhado após delay
            setTimeout(() => get().clearDetailedStatus(), 3000);

            // Log da interação
            get().logInteraction(actualPrompt, finalCode, 'anti_simulation_generation');

            // Auto-crítica do código gerado
            setTimeout(async () => {
                try {
                    set({ isLoadingCritique: true });
                    const { projectPlan, selectedTextModel } = get();
                    const critique = await critiqueGeneratedSite(finalCode, actualPrompt, projectPlan, selectedTextModel);
                    set({
                        autoCritiqueResult: critique,
                        isLoadingCritique: false
                    });
                } catch (error) {
                    console.error('Erro na auto-crítica:', error);
                    set({ isLoadingCritique: false });
                }
            }, 2000);

        } catch (error: any) {
            console.error('Erro no sistema anti-simulação:', error);

            set({
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: `❌ Erro no sistema anti-simulação: ${error.message}`,
                isLoadingAi: false
            });

            get().clearDetailedStatus();

            // Fallback para método tradicional
            setTimeout(() => {
                set({ aiStatusMessage: '🔄 Tentando método tradicional como fallback...' });
                get().handleAiCommand(prompt, currentCode, attachments, action);
            }, 2000);
        }
    },

    handleAiCommand: async (prompt, currentCode, attachments, action, forceFullStack, arquitetaUnica, artesaoMundos) => {
        if (!prompt.trim() && !action && (!attachments || attachments.length === 0)) {
            set({ aiStatusMessage: "Por favor, insira uma instrução para a IA." });
            return;
        }

        // ===== NOVO: VERIFICAR SE DEVE USAR MODO ARTESÃO DE MUNDOS =====
        if (artesaoMundos && !action) {
            console.log('🎮 MODO ARTESÃO DE MUNDOS ATIVADO - Jogos 3D com Three.js');
            await get().handleArtesaoMundosGeneration(prompt, currentCode, attachments);
            return;
        }

        // ===== NOVO: VERIFICAR SE DEVE USAR MODO ARQUITETA ÚNICA =====
        if (arquitetaUnica && !action) {
            console.log('🏗️ MODO ARQUITETA ÚNICA ATIVADO - App completo em 2 arquivos');
            await get().handleArquitetaUnicaGeneration(prompt, currentCode, attachments);
            return;
        }

        // ===== NOVO: VERIFICAR SE DEVE USAR MODO FULLSTACK =====
        if (forceFullStack && !action) {
            console.log('🔥 MODO FULLSTACK ATIVADO - Usando sistema Frontend-First com streaming');
            await get().handleFullStackStreamingGeneration(prompt, currentCode, attachments);
            return;
        }

        // ===== INTEGRAÇÃO DO AUTO-AVALIADOR SEMPRE ATIVO =====
        const enableAutoEvaluator = true; // Sempre ativo independente do anti-simulação

        set(state => {
            state.isLoadingAi = true;
            state.previousHtmlCode = currentCode;
            state.lastMajorOperationDescriptionForUndo = `IA: ${action || prompt.substring(0, 30)}...`;
            state.canUndoLastAiOperation = true;
            state.projectPlanSources = null;
            state.researchFindings = null;
            state.isResearchPanelOpen = false;
            state.consoleMessages = [];
            state.consoleErrorCount = 0;
            state.currentInteractionUserFeedback = null;
            state.autoCritiqueResult = null;
        });

        // ===== AUTO-AVALIADOR SEMPRE ATIVO =====
        const setupAutoEvaluator = () => {
            setTimeout(async () => {
                const currentGeneratedCode = get().htmlCode;
                if (currentGeneratedCode && currentGeneratedCode.length > 100) {
                    console.log('🤖 Iniciando auto-avaliação inteligente da IA...');
                    
                    try {
                        // Importar sistema de auto-avaliação
                        const { aiSelfEvaluationSystem } = await import('../services/AISelfevaluationSystem');
                        
                        // Executar ciclo completo: Auto-avaliação → Auto-pontuação → Auto-correção
                        const selfImprovementResult = await aiSelfEvaluationSystem.executeFullSelfImprovementCycle(
                            currentGeneratedCode,
                            prompt,
                            90 // Score mínimo desejado
                        );
                        
                        console.log(`📊 Auto-avaliação: ${selfImprovementResult.originalScore} → ${selfImprovementResult.finalScore} pontos`);
                        
                        // Aplicar código melhorado se houve melhoria significativa
                        if (selfImprovementResult.finalScore > selfImprovementResult.originalScore + 5) {
                            console.log('✨ IA se auto-corrigiu! Aplicando melhorias...');
                            set({ 
                                htmlCode: selfImprovementResult.finalCode,
                                aiStatusMessage: `🧠 IA se auto-avaliou e melhorou: ${selfImprovementResult.originalScore} → ${selfImprovementResult.finalScore} pontos`
                            });
                            
                            // Log das melhorias aplicadas
                            selfImprovementResult.correctionDetails.changesApplied.forEach(change => {
                                console.log(`🔧 ${change}`);
                            });
                        } else {
                            console.log('✅ Código já estava em boa qualidade segundo auto-avaliação da IA');
                        }
                        
                    } catch (error) {
                        console.error('❌ Erro na auto-avaliação da IA:', error);
                    }
                }
            }, 2000); // 2 segundos após a geração
        };
        get().addPromptToHistory(prompt);

        const { selectedTextModel, initialPlanPrompt } = get();
        let { projectPlan } = get();

        let actualPrompt = action === 'GENERATE_CODE_FROM_PLAN' && initialPlanPrompt ? initialPlanPrompt : prompt;
        set({ lastUserPromptForLog: actualPrompt });

        const attachmentParts: Part[] = attachments ? attachments.map(att => ({
            inlineData: {
                mimeType: att.mimeType,
                data: att.data
            }
        })) : [];

        try {
            // Path A: Initial prompt -> Create a plan and then stop.
            if (!projectPlan && !action) {
                set({ currentAppPhase: 'PERFORMING_RESEARCH', aiStatusMessage: '🔍 Analisando mercado, tendências de design e stack tecnológico ideal...' });
                get().setDetailedStatus('Research', 'Análise de Mercado', 'Pesquisando tendências e referências...', 10, 30);

                const researchResults = await performSpecializedResearch(actualPrompt, selectedTextModel);
                get().updateStatusProgress(50);

                set({ researchFindings: researchResults, isResearchPanelOpen: true, aiStatusMessage: '📊 Pesquisa concluída! Criando plano detalhado baseado nas descobertas...' });
                get().setDetailedStatus('Analysis', 'Geração de Plano', 'Criando plano detalhado do projeto...', 70, 15);

                const codeForPlanning = currentCode === initialHtmlBase ? null : currentCode;

                const planResponse = await generateAiResponse(actualPrompt, 'create_plan', selectedTextModel, null, codeForPlanning, actualPrompt, researchResults, attachmentParts);
                if (planResponse.type === AiResponseType.PLAN) {
                    get().updateStatusProgress(100);
                    setTimeout(() => get().clearDetailedStatus(), 2000);

                    set({
                        projectPlan: planResponse.content,
                        currentAppPhase: 'PLAN_DISPLAYED',
                        aiStatusMessage: '📋 Plano estratégico criado! Revise os detalhes ou inicie a geração de código.',
                        initialPlanPrompt: actualPrompt,
                        isLoadingAi: false // Stop loading
                    });
                    return;
                } else {
                    throw new Error("A resposta da IA não foi um plano como esperado.");
                }
            }
            // Path B: User clicked "Refine Plan"
            else if (action === 'REFINE_PLAN') {
                if (!projectPlan) throw new Error("Tentativa de refinar um plano inexistente.");
                set({ currentAppPhase: 'REFINING_PLAN', aiStatusMessage: 'Refinando o plano do projeto...' });
                const planResponse = await generateAiResponse(prompt, 'refine_plan', selectedTextModel, projectPlan, null, null, null, attachmentParts);
                if (planResponse.type === AiResponseType.PLAN) {
                    set({
                        projectPlan: planResponse.content,
                        currentAppPhase: 'PLAN_DISPLAYED',
                        aiStatusMessage: 'Plano refinado! Revise novamente ou clique em "Gerar Código".',
                        isLoadingAi: false, // Stop loading
                    });
                    return;
                } else {
                    throw new Error("A resposta da IA não foi um plano como esperado durante o refinamento.");
                }
            }
            // Path C: User clicked "Generate Code"
            else if (action === 'GENERATE_CODE_FROM_PLAN') {
                if (!projectPlan) throw new Error("Tentativa de gerar código sem um plano.");
                const { selectedGenerationType } = get();
                const generationPrompt = initialPlanPrompt || prompt;
                
                // NOVA LÓGICA INTELIGENTE: Baseada na seleção do usuário
                if (selectedGenerationType === 'backend') {
                    await get().generateBackendOnly(generationPrompt, projectPlan, attachmentParts);
                    return;
                } else if (selectedGenerationType === 'frontend') {
                    await get().generateFrontendOnly(generationPrompt, projectPlan, attachmentParts);
                    return;
                } else {
                    // Full Stack - usar nova lógica unificada
                    await get().generateFullStackUnified(generationPrompt, projectPlan, attachmentParts);
                    return;
                }

                if (isFullStack) {
                    // ===== SISTEMA FULLSTACK FRONTEND-FIRST =====
                    // NOVA ORDEM: FRONTEND PRIMEIRO → BACKEND → INTEGRAÇÃO
                    // 
                    // VANTAGENS DO FRONTEND-FIRST:
                    // 1. Usuário vê resultado visual imediatamente
                    // 2. Interface funcional desde o início
                    // 3. Backend é criado baseado no frontend real
                    // 4. Melhor experiência de desenvolvimento
                    // 5. Permite pausar após frontend se necessário
                    
                    // FASE 1: FRONTEND - Mostrar progresso no editor
                    set({
                        currentAppPhase: 'GENERATING_FRONTEND',
                        aiStatusMessage: '🎨 FASE 1/3: Criando interface do usuário completa e funcional...',
                        htmlCode: '<!-- 🎨 GERANDO FRONTEND: Interface, Componentes, UX -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #34d399; border-radius: 8px; margin: 20px;">\n  <h2>🚀 Gerando Projeto Full-Stack (Frontend-First)</h2>\n  <p>🎨 FASE 1/3: Criando Frontend (Interface, UX, Componentes)</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Criando interface completa e funcional...</div>\n  </div>\n  <div style="margin-top: 20px; padding: 15px; background: #0f172a; border-radius: 4px; text-align: left; font-size: 12px;">\n    <div>✅ Estrutura HTML semântica</div>\n    <div>✅ CSS moderno e responsivo</div>\n    <div>✅ JavaScript interativo</div>\n    <div>✅ Componentes funcionais</div>\n  </div>\n</div>'
                    });
                    get().setDetailedStatus('Frontend', 'Interface', 'Criando interface completa e funcional...', 10, 30);

                    const frontendResponse = await generateAiResponse(generationPrompt, 'generate_code_from_plan', selectedTextModel, projectPlan, null, generationPrompt, get().researchFindings, attachmentParts);
                    set({ lastInitialGeminiCodeForLog: frontendResponse.content });
                    get().updateStatusProgress(40);

                    // FASE 2: BACKEND - Mostrar progresso no editor
                    set({
                        currentAppPhase: 'GENERATING_BACKEND',
                        aiStatusMessage: '⚙️ FASE 2/3: Frontend pronto! Construindo APIs e banco de dados...',
                        htmlCode: `<!-- ✅ FRONTEND CONCLUÍDO -->\n<!-- ⚙️ GERANDO BACKEND: APIs, Banco de Dados, Autenticação -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #60a5fa; border-radius: 8px; margin: 20px;">\n  <h2>🚀 Gerando Projeto Full-Stack (Frontend-First)</h2>\n  <p>✅ Frontend concluído e funcional!</p>\n  <p>⚙️ FASE 2/3: Criando Backend (APIs, Banco, Auth)</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Construindo arquitetura do servidor...</div>\n  </div>\n  <details style="margin-top: 20px; text-align: left;">\n    <summary style="cursor: pointer; color: #34d399;">📋 Frontend Gerado (clique para ver)</summary>\n    <pre style="background: #0f172a; padding: 15px; border-radius: 4px; overflow: auto; max-height: 200px; font-size: 12px;">${frontendResponse.content.substring(0, 1000)}...</pre>\n  </details>\n</div>`
                    });
                    get().setDetailedStatus('Backend', 'Arquitetura', 'Criando estrutura de APIs e banco de dados...', 50, 30);

                    const backendResponse = await generateAiResponse(generationPrompt, 'generate_backend', selectedTextModel, projectPlan, frontendResponse.content, generationPrompt, get().researchFindings, attachmentParts);
                    get().updateStatusProgress(80);

                    // FASE 3: INTEGRAÇÃO - Mostrar progresso no editor
                    set({
                        aiStatusMessage: '🔗 FASE 3/3: Integrando frontend + backend...',
                        htmlCode: `<!-- ✅ FRONTEND CONCLUÍDO -->\n<!-- ✅ BACKEND CONCLUÍDO -->\n<!-- 🔗 INTEGRANDO SISTEMA COMPLETO -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #f59e0b; border-radius: 8px; margin: 20px;">\n  <h2>🚀 Gerando Projeto Full-Stack (Frontend-First)</h2>\n  <p>✅ Frontend concluído e funcional!</p>\n  <p>✅ Backend concluído e robusto!</p>\n  <p>🔗 FASE 3/3: Integrando sistema completo</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Combinando frontend + backend...</div>\n  </div>\n</div>`
                    });
                    get().setDetailedStatus('Integração', 'Finalização', 'Combinando frontend e backend...', 85, 15);

                    const finalHtml = combineFrontendAndBackend(frontendResponse.content, backendResponse.content);

                    set({ aiStatusMessage: '🎬 Processando mídia e otimizações finais...' });
                    get().setDetailedStatus('Mídia', 'Processamento', 'Adicionando imagens e vídeos...', 95, 10);

                    const finalHtmlWithMedia = await postProcessHtmlWithMedia(finalHtml);
                    get().updateStatusProgress(100);

                    set({
                        htmlCode: finalHtmlWithMedia,
                        projectPlan: null,
                        currentAppPhase: 'CODE_GENERATED',
                        aiStatusMessage: '🚀 Projeto full-stack completo! Frontend-First + Backend + Mídia integrados.'
                    });
                    setTimeout(() => get().clearDetailedStatus(), 3000);
                    
                    // Ativar auto-avaliador após geração completa
                    setupAutoEvaluator();
                } else {
                    set({ currentAppPhase: 'GENERATING_CODE_FROM_PLAN', aiStatusMessage: '💻 Transformando plano em código HTML, CSS e JavaScript...', htmlCode: '' });
                    get().setDetailedStatus('Frontend', 'Geração', 'Criando código HTML, CSS e JavaScript...', 30, 40);

                    let finalCode = "";
                    let progress = 30;
                    const stream = generateAiResponseStream(generationPrompt, 'generate_code_from_plan', selectedTextModel, false, projectPlan, currentCode, generationPrompt, attachmentParts);

                    // ATIVAR streaming no editor
                    set(state => {
                        state.editorInteractionState.isStreaming = true;
                    });

                    for await (const chunk of stream) {
                        finalCode += chunk.chunk;

                        // PRIMEIRO: Atualizar o htmlCode principal (para o preview)
                        set({ htmlCode: finalCode });

                        // SEGUNDO: Atualizar o editor Monaco DIRETAMENTE via editorRef
                        const editorRef = (window as any).globalEditorRef;
                        if (editorRef?.current) {
                            // Usar executeEdits para melhor performance no streaming
                            const model = editorRef.current.getModel();
                            if (model) {
                                const fullRange = model.getFullModelRange();
                                editorRef.current.executeEdits('ai-streaming', [{
                                    range: fullRange,
                                    text: finalCode
                                }]);

                                // Auto-scroll para o final
                                const lineCount = model.getLineCount();
                                editorRef.current.revealLine(lineCount, 1);
                                const lastLineLength = model.getLineLength(lineCount);
                                editorRef.current.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
                            }
                        }

                        // TERCEIRO: Sincronização simplificada (sem multi-editor)
                        // Removido temporariamente para simplificar

                        // QUARTO: Atualizar progresso
                        progress = Math.min(85, progress + 0.5);
                        get().updateStatusProgress(progress);
                    }

                    // DESATIVAR streaming
                    set(state => {
                        state.editorInteractionState.isStreaming = false;
                    });

                    set({ aiStatusMessage: 'Processando mídia para dar vida ao site...' });
                    get().setDetailedStatus('Frontend', 'Finalização', 'Processando mídia e otimizações finais...', 90, 15);

                    // 🎨 SISTEMA DE GERAÇÃO AUTOMÁTICA DE IMAGENS
                    let finalCodeWithImages = finalCode;
                    if (finalCode.includes('ai-researched-image://')) {
                        try {
                            console.log('🎨 Detectados placeholders de imagem, iniciando geração...');
                            set({ aiStatusMessage: '🎨 Gerando imagens profissionais com IA...' });
                            
                            // Importar dinamicamente o serviço de imagens
                            const { processHtmlAndGenerateImages } = await import('../services/GeminiImageService');
                            
                            const result = await processHtmlAndGenerateImages(
                                finalCode,
                                (current, total, description) => {
                                    console.log(`📸 Gerando imagem ${current}/${total}: ${description.substring(0, 30)}...`);
                                    set({ aiStatusMessage: `🎨 Gerando imagem ${current}/${total}: ${description.substring(0, 40)}...` });
                                }
                            );
                            
                            finalCodeWithImages = result.htmlContent;
                            console.log(`✅ ${result.imagesGenerated} imagens geradas automaticamente!`);
                            
                            // Atualizar o HTML com as imagens geradas
                            set({ htmlCode: finalCodeWithImages });
                            
                            // Forçar re-renderização após pequeno delay para garantir que localStorage foi atualizado
                            setTimeout(() => {
                                console.log('🔄 Forçando re-renderização para expansão de URLs...');
                                set({ htmlCode: finalCodeWithImages + ' ' }); // Trigger re-render
                                setTimeout(() => {
                                    set({ htmlCode: finalCodeWithImages }); // Restore original
                                }, 100);
                            }, 500);
                            
                            // Atualizar editor também
                            const editorRef = (window as any).globalEditorRef;
                            if (editorRef?.current) {
                                const model = editorRef.current.getModel();
                                if (model) {
                                    const fullRange = model.getFullModelRange();
                                    editorRef.current.executeEdits('ai-image-generation', [{
                                        range: fullRange,
                                        text: finalCodeWithImages
                                    }]);
                                }
                            }
                            
                        } catch (imageError) {
                            console.error('⚠️ Erro na geração de imagens, continuando sem imagens:', imageError);
                            // Continuar sem imagens em caso de erro
                        }
                    }

                    const finalCodeWithMedia = await postProcessHtmlWithMedia(finalCodeWithImages);
                    get().updateStatusProgress(100);

                    // Sincronização FINAL simplificada
                    // Removido temporariamente para simplificar

                    set({ htmlCode: finalCodeWithMedia, projectPlan: null, currentAppPhase: 'CODE_GENERATED', aiStatusMessage: '✅ Código gerado com sucesso! Site pronto para visualização e edição.' });
                    setTimeout(() => get().clearDetailedStatus(), 3000);
                    
                    // Ativar auto-avaliador após geração normal
                    setupAutoEvaluator();
                }
            }
            // Path D: Generic prompt for refinement (no specific action button clicked)
            else if (!action) {
                const phase = projectPlan ? 'refine_code_with_plan' : 'refine_code_no_plan';
                const status = projectPlan ? 'Refinando código com base no plano...' : 'Refinando código...';
                set({ currentAppPhase: 'AWAITING_CODE_MODIFICATION', aiStatusMessage: status, htmlCode: '' });

                // ATIVAR streaming no editor
                set(state => {
                    state.editorInteractionState.isStreaming = true;
                });

                let finalCode = "";
                const stream = generateAiResponseStream(prompt, phase, selectedTextModel, false, projectPlan, currentCode, initialPlanPrompt, attachmentParts);

                for await (const chunk of stream) {
                    finalCode += chunk.chunk;

                    // Atualizar preview
                    set({ htmlCode: finalCode });

                    // Atualizar editor Monaco DIRETAMENTE
                    const editorRef = (window as any).globalEditorRef;
                    if (editorRef?.current) {
                        // Usar executeEdits para melhor performance no streaming
                        const model = editorRef.current.getModel();
                        if (model) {
                            const fullRange = model.getFullModelRange();
                            editorRef.current.executeEdits('ai-streaming', [{
                                range: fullRange,
                                text: finalCode
                            }]);

                            // Auto-scroll para o final
                            const lineCount = model.getLineCount();
                            editorRef.current.revealLine(lineCount, 1);
                            const lastLineLength = model.getLineLength(lineCount);
                            editorRef.current.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
                        }
                    }

                    // Sincronização simplificada (sem multi-editor)
                    // Removido temporariamente para simplificar
                }

                // DESATIVAR streaming
                set(state => {
                    state.editorInteractionState.isStreaming = false;
                });

                set({ aiStatusMessage: 'Atualizando mídia para dar vida ao site...' });
                
                // 🎨 SISTEMA DE GERAÇÃO AUTOMÁTICA DE IMAGENS
                let finalCodeWithImages = finalCode;
                if (finalCode.includes('ai-researched-image://')) {
                    try {
                        console.log('🎨 Detectados placeholders de imagem, iniciando geração...');
                        set({ aiStatusMessage: '🎨 Gerando imagens profissionais com IA...' });
                        
                        // Importar dinamicamente o serviço de imagens
                        const { processHtmlAndGenerateImages } = await import('../services/GeminiImageService');
                        
                        const result = await processHtmlAndGenerateImages(
                            finalCode,
                            (current, total, description) => {
                                console.log(`📸 Gerando imagem ${current}/${total}: ${description.substring(0, 30)}...`);
                                set({ aiStatusMessage: `🎨 Gerando imagem ${current}/${total}: ${description.substring(0, 40)}...` });
                            }
                        );
                        
                        finalCodeWithImages = result.htmlContent;
                        console.log(`✅ ${result.imagesGenerated} imagens geradas automaticamente!`);
                        
                        // Atualizar o HTML com as imagens geradas
                        set({ htmlCode: finalCodeWithImages });
                        
                        // Comprimir URLs para o editor (manter código limpo)
                        const { compressImageUrls } = await import('../services/ImageUrlExpander');
                        const compressedCodeForEditor = compressImageUrls(finalCodeWithImages);
                        
                        // Atualizar editor com código comprimido
                        const editorRef = (window as any).globalEditorRef;
                        if (editorRef?.current) {
                            const model = editorRef.current.getModel();
                            if (model) {
                                const fullRange = model.getFullModelRange();
                                editorRef.current.executeEdits('ai-image-generation', [{
                                    range: fullRange,
                                    text: compressedCodeForEditor
                                }]);
                            }
                        }
                        
                    } catch (imageError) {
                        console.error('⚠️ Erro na geração de imagens, continuando sem imagens:', imageError);
                        // Continuar sem imagens em caso de erro
                    }
                }
                
                const finalCodeWithMedia = await postProcessHtmlWithMedia(finalCodeWithImages);

                set({ htmlCode: finalCodeWithMedia, currentAppPhase: 'CODE_GENERATED', aiStatusMessage: 'Código refinado com sucesso!' });
                await get().critiqueGeneratedCode();
            }

        } catch (error) {
            console.error("Erro no comando IA:", error);
            set({ aiStatusMessage: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
        } finally {
            set({ isLoadingAi: false });
        }
    },

    saveWipProject: (currentCode) => {
        set({ aiStatusMessage: "Salvando trabalho em andamento localmente..." });
        try {
            const { projectPlan, initialPlanPrompt, selectedTextModel, loggedInteractions, tasks, promptHistory, currentProjectId, researchFindings } = get();
            const projectState: StoredProjectState = {
                htmlCode: currentCode,
                projectPlan,
                initialPlanPrompt,
                selectedTextModel,
                loggedInteractions,
                tasks,
                promptHistory,
                projectId: currentProjectId,
                researchFindings,
            };
            localStorage.setItem(WIP_LOCAL_STORAGE_KEY, JSON.stringify(projectState));
            set({ aiStatusMessage: "Projeto salvo localmente com sucesso!" });
        } catch (error) {
            console.error("Erro ao salvar projeto no LocalStorage:", error);
            set({ aiStatusMessage: "Erro ao salvar o trabalho em andamento." });
        }
    },

    // --- Chat Mode Actions ---
    switchToChatMode: (currentCode) => {
        let files = parseFilesFromHtml(currentCode);
        
        // Se não conseguiu extrair arquivos, criar arquivo padrão
        if (files.length === 0) {
            files = [{
                path: 'index.html',
                content: currentCode || initialHtmlBase
            }];
        }

        const { chats, currentProjectId } = get();
        const projectChatId = `project_CHAT_${currentProjectId}`;
        let projectChat = chats.find(c => c.id === projectChatId);

        let newChats = [...chats];
        if (!projectChat) {
            projectChat = {
                id: projectChatId,
                title: 'Refatoração do Projeto (Principal)',
                messages: [{
                    role: 'model',
                    parts: [{ text: 'Bem-vindo ao modo de chat do projeto! Você pode me pedir para fazer alterações em qualquer arquivo. Comece selecionando um arquivo e me diga o que fazer.' }],
                    timestamp: new Date().toISOString(),
                }],
                createdAt: new Date().toISOString(),
            };
            newChats.unshift(projectChat);
        }

        // Garantir que sempre há pelo menos um arquivo
        if (files.length === 0) {
            files = [{
                path: 'index.html',
                content: currentCode || initialHtmlBase
            }];
        }

        set({
            appMode: 'chat',
            projectFiles: files,
            activeChatFile: files.find(f => f.path.includes('index.html'))?.path || files[0]?.path || 'index.html',
            chats: newChats,
            activeChatId: projectChat.id,
        });
    },

    switchToEditorMode: () => {
        const { projectFiles } = get();
        const reconstructedHtml = reconstructHtmlFromFiles(projectFiles);
        set({
            appMode: 'editor',
            htmlCode: reconstructedHtml,
            projectFiles: [],
            activeChatFile: null,
        });
        return reconstructedHtml;
    },

    handleNewChat: () => {
        const newChat: ChatSession = {
            id: uuidv4(),
            title: `Nova Conversa ${get().chats.filter(c => !c.id.startsWith('project_CHAT_')).length + 1}`,
            messages: [],
            createdAt: new Date().toISOString(),
        };
        set(state => {
            state.chats.push(newChat);
            state.activeChatId = newChat.id;
        });
    },

    handleSelectChat: (id) => {
        set({ activeChatId: id });
    },

    handleDeleteChat: (id) => {
        set(state => {
            state.chats = state.chats.filter(c => c.id !== id);
            if (state.activeChatId === id) {
                state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
            }
        });
    },

    handleRenameChat: (id, newTitle) => {
        set(state => {
            const chat = state.chats.find(c => c.id === id);
            if (chat) {
                chat.title = newTitle;
            }
        });
    },

    setActiveChatFile: (path) => {
        set({ activeChatFile: path });
    },

    handleFileContentChange: (path, newContent) => {
        set(state => {
            const file = state.projectFiles.find(f => f.path === path);
            if (file) {
                file.content = newContent;
            }
        });
    },

    executeTerminalCommand: async (command) => {
        set(state => {
            state.isTerminalBusy = true;
            state.terminalHistory.push({ type: 'command', content: command, timestamp: new Date().toISOString() });
        });

        await new Promise(res => setTimeout(res, 1500));

        let output = `Comando '${command}' executado (simulado).`;
        let outputType: TerminalHistoryEntry['type'] = 'output';

        if (command.startsWith('npm install') || command.startsWith('yarn add')) {
            output = `Pacote(s) instalados com sucesso (simulado). Adicione as importações necessárias ao seu código.`;
        } else if (command.startsWith('npm test') || command.startsWith('yarn test')) {
            output = `Rodando testes... (simulado)\n\n  ✓ 1 test passed (2s)`;
        } else {
            output = `bash: command not found: ${command}`;
            outputType = 'error';
        }

        set(state => {
            state.isTerminalBusy = false;
            state.terminalHistory.push({ type: outputType, content: output, timestamp: new Date().toISOString() });
        });
    },

    handleSendMessage: async (prompt) => {
        const { activeChatId, selectedTextModel, projectFiles, activeChatFile } = get();
        if (!activeChatId) return;

        const userMessage: ChatMessage = {
            role: 'user',
            parts: [{ text: prompt }],
            timestamp: new Date().toISOString(),
        };

        set(state => {
            const chat = state.chats.find(c => c.id === activeChatId);
            if (chat) {
                chat.messages.push(userMessage);
            }
            state.isGeneratingChatResponse = true;
        });

        try {
            const response: AiChatAgentResponse = await generateChatAgentResponse(
                prompt,
                projectFiles,
                activeChatFile,
                selectedTextModel
            );

            const modelMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: response.response || response.explanation || '' }],
                timestamp: new Date().toISOString(),
                suggestion: response.suggestion,
            };

            set(state => {
                const chat = state.chats.find(c => c.id === activeChatId);
                if (chat) {
                    chat.messages.push(modelMessage);
                }

                if (response.intent === 'modify' && response.response && state.activeChatFile) {
                    const file = state.projectFiles.find(f => f.path === state.activeChatFile);
                    if (file) {
                        file.content = response.response;
                    }
                } else if (response.intent === 'modify_multiple' && response.modifications) {
                    response.modifications.forEach(mod => {
                        const file = state.projectFiles.find(f => f.path === mod.path);
                        if (file) {
                            file.content = mod.content;
                        }
                    });
                }
            });

            if (response.intent === 'run_command' && response.command) {
                await get().executeTerminalCommand(response.command);
            }
        } catch (error) {
            console.error("Error sending chat message:", error);
            const errorMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: `Desculpe, ocorreu um erro: ${error instanceof Error ? error.message : String(error)}` }],
                timestamp: new Date().toISOString(),
            };
            set(state => {
                const chat = state.chats.find(c => c.id === activeChatId);
                if (chat) {
                    chat.messages.push(errorMessage);
                }
            });
        } finally {
            set({ isGeneratingChatResponse: false });
        }
    },

    // START: CONTEXTUAL AI PANEL ACTIONS
    openContextualAiPanel: (info, position) => {
        const quickActions = generateQuickActionsForTag(info.tagName);
        set({
            isContextualAiPanelOpen: true,
            contextualAiTargetElementInfo: info,
            contextualAiPanelPosition: position,
            contextualQuickActions: quickActions,
            contextualAiCommand: '',
            contextualAiAnalysisResults: null,
            currentAppPhase: 'CONTEXTUAL_AI_PANEL_OPEN'
        });
    },
    closeContextualAiPanel: () => {
        set({
            isContextualAiPanelOpen: false,
            contextualAiTargetElementInfo: null,
            contextualAiCommand: '',
            contextualAiError: null,
            contextualAiAnalysisResults: null,
            currentAppPhase: 'IDLE',
        });
    },
    setContextualAiCommand: (command) => {
        set({ contextualAiCommand: command });
    },
    handleContextualQuickAction: (prompt) => {
        set({ contextualAiCommand: prompt });
        get().handleContextualAiSubmit(get().htmlCode);
    },
    handleContextualAiSubmit: async (currentCode) => {
        const { contextualAiCommand, contextualAiTargetElementInfo, selectedTextModel } = get();
        if (!contextualAiCommand || !contextualAiTargetElementInfo) return null;

        set({ 
            isLoadingContextualAi: true, 
            contextualAiAnalysisResults: null, 
            contextualAiError: null,
            autoCritiqueResult: null 
        });

        try {
            const newCode = await generateContextualModification(
                contextualAiCommand,
                contextualAiTargetElementInfo.dataAid,
                currentCode,
                selectedTextModel
            );

            if (!newCode || newCode.trim() === '') {
                throw new Error('A IA não retornou código válido. Tente reformular seu comando.');
            }

            const newCodeWithMedia = await postProcessHtmlWithMedia(newCode);

            set(state => {
                state.htmlCode = newCodeWithMedia;
                state.aiStatusMessage = `✅ Elemento <${contextualAiTargetElementInfo.tagName.toLowerCase()}> modificado com sucesso!`;
                // Só fecha o painel se a modificação foi bem-sucedida
                state.isContextualAiPanelOpen = false;
                state.contextualAiCommand = '';
                state.contextualAiError = null;
                state.previousHtmlCode = currentCode;
                state.canUndoLastAiOperation = true;
                state.lastMajorOperationDescriptionForUndo = "Edição contextual";
                state.isLoadingContextualAi = false;
            });

            await get().critiqueGeneratedCode(); // Auto-critique the change
            return newCodeWithMedia;
        } catch (error) {
            console.error("❌ Erro na modificação contextual:", error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar sua solicitação';
            
            // Mantém o painel aberto em caso de erro para o usuário tentar novamente
            set({ 
                contextualAiError: errorMessage,
                aiStatusMessage: `❌ Falha ao modificar elemento: ${errorMessage}`,
                isLoadingContextualAi: false 
            });
            return null;
        }
    },
    handleAnalyzeElementWithAi: async (currentCode) => {
        const { contextualAiTargetElementInfo, selectedTextModel } = get();
        if (!contextualAiTargetElementInfo) return;

        set({ isLoadingContextualAiAnalysis: true, contextualAiAnalysisResults: null });
        try {
            const analysis = await analyzeHtmlElement(
                currentCode,
                contextualAiTargetElementInfo.dataAid,
                selectedTextModel
            );
            set({ contextualAiAnalysisResults: analysis });
        } catch (error) {
            console.error("Erro na análise contextual de elemento:", error);
            set({ contextualAiAnalysisResults: `Falha ao analisar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
        } finally {
            set({ isLoadingContextualAiAnalysis: false });
        }
    },
    // END: CONTEXTUAL AI PANEL ACTIONS

    handleFetchUrl: async () => { console.log('handleFetchUrl not implemented in store'); },
    handleLikeInteraction: () => { console.log('handleLikeInteraction not implemented in store'); },
    handleDislikeInteraction: () => { console.log('handleDislikeInteraction not implemented in store'); },
    handleFinalizeInteraction: () => { console.log('handleFinalizeInteraction not implemented in store'); },
    handleUndoLastAiOperation: () => { console.log('handleUndoLastAiOperation not implemented in store'); },

    handleExportProject: async (currentCode: string) => {
        set({
            currentAppPhase: 'EXPORTING_PROJECT',
            aiStatusMessage: 'Preparando arquivos para exportação...'
        });

        try {
            const {
                initialPlanPrompt,
                projectPlan,
                tasks,
                selectedTextModel
            } = get();

            const files = parseFilesFromHtml(currentCode);
            if (files.length === 0 || (files.length === 1 && files[0].path === 'index.html' && files[0].content === initialHtmlBase)) {
                set({
                    aiStatusMessage: "Nenhum projeto gerado para exportar.",
                    currentAppPhase: 'IDLE'
                });
                return;
            }

            const zip = new JSZip();

            const mainHtmlFile = files.find(f => f.path === 'index.html');
            const htmlContent = mainHtmlFile?.content || '';

            // Extract project name from title tag for the README and zip file name
            const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/i);
            let projectName = titleMatch ? titleMatch[1].trim() : 'meu-projeto-ia';
            if (projectName.includes("AI Web Weaver")) {
                const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
                projectName = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : 'meu-projeto-ia';
            }
            const sanitizedProjectName = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            // Check for backend files to pass to README generation
            const hasBackend = files.some(file => file.path.startsWith('backend/') || file.path.includes('docker') || file.path === 'init-project.sh');

            set({ aiStatusMessage: 'Gerando documentação README.md...' });

            // Generate README
            const readmeContent = await generateReadmeForProject(
                projectName,
                initialPlanPrompt,
                projectPlan,
                tasks,
                hasBackend,
                selectedTextModel,
                htmlContent
            );

            const projectFolder = zip.folder(sanitizedProjectName);

            if (!projectFolder) {
                throw new Error("Não foi possível criar a pasta do projeto no arquivo zip.");
            }

            projectFolder.file("README.md", readmeContent);

            set({ aiStatusMessage: 'Compactando arquivos do projeto...' });

            // Add all project files to the zip
            files.forEach(file => {
                projectFolder.file(file.path, file.content);
            });

            // Generate and download the zip file
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${sanitizedProjectName}.zip`);

            set({
                currentAppPhase: 'IDLE',
                aiStatusMessage: `Projeto "${projectName}" exportado com sucesso!`
            });

        } catch (error) {
            console.error("Erro ao exportar projeto:", error);
            set({
                aiStatusMessage: `Falha na exportação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                currentAppPhase: 'IDLE'
            });
        }
    },

    openSnapshotsModal: () => { console.log('openSnapshotsModal not implemented in store'); },
    closeSnapshotsModal: () => { console.log('closeSnapshotsModal not implemented in store'); },
    handleSaveSnapshot: () => { console.log('handleSaveSnapshot not implemented in store'); },
    handleLoadSnapshot: () => { console.log('handleLoadSnapshot not implemented in store'); },
    handleDeleteSnapshot: () => { console.log('handleDeleteSnapshot not implemented in store'); },
    handleRenameSnapshot: () => { console.log('handleRenameSnapshot not implemented in store'); },
    toggleEvolutionTracker: () => set(state => ({ isEvolutionTrackerOpen: !state.isEvolutionTrackerOpen })),
    toggleConsole: () => set(state => ({ isConsoleOpen: !state.isConsoleOpen })),
    setConsoleMessages: (messages) => set({ consoleMessages: messages }),
    setConsoleErrorCount: (count) => set({ consoleErrorCount: count }),

    openBrainstormingModal: () => set({ isBrainstormingModalOpen: true }),
    closeBrainstormingModal: () => set({ isBrainstormingModalOpen: false }),
    setBrainstormingTopic: (topic) => set({ brainstormingTopic: topic }),
    setBrainstormingMode: (mode) => set({ brainstormingMode: mode }),
    handleGenerateBrainstormIdeas: async () => { console.log('handleGenerateBrainstormIdeas not implemented in store'); },
    openThemeModal: () => set({ isThemeModalOpen: true }),
    closeThemeModal: () => set({ isThemeModalOpen: false }),
    setCurrentThemeDescription: (description) => set({ currentThemeDescription: description }),
    setCurrentThemeColors: (colors) => set({ currentThemeColors: colors }),
    handleSuggestThemeColors: async () => { console.log('handleSuggestThemeColors not implemented in store'); },
    handleApplyThemeColors: async (currentCode) => {
        const { currentThemeColors, selectedTextModel } = get();
        if (Object.values(currentThemeColors).some(c => !c)) return null;

        set({ isApplyingTheme: true, autoCritiqueResult: null });

        try {
            const newCode = await applyThemeColorsToHtml(currentCode, currentThemeColors, selectedTextModel);
            const newCodeWithMedia = await postProcessHtmlWithMedia(newCode);
            set({
                htmlCode: newCodeWithMedia,
                isThemeModalOpen: false,
                aiStatusMessage: 'Novo tema de cores aplicado com sucesso!',
            });
            await get().critiqueGeneratedCode();
            return newCodeWithMedia;
        } catch (error) {
            console.error("Erro ao aplicar tema de cores:", error);
            set({ aiStatusMessage: `Falha ao aplicar tema: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
            return null;
        } finally {
            set({ isApplyingTheme: false });
        }
    },
    openTaskManager: () => set({ isTaskManagerOpen: true }),
    closeTaskManager: () => set({ isTaskManagerOpen: false }),
    handleAddTask: (text) => {
        const newTask: Task = { id: uuidv4(), text, completed: false, createdAt: new Date().toISOString() };
        set(state => { state.tasks.push(newTask); });
    },
    handleToggleTask: (taskId) => {
        set(state => {
            const task = state.tasks.find(t => t.id === taskId);
            if (task) task.completed = !task.completed;
        });
    },
    handleRemoveTask: (taskId) => {
        set(state => { state.tasks = state.tasks.filter(t => t.id !== taskId); });
    },
    openSiteCriticModal: async () => { console.log('openSiteCriticModal not implemented in store'); },
    closeSiteCriticModal: () => set({ isSiteCriticModalOpen: false }),
    openAiCodeInsightModal: () => { console.log('openAiCodeInsightModal not implemented in store'); },
    closeAiCodeInsightModal: () => set({ isAiCodeInsightModalOpen: false }),
    handleRequestCodeExplanation: async () => { console.log('handleRequestCodeExplanation not implemented in store'); },
    handleRequestRefactoringSuggestion: async () => { console.log('handleRequestRefactoringSuggestion not implemented in store'); },
    openTestSuggestionModal: async () => { console.log('openTestSuggestionModal not implemented in store'); },
    closeTestSuggestionModal: () => set({ isTestSuggestionModalOpen: false }),
    openAiCodeDoctorModal: () => { console.log('openAiCodeDoctorModal not implemented in store'); },
    closeAiCodeDoctorModal: () => set({ isAiCodeDoctorModalOpen: false }),
    setAiCodeDoctorProblem: () => { console.log('setAiCodeDoctorProblem not implemented in store'); },
    handleAiCodeDoctorSubmit: async () => { console.log('handleAiCodeDoctorSubmit not implemented in store'); },

    // API Key Modal Actions
    openApiKeyModal: () => set({ isApiKeyModalOpen: true }),
    closeApiKeyModal: () => set({ isApiKeyModalOpen: false }),
    triggerFallbackModal: () => { console.log('triggerFallbackModal not implemented in store'); },
    closeAiErrorFallbackModal: () => { console.log('closeAiErrorFallbackModal not implemented in store'); },
    handleFallbackRetrySimplePrompt: async () => { console.log('handleFallbackRetrySimplePrompt not implemented in store'); },

    // Streaming actions implementation
    startCodeStreaming: (editorId: string, speed = 30) => {
        set(state => {
            state.isCodeStreaming = true;
            state.streamingEditorId = editorId;
            state.streamingSpeed = speed;
            state.streamingProgress = 0;
        });
    },

    stopCodeStreaming: () => {
        set(state => {
            state.isCodeStreaming = false;
            state.streamingEditorId = null;
            state.streamingProgress = 0;
        });
    },

    setStreamingAutoScroll: (enabled: boolean) => {
        set(state => {
            state.streamingAutoScroll = enabled;
        });
    },

    setStreamingSpeed: (speed: number) => {
        set(state => {
            state.streamingSpeed = Math.max(1, Math.min(100, speed)); // Limitar entre 1-100
        });
    },

    updateStreamingProgress: (progress: number) => {
        set(state => {
            state.streamingProgress = Math.max(0, Math.min(100, progress));
        });
    },

    // Granular status actions implementation
    setDetailedStatus: (operation: string, phase: string, message: string, progress = 0, estimatedTime?: number) => {
        set(state => {
            state.detailedStatus = {
                operation,
                phase,
                message,
                progress: Math.max(0, Math.min(100, progress)),
                estimatedTime,
                startTime: Date.now(),
            };
            // Manter compatibilidade com aiStatusMessage
            state.aiStatusMessage = message;
        });
    },

    clearDetailedStatus: () => {
        set(state => {
            state.detailedStatus = null;
            state.aiStatusMessage = null;
        });
    },

    updateStatusProgress: (progress: number) => {
        set(state => {
            if (state.detailedStatus) {
                state.detailedStatus.progress = Math.max(0, Math.min(100, progress));
            }
        });
    },

    // Multi-editor actions implementation
    createEditorTab: (name: string, stack: TechStack, aiSpecialist: 'general' | 'frontend' | 'backend') => {
        set(state => {
            const newTab: EditorTab = {
                id: uuidv4(),
                name,
                stack,
                content: stackTemplates[stack].defaultFiles[0]?.content || '',
                isActive: false,
                isDirty: false,
                aiSpecialist,
                createdAt: new Date(),
                lastModified: new Date(),
                language: stackTemplates[stack].defaultFiles[0]?.language || 'html'
            };

            state.editorTabs.push(newTab);
            state.activeEditorId = newTab.id;
            state.isNewEditorModalOpen = false;
            state.isCreatingEditor = false;
        });
    },

    closeEditorTab: (tabId: string) => {
        set(state => {
            const tabIndex = state.editorTabs.findIndex(tab => tab.id === tabId);
            if (tabIndex === -1) return;

            // Se é a aba ativa, ativar outra
            if (state.activeEditorId === tabId) {
                const remainingTabs = state.editorTabs.filter(tab => tab.id !== tabId);
                if (remainingTabs.length > 0) {
                    // Ativar a aba anterior ou a próxima
                    const newActiveIndex = Math.max(0, tabIndex - 1);
                    state.activeEditorId = remainingTabs[newActiveIndex]?.id || remainingTabs[0].id;
                } else {
                    // Se não há mais abas, criar uma nova aba padrão
                    const defaultTab: EditorTab = {
                        id: 'main',
                        name: 'Principal',
                        stack: 'html5-vanilla',
                        content: initialHtmlBase,
                        isActive: true,
                        isDirty: false,
                        aiSpecialist: 'general',
                        createdAt: new Date(),
                        lastModified: new Date(),
                        language: 'html'
                    };
                    state.editorTabs = [defaultTab];
                    state.activeEditorId = 'main';
                    return;
                }
            }

            // Remover a aba
            state.editorTabs.splice(tabIndex, 1);
        });
    },

    setActiveEditor: (editorId: string) => {
        set(state => {
            state.activeEditorId = editorId;
        });
    },

    renameEditorTab: (tabId: string, newName: string) => {
        set(state => {
            const tab = state.editorTabs.find(t => t.id === tabId);
            if (tab) {
                tab.name = newName;
                tab.lastModified = new Date();
            }
        });
    },

    reorderEditorTabs: (fromIndex: number, toIndex: number) => {
        set(state => {
            const tabs = [...state.editorTabs];
            const [movedTab] = tabs.splice(fromIndex, 1);
            tabs.splice(toIndex, 0, movedTab);
            state.editorTabs = tabs;
        });
    },

    updateEditorContent: (tabId: string, content: string) => {
        set(state => {
            const tab = state.editorTabs.find(t => t.id === tabId);
            if (tab) {
                tab.content = content;
                tab.lastModified = new Date();
                tab.isDirty = true;
            }
        });
    },

    markEditorDirty: (tabId: string, isDirty: boolean) => {
        set(state => {
            const tab = state.editorTabs.find(t => t.id === tabId);
            if (tab) {
                tab.isDirty = isDirty;
                if (!isDirty) {
                    tab.lastModified = new Date();
                }
            }
        });
    },

    setEditorInteractionState: (newState: Partial<EditorInteractionState>) => {
        set(state => {
            state.editorInteractionState = { ...state.editorInteractionState, ...newState };
        });
    },

    // AI Specialist actions implementation
    setActiveAiSpecialist: (specialist: 'general' | 'frontend' | 'backend') => {
        set(state => {
            state.activeAiSpecialist = specialist;
            // Atualizar também a aba ativa
            const activeTab = state.editorTabs.find(tab => tab.id === state.activeEditorId);
            if (activeTab) {
                activeTab.aiSpecialist = specialist;
            }
        });
    },

    toggleAiSpecialistPanel: () => {
        set(state => {
            state.isAiSpecialistPanelVisible = !state.isAiSpecialistPanelVisible;
        });
    },

    toggleAiThinking: () => {
        set(state => {
            state.isAiThinkingVisible = !state.isAiThinkingVisible;
        });
    },

    // 🎭 Implementação das Ações do Sistema de Personas
    loadAvailablePersonas: () => {
        console.log('🎭 Carregando personas disponíveis...');
        const personas = getAvailablePersonas();
        console.log('✅ Personas carregadas:', personas.length, personas.map(p => p.name));
        set(state => {
            state.availablePersonas = personas;
        });
    },

    selectPersona: (persona: AiPersona | null) => {
        set(state => {
            state.selectedPersona = persona;
            state.isPersonaSelectorOpen = false;
        });
    },

    togglePersonaSelector: () => {
        set(state => {
            state.isPersonaSelectorOpen = !state.isPersonaSelectorOpen;
        });
    },

    generateWithSelectedPersona: async (prompt: string, currentCode: string) => {
        const { selectedPersona, selectedTextModel } = get();
        
        if (!selectedPersona) {
            throw new Error('Nenhuma persona selecionada');
        }

        set(state => {
            state.isGeneratingWithPersona = true;
            state.isLoadingAi = true;
            state.currentAppPhase = 'GENERATING_CODE_FROM_PLAN';
            state.aiStatusMessage = `🎭 Gerando com ${selectedPersona.name}...`;
        });

        try {
            const response = await generateWithPersona(
                prompt,
                selectedPersona.id,
                currentCode,
                'generate_code_no_plan',
                selectedTextModel
            );

            set(state => {
                state.htmlCode = response.content;
                state.previousHtmlCode = currentCode;
                state.canUndoLastAiOperation = true;
                state.lastMajorOperationDescriptionForUndo = `Geração com ${selectedPersona.name}`;
                state.isGeneratingWithPersona = false;
                state.isLoadingAi = false;
                state.currentAppPhase = 'CODE_GENERATED';
                state.aiStatusMessage = `✅ Código gerado com expertise em ${selectedPersona.expertise.join(', ')}`;
            });

            // Log da interação
            get().logInteraction({
                interactionId: uuidv4(),
                timestamp: new Date().toISOString(),
                userPrompt: `[${selectedPersona.name}] ${prompt}`,
                initialGeminiCode: response.content,
                finalUserCode: response.content,
                modelVersionUsed: selectedTextModel,
                feedbackSignal: 'new_generation_started'
            }, null);

            // 🔬 Auto-avaliação automática após geração com persona
            setTimeout(() => {
                get().critiqueGeneratedCode();
            }, 1000);

        } catch (error) {
            console.error('Erro na geração com persona:', error);
            set(state => {
                state.isGeneratingWithPersona = false;
                state.isLoadingAi = false;
                state.currentAppPhase = 'AI_ERROR_STATE';
                state.aiStatusMessage = `❌ Erro na geração com ${selectedPersona.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
            });
            throw error;
        }
    },

    recommendPersonaForCurrentPrompt: (prompt: string) => {
        const recommendedPersona = recommendPersonaForPrompt(prompt);
        set(state => {
            state.recommendedPersona = recommendedPersona;
        });
    },

    clearPersonaRecommendation: () => {
        set(state => {
            state.recommendedPersona = null;
        });
    },

    // New Editor Modal actions
    openNewEditorModal: () => {
        set(state => {
            state.isNewEditorModalOpen = true;
        });
    },

    closeNewEditorModal: () => {
        set(state => {
            state.isNewEditorModalOpen = false;
            state.isCreatingEditor = false;
        });
    },

    // Tech Stack Modal actions
    openTechStackModal: () => {
        set(state => {
            state.isTechStackModalOpen = true;
        });
    },

    closeTechStackModal: () => {
        set(state => {
            state.isTechStackModalOpen = false;
        });
    },

    selectTechStack: (stack: TechStack, specialist: 'general' | 'frontend' | 'backend') => {
        set(state => {
            // Criar nova aba com a tecnologia selecionada
            const newTab: EditorTab = {
                id: `tab-${Date.now()}`,
                name: `${stackTemplates[stack]?.name || stack}`,
                stack: stack,
                content: stackTemplates[stack]?.template || '// Novo projeto',
                isActive: false,
                isDirty: false,
                aiSpecialist: specialist,
                createdAt: new Date(),
                lastModified: new Date(),
                language: stackTemplates[stack]?.language || 'javascript'
            };

            // Desativar todas as abas
            state.editorTabs.forEach(tab => tab.isActive = false);
            
            // Adicionar nova aba e ativá-la
            state.editorTabs.push(newTab);
            state.activeEditorId = newTab.id;
            
            // Fechar modal
            state.isTechStackModalOpen = false;
        });
    },

    // Advanced Research & Color System actions
    selectColorPalette: (palette: ColorPalette) => {
        set(state => {
            state.selectedColorPalette = palette;
        });
    },

    closeColorPaletteSelector: () => {
        set(state => {
            state.isColorPaletteSelectorOpen = false;
        });
    },

    continueWithSelectedPalette: async () => {
        const { selectedColorPalette, designResearch, lastUserPromptForLog, selectedTextModel } = get();

        if (!selectedColorPalette || !designResearch) return;

        set({
            isColorPaletteSelectorOpen: false,
            isLoadingAi: true,
            currentAppPhase: 'AWAITING_INITIAL_PLAN',
            aiStatusMessage: '📋 FASE 2/4: Criando plano baseado na pesquisa e paleta...'
        });

        try {
            const planPrompt = `
PESQUISA REALIZADA: ${JSON.stringify(designResearch, null, 2)}
PALETA SELECIONADA: ${JSON.stringify(selectedColorPalette, null, 2)}
PROJETO: ${lastUserPromptForLog}

Crie um plano detalhado usando a pesquisa e a paleta selecionada.
`;

            const planResponse = await generateAiResponse(planPrompt, 'create_plan', selectedTextModel);

            if (planResponse.type === AiResponseType.PLAN) {
                set({
                    projectPlan: planResponse.content,
                    projectPlanSources: planResponse.sources || null,
                    currentAppPhase: 'PLAN_DISPLAYED',
                    aiStatusMessage: '📋 Plano criado! Clique em "Gerar Código" para continuar.',
                    isLoadingAi: false
                });
            }
        } catch (error) {
            console.error('Erro ao criar plano:', error);
            
            // Mensagem de erro mais específica
            let errorMessage = 'Erro ao criar plano. Tente novamente.';
            if (error instanceof Error) {
                if (error.message.includes('sobrecarregado') || error.message.includes('overloaded')) {
                    errorMessage = '🔴 Servidor Gemini sobrecarregado. Aguarde 1-2 minutos e tente novamente.';
                } else if (error.message.includes('API key') || error.message.includes('API_KEY')) {
                    errorMessage = '🔑 Erro na chave da API. Verifique suas configurações.';
                } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
                    errorMessage = '⚠️ Limite de uso atingido. Aguarde alguns minutos.';
                }
            }
            
            set({
                isLoadingAi: false,
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: errorMessage
            });
        }
    },

    performAdvancedResearchAndShowPalettes: async (prompt: string) => {
        console.log('🔍 Iniciando pesquisa avançada para:', prompt);
        
        // Salvar o prompt para usar depois
        set({
            lastUserPromptForLog: prompt,
            initialPlanPrompt: prompt,
            isLoadingAi: true,
            currentAppPhase: 'PERFORMING_RESEARCH',
            aiStatusMessage: '🔍 FASE 1/4: Pesquisando design, cores e padrões...',
            isPerformingAdvancedResearch: true
        });

        try {
            console.log('📡 Chamando performAdvancedResearch...');
            const designResearch = await performAdvancedResearch(prompt, get().selectedTextModel);
            console.log('✅ Pesquisa concluída:', designResearch);
            
            set({
                designResearch,
                isPerformingAdvancedResearch: false,
                isColorPaletteSelectorOpen: true,
                currentAppPhase: 'PLAN_DISPLAYED',
                aiStatusMessage: '🎨 Pesquisa concluída! Escolha sua paleta de cores favorita.',
                isLoadingAi: false
            });
            
            console.log('🎨 Seletor de paletas aberto!');
        } catch (error) {
            console.error('❌ Erro na pesquisa avançada:', error);
            
            // Mensagem de erro mais específica
            let errorMessage = 'Erro na pesquisa. Tente novamente.';
            if (error instanceof Error) {
                if (error.message.includes('503') || error.message.includes('UNAVAILABLE') || error.message.includes('overloaded')) {
                    errorMessage = '🔴 Servidor Gemini sobrecarregado. Aguarde 1-2 minutos e tente novamente. (Tentou 5x com modelos alternativos)';
                } else if (error.message.includes('API key') || error.message.includes('API_KEY')) {
                    errorMessage = '🔑 Erro na chave da API. Verifique suas configurações.';
                } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
                    errorMessage = '⚠️ Limite de uso atingido. Aguarde alguns minutos.';
                }
            }
            
            set({
                isLoadingAi: false,
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: errorMessage
            });
        }
    },

    // ===== FUNÇÕES INTELIGENTES: GERAÇÃO SEPARADA E COMPLETA =====

    generateFrontendOnly: async (prompt: string, plan: string, attachments: Part[]) => {
        const { selectedTextModel, researchFindings } = get();
        
        set({
            currentAppPhase: 'GENERATING_FRONTEND',
            aiStatusMessage: '🎨 Gerando Frontend Completo - Interface, navegação e funcionalidades...',
            isLoadingAi: true
        });

        get().setDetailedStatus('Frontend', 'Análise', 'Analisando requisitos para frontend completo...', 10, 45);

        try {
            // PROMPT INTELIGENTE PARA FRONTEND COMPLETO
            const intelligentPrompt = `
🎨 **GERAÇÃO DE FRONTEND COMPLETO E INTELIGENTE**

**PROJETO:** ${prompt}

**PLANO ESTRATÉGICO:**
${plan}

**MISSÃO:** Criar um frontend COMPLETO que pensa além do óbvio:

**REGRAS DE INTELIGÊNCIA:**
1. **SITE COMPLETO:** Se for um site, criar TODAS as páginas necessárias (Home, Sobre, Contato, etc.)
2. **NAVEGAÇÃO FUNCIONAL:** Menu que funciona e leva para páginas reais
3. **CONTEÚDO REAL:** Não usar Lorem Ipsum - criar conteúdo relevante
4. **FUNCIONALIDADES REAIS:** Formulários que funcionam, botões que fazem algo
5. **RESPONSIVO:** Funcionar em mobile, tablet e desktop
6. **INTERATIVO:** JavaScript que adiciona valor real

**ESTRUTURA INTELIGENTE:**
- Header com navegação completa
- Páginas principais do negócio
- Footer com informações reais
- Seções que fazem sentido para o negócio
- Call-to-actions estratégicos

**TECNOLOGIAS:**
- HTML5 semântico
- CSS moderno (Grid, Flexbox, Animations)
- JavaScript ES6+ funcional
- Design responsivo
- Acessibilidade (ARIA)

Crie um frontend que impressione e funcione de verdade!
`;

            const response = await generateAiResponse(
                intelligentPrompt, 
                'generate_code_from_plan', 
                selectedTextModel, 
                plan, 
                null, 
                prompt, 
                researchFindings, 
                attachments
            );

            get().updateStatusProgress(80);
            
            const finalCode = await postProcessHtmlWithMedia(response.content);
            get().updateStatusProgress(100);

            set({
                htmlCode: finalCode,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: '✅ Frontend completo gerado! Site funcional com navegação e conteúdo real.',
                isLoadingAi: false
            });

            setTimeout(() => get().clearDetailedStatus(), 3000);
            get().critiqueGeneratedCode();

        } catch (error: any) {
            console.error('Erro na geração de frontend:', error);
            set({
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: `❌ Erro na geração de frontend: ${error.message}`,
                isLoadingAi: false
            });
            get().clearDetailedStatus();
        }
    },

    generateBackendOnly: async (prompt: string, plan: string, attachments: Part[]) => {
        const { selectedTextModel, researchFindings } = get();
        
        set({
            currentAppPhase: 'GENERATING_BACKEND',
            aiStatusMessage: '⚙️ Gerando Backend Completo - APIs, banco de dados e lógica de negócio...',
            isLoadingAi: true
        });

        get().setDetailedStatus('Backend', 'Arquitetura', 'Criando arquitetura completa do servidor...', 10, 45);

        try {
            // PROMPT INTELIGENTE PARA BACKEND COMPLETO
            const intelligentPrompt = `
⚙️ **GERAÇÃO DE BACKEND COMPLETO E ROBUSTO**

**PROJETO:** ${prompt}

**PLANO ESTRATÉGICO:**
${plan}

**MISSÃO:** Criar um backend COMPLETO e FUNCIONAL:

**ARQUITETURA INTELIGENTE:**
1. **APIs RESTful:** Endpoints completos para todas as funcionalidades
2. **BANCO DE DADOS:** Schema completo com relacionamentos
3. **AUTENTICAÇÃO:** Sistema de login/registro funcional
4. **VALIDAÇÃO:** Validação de dados robusta
5. **SEGURANÇA:** Middleware de segurança
6. **DOCUMENTAÇÃO:** APIs documentadas

**ESTRUTURA TÉCNICA:**
- Node.js + Express
- Banco de dados (SQL/NoSQL conforme necessário)
- JWT para autenticação
- Middleware de validação
- Tratamento de erros
- CORS configurado
- Rate limiting

**FUNCIONALIDADES REAIS:**
- CRUD completo para entidades principais
- Sistema de usuários
- Upload de arquivos (se necessário)
- Integração com APIs externas (se relevante)
- Sistema de logs
- Backup e recovery

**DEPLOY READY:**
- Dockerfile
- docker-compose.yml
- Scripts de inicialização
- Variáveis de ambiente
- README com instruções

Crie um backend que funcione de verdade em produção!
`;

            const response = await generateAiResponse(
                intelligentPrompt, 
                'generate_backend', 
                selectedTextModel, 
                plan, 
                null, 
                prompt, 
                researchFindings, 
                attachments
            );

            get().updateStatusProgress(100);

            set({
                htmlCode: response.content,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: '✅ Backend completo gerado! APIs funcionais, banco de dados e deploy ready.',
                isLoadingAi: false
            });

            setTimeout(() => get().clearDetailedStatus(), 3000);

        } catch (error: any) {
            console.error('Erro na geração de backend:', error);
            set({
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: `❌ Erro na geração de backend: ${error.message}`,
                isLoadingAi: false
            });
            get().clearDetailedStatus();
        }
    },

    generateFullStackIntelligent: async (prompt: string, plan: string, attachments: Part[]) => {
        const { selectedTextModel, researchFindings } = get();
        
        console.log('🚀 INICIANDO GERAÇÃO FULLSTACK INTELIGENTE - 5 CHAMADAS API COM STREAMING');
        
        set({
            currentAppPhase: 'GENERATING_FRONTEND',
            aiStatusMessage: '🚀 Gerando Full Stack Inteligente - Sistema completo e integrado...',
            isLoadingAi: true
        });

        try {
            const attachmentParts = attachments || [];
            const { projectPlan } = get();
            let frontendCode = "";
            let backendCode = "";
            
            // ===== CHAMADA API 1: FRONTEND COMPLETO COM STREAMING =====
            console.log('📡 CHAMADA API 1/5: Frontend completo com streaming');
            set({
                aiStatusMessage: '🎨 CHAMADA 1/5: Gerando Frontend completo...',
                editorInteractionState: { ...get().editorInteractionState, isStreaming: true }
            });
            get().setDetailedStatus('Frontend', 'API Call 1', 'Chamada dedicada para frontend...', 10, 30);

            const frontendPrompt = `
🎨 **FRONTEND INTELIGENTE PARA FULL STACK**

**PROJETO:** ${prompt}
**PLANO:** ${plan}

Crie um frontend COMPLETO que:
1. Tenha TODAS as páginas necessárias
2. Navegação funcional entre páginas
3. Formulários que se conectarão ao backend
4. Interface responsiva e moderna
5. Conteúdo real e relevante
6. Preparado para integração com APIs

Pense como um usuário real usaria este sistema!
`;

            // Usando streaming para mostrar o código sendo gerado em tempo real
            const frontendStream = generateAiResponseStream(
                frontendPrompt, 
                'generate_code_from_plan', 
                selectedTextModel,
                false, // isReactLikely
                plan, 
                null, 
                prompt, 
                attachments
            );
            
            // Processar cada chunk do streaming
            for await (const chunk of frontendStream) {
                frontendCode += chunk.chunk;
                
                // Atualizar editor em tempo real
                const editorRef = (window as any).globalEditorRef;
                if (editorRef?.current) {
                    const model = editorRef.current.getModel();
                    if (model) {
                        const fullRange = model.getFullModelRange();
                        editorRef.current.executeEdits('ai-streaming', [{
                            range: fullRange,
                            text: frontendCode
                        }]);
                        
                        // Auto-scroll para o final
                        const lineCount = model.getLineCount();
                        editorRef.current.revealLine(lineCount, 1);
                    }
                }
            }
            
            // Desativar streaming após concluir
            set({ 
                htmlCode: frontendCode,
                editorInteractionState: { ...get().editorInteractionState, isStreaming: false }
            });
            get().updateStatusProgress(20);

            // ===== CHAMADA API 2: BACKEND INTEGRADO COM STREAMING =====
            console.log('📡 CHAMADA API 2/5: Backend integrado com streaming');
            set({
                currentAppPhase: 'GENERATING_BACKEND',
                aiStatusMessage: '⚙️ CHAMADA 2/5: Gerando Backend integrado...',
                editorInteractionState: { ...get().editorInteractionState, isStreaming: true }
            });
            get().setDetailedStatus('Backend', 'API Call 2', 'Chamada dedicada para backend...', 20, 30);

            const separator = `\n\n<!-- ===== BACKEND INTEGRADO (API CALL 2) ===== -->\n<!-- Frontend ↑ | Backend ↓ -->\n\n`;
            
            const backendPrompt = `
⚙️ **BACKEND INTEGRADO PARA FULL STACK**

**PROJETO:** ${prompt}
**PLANO:** ${plan}

**FRONTEND GERADO:**
${frontendCode.substring(0, 2000)}...

Crie um backend que:
1. Tenha APIs para TODAS as funcionalidades do frontend
2. Banco de dados completo
3. Autenticação funcional
4. Validação de dados
5. Integração perfeita com o frontend
6. Deploy ready

O backend deve servir EXATAMENTE o que o frontend precisa!
`;

            // Usando streaming para o backend também
            let combinedCode = frontendCode + separator;
            backendCode = "";
            
            const backendStream = generateAiResponseStream(
                backendPrompt, 
                'generate_backend', 
                selectedTextModel,
                false, // isReactLikely
                projectPlan, 
                frontendCode, 
                prompt, 
                attachmentParts
            );
            
            // Processar cada chunk do streaming
            for await (const chunk of backendStream) {
                backendCode += chunk.chunk;
                const updatedCode = combinedCode + backendCode;
                
                // Atualizar editor em tempo real
                const editorRef = (window as any).globalEditorRef;
                if (editorRef?.current) {
                    const model = editorRef.current.getModel();
                    if (model) {
                        const fullRange = model.getFullModelRange();
                        editorRef.current.executeEdits('ai-streaming', [{
                            range: fullRange,
                            text: updatedCode
                        }]);
                        
                        // Auto-scroll para o final
                        const lineCount = model.getLineCount();
                        editorRef.current.revealLine(lineCount, 1);
                    }
                }
            }
            
            // Desativar streaming após concluir
            combinedCode = frontendCode + separator + backendCode;
            set({ 
                htmlCode: combinedCode,
                editorInteractionState: { ...get().editorInteractionState, isStreaming: false }
            });
            get().updateStatusProgress(40);

            // ===== CHAMADA API 3: DOCUMENTAÇÃO COMPLETA COM STREAMING =====
            console.log('📡 CHAMADA API 3/5: Documentação com streaming');
            set({
                currentAppPhase: 'GENERATING_CODE_FROM_PLAN',
                aiStatusMessage: '📚 CHAMADA 3/5: Gerando documentação completa...',
                editorInteractionState: { ...get().editorInteractionState, isStreaming: true }
            });
            get().setDetailedStatus('Documentação', 'API Call 3', 'Chamada dedicada para documentação...', 40, 20);

            const docSeparator = `\n\n<!-- ===== DOCUMENTAÇÃO COMPLETA (API CALL 3) ===== -->\n\n`;
            let codeWithDocs = combinedCode + docSeparator;
            let documentation = "";
            
            const docPrompt = `PROJETO COMPLETO:\nFRONTEND:\n${frontendCode}\n\nBACKEND:\n${backendCode}\n\n${prompt}\n\nGERE DOCUMENTAÇÃO COMPLETA:\n- README.md detalhado\n- Instruções de instalação\n- Como usar o sistema\n- Estrutura do projeto\n- APIs e endpoints\n- Exemplos de uso\n- Troubleshooting`;
            
            const docStream = generateAiResponseStream(
                docPrompt, 
                'generate_code_from_plan', 
                selectedTextModel,
                false, // isReactLikely
                projectPlan, 
                codeWithDocs, 
                prompt, 
                attachmentParts
            );
            
            // Processar cada chunk do streaming
            for await (const chunk of docStream) {
                documentation += chunk.chunk;
                const updatedCode = codeWithDocs + documentation;
                
                // Atualizar editor em tempo real
                const editorRef = (window as any).globalEditorRef;
                if (editorRef?.current) {
                    const model = editorRef.current.getModel();
                    if (model) {
                        const fullRange = model.getFullModelRange();
                        editorRef.current.executeEdits('ai-streaming', [{
                            range: fullRange,
                            text: updatedCode
                        }]);
                        
                        // Auto-scroll para o final
                        const lineCount = model.getLineCount();
                        editorRef.current.revealLine(lineCount, 1);
                    }
                }
            }
            
            // Desativar streaming após concluir
            codeWithDocs += documentation;
            set({ 
                htmlCode: codeWithDocs,
                editorInteractionState: { ...get().editorInteractionState, isStreaming: false }
            });
            get().updateStatusProgress(60);

            // ===== CHAMADA API 4: GERAÇÃO DE IMAGENS =====
            console.log('📡 CHAMADA API 4/5: Geração de imagens');
            set({
                aiStatusMessage: '📸 CHAMADA 4/5: Gerando imagens para o projeto...'
            });
            get().setDetailedStatus('Imagens', 'API Call 4', 'Chamada dedicada para imagens...', 60, 20);

            const finalCodeWithMedia = await postProcessHtmlWithMedia(codeWithDocs);
            set({ htmlCode: finalCodeWithMedia });
            get().updateStatusProgress(80);

            // ===== CHAMADA API 5: AUTO-AVALIAÇÃO FINAL =====
            console.log('📡 CHAMADA API 5/5: Auto-avaliação');
            set({
                aiStatusMessage: '🔬 CHAMADA 5/5: Realizando auto-avaliação final...',
                isLoadingCritique: true
            });
            get().setDetailedStatus('Avaliação', 'API Call 5', 'Chamada dedicada para avaliação...', 80, 20);

            const critiqueResponse = await generateAiResponse(
                `PROJETO FULLSTACK COMPLETO:\n${finalCodeWithMedia}\n\nREALIZE AUTO-AVALIAÇÃO COMPLETA:\n- Qualidade do código\n- Funcionalidades implementadas\n- Integração frontend-backend\n- Documentação\n- Pontos fortes\n- Melhorias sugeridas\n- Score de 0-100`, 
                'critique', 
                selectedTextModel, 
                null, 
                finalCodeWithMedia, 
                prompt, 
                null, 
                attachmentParts
            );

            set({
                autoCritiqueResult: critiqueResponse.content,
                isLoadingCritique: false
            });
            get().updateStatusProgress(100);

            // ===== FINALIZAÇÃO =====
            set({
                htmlCode: finalCodeWithMedia,
                projectPlan: null,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: '🚀 Sistema FullStack concluído! 5 chamadas API executadas: Frontend → Backend → Docs → Imagens → Avaliação',
                isLoadingAi: false
            });

            setTimeout(() => get().clearDetailedStatus(), 3000);
            get().logInteraction(prompt, finalCodeWithMedia, 'fullstack_5_api_calls');

            console.log('✅ SISTEMA FULLSTACK CONCLUÍDO - 5 CHAMADAS API EXECUTADAS COM SUCESSO');

        } catch (error: any) {
            console.error('❌ Erro no sistema FullStack:', error);
            
            set({
                isLoadingAi: false,
                isLoadingCritique: false,
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: `❌ Erro no sistema FullStack: ${error.message}`
            });
            get().clearDetailedStatus();
        }
    },

    // ===== SISTEMA ARTESÃO DE MUNDOS 3D - ISOLADO E ESPECIALIZADO =====
    handleArtesaoMundosGeneration: async (prompt: string, currentCode: string, attachments?: AttachmentFile[]) => {
        console.log('🎮 INICIANDO ARTESÃO DE MUNDOS ISOLADO - ESPECIALISTA EM JOGOS 3D');
        
        set(state => {
            state.isLoadingAi = true;
            state.previousHtmlCode = currentCode;
            state.lastMajorOperationDescriptionForUndo = `Artesão: ${prompt.substring(0, 30)}...`;
            state.canUndoLastAiOperation = true;
            state.projectPlanSources = null;
            state.researchFindings = null;
            state.isResearchPanelOpen = false;
            state.consoleMessages = [];
            state.consoleErrorCount = 0;
            state.currentInteractionUserFeedback = null;
            state.autoCritiqueResult = null;
        });

        try {
            // Importar o serviço isolado
            const { artesaoMundos } = await import('../services/ArtesaoMundosService');
            const GameWorldContextManager = (await import('../services/GameWorldContext')).default;

            // ===== DETECÇÃO INTELIGENTE: PRIMEIRA GERAÇÃO VS EXPANSÃO =====
            const isFirstGeneration = !currentCode.includes('construirMundo') && 
                                    !currentCode.includes('THREE.Scene') && 
                                    !currentCode.includes('GameWorld');
            
            console.log(`🔍 ARTESÃO ISOLADO - Modo: ${isFirstGeneration ? 'CRIAÇÃO INICIAL' : 'EXPANSÃO LEGO'}`);

            if (isFirstGeneration) {
                // ===== CRIAÇÃO INICIAL COM SISTEMA ISOLADO =====
                console.log('🏗️ ARTESÃO ISOLADO - Criando novo mundo de jogo');
                
                set({
                    currentAppPhase: 'GENERATING_CODE_FROM_PLAN',
                    aiStatusMessage: '🎮 ARTESÃO ISOLADO: Criando mundo de jogo especializado...',
                    htmlCode: ''
                });
                get().setDetailedStatus('Jogo 3D', 'Criação', 'Artesão criando mundo especializado...', 10, 60);

                // Detectar tipo de jogo baseado no prompt
                const gameType = get().detectGameType(prompt);
                const complexity = get().detectComplexity(prompt);

                // Opções de criação
                const options = {
                    gameType,
                    complexity,
                    targetFPS: 60,
                    audioEnabled: true,
                    physicsEngine: 'cannon' as const,
                    graphicsQuality: 'high' as const
                };

                console.log('🎮 Configurações detectadas:', options);

                // Usar o serviço isolado para criar o mundo
                const gameWorld = await artesaoMundos.createGameWorld(prompt, options);

                set({
                    htmlCode: gameWorld.htmlCode,
                    projectPlan: null,
                    currentAppPhase: 'CODE_GENERATED',
                    aiStatusMessage: `🎮 Mundo "${gameWorld.name}" criado! Tipo: ${gameWorld.gameType}, Elementos: ${gameWorld.context.elements.length}`,
                    isLoadingAi: false
                });

                // Salvar contexto do mundo no localStorage para expansões futuras
                localStorage.setItem(`gameWorld_${gameWorld.id}`, JSON.stringify(gameWorld));
                console.log('💾 Contexto do mundo salvo para expansões futuras');

            } else {
                // ===== EXPANSÃO COM SISTEMA LEGO =====
                console.log('🔧 ARTESÃO ISOLADO - Expandindo mundo existente');
                
                set({
                    currentAppPhase: 'GENERATING_CODE_FROM_PLAN',
                    aiStatusMessage: '🎮 ARTESÃO ISOLADO: Expandindo mundo com sistema Lego...'
                });
                get().setDetailedStatus('Expansão Lego', 'Adição', 'Sistema Lego adicionando elementos...', 10, 40);

                // Tentar recuperar contexto do mundo
                let gameWorld = get().tryRecoverGameWorld(currentCode);
                
                if (!gameWorld) {
                    // Criar contexto básico se não encontrado
                    console.log('⚠️ Contexto não encontrado, criando contexto básico');
                    gameWorld = get().createBasicGameWorld(currentCode);
                }

                // Usar o serviço isolado para expandir
                const expansion = await artesaoMundos.expandGameWorld(prompt, gameWorld);

                // Aplicar expansão ao código
                const separator = `\n\n<!-- ===== EXPANSÃO LEGO (${new Date().toLocaleTimeString()}) ===== -->\n<!-- ${prompt} -->\n`;
                const expandedCode = currentCode + separator + expansion.codeChanges.join('\n');

                // Atualizar contexto do mundo
                gameWorld.expansions.push(expansion);
                gameWorld.context.elements.push(...expansion.addedElements);
                gameWorld.context.lastModified = new Date();

                set({
                    htmlCode: expandedCode,
                    currentAppPhase: 'CODE_GENERATED',
                    aiStatusMessage: `🔧 Expansão aplicada! Adicionados: ${expansion.addedElements.length} elementos`,
                    isLoadingAi: false
                });

                // Salvar contexto atualizado
                localStorage.setItem(`gameWorld_${gameWorld.id}`, JSON.stringify(gameWorld));
                console.log('💾 Contexto expandido salvo');
            }

            get().clearDetailedStatus();

        } catch (error) {
            console.error('❌ ARTESÃO ISOLADO - Erro:', error);
            
            let errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            
            // Mensagem mais amigável para problemas de API Key
            if (errorMessage.includes('API Key') || errorMessage.includes('not found') || errorMessage.includes('getGenerativeModel')) {
                errorMessage = '🔑 API Key não configurada. Clique no botão de configurações para adicionar sua chave do Gemini.';
                // Abrir automaticamente o modal de configuração
                setTimeout(() => {
                    get().openApiKeyModal();
                }, 1000);
            }
            
            set({
                currentAppPhase: 'IDLE',
                aiStatusMessage: `❌ ${errorMessage}`,
                isLoadingAi: false
            });
            
            get().clearDetailedStatus();
        }
    },

    // ===== MÉTODOS AUXILIARES PARA ARTESÃO DE MUNDOS =====
    
    /**
     * Detecta o tipo de jogo baseado no prompt do usuário
     */
    detectGameType: (prompt: string): 'fps' | 'platformer' | 'racing' | 'puzzle' | 'rpg' | 'strategy' | 'exploration' | 'arcade' => {
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('fps') || promptLower.includes('tiro') || promptLower.includes('arma') || promptLower.includes('atirador')) {
            return 'fps';
        }
        if (promptLower.includes('plataforma') || promptLower.includes('pulo') || promptLower.includes('mario') || promptLower.includes('platformer')) {
            return 'platformer';
        }
        if (promptLower.includes('corrida') || promptLower.includes('carro') || promptLower.includes('velocidade') || promptLower.includes('racing')) {
            return 'racing';
        }
        if (promptLower.includes('puzzle') || promptLower.includes('quebra') || promptLower.includes('enigma') || promptLower.includes('lógica')) {
            return 'puzzle';
        }
        if (promptLower.includes('rpg') || promptLower.includes('personagem') || promptLower.includes('level') || promptLower.includes('experiência')) {
            return 'rpg';
        }
        if (promptLower.includes('estratégia') || promptLower.includes('strategy') || promptLower.includes('construir') || promptLower.includes('gerenciar')) {
            return 'strategy';
        }
        if (promptLower.includes('exploração') || promptLower.includes('explorar') || promptLower.includes('mundo aberto') || promptLower.includes('aventura')) {
            return 'exploration';
        }
        
        return 'arcade'; // Default
    },

    /**
     * Detecta a complexidade baseada no prompt
     */
    detectComplexity: (prompt: string): 'simple' | 'medium' | 'complex' => {
        const promptLower = prompt.toLowerCase();
        
        if (promptLower.includes('simples') || promptLower.includes('básico') || promptLower.includes('fácil')) {
            return 'simple';
        }
        if (promptLower.includes('complexo') || promptLower.includes('avançado') || promptLower.includes('detalhado') || promptLower.includes('completo')) {
            return 'complex';
        }
        
        return 'medium'; // Default
    },

    /**
     * Tenta recuperar o contexto de um mundo existente
     */
    tryRecoverGameWorld: (currentCode: string): any => {
        try {
            // Procurar por ID do mundo no código
            const worldIdMatch = currentCode.match(/worldId:\s*['"]([^'"]+)['"]/);
            if (worldIdMatch) {
                const worldId = worldIdMatch[1];
                const savedWorld = localStorage.getItem(`gameWorld_${worldId}`);
                if (savedWorld) {
                    return JSON.parse(savedWorld);
                }
            }

            // Procurar por mundos salvos recentemente
            const keys = Object.keys(localStorage).filter(key => key.startsWith('gameWorld_'));
            if (keys.length > 0) {
                const latestKey = keys.sort().pop();
                if (latestKey) {
                    const savedWorld = localStorage.getItem(latestKey);
                    if (savedWorld) {
                        return JSON.parse(savedWorld);
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao recuperar contexto do mundo:', error);
        }
        
        return null;
    },

    /**
     * Cria um contexto básico para mundos sem contexto salvo
     */
    createBasicGameWorld: (currentCode: string): any => {
        const worldId = `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            id: worldId,
            name: 'Mundo Recuperado',
            description: 'Mundo criado a partir de código existente',
            gameType: 'exploration',
            createdAt: new Date(),
            version: '1.0.0',
            htmlCode: currentCode,
            context: {
                worldId,
                createdAt: new Date(),
                lastModified: new Date(),
                elements: [],
                terrain: { type: 'flat', size: 100, textures: ['grass'] },
                lighting: { type: 'daylight', ambientColor: '#404040', directionalLight: true, shadows: true, fog: false },
                audio: { ambientSounds: [], effectSounds: [], reverbZones: [] },
                physics: { engine: 'cannon', gravity: { x: 0, y: -9.82, z: 0 }, rigidBodies: [], constraints: [] },
                performance: { fps: 60, drawCalls: 0, triangles: 0, memoryUsage: 0, bottlenecks: [] },
                bounds: { 
                    min: { x: -100, y: -10, z: -100 }, 
                    max: { x: 100, y: 50, z: 100 },
                    safeZone: { min: { x: -50, y: 0, z: -50 }, max: { x: 50, y: 20, z: 50 } }
                }
            },
            settings: {
                renderDistance: 500,
                shadowQuality: 'high',
                particleCount: 500,
                audioQuality: 'high',
                debugMode: false
            },
            expansions: [],
            performanceProfile: {
                targetFPS: 60,
                maxMemory: 512,
                maxDrawCalls: 100,
                optimizationLevel: 'basic'
            }
        };
    },

    // ===== SISTEMA FULLSTACK COM STREAMING - FRONTEND-FIRST =====
    generateFullStackUnified: async (prompt: string, plan: string, attachments: Part[]) => {
        const { selectedTextModel, researchFindings } = get();
        
        console.log('🚀 INICIANDO GERAÇÃO FULLSTACK UNIFICADA - CHAMADA API ÚNICA');
        
        set({
            currentAppPhase: 'GENERATING_FRONTEND',
            aiStatusMessage: '🚀 Gerando Full Stack Completo - Sistema integrado em uma única chamada...',
            isLoadingAi: true,
            editorInteractionState: { ...get().editorInteractionState, isStreaming: true }
        });
        get().setDetailedStatus('Sistema Completo', 'Geração Unificada', 'Gerando sistema completo em uma única chamada...', 10, 80);

        try {
            const attachmentParts = attachments || [];
            let fullStackCode = "";
            
            // ===== CHAMADA API ÚNICA: FULLSTACK COMPLETO COM STREAMING =====
            console.log('📡 CHAMADA API ÚNICA: Sistema completo com streaming');
            
            const fullStackPrompt = `
🚀 **SISTEMA FULLSTACK COMPLETO - GERAÇÃO UNIFICADA**

**PROJETO:** ${prompt}
**PLANO:** ${plan}

Crie um sistema COMPLETO que inclua:

1. **FRONTEND COMPLETO:**
   - Todas as páginas necessárias
   - Navegação funcional entre páginas
   - Formulários completos
   - Interface responsiva e moderna
   - Conteúdo real e relevante

2. **BACKEND INTEGRADO:**
   - APIs para todas as funcionalidades do frontend
   - Banco de dados completo
   - Autenticação funcional
   - Validação de dados
   - Integração perfeita com o frontend

3. **DOCUMENTAÇÃO COMPLETA:**
   - README.md detalhado
   - Instruções de instalação
   - Como usar o sistema
   - Estrutura do projeto
   - APIs e endpoints
   - Exemplos de uso

Separe claramente as seções com comentários HTML:
<!-- ===== FRONTEND ===== -->
<!-- ===== BACKEND ===== -->
<!-- ===== DOCUMENTAÇÃO ===== -->

Crie um sistema COMPLETO e FUNCIONAL pronto para produção!
`;

            // Usando streaming para mostrar o código sendo gerado em tempo real
            const fullStackStream = generateAiResponseStream(
                fullStackPrompt, 
                'generate_code_from_plan', 
                selectedTextModel,
                false, // isReactLikely
                plan, 
                null, 
                prompt, 
                attachments
            );
            
            // Processar cada chunk do streaming
            for await (const chunk of fullStackStream) {
                fullStackCode += chunk.chunk;
                
                // Atualizar editor em tempo real
                const editorRef = (window as any).globalEditorRef;
                if (editorRef?.current) {
                    const model = editorRef.current.getModel();
                    if (model) {
                        const fullRange = model.getFullModelRange();
                        editorRef.current.executeEdits('ai-streaming', [{
                            range: fullRange,
                            text: fullStackCode
                        }]);
                        
                        // Auto-scroll para o final
                        const lineCount = model.getLineCount();
                        editorRef.current.revealLine(lineCount, 1);
                    }
                }
            }
            
            // Desativar streaming após concluir
            set({ 
                htmlCode: fullStackCode,
                editorInteractionState: { ...get().editorInteractionState, isStreaming: false }
            });
            get().updateStatusProgress(80);

            // ===== PROCESSAMENTO DE IMAGENS =====
            console.log('📡 Processando imagens para o projeto');
            set({
                aiStatusMessage: '📸 Processando imagens para o projeto...'
            });
            get().setDetailedStatus('Imagens', 'Processamento', 'Processando imagens para o projeto...', 80, 10);

            const finalCodeWithMedia = await postProcessHtmlWithMedia(fullStackCode);
            set({ htmlCode: finalCodeWithMedia });
            get().updateStatusProgress(90);

            // ===== AUTO-AVALIAÇÃO FINAL =====
            console.log('📡 Realizando auto-avaliação');
            set({
                aiStatusMessage: '🔬 Realizando auto-avaliação final...',
                isLoadingCritique: true
            });
            get().setDetailedStatus('Avaliação', 'Auto-avaliação', 'Realizando auto-avaliação final...', 90, 10);

            const critiqueResponse = await generateAiResponse(
                `PROJETO FULLSTACK COMPLETO:\n${finalCodeWithMedia}\n\nREALIZE AUTO-AVALIAÇÃO COMPLETA:\n- Qualidade do código\n- Funcionalidades implementadas\n- Integração frontend-backend\n- Documentação\n- Pontos fortes\n- Melhorias sugeridas\n- Score de 0-100`, 
                'critique', 
                selectedTextModel, 
                null, 
                finalCodeWithMedia, 
                prompt, 
                null, 
                attachmentParts
            );

            set({
                autoCritiqueResult: critiqueResponse.content,
                isLoadingCritique: false
            });
            get().updateStatusProgress(100);

            // ===== FINALIZAÇÃO =====
            set({
                htmlCode: finalCodeWithMedia,
                projectPlan: null,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: '🚀 Sistema FullStack concluído! Geração unificada em uma única chamada API',
                isLoadingAi: false
            });

            setTimeout(() => get().clearDetailedStatus(), 3000);
            get().logInteraction(prompt, finalCodeWithMedia, 'fullstack_unified_call');

            console.log('✅ SISTEMA FULLSTACK CONCLUÍDO - CHAMADA API ÚNICA EXECUTADA COM SUCESSO');

        } catch (error: any) {
            console.error('❌ Erro no sistema FullStack Unificado:', error);
            
            set({
                isLoadingAi: false,
                isLoadingCritique: false,
                currentAppPhase: 'AI_ERROR_STATE',
                aiStatusMessage: `❌ Erro no sistema FullStack Unificado: ${error.message}`
            });
            get().clearDetailedStatus();
        }
    },

    handleFullStackStreamingGeneration: async (prompt: string, currentCode: string, attachments?: AttachmentFile[]) => {
        console.log('🔥 INICIANDO MODO FULLSTACK COM STREAMING - Frontend-First');
        
        set(state => {
            state.isLoadingAi = true;
            state.previousHtmlCode = currentCode;
            state.lastMajorOperationDescriptionForUndo = `FullStack: ${prompt.substring(0, 30)}...`;
            state.canUndoLastAiOperation = true;
            state.projectPlanSources = null;
            state.researchFindings = null;
            state.isResearchPanelOpen = false;
            state.consoleMessages = [];
            state.consoleErrorCount = 0;
            state.currentInteractionUserFeedback = null;
            state.autoCritiqueResult = null;
        });

        const { selectedTextModel, initialPlanPrompt } = get();
        let { projectPlan } = get();

        const attachmentParts: Part[] = attachments ? attachments.map(att => ({
            inlineData: {
                mimeType: att.mimeType,
                data: att.data
            }
        })) : [];

        try {
            // Se não há plano, criar um primeiro
            if (!projectPlan) {
                set({ 
                    currentAppPhase: 'PERFORMING_RESEARCH', 
                    aiStatusMessage: '🔍 Analisando requisitos para projeto fullstack...' 
                });
                get().setDetailedStatus('Research', 'Análise', 'Pesquisando tecnologias e arquitetura...', 10, 20);

                const researchResults = await performSpecializedResearch(prompt, selectedTextModel);
                set({ researchFindings: researchResults, isResearchPanelOpen: true });

                // Plano não precisa de streaming, é texto curto
                const planResponse = await generateAiResponse(prompt, 'create_plan', selectedTextModel, null, currentCode === initialHtmlBase ? null : currentCode, prompt, researchResults, attachmentParts);
                
                if (planResponse.type === AiResponseType.PLAN) {
                    projectPlan = planResponse.content;
                    set({ projectPlan, initialPlanPrompt: prompt });
                } else {
                    throw new Error("Falha ao criar plano do projeto");
                }
            }

            // FASE 1: FRONTEND - Mostrar progresso no editor
            set({
                currentAppPhase: 'GENERATING_FRONTEND',
                aiStatusMessage: '🎨 FASE 1/3: Criando interface do usuário completa e funcional...',
                htmlCode: '<!-- 🎨 GERANDO FRONTEND: Interface, Componentes, UX -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #34d399; border-radius: 8px; margin: 20px;">\n  <h2>🚀 Gerando Projeto Full-Stack (Frontend-First)</h2>\n  <p>🎨 FASE 1/3: Criando Frontend (Interface, UX, Componentes)</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Criando interface completa e funcional...</div>\n  </div>\n  <div style="margin-top: 20px; padding: 15px; background: #0f172a; border-radius: 4px; text-align: left; font-size: 12px;">\n    <div>✅ Estrutura HTML semântica</div>\n    <div>✅ CSS moderno e responsivo</div>\n    <div>✅ JavaScript interativo</div>\n    <div>✅ Componentes funcionais</div>\n  </div>\n</div>'
            });
            get().setDetailedStatus('Frontend', 'Interface', 'Criando interface completa e funcional...', 30, 30);

            // 🚀 FRONTEND COM STREAMING
            set(state => {
                state.editorInteractionState.isStreaming = true;
            });

            let frontendCode = "";
            const frontendStream = generateAiResponseStream(prompt, 'generate_code_from_plan', selectedTextModel, false, projectPlan, null, prompt, attachmentParts);
            
            for await (const chunk of frontendStream) {
                frontendCode += chunk.chunk;
                
                // Atualizar editor em tempo real
                const editorRef = (window as any).globalEditorRef;
                if (editorRef?.current) {
                    const model = editorRef.current.getModel();
                    if (model) {
                        const fullRange = model.getFullModelRange();
                        editorRef.current.executeEdits('ai-streaming', [{
                            range: fullRange,
                            text: frontendCode
                        }]);
                    }
                }
            }

            set(state => {
                state.editorInteractionState.isStreaming = false;
            });

            set({ lastInitialGeminiCodeForLog: frontendCode });
            get().updateStatusProgress(50);

            // FASE 2: BACKEND - Mostrar progresso no editor
            set({
                currentAppPhase: 'GENERATING_BACKEND',
                aiStatusMessage: '⚙️ FASE 2/3: Frontend pronto! Construindo APIs e banco de dados...',
                htmlCode: `<!-- ✅ FRONTEND CONCLUÍDO -->\n<!-- ⚙️ GERANDO BACKEND: APIs, Banco de Dados, Autenticação -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #60a5fa; border-radius: 8px; margin: 20px;">\n  <h2>🚀 Gerando Projeto Full-Stack (Frontend-First)</h2>\n  <p>✅ Frontend concluído e funcional!</p>\n  <p>⚙️ FASE 2/3: Criando Backend (APIs, Banco, Auth)</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Construindo arquitetura do servidor...</div>\n  </div>\n  <details style="margin-top: 20px; text-align: left;">\n    <summary style="cursor: pointer; color: #34d399;">📋 Frontend Gerado (clique para ver)</summary>\n    <pre style="background: #0f172a; padding: 15px; border-radius: 4px; overflow: auto; max-height: 200px; font-size: 12px;">${frontendResponse.content.substring(0, 1000)}...</pre>\n  </details>\n</div>`
            });
            get().setDetailedStatus('Backend', 'Arquitetura', 'Criando estrutura de APIs e banco de dados...', 60, 30);

            // Backend não precisa de streaming visual pois não vai para o editor
            const backendResponse = await generateAiResponse(prompt, 'generate_backend', selectedTextModel, projectPlan, frontendCode, prompt, get().researchFindings, attachmentParts);
            get().updateStatusProgress(80);

            // FASE 3: INTEGRAÇÃO - Mostrar progresso no editor
            set({
                aiStatusMessage: '🔗 FASE 3/3: Integrando frontend + backend...',
                htmlCode: `<!-- ✅ FRONTEND CONCLUÍDO -->\n<!-- ✅ BACKEND CONCLUÍDO -->\n<!-- 🔗 INTEGRANDO SISTEMA COMPLETO -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #f59e0b; border-radius: 8px; margin: 20px;">\n  <h2>🚀 Gerando Projeto Full-Stack (Frontend-First)</h2>\n  <p>✅ Frontend concluído e funcional!</p>\n  <p>✅ Backend concluído e robusto!</p>\n  <p>🔗 FASE 3/3: Integrando sistema completo</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Combinando frontend + backend...</div>\n  </div>\n</div>`
            });
            get().setDetailedStatus('Integração', 'Finalização', 'Combinando frontend e backend...', 85, 15);

            const finalHtml = combineFrontendAndBackend(frontendResponse.content, backendResponse.content);

            set({ aiStatusMessage: '🎬 Processando mídia e otimizações finais...' });
            get().setDetailedStatus('Mídia', 'Processamento', 'Adicionando imagens e vídeos...', 95, 10);

            const finalHtmlWithMedia = await postProcessHtmlWithMedia(finalHtml);
            get().updateStatusProgress(100);

            set({
                htmlCode: finalHtmlWithMedia,
                projectPlan: null,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: '🚀 Projeto full-stack completo! Frontend-First + Backend + Mídia integrados.',
                isLoadingAi: false
            });
            
            setTimeout(() => get().clearDetailedStatus(), 3000);

        } catch (error) {
            console.error('❌ ERRO NO FULLSTACK STREAMING:', error);
            
            set({
                currentAppPhase: 'IDLE',
                aiStatusMessage: `❌ Erro na geração fullstack: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                isLoadingAi: false
            });
            
            get().clearDetailedStatus();
        }
    },

    // ===== SISTEMA ARQUITETA ÚNICA - APP COMPLETO EM 2 ARQUIVOS =====
    handleArquitetaUnicaGeneration: async (prompt: string, currentCode: string, attachments?: AttachmentFile[]) => {
        console.log('🏗️ INICIANDO MODO ARQUITETA ÚNICA - App completo em 2 arquivos');
        
        set(state => {
            state.isLoadingAi = true;
            state.previousHtmlCode = currentCode;
            state.lastMajorOperationDescriptionForUndo = `Arquiteta: ${prompt.substring(0, 30)}...`;
            state.canUndoLastAiOperation = true;
            state.projectPlanSources = null;
            state.researchFindings = null;
            state.isResearchPanelOpen = false;
            state.consoleMessages = [];
            state.consoleErrorCount = 0;
            state.currentInteractionUserFeedback = null;
            state.autoCritiqueResult = null;
        });

        const { selectedTextModel } = get();
        const attachmentParts: Part[] = attachments ? attachments.map(att => ({
            inlineData: {
                mimeType: att.mimeType,
                data: att.data
            }
        })) : [];

        try {
            set({
                currentAppPhase: 'GENERATING_CODE_FROM_PLAN',
                aiStatusMessage: '🏗️ ARQUITETA ÚNICA: Criando aplicação completa em 2 arquivos...',
                htmlCode: '<!-- 🏗️ GERANDO APP COMPLETO: Frontend + Backend em 2 arquivos -->\n<div style="padding: 40px; text-align: center; font-family: monospace; background: #1e293b; color: #f59e0b; border-radius: 8px; margin: 20px;">\n  <h2>🏗️ Arquiteta Única - App Completo</h2>\n  <p>Criando aplicação completa em apenas 2 arquivos</p>\n  <div style="background: #334155; padding: 20px; border-radius: 4px; margin: 20px 0;">\n    <div style="animation: pulse 2s infinite;">Arquitetando solução completa...</div>\n  </div>\n  <div style="margin-top: 20px; padding: 15px; background: #0f172a; border-radius: 4px; text-align: left; font-size: 12px;">\n    <div>📄 index.html - Interface completa</div>\n    <div>⚙️ server.js - Backend funcional</div>\n    <div>🔗 Integração automática</div>\n  </div>\n</div>'
            });
            get().setDetailedStatus('Arquiteta', 'Criação', 'Arquitetando aplicação completa...', 20, 45);

            // Usar o serviço Gemini com prompt especializado para Arquiteta Única
            const arquitetaPrompt = `${prompt}

**MODO ARQUITETA ÚNICA ATIVADO**

Você deve criar uma aplicação COMPLETA em exatamente 2 arquivos:

1. **index.html** - Frontend completo com:
   - HTML semântico e responsivo
   - CSS moderno (Tailwind ou CSS customizado)
   - JavaScript funcional
   - Interface de usuário completa
   - Integração com backend via fetch/axios

2. **server.js** - Backend completo com:
   - Node.js + Express
   - APIs RESTful funcionais
   - Banco de dados (SQLite/MongoDB)
   - Autenticação se necessário
   - CORS configurado
   - Middleware essencial

**ESTRUTURA OBRIGATÓRIA:**
- Frontend e backend devem se comunicar
- APIs devem ser funcionais
- Banco de dados deve ser configurado automaticamente
- Código deve ser production-ready
- Documentação de instalação incluída

**FORMATO DE RESPOSTA:**
Retorne o HTML frontend completo e funcional. Se houver backend, gere arquivos separados e executáveis com instruções de instalação.
NUNCA use <script type="text/plain"> a menos que o usuário peça explicitamente "em um único arquivo".`;

            // 🚀 USAR STREAMING PARA MOSTRAR CÓDIGO EM TEMPO REAL
            set(state => {
                state.editorInteractionState.isStreaming = true;
            });

            let finalCode = "";
            const stream = generateAiResponseStream(arquitetaPrompt, 'generate_code_from_plan', selectedTextModel, false, null, currentCode === initialHtmlBase ? null : currentCode, prompt, attachmentParts);
            
            for await (const chunk of stream) {
                finalCode += chunk.chunk;
                
                // Atualizar editor em tempo real
                const editorRef = (window as any).globalEditorRef;
                if (editorRef?.current) {
                    const model = editorRef.current.getModel();
                    if (model) {
                        const fullRange = model.getFullModelRange();
                        editorRef.current.executeEdits('ai-streaming', [{
                            range: fullRange,
                            text: finalCode
                        }]);
                    }
                }
                
                // Atualizar progresso
                const progress = Math.min(30 + (finalCode.length / 100), 80);
                get().updateStatusProgress(progress);
            }

            // DESATIVAR streaming
            set(state => {
                state.editorInteractionState.isStreaming = false;
            });
            
            get().updateStatusProgress(80);
            set({ aiStatusMessage: '🎬 Processando mídia e otimizações finais...' });

            const finalHtmlWithMedia = await postProcessHtmlWithMedia(finalCode);
            get().updateStatusProgress(100);

            set({
                htmlCode: finalHtmlWithMedia,
                projectPlan: null,
                currentAppPhase: 'CODE_GENERATED',
                aiStatusMessage: '🏗️ Aplicação completa criada! Frontend + Backend em 2 arquivos.',
                isLoadingAi: false
            });
            
            setTimeout(() => get().clearDetailedStatus(), 3000);

        } catch (error) {
            console.error('❌ ERRO NO ARQUITETA ÚNICA:', error);
            
            set({
                currentAppPhase: 'IDLE',
                aiStatusMessage: `❌ Erro na criação da aplicação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                isLoadingAi: false
            });
            
            get().clearDetailedStatus();
        }
    },
})));