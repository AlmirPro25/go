/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║                    🧠 KNOWLEDGE BASE - MEMÓRIA VETORIAL                      ║
 * ║                                                                              ║
 * ║              "A Biblioteca de Alexandria, Mas Organizada"                   ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * PROPÓSITO:
 * Externalizar todo o conhecimento de domínio (manifestos, princípios, padrões)
 * para uma base consultável dinamicamente, em vez de hardcoded inline.
 * 
 * ARQUITETURA:
 * - Conhecimento estruturado em JSON
 * - Busca por domínio/contexto
 * - Extensível para busca vetorial futura (ChromaDB/pgvector)
 */

export interface DomainKnowledge {
  domain: string;
  keywords: string[];
  principles: string[];
  architecture: {
    stack: string[];
    patterns: string[];
    security: string[];
  };
  templates: {
    structure: Record<string, any>;
    files: Array<{
      path: string;
      template: string;
    }>;
  };
  examples: string[];
}

export interface KnowledgeQueryResult {
  domain: string;
  relevance: number;
  context: string;
  principles: string[];
  architecture: DomainKnowledge['architecture'];
  templates: DomainKnowledge['templates'];
}

export class KnowledgeBase {
  private domains: Map<string, DomainKnowledge> = new Map();

  constructor() {
    this.initializeDomains();
  }

  /**
   * Inicializar domínios de conhecimento
   */
  private initializeDomains(): void {
    // Domínio: Fintech
    this.domains.set('fintech', {
      domain: 'fintech',
      keywords: [
        'fintech', 'banco', 'bank', 'banking',
        'pagamento', 'payment', 'pix',
        'transferência', 'transfer', 'withdrawal',
        'depósito', 'deposit',
        'empréstimo', 'loan', 'crédito', 'credit',
        'carteira digital', 'wallet',
        'conta virtual', 'virtual account',
        'saldo', 'balance',
        'transação', 'transaction',
        'mercado pago', 'stripe', 'paypal'
      ],
      principles: [
        'Transações atômicas obrigatórias (BEGIN/COMMIT/ROLLBACK)',
        'PostgreSQL como fonte única da verdade',
        'Modelo de contas virtuais (Cofre Central)',
        'Verificação de saldo ANTES de débito (SELECT FOR UPDATE)',
        'Logs imutáveis de todas as operações',
        'Webhook com validação de assinatura',
        'Aviso regulatório BACEN obrigatório',
        'Criptografia de dados sensíveis (CPF, chaves PIX)',
        'Rate limiting em endpoints financeiros',
        'Auditoria completa (quem, quando, o quê, de onde)'
      ],
      architecture: {
        stack: [
          'Backend: Go (Gin) ou Node.js (Fastify)',
          'Frontend: React + TypeScript ou Vue.js 3',
          'Database: PostgreSQL (ACID compliance)',
          'Infraestrutura: Docker Compose',
          'Cache: Redis (opcional)',
          'Queue: BullMQ (para processamento assíncrono)'
        ],
        patterns: [
          'Contas Virtuais (saldo em tabela accounts)',
          'Transações Atômicas (BEGIN/COMMIT/ROLLBACK)',
          'Webhook Handler (validação de assinatura)',
          'External Reference (rastreamento de transações)',
          'Idempotência (evitar duplicação de transações)',
          'Event Sourcing (registro imutável de eventos)'
        ],
        security: [
          'JWT com refresh tokens',
          'Bcrypt para senhas',
          'AES-256 para dados sensíveis',
          'Rate limiting (5 req/min para transfers)',
          'CORS configurado',
          'Helmet.js para headers de segurança',
          'Validação de entrada (Zod/Joi)',
          'Prepared statements (SQL Injection protection)'
        ]
      },
      templates: {
        structure: {
          'backend/': {
            'src/': {
              'routes/': ['auth.ts', 'deposits.ts', 'withdrawals.ts', 'loans.ts', 'accounts.ts'],
              'services/': ['MercadoPagoService.ts', 'TransactionService.ts', 'LoanService.ts'],
              'repositories/': ['AccountRepository.ts', 'TransactionRepository.ts', 'LoanRepository.ts'],
              'middleware/': ['auth.ts', 'rateLimit.ts', 'validation.ts'],
              'server.ts': true
            },
            'prisma/': ['schema.prisma'],
            'Dockerfile': true,
            'package.json': true,
            '.env.example': true
          },
          'frontend/': {
            'src/': {
              'pages/': ['Dashboard.tsx', 'Deposit.tsx', 'Transfer.tsx', 'Loans.tsx'],
              'components/': ['QRCodeDisplay.tsx', 'TransactionList.tsx', 'BalanceCard.tsx', 'RegulatoryWarning.tsx'],
              'hooks/': ['useAccount.ts', 'useTransactions.ts'],
              'App.tsx': true
            },
            'Dockerfile': true,
            'package.json': true
          },
          'docker-compose.yml': true,
          'docs/': ['API.md', 'ARCHITECTURE.md', 'DEPLOYMENT.md'],
          'README.md': true
        },
        files: [
          {
            path: 'backend/prisma/schema.prisma',
            template: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Account {
  id        String   @id @default(uuid())
  userId    String   @unique
  balance   Decimal  @default(0.00) @db.Decimal(15, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  transactions Transaction[]
  loans        Loan[]
  
  @@index([userId])
}

model Transaction {
  id                String   @id @default(uuid())
  accountId         String
  type              String   // DEPOSIT, WITHDRAWAL, LOAN_CREDIT, LOAN_DEBIT
  amount            Decimal  @db.Decimal(15, 2)
  status            String   // PENDING, COMPLETED, FAILED
  externalReference String?  @unique
  metadata          Json?
  createdAt         DateTime @default(now())
  
  account Account @relation(fields: [accountId], references: [id])
  
  @@index([accountId])
  @@index([externalReference])
  @@index([createdAt])
}

model Loan {
  id                String   @id @default(uuid())
  accountId         String
  amount            Decimal  @db.Decimal(15, 2)
  partner           String
  status            String   // ACTIVE, PAID, DEFAULTED
  installments      Int
  installmentAmount Decimal  @db.Decimal(15, 2)
  nextDueDate       DateTime
  createdAt         DateTime @default(now())
  
  account Account @relation(fields: [accountId], references: [id])
  
  @@index([accountId])
  @@index([status])
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  cpf          String   @unique
  name         String
  passwordHash String
  createdAt    DateTime @default(now())
  
  @@index([email])
  @@index([cpf])
}`
          }
        ]
      },
      examples: [
        'Nexus Bank - Banco digital completo',
        'PicPay Clone - Carteira digital',
        'Nubank Clone - Conta digital e cartão',
        'Mercado Pago Integration - Gateway de pagamento'
      ]
    });

    // Domínio: Excellence (Aplicações Web de Alta Qualidade)
    this.domains.set('excellence', {
      domain: 'excellence',
      keywords: [
        'app', 'aplicação', 'website', 'site',
        'dashboard', 'painel', 'admin',
        'landing page', 'portfolio', 'blog',
        'e-commerce', 'loja', 'marketplace'
      ],
      principles: [
        'Score mínimo 100/100 (Excelência Máxima)',
        'HTML5 semântico obrigatório',
        'Acessibilidade WCAG 2.1 AA',
        'Responsividade mobile-first',
        'Performance otimizada (Lighthouse 90+)',
        'Segurança por design',
        'UX excepcional com micro-interações',
        'Dark mode com prefers-color-scheme',
        'Estados de loading e erro',
        'Código limpo e documentado'
      ],
      architecture: {
        stack: [
          'Frontend: React 19 ou Vue.js 3 (via CDN)',
          'Styling: TailwindCSS + Shadcn/UI',
          'Icons: Lucide ou Heroicons',
          'Animations: Framer Motion',
          'State: Zustand ou Pinia',
          'Forms: React Hook Form ou VeeValidate'
        ],
        patterns: [
          'Component-driven development',
          'Atomic design principles',
          'Single responsibility',
          'Composition over inheritance',
          'Progressive enhancement',
          'Graceful degradation'
        ],
        security: [
          'Sem innerHTML com dados do usuário',
          'Links externos com rel="noopener noreferrer"',
          'Validação de entrada no frontend e backend',
          'CSP headers',
          'HTTPS only',
          'Sem API keys expostas'
        ]
      },
      templates: {
        structure: {
          'index.html': true,
          'styles/': ['main.css', 'components.css'],
          'js/': ['app.js', 'utils.js'],
          'assets/': ['images/', 'icons/'],
          'README.md': true
        },
        files: []
      },
      examples: [
        'Dashboard administrativo',
        'Landing page de produto',
        'Portfolio pessoal',
        'Blog com CMS',
        'E-commerce completo'
      ]
    });

    // Domínio: Fullstack (Aplicações Complexas)
    this.domains.set('fullstack', {
      domain: 'fullstack',
      keywords: [
        'fullstack', 'full-stack', 'full stack',
        'backend', 'api', 'rest', 'graphql',
        'database', 'banco de dados', 'sql',
        'autenticação', 'authentication', 'auth',
        'crud', 'sistema completo'
      ],
      principles: [
        'Separação clara frontend/backend',
        'API RESTful bem documentada',
        'Autenticação e autorização robustas',
        'Validação em ambos os lados',
        'Tratamento de erros consistente',
        'Logs estruturados',
        'Testes automatizados',
        'CI/CD pipeline',
        'Containerização com Docker',
        'Documentação completa'
      ],
      architecture: {
        stack: [
          'Backend: Node.js (Fastify) ou Go (Gin)',
          'Frontend: React + TypeScript',
          'Database: PostgreSQL ou SQLite',
          'ORM: Prisma',
          'Auth: JWT + Refresh Tokens',
          'Validation: Zod',
          'Testing: Jest + Playwright',
          'Deploy: Docker Compose'
        ],
        patterns: [
          'Repository pattern',
          'Service layer',
          'Dependency injection',
          'Error handling middleware',
          'Request validation',
          'Response normalization',
          'Database transactions',
          'Caching strategy'
        ],
        security: [
          'JWT com refresh tokens',
          'Bcrypt para senhas',
          'Rate limiting',
          'CORS configurado',
          'Helmet.js',
          'Input validation',
          'SQL injection protection',
          'XSS protection'
        ]
      },
      templates: {
        structure: {
          'backend/': {
            'src/': {
              'routes/': true,
              'services/': true,
              'repositories/': true,
              'middleware/': true,
              'server.ts': true
            },
            'prisma/': ['schema.prisma'],
            'Dockerfile': true
          },
          'frontend/': {
            'src/': {
              'pages/': true,
              'components/': true,
              'hooks/': true,
              'App.tsx': true
            },
            'Dockerfile': true
          },
          'docker-compose.yml': true,
          'README.md': true
        },
        files: []
      },
      examples: [
        'Sistema de gerenciamento',
        'Plataforma SaaS',
        'Rede social',
        'Sistema de tickets',
        'CRM completo'
      ]
    });
  }

  /**
   * Buscar conhecimento por prompt do usuário
   */
  query(userPrompt: string): KnowledgeQueryResult[] {
    const promptLower = userPrompt.toLowerCase();
    const results: KnowledgeQueryResult[] = [];

    for (const [domainName, knowledge] of this.domains) {
      // Calcular relevância baseado em keywords
      const matchedKeywords = knowledge.keywords.filter(keyword =>
        promptLower.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        const relevance = matchedKeywords.length / knowledge.keywords.length;

        results.push({
          domain: domainName,
          relevance,
          context: this.buildContext(knowledge, matchedKeywords),
          principles: knowledge.principles,
          architecture: knowledge.architecture,
          templates: knowledge.templates
        });
      }
    }

    // Ordenar por relevância (maior primeiro)
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Construir contexto textual para o prompt
   */
  private buildContext(knowledge: DomainKnowledge, matchedKeywords: string[]): string {
    let context = `# Domínio: ${knowledge.domain.toUpperCase()}\n\n`;
    context += `**Palavras-chave detectadas:** ${matchedKeywords.join(', ')}\n\n`;
    
    context += `## Princípios Fundamentais\n`;
    knowledge.principles.forEach((principle, i) => {
      context += `${i + 1}. ${principle}\n`;
    });
    
    context += `\n## Arquitetura\n`;
    context += `**Stack:** ${knowledge.architecture.stack.join(', ')}\n\n`;
    context += `**Padrões:** ${knowledge.architecture.patterns.join(', ')}\n\n`;
    context += `**Segurança:** ${knowledge.architecture.security.join(', ')}\n`;
    
    return context;
  }

  /**
   * Obter conhecimento específico de um domínio
   */
  getDomain(domainName: string): DomainKnowledge | undefined {
    return this.domains.get(domainName);
  }

  /**
   * Listar todos os domínios disponíveis
   */
  listDomains(): string[] {
    return Array.from(this.domains.keys());
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
