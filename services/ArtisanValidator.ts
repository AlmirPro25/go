// services/ArtisanValidator.ts - Validador do Manifesto do Artesão Digital

export interface ArtisanValidationResult {
  isValid: boolean;
  score: number; // 0-100
  principleScores: {
    experience: number;
    structure: number;
    style: number;
    interactivity: number;
    resilience: number;
    delivery: number;
  };
  violations: string[];
  suggestions: string[];
  summary: string;
}

export class ArtisanValidator {
  
  /**
   * Valida se o código HTML segue os 6 Princípios do Manifesto do Artesão Digital
   */
  static validateCode(htmlCode: string, userPrompt: string): ArtisanValidationResult {
    const violations: string[] = [];
    const suggestions: string[] = [];
    const scores = {
      experience: 0,
      structure: 0,
      style: 0,
      interactivity: 0,
      resilience: 0,
      delivery: 0
    };

    // Parse do HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlCode, 'text/html');

    // PRINCÍPIO 1: EXPERIÊNCIA PRIMEIRO
    scores.experience = this.validateExperience(doc, userPrompt, violations, suggestions);

    // PRINCÍPIO 2: ESTRUTURA SEMÂNTICA
    scores.structure = this.validateStructure(doc, violations, suggestions);

    // PRINCÍPIO 3: ESTILO ADAPTATIVO
    scores.style = this.validateStyle(doc, htmlCode, violations, suggestions);

    // PRINCÍPIO 4: INTERATIVIDADE REATIVA
    scores.interactivity = this.validateInteractivity(doc, htmlCode, violations, suggestions);

    // PRINCÍPIO 5: RESILIÊNCIA
    scores.resilience = this.validateResilience(doc, htmlCode, violations, suggestions);

    // PRINCÍPIO 6: ENTREGA COMPLETA
    scores.delivery = this.validateDelivery(doc, htmlCode, violations, suggestions);

    // Calcular score total
    const totalScore = Math.round(
      (scores.experience + scores.structure + scores.style + 
       scores.interactivity + scores.resilience + scores.delivery) / 6
    );

    const isValid = totalScore >= 80;

    const summary = this.generateSummary(totalScore, scores, violations.length);

    return {
      isValid,
      score: totalScore,
      principleScores: scores,
      violations,
      suggestions,
      summary
    };
  }

  // PRINCÍPIO 1: A EXPERIÊNCIA PRIMEIRO
  private static validateExperience(doc: Document, userPrompt: string, violations: string[], suggestions: string[]): number {
    let score = 0;

    // Verificar se há uma jornada clara do usuário
    const hasNavigation = doc.querySelector('nav') !== null;
    const hasMainContent = doc.querySelector('main') !== null;
    const hasClearSections = doc.querySelectorAll('section').length > 0;

    if (hasNavigation) score += 25;
    else violations.push("Falta navegação clara (elemento <nav>)");

    if (hasMainContent) score += 25;
    else violations.push("Falta conteúdo principal (elemento <main>)");

    if (hasClearSections) score += 25;
    else suggestions.push("Adicione seções (<section>) para organizar melhor a jornada do usuário");

    // Verificar se o conteúdo faz sentido para o prompt
    const title = doc.querySelector('title')?.textContent || '';
    const h1 = doc.querySelector('h1')?.textContent || '';
    
    if (title.length > 0 && h1.length > 0) score += 25;
    else violations.push("Título e H1 devem estar presentes e ser descritivos");

    return Math.min(100, score);
  }

  // PRINCÍPIO 2: ESTRUTURA SEMÂNTICA
  private static validateStructure(doc: Document, violations: string[], suggestions: string[]): number {
    let score = 0;

    // Verificar DOCTYPE
    if (doc.doctype) score += 10;
    else violations.push("DOCTYPE HTML5 obrigatório");

    // Verificar meta tags essenciais
    const charset = doc.querySelector('meta[charset]');
    const viewport = doc.querySelector('meta[name="viewport"]');
    const description = doc.querySelector('meta[name="description"]');

    if (charset) score += 15;
    else violations.push("Meta charset obrigatório");

    if (viewport) score += 15;
    else violations.push("Meta viewport obrigatório para responsividade");

    if (description) score += 10;
    else suggestions.push("Adicione meta description para SEO");

    // Verificar elementos semânticos
    const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'footer'];
    const foundElements = semanticElements.filter(tag => doc.querySelector(tag));
    
    score += (foundElements.length / semanticElements.length) * 30;

    if (foundElements.length < 3) {
      violations.push("Use mais elementos semânticos HTML5 (header, nav, main, section, article, footer)");
    }

    // Verificar data-aid
    const elementsWithDataAid = doc.querySelectorAll('[data-aid]').length;
    const totalElements = doc.querySelectorAll('*').length;
    
    if (elementsWithDataAid > totalElements * 0.3) score += 20;
    else suggestions.push("Adicione data-aid em mais elementos para melhor identificação");

    return Math.min(100, score);
  }

  // PRINCÍPIO 3: ESTILO ADAPTATIVO
  private static validateStyle(doc: Document, htmlCode: string, violations: string[], suggestions: string[]): number {
    let score = 0;

    // Verificar se há CSS
    const hasInlineCSS = htmlCode.includes('<style>');
    const hasExternalCSS = doc.querySelector('link[rel="stylesheet"]');
    
    if (hasInlineCSS || hasExternalCSS) score += 20;
    else violations.push("Código deve incluir estilos CSS");

    // Verificar responsividade
    const hasMediaQueries = htmlCode.includes('@media');
    const hasFlexbox = htmlCode.includes('flex');
    const hasGrid = htmlCode.includes('grid');

    if (hasMediaQueries || hasFlexbox || hasGrid) score += 30;
    else violations.push("Implemente design responsivo com media queries, flexbox ou grid");

    // Verificar variáveis CSS
    const hasCSSVariables = htmlCode.includes('--') || htmlCode.includes('var(');
    if (hasCSSVariables) score += 20;
    else suggestions.push("Use variáveis CSS (:root) para cores e espaçamentos");

    // Verificar paleta de cores consistente
    const colorMatches = htmlCode.match(/#[0-9a-fA-F]{6}|rgb\(|hsl\(/g);
    if (colorMatches && colorMatches.length >= 3) score += 15;
    else suggestions.push("Defina uma paleta de cores consistente");

    // Verificar tipografia
    const hasFontFamily = htmlCode.includes('font-family');
    if (hasFontFamily) score += 15;
    else suggestions.push("Defina tipografia clara com font-family");

    return Math.min(100, score);
  }

  // PRINCÍPIO 4: INTERATIVIDADE REATIVA
  private static validateInteractivity(doc: Document, htmlCode: string, violations: string[], suggestions: string[]): number {
    let score = 0;

    // Verificar se há JavaScript
    const hasJS = htmlCode.includes('<script>') || doc.querySelector('script[src]');
    if (hasJS) score += 30;
    else suggestions.push("Adicione interatividade com JavaScript quando apropriado");

    // Verificar event listeners
    const hasEventListeners = htmlCode.includes('addEventListener') || htmlCode.includes('onclick');
    if (hasEventListeners) score += 25;

    // Verificar estados visuais
    const hasHoverStates = htmlCode.includes(':hover');
    const hasFocusStates = htmlCode.includes(':focus');
    
    if (hasHoverStates) score += 15;
    if (hasFocusStates) score += 15;
    else suggestions.push("Adicione estados visuais (:hover, :focus) para melhor UX");

    // Verificar formulários interativos
    const forms = doc.querySelectorAll('form');
    if (forms.length > 0) {
      const hasValidation = htmlCode.includes('required') || htmlCode.includes('pattern');
      if (hasValidation) score += 15;
      else suggestions.push("Adicione validação em formulários");
    } else {
      score += 15; // Não penalizar se não há formulários
    }

    return Math.min(100, score);
  }

  // PRINCÍPIO 5: RESILIÊNCIA
  private static validateResilience(doc: Document, htmlCode: string, violations: string[], suggestions: string[]): number {
    let score = 0;

    // Verificar alt em imagens
    const images = doc.querySelectorAll('img');
    const imagesWithAlt = doc.querySelectorAll('img[alt]');
    
    if (images.length === 0 || imagesWithAlt.length === images.length) score += 25;
    else violations.push("Todas as imagens devem ter atributo alt para acessibilidade");

    // Verificar labels em inputs
    const inputs = doc.querySelectorAll('input');
    const labels = doc.querySelectorAll('label');
    
    if (inputs.length === 0 || labels.length >= inputs.length) score += 25;
    else violations.push("Todos os inputs devem ter labels associados");

    // Verificar tratamento de erros
    const hasErrorHandling = htmlCode.includes('try') && htmlCode.includes('catch');
    if (hasErrorHandling) score += 25;
    else suggestions.push("Implemente tratamento de erros com try/catch");

    // Verificar loading states
    const hasLoadingStates = htmlCode.includes('loading') || htmlCode.includes('spinner');
    if (hasLoadingStates) score += 25;
    else suggestions.push("Adicione estados de carregamento para melhor UX");

    return Math.min(100, score);
  }

  // PRINCÍPIO 6: ENTREGA COMPLETA
  private static validateDelivery(doc: Document, htmlCode: string, violations: string[], suggestions: string[]): number {
    let score = 0;

    // Verificar se o código está completo
    const hasTitle = doc.querySelector('title')?.textContent?.length > 0;
    const hasContent = doc.body?.textContent?.trim().length > 0;
    
    if (hasTitle) score += 25;
    else violations.push("Título da página obrigatório");

    if (hasContent) score += 25;
    else violations.push("Página deve ter conteúdo visível");

    // Verificar comentários explicativos
    const hasComments = htmlCode.includes('<!--') || htmlCode.includes('//');
    if (hasComments) score += 25;
    else suggestions.push("Adicione comentários explicativos no código");

    // Verificar se está pronto para produção
    const hasMinification = htmlCode.length < 10000 || htmlCode.includes('minified');
    const hasOptimization = htmlCode.includes('lazy') || htmlCode.includes('defer');
    
    if (hasOptimization) score += 25;
    else suggestions.push("Otimize para produção com lazy loading e defer");

    return Math.min(100, score);
  }

  private static generateSummary(totalScore: number, scores: any, violationCount: number): string {
    if (totalScore >= 90) {
      return `🏆 OBRA-PRIMA DIGITAL! Pontuação: ${totalScore}/100. O código segue exemplarmente o Manifesto do Artesão Digital.`;
    } else if (totalScore >= 80) {
      return `✅ CÓDIGO PROFISSIONAL! Pontuação: ${totalScore}/100. Segue bem os princípios do manifesto com pequenos ajustes.`;
    } else if (totalScore >= 60) {
      return `⚠️ BOM CÓDIGO com melhorias necessárias. Pontuação: ${totalScore}/100. ${violationCount} violações encontradas.`;
    } else {
      return `❌ CÓDIGO PRECISA DE REFATORAÇÃO. Pontuação: ${totalScore}/100. Muitas violações dos princípios do manifesto.`;
    }
  }
}