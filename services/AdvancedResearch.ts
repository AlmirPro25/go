// services/AdvancedResearch.ts - Sistema de Pesquisa Revolucionário

export interface FontSystem {
  id: string;
  name: string;
  primaryFont: string;
  secondaryFont: string;
  headingFont: string;
  bodyFont: string;
  accentFont: string;
  fontWeights: string[];
  googleFontsUrl: string;
  description: string;
  personality: string;
}

export interface EffectSystem {
  id: string;
  name: string;
  animations: string[];
  transitions: string[];
  shadows: string[];
  gradients: string[];
  filters: string[];
  transforms: string[];
  cssCode: string;
  description: string;
  mood: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  description: string;
  fontSystem: FontSystem;
  effectSystem: EffectSystem;
  personality: string;
  mood: string;
}

export interface DesignResearch {
  colorPalettes: ColorPalette[];
  fontSystems: FontSystem[];
  effectSystems: EffectSystem[];
  designPatterns: string[];
  layoutStructures: string[];
  uiComponents: string[];
  inspirationSources: string[];
}

export const ADVANCED_RESEARCH_PROMPT = `
🔍 **VOCÊ É UM PESQUISADOR DE DESIGN REVOLUCIONÁRIO**

**MISSÃO:** Fazer pesquisa PROFUNDA sobre design, cores e padrões para o projeto solicitado.

**PROCESSO DE PESQUISA:**

1. **ANÁLISE DO PEDIDO**
   - Se for "clone do TikTok" → Pesquisar interface EXATA do TikTok
   - Se for "clone do YouTube" → Pesquisar layout EXATO do YouTube  
   - Se for "página inicial da Netflix" → Replicar EXATAMENTE a Netflix
   - Se for projeto original → Pesquisar tendências e referências

2. **PESQUISA INTEGRADA: CORES + FONTES + EFEITOS**
   - Gerar 5 sistemas completos e únicos
   - Cada sistema com: PALETA + FONTES + EFEITOS integrados
   - Baseados em: psicologia das cores, tipografia, tendências 2024, contexto do projeto

   **PALETAS DE CORES:**
   - Primária, secundária, destaque, fundo, texto
   - Harmonia cromática perfeita
   - Acessibilidade e contraste

   **SISTEMAS DE FONTES:**
   - Fonte principal (headings)
   - Fonte secundária (body)
   - Fonte de destaque (accent)
   - Pesos e estilos
   - Google Fonts URLs

   **SISTEMAS DE EFEITOS:**
   - Animações CSS
   - Transições suaves
   - Sombras e profundidade
   - Gradientes
   - Filtros e transformações

3. **PESQUISA DE PADRÕES DE DESIGN**
   - Layouts modernos
   - Componentes UI atuais
   - Microinterações
   - Tipografia
   - Espaçamentos

4. **PESQUISA DE ESTRUTURAS**
   - Grid systems
   - Navigation patterns
   - Content organization
   - Responsive breakpoints

**FORMATO DE RESPOSTA (JSON):**
{
  "colorPalettes": [
    {
      "id": "system1",
      "name": "Nome Criativo do Sistema",
      "primary": "#hex",
      "secondary": "#hex", 
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex",
      "description": "Descrição da paleta",
      "personality": "Moderna, Elegante, Profissional",
      "mood": "Confiança e Sofisticação",
      "fontSystem": {
        "id": "font1",
        "name": "Sistema Tipográfico",
        "primaryFont": "Montserrat",
        "secondaryFont": "Open Sans",
        "headingFont": "Montserrat",
        "bodyFont": "Open Sans",
        "accentFont": "Dancing Script",
        "fontWeights": ["300", "400", "600", "700"],
        "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Open+Sans:wght@300;400;600&family=Dancing+Script:wght@400;700&display=swap",
        "description": "Combinação moderna e legível",
        "personality": "Profissional e Acessível"
      },
      "effectSystem": {
        "id": "effect1",
        "name": "Sistema de Efeitos",
        "animations": ["fadeIn", "slideUp", "bounce"],
        "transitions": ["ease-in-out 0.3s", "cubic-bezier(0.4, 0, 0.2, 1) 0.2s"],
        "shadows": ["0 4px 6px rgba(0,0,0,0.1)", "0 10px 25px rgba(0,0,0,0.15)"],
        "gradients": ["linear-gradient(135deg, #667eea 0%, #764ba2 100%)"],
        "filters": ["blur(10px)", "brightness(1.1)"],
        "transforms": ["scale(1.05)", "translateY(-2px)"],
        "cssCode": "/* CSS dos efeitos */",
        "description": "Efeitos suaves e modernos",
        "mood": "Elegante e Interativo"
      }
    }
  ],
  "designPatterns": ["padrão1", "padrão2"],
  "layoutStructures": ["estrutura1", "estrutura2"],
  "uiComponents": ["componente1", "componente2"],
  "inspirationSources": ["fonte1", "fonte2"]
}
`;

export const CLONE_DETECTION_SYSTEM = `
🎯 **SISTEMA DE DETECÇÃO DE CLONES**

**PALAVRAS-CHAVE PARA CLONES:**
- "clone do" → Replicar interface exata
- "igual ao" → Copiar layout específico
- "como o" → Inspirar-se mas adaptar
- "página inicial da" → Replicar homepage exata
- "interface do" → Copiar UI específica

**CLONES ESPECÍFICOS:**

**TIKTOK:**
- Layout: Feed vertical infinito
- Cores: Preto (#000000), Branco (#FFFFFF), Rosa (#FF0050), Azul (#25F4EE)
- Componentes: Video player, botões laterais, comentários
- Tipografia: Proxima Nova, sans-serif

**YOUTUBE:**
- Layout: Header + Sidebar + Grid de vídeos
- Cores: Vermelho (#FF0000), Branco (#FFFFFF), Cinza (#0F0F0F)
- Componentes: Player, thumbnails, sidebar, search
- Tipografia: Roboto, sans-serif

**NETFLIX:**
- Layout: Hero banner + carrosséis horizontais
- Cores: Preto (#000000), Vermelho (#E50914), Cinza (#221F1F)
- Componentes: Hero video, carrosséis, cards
- Tipografia: Netflix Sans, Helvetica

**INSTAGRAM:**
- Layout: Stories + Feed + Navigation
- Cores: Branco (#FFFFFF), Gradiente (#833AB4, #FD1D1D, #FCB045)
- Componentes: Stories, posts, navigation
- Tipografia: Proxima Nova, sans-serif

**SPOTIFY:**
- Layout: Sidebar + Main content + Player
- Cores: Verde (#1DB954), Preto (#191414), Cinza (#121212)
- Componentes: Playlists, player, search
- Tipografia: Circular, sans-serif
`;

export async function performAdvancedResearch(
  userPrompt: string,
  modelName: string = 'gemini-2.5-pro'
): Promise<DesignResearch> {
  const { ApiKeyManager } = await import('./ApiKeyManager');
  const apiKey = ApiKeyManager.getKeyToUse();
  if (!apiKey) {
    throw new Error('API Key do Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env ou adicione uma chave nas configurações.');
  }
  const ai = new (await import('@google/genai')).GoogleGenAI({ apiKey });

  const researchPrompt = `
${ADVANCED_RESEARCH_PROMPT}

${CLONE_DETECTION_SYSTEM}

**PROJETO SOLICITADO:** "${userPrompt}"

**🎨 INSTRUÇÕES PARA SISTEMAS INTEGRADOS:**

**CADA PALETA DEVE TER:**
1. **Harmonia Cromática**: Cores que funcionam perfeitamente juntas
2. **Sistema de Fontes Casado**: Tipografia que complementa a personalidade das cores
3. **Efeitos Coordenados**: Animações e efeitos que reforçam o mood do sistema

**PERSONALIDADES POSSÍVEIS:**
- **Profissional**: Cores sóbrias + fontes clean + efeitos sutis
- **Criativo**: Cores vibrantes + fontes expressivas + efeitos dinâmicos  
- **Elegante**: Cores sofisticadas + fontes serif + efeitos refinados
- **Moderno**: Cores tech + fontes sans-serif + efeitos futuristas
- **Natural**: Cores orgânicas + fontes humanistas + efeitos suaves

**CADA SISTEMA DEVE CONTAR UMA HISTÓRIA VISUAL COMPLETA!**

**SUA PESQUISA DEVE SER REVOLUCIONÁRIA E COMPLETA.**
Retorne APENAS o JSON com 5 sistemas integrados perfeitos.
`;

  // Sistema de retry com fallback de modelos (apenas Gemini 2.5)
  const maxRetries = 5;
  
  // Função para obter modelos de fallback (apenas Gemini 2.5)
  const getFallbackModels = (originalModel: string): string[] => {
    const modelFallbacks: Record<string, string[]> = {
      'gemini-2.5-pro': ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
      'gemini-2.5-flash': ['gemini-2.5-flash-lite', 'gemini-2.5-pro'],
      'gemini-2.5-flash-lite': ['gemini-2.5-flash', 'gemini-2.5-pro']
    };
    return modelFallbacks[originalModel] || ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  };
  
  const fallbackModels = getFallbackModels(modelName);
  let currentModel = modelName;
  let fallbackIndex = 0;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Tentar modelo alternativo na tentativa 3 e 4
      if (attempt === 3 && fallbackIndex < fallbackModels.length) {
        currentModel = fallbackModels[fallbackIndex];
        fallbackIndex++;
        console.log(`🔄 Pesquisa: Tentando modelo alternativo: ${currentModel}`);
      } else if (attempt === 4 && fallbackIndex < fallbackModels.length) {
        currentModel = fallbackModels[fallbackIndex];
        fallbackIndex++;
        console.log(`🔄 Pesquisa: Tentando modelo alternativo: ${currentModel}`);
      }

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: researchPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const researchData = JSON.parse(response.text || '{}');
      
      // Garantir que temos 5 paletas
      if (!researchData.colorPalettes || researchData.colorPalettes.length < 5) {
        researchData.colorPalettes = generateDefaultPalettes();
      }

      return researchData;
    } catch (error) {
      lastError = error as Error;
      console.error(`Erro na pesquisa avançada (tentativa ${attempt}/${maxRetries}):`, error);

      // Verificar se é erro 503/UNAVAILABLE
      if (error instanceof Error) {
        const isRetryableError =
          error.message.includes("503") ||
          error.message.includes("UNAVAILABLE") ||
          error.message.includes("overloaded") ||
          error.message.includes("timeout") ||
          error.message.includes("DEADLINE_EXCEEDED") ||
          error.message.includes("INTERNAL") ||
          error.message.includes("502") ||
          error.message.includes("504");

        if (isRetryableError && attempt < maxRetries) {
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
          console.log(`⏳ Pesquisa: Servidor sobrecarregado. Aguardando ${delay}ms antes da tentativa ${attempt + 1}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      // Se não for recuperável ou for a última tentativa, usar paletas padrão
      if (attempt === maxRetries) {
        console.warn('⚠️ Pesquisa avançada falhou após todas as tentativas. Usando paletas padrão.');
        break;
      }
    }
  }
  // Fallback: retornar paletas padrão
  const palettes = generateDefaultPalettes();
  return {
    colorPalettes: palettes,
    fontSystems: palettes.map(p => p.fontSystem),
    effectSystems: palettes.map(p => p.effectSystem),
    designPatterns: ['Modern Minimalism', 'Glassmorphism', 'Neumorphism', 'Brutalism', 'Organic Design'],
    layoutStructures: ['CSS Grid', 'Flexbox Layout', 'Masonry Grid', 'Asymmetric Layout', 'Modular Grid'],
    uiComponents: ['Hero Sections', 'Card Systems', 'Navigation Bars', 'Form Elements', 'Interactive Buttons'],
    inspirationSources: ['Dribbble', 'Behance', 'Awwwards', 'Mobbin', 'UI Movement']
  };
}

function generateDefaultPalettes(): ColorPalette[] {
  return [
    {
      id: 'modern-dark',
      name: 'Modern Dark Elite',
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#0f172a',
      text: '#e2e8f0',
      description: 'Sistema escuro moderno e elegante',
      personality: 'Profissional, Sofisticado, Tecnológico',
      mood: 'Confiança e Inovação',
      fontSystem: {
        id: 'modern-fonts',
        name: 'Modern Tech',
        primaryFont: 'Inter',
        secondaryFont: 'JetBrains Mono',
        headingFont: 'Inter',
        bodyFont: 'Inter',
        accentFont: 'JetBrains Mono',
        fontWeights: ['300', '400', '500', '600', '700'],
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
        description: 'Tipografia moderna e tecnológica',
        personality: 'Clean, Técnico, Legível'
      },
      effectSystem: {
        id: 'modern-effects',
        name: 'Tech Glow',
        animations: ['fadeInUp', 'slideInRight', 'pulse'],
        transitions: ['all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 'transform 0.2s ease'],
        shadows: ['0 4px 6px rgba(37, 99, 235, 0.1)', '0 20px 25px rgba(0, 0, 0, 0.25)'],
        gradients: ['linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)'],
        filters: ['blur(20px)', 'brightness(1.1)', 'saturate(1.2)'],
        transforms: ['scale(1.02)', 'translateY(-4px)', 'rotateX(5deg)'],
        cssCode: `
          .glow-effect { box-shadow: 0 0 20px rgba(37, 99, 235, 0.3); }
          .hover-lift:hover { transform: translateY(-4px) scale(1.02); }
          .tech-gradient { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); }
        `,
        description: 'Efeitos tecnológicos com brilho sutil',
        mood: 'Futurista e Interativo'
      }
    },
    {
      id: 'vibrant-energy',
      name: 'Vibrant Energy Burst',
      primary: '#7c3aed',
      secondary: '#06d6a0',
      accent: '#ff0080',
      background: '#ffffff',
      text: '#1a1a1a',
      description: 'Sistema vibrante e energético',
      personality: 'Criativo, Dinâmico, Jovem',
      mood: 'Energia e Criatividade',
      fontSystem: {
        id: 'vibrant-fonts',
        name: 'Creative Bold',
        primaryFont: 'Poppins',
        secondaryFont: 'Nunito',
        headingFont: 'Poppins',
        bodyFont: 'Nunito',
        accentFont: 'Fredoka One',
        fontWeights: ['300', '400', '600', '700', '800'],
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Nunito:wght@300;400;600;700&family=Fredoka+One&display=swap',
        description: 'Tipografia criativa e amigável',
        personality: 'Divertida, Moderna, Acessível'
      },
      effectSystem: {
        id: 'vibrant-effects',
        name: 'Energy Burst',
        animations: ['bounceIn', 'zoomIn', 'rotateIn', 'rainbow'],
        transitions: ['all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 'color 0.3s ease'],
        shadows: ['0 8px 32px rgba(124, 58, 237, 0.2)', '0 0 40px rgba(255, 0, 128, 0.3)'],
        gradients: ['linear-gradient(45deg, #7c3aed, #06d6a0, #ff0080)', 'conic-gradient(from 0deg, #7c3aed, #06d6a0, #ff0080, #7c3aed)'],
        filters: ['hue-rotate(10deg)', 'saturate(1.3)', 'contrast(1.1)'],
        transforms: ['scale(1.1)', 'rotate(2deg)', 'skew(-2deg, 1deg)'],
        cssCode: `
          .rainbow-gradient { background: linear-gradient(45deg, #7c3aed, #06d6a0, #ff0080); }
          .bounce-hover:hover { animation: bounce 0.6s; }
          .energy-glow { box-shadow: 0 0 30px rgba(124, 58, 237, 0.4); }
        `,
        description: 'Efeitos vibrantes e dinâmicos',
        mood: 'Alegre e Energético'
      }
    },
    {
      id: 'ocean-breeze',
      name: 'Ocean Breeze Serenity',
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: '#f8fafc',
      text: '#0f172a',
      description: 'Sistema inspirado no oceano',
      personality: 'Calmo, Natural, Refrescante',
      mood: 'Tranquilidade e Clareza',
      fontSystem: {
        id: 'ocean-fonts',
        name: 'Coastal Calm',
        primaryFont: 'Lato',
        secondaryFont: 'Source Sans Pro',
        headingFont: 'Lato',
        bodyFont: 'Source Sans Pro',
        accentFont: 'Caveat',
        fontWeights: ['300', '400', '600', '700'],
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Source+Sans+Pro:wght@300;400;600;700&family=Caveat:wght@400;700&display=swap',
        description: 'Tipografia limpa e respirável',
        personality: 'Serena, Legível, Natural'
      },
      effectSystem: {
        id: 'ocean-effects',
        name: 'Wave Motion',
        animations: ['wave', 'float', 'ripple'],
        transitions: ['all 0.6s ease-in-out', 'opacity 0.4s ease'],
        shadows: ['0 4px 20px rgba(14, 165, 233, 0.15)', '0 8px 30px rgba(6, 182, 212, 0.2)'],
        gradients: ['linear-gradient(120deg, #0ea5e9 0%, #06b6d4 50%, #10b981 100%)', 'radial-gradient(ellipse at center, rgba(14,165,233,0.1) 0%, transparent 70%)'],
        filters: ['blur(1px)', 'brightness(1.05)'],
        transforms: ['translateY(-2px)', 'scale(1.01)'],
        cssCode: `
          .wave-effect { animation: wave 2s ease-in-out infinite; }
          .ocean-gradient { background: linear-gradient(120deg, #0ea5e9, #06b6d4, #10b981); }
          .float:hover { transform: translateY(-2px); }
        `,
        description: 'Efeitos suaves como ondas do mar',
        mood: 'Relaxante e Fluido'
      }
    },
    {
      id: 'sunset-glow',
      name: 'Sunset Glow Warmth',
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#fbbf24',
      background: '#fef7ed',
      text: '#7c2d12',
      description: 'Sistema quente do pôr do sol',
      personality: 'Acolhedor, Caloroso, Inspirador',
      mood: 'Otimismo e Energia',
      fontSystem: {
        id: 'sunset-fonts',
        name: 'Warm Embrace',
        primaryFont: 'Merriweather',
        secondaryFont: 'Open Sans',
        headingFont: 'Merriweather',
        bodyFont: 'Open Sans',
        accentFont: 'Pacifico',
        fontWeights: ['300', '400', '700', '900'],
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Open+Sans:wght@300;400;600&family=Pacifico&display=swap',
        description: 'Tipografia calorosa e convidativa',
        personality: 'Acolhedora, Elegante, Humana'
      },
      effectSystem: {
        id: 'sunset-effects',
        name: 'Golden Hour',
        animations: ['glow', 'warmPulse', 'shimmer'],
        transitions: ['all 0.5s ease-out', 'box-shadow 0.3s ease'],
        shadows: ['0 6px 20px rgba(249, 115, 22, 0.25)', '0 0 40px rgba(251, 191, 36, 0.3)'],
        gradients: ['linear-gradient(45deg, #f97316 0%, #ef4444 50%, #fbbf24 100%)', 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 60%)'],
        filters: ['sepia(0.1)', 'brightness(1.1)', 'contrast(1.05)'],
        transforms: ['scale(1.03)', 'rotate(-1deg)'],
        cssCode: `
          .sunset-glow { box-shadow: 0 0 30px rgba(249, 115, 22, 0.4); }
          .warm-gradient { background: linear-gradient(45deg, #f97316, #ef4444, #fbbf24); }
          .golden-hover:hover { filter: brightness(1.1) sepia(0.1); }
        `,
        description: 'Efeitos dourados e calorosos',
        mood: 'Aconchegante e Inspirador'
      }
    },
    {
      id: 'forest-calm',
      name: 'Forest Calm Harmony',
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#84cc16',
      background: '#f0fdf4',
      text: '#14532d',
      description: 'Sistema da tranquilidade da floresta',
      personality: 'Natural, Equilibrado, Sustentável',
      mood: 'Harmonia e Crescimento',
      fontSystem: {
        id: 'forest-fonts',
        name: 'Natural Balance',
        primaryFont: 'Libre Baskerville',
        secondaryFont: 'Lora',
        headingFont: 'Libre Baskerville',
        bodyFont: 'Lora',
        accentFont: 'Dancing Script',
        fontWeights: ['400', '500', '600', '700'],
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;500;600;700&family=Dancing+Script:wght@400;700&display=swap',
        description: 'Tipografia orgânica e equilibrada',
        personality: 'Natural, Sofisticada, Sustentável'
      },
      effectSystem: {
        id: 'forest-effects',
        name: 'Nature Growth',
        animations: ['grow', 'sway', 'breathe'],
        transitions: ['all 0.8s ease-in-out', 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'],
        shadows: ['0 4px 15px rgba(5, 150, 105, 0.2)', '0 8px 25px rgba(13, 148, 136, 0.15)'],
        gradients: ['linear-gradient(135deg, #059669 0%, #0d9488 50%, #84cc16 100%)', 'linear-gradient(to bottom, rgba(5,150,105,0.1) 0%, transparent 100%)'],
        filters: ['saturate(1.1)', 'brightness(1.02)'],
        transforms: ['scale(1.02)', 'translateY(-1px)'],
        cssCode: `
          .nature-gradient { background: linear-gradient(135deg, #059669, #0d9488, #84cc16); }
          .grow-effect:hover { transform: scale(1.02) translateY(-1px); }
          .forest-shadow { box-shadow: 0 4px 15px rgba(5, 150, 105, 0.2); }
        `,
        description: 'Efeitos orgânicos e naturais',
        mood: 'Crescimento e Sustentabilidade'
      }
    }
  ];
}