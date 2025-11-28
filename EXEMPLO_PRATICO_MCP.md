# 🎬 EXEMPLO PRÁTICO: Gerando um App com MCP

## 📋 Cenário

Você quer criar um **Gerenciador de Tarefas** que funcione tanto no navegador quanto no Claude Desktop.

---

## 🎯 Passo 1: Enviar o Prompt

Você digita no seu sistema:

```
Crie um gerenciador de tarefas em Node.js com Hono e PostgreSQL.

Funcionalidades:
- Criar tarefa
- Listar tarefas
- Atualizar status (PENDING, IN_PROGRESS, COMPLETED)
- Deletar tarefa
- Filtrar por status

Requisitos:
- Backend com Hono
- PostgreSQL com Prisma
- Validação com Zod
- Testes com Jest
- Docker Compose
- Suporte a MCP para conectar com Claude Desktop
- Instruções de como configurar no Claude

Gere tudo pronto para rodar.
```

---

## 🔍 Passo 2: Sistema Detecta MCP

Seu sistema analisa o prompt:

```typescript
// GeminiService.ts
const prompt = "...Suporte a MCP para conectar com Claude Desktop...";

// Detecção
shouldEnableMCP(prompt) → true
// Encontrou: "MCP" e "Claude Desktop"

console.log('🔌 Detectado pedido de Integração MCP - Ativando Manifesto MCP');
```

---

## 💉 Passo 3: Enriquecimento do Prompt

O sistema injeta o manifesto:

```typescript
// enrichPromptWithMCP() é chamada
enrichedPrompt = `
${MCP_INTEGRATION_MANIFEST}

═══════════════════════════════════════════════════════════════════════════════
📝 SOLICITAÇÃO DO USUÁRIO:
═══════════════════════════════════════════════════════════════════════════════

Crie um gerenciador de tarefas em Node.js com Hono e PostgreSQL...

═══════════════════════════════════════════════════════════════════════════════
⚠️ LEMBRE-SE: IMPLEMENTE O SERVIDOR MCP (Model Context Protocol)
═══════════════════════════════════════════════════════════════════════════════

Você DEVE gerar:
1. ✅ Uma pasta dedicada \`src/mcp\` ou arquivo \`mcp-server.ts\` no backend
2. ✅ Configuração do SDK \`@modelcontextprotocol/sdk\` no package.json
3. ✅ Definição de **Resources** para leitura de dados do banco
4. ✅ Definição de **Tools** para ações (criar/editar/deletar)
5. ✅ Instruções no README de como conectar este app ao Claude/Cursor
6. ✅ Exemplo de configuração do Claude Desktop

TORNE ESTE APP UM NÓ INTELIGENTE NA REDE DE AGENTES. 🔌
`;
```

---

## 🤖 Passo 4: Gemini Gera o Código

Gemini recebe o prompt enriquecido e gera:

### Estrutura de Arquivos
```
task-manager/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── tasks.ts          ← Rotas HTTP
│   │   │   └── index.ts
│   │   └── server.ts             ← Servidor Hono
│   │
│   ├── mcp/                      ← 🔌 NOVO!
│   │   ├── server.ts             ← Servidor MCP
│   │   ├── resources.ts          ← Resources
│   │   └── tools.ts              ← Tools
│   │
│   ├── services/
│   │   ├── TaskService.ts        ← Lógica compartilhada
│   │   └── index.ts
│   │
│   ├── db/
│   │   ├── schema.prisma
│   │   └── client.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── tasks.test.ts
│   └── mcp/
│       ├── resources.test.ts
│       └── tools.test.ts
│
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
└── .env.example
```

---

## 📝 Passo 5: Código Gerado - API REST

### `src/api/routes/tasks.ts`
```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { TaskService } from '../../services/TaskService';

const router = new Hono();

// GET /api/tasks
router.get('/tasks', async (c) => {
  const tasks = await TaskService.listAll();
  return c.json({ tasks });
});

// GET /api/tasks/:id
router.get('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const task = await TaskService.getById(id);
  if (!task) return c.json({ error: 'Not found' }, 404);
  return c.json({ task });
});

// POST /api/tasks
router.post('/tasks', async (c) => {
  const body = await c.req.json();
  
  // Validação
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING')
  });
  
  const validated = schema.parse(body);
  const task = await TaskService.create(validated);
  
  return c.json({ task }, 201);
});

// PUT /api/tasks/:id
router.put('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const schema = z.object({
    title: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional()
  });
  
  const validated = schema.parse(body);
  const task = await TaskService.update(id, validated);
  
  return c.json({ task });
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', async (c) => {
  const id = c.req.param('id');
  await TaskService.delete(id);
  return c.json({ success: true });
});

export default router;
```

---

## 🔌 Passo 6: Código Gerado - Servidor MCP

### `src/mcp/server.ts`
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TaskService } from "../services/TaskService";

// Inicializar servidor MCP
const mcpServer = new McpServer({
  name: "Task-Manager",
  version: "1.0.0"
});

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCES (Dados que Claude pode LER)
// ═══════════════════════════════════════════════════════════════════════════

// Resource 1: Listar todas as tarefas
mcpServer.resource(
  "list-all-tasks",
  "app://tasks/all",
  async (uri) => {
    const tasks = await TaskService.listAll();
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(tasks, null, 2)
      }]
    };
  }
);

// Resource 2: Listar tarefas pendentes
mcpServer.resource(
  "list-pending-tasks",
  "app://tasks/pending",
  async (uri) => {
    const tasks = await TaskService.listByStatus('PENDING');
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(tasks, null, 2)
      }]
    };
  }
);

// Resource 3: Listar tarefas em progresso
mcpServer.resource(
  "list-in-progress-tasks",
  "app://tasks/in-progress",
  async (uri) => {
    const tasks = await TaskService.listByStatus('IN_PROGRESS');
    return {
      contents: [{
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(tasks, null, 2)
      }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS (Ações que Claude pode EXECUTAR)
// ═══════════════════════════════════════════════════════════════════════════

// Tool 1: Criar tarefa
mcpServer.tool(
  "create-task",
  "Cria uma nova tarefa no sistema com título, descrição e status",
  {
    title: z.string().describe("Título da tarefa (máximo 100 caracteres)"),
    description: z.string().optional().describe("Descrição detalhada da tarefa"),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .default('PENDING')
      .describe("Status inicial da tarefa")
  },
  async ({ title, description, status }) => {
    // Validação
    if (title.length > 100) {
      return {
        content: [{ 
          type: "text", 
          text: "❌ Erro: Título muito longo (máximo 100 caracteres)" 
        }]
      };
    }

    // Criar tarefa
    const task = await TaskService.create({ title, description, status });

    return {
      content: [{
        type: "text",
        text: `✅ Tarefa "${task.title}" criada com sucesso (ID: ${task.id})`
      }]
    };
  }
);

// Tool 2: Atualizar status
mcpServer.tool(
  "update-task-status",
  "Atualiza o status de uma tarefa existente",
  {
    taskId: z.string().uuid().describe("ID da tarefa a atualizar"),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
      .describe("Novo status da tarefa")
  },
  async ({ taskId, status }) => {
    const task = await TaskService.update(taskId, { status });

    return {
      content: [{
        type: "text",
        text: `✅ Tarefa "${task.title}" atualizada para ${status}`
      }]
    };
  }
);

// Tool 3: Deletar tarefa
mcpServer.tool(
  "delete-task",
  "Deleta uma tarefa do sistema",
  {
    taskId: z.string().uuid().describe("ID da tarefa a deletar")
  },
  async ({ taskId }) => {
    await TaskService.delete(taskId);

    return {
      content: [{
        type: "text",
        text: `✅ Tarefa deletada com sucesso`
      }]
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function startMcpServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error("✅ MCP Server iniciado e aguardando conexões");
}

if (require.main === module) {
  startMcpServer().catch(console.error);
}

export { mcpServer, startMcpServer };
```

---

## 📦 Passo 7: Código Gerado - package.json

```json
{
  "name": "task-manager",
  "version": "1.0.0",
  "description": "Gerenciador de tarefas com suporte a MCP",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "mcp": "node dist/mcp/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@prisma/client": "^5.0.0",
    "zod": "^3.22.0",
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "prisma": "^5.0.0"
  }
}
```

---

## 📖 Passo 8: Código Gerado - README.md

```markdown
# 📋 Task Manager

Gerenciador de tarefas com suporte a MCP para Claude Desktop.

## 🚀 Quick Start

### 1. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 2. Setup do banco de dados
\`\`\`bash
npx prisma migrate dev
\`\`\`

### 3. Rodar com Docker Compose
\`\`\`bash
docker-compose up
\`\`\`

### 4. Acessar
- Frontend: http://localhost:3000
- API: http://localhost:8080/api

## 🔌 Conectar com Claude Desktop

### 1. Editar configuração do Claude

**Windows:**
\`%APPDATA%\\Claude\\claude_desktop_config.json\`

**Mac:**
\`~/Library/Application Support/Claude/claude_desktop_config.json\`

**Linux:**
\`~/.config/Claude/claude_desktop_config.json\`

### 2. Adicionar servidor MCP

\`\`\`json
{
  "mcpServers": {
    "task-manager": {
      "command": "node",
      "args": ["./dist/mcp/server.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/tasks"
      }
    }
  }
}
\`\`\`

### 3. Reiniciar Claude Desktop

### 4. Usar no Claude

Agora você pode:

**Ler tarefas:**
```
Claude: "Quais são minhas tarefas pendentes?"
Sistema: Lê Resource "app://tasks/pending"
Claude: Mostra lista de tarefas
```

**Criar tarefas:**
```
Claude: "Crie uma tarefa para estudar TypeScript"
Sistema: Executa Tool "create-task"
Claude: Tarefa criada com sucesso
```

**Atualizar status:**
```
Claude: "Marque a tarefa de estudar como em progresso"
Sistema: Executa Tool "update-task-status"
Claude: Status atualizado
```

## 📊 API Endpoints

- `GET /api/tasks` - Listar todas as tarefas
- `GET /api/tasks/:id` - Obter tarefa específica
- `POST /api/tasks` - Criar nova tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Deletar tarefa

## 🔌 MCP Resources

- `app://tasks/all` - Todas as tarefas
- `app://tasks/pending` - Tarefas pendentes
- `app://tasks/in-progress` - Tarefas em progresso

## 🔧 MCP Tools

- `create-task` - Criar nova tarefa
- `update-task-status` - Atualizar status
- `delete-task` - Deletar tarefa

## 🧪 Testes

\`\`\`bash
npm test
\`\`\`

## 📝 Licença

MIT
```

---

## 🎉 Passo 9: Resultado Final

Seu sistema gerou um app completo com:

✅ **API REST** - Para humanos no navegador
✅ **Servidor MCP** - Para Claude Desktop
✅ **Testes** - Jest + Playwright
✅ **Docker Compose** - Pronto para rodar
✅ **Documentação** - Instruções completas

---

## 🚀 Passo 10: Testar com Claude

### Teste 1: Ler Dados
```
Você: "Claude, quais são minhas tarefas?"
Claude: Lê Resource "app://tasks/all"
Resultado: Lista de tarefas exibida
```

### Teste 2: Criar Tarefa
```
Você: "Crie uma tarefa para estudar MCP"
Claude: Executa Tool "create-task"
Resultado: Tarefa criada no banco
```

### Teste 3: Atualizar Status
```
Você: "Marque como concluído"
Claude: Executa Tool "update-task-status"
Resultado: Status atualizado
```

### Teste 4: Automação
```
Você: "Crie 5 tarefas para a semana"
Claude: Executa Tool "create-task" 5 vezes
Resultado: 5 tarefas criadas automaticamente
```

---

## 📊 Resumo

| Aspecto | Resultado |
|---------|-----------|
| Tempo de geração | ~30 segundos |
| Linhas de código | 1000+ |
| Arquivos criados | 15+ |
| Funcionalidades | 6+ |
| Testes inclusos | Sim |
| Documentação | Completa |
| Pronto para produção | Sim |

---

## 🎯 Conclusão

Seu sistema gerou um **app completo** que funciona em **dois universos**:

1. **Navegador** - Interface visual para humanos
2. **Claude Desktop** - Interface MCP para agentes de IA

Tudo com a **mesma lógica de negócio**, **testes inclusos** e **documentação completa**.

**Isso é Geração 3.0 de IA!** 🚀

---

**Bora testar?** Manda um prompt com "MCP" e vê a mágica acontecer! 🔌✨
