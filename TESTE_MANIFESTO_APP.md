# 🧪 MANIFESTO DE TESTE - App Completo

## 📋 PROMPT PARA TESTAR O SISTEMA

Copie e cole este prompt no seu sistema:

---

**Crie um sistema de gerenciamento de tarefas (Task Manager) completo e profissional com:**

**FUNCIONALIDADES:**
- Dashboard com estatísticas (total de tarefas, concluídas, pendentes, atrasadas)
- CRUD completo de tarefas (criar, editar, deletar, marcar como concluída)
- Filtros por status (todas, pendentes, concluídas, atrasadas)
- Busca por título
- Categorias de tarefas (Trabalho, Pessoal, Estudos, Urgente)
- Prioridades (Baixa, Média, Alta)
- Data de vencimento com alertas visuais
- Modo escuro/claro
- Persistência de dados no localStorage
- Design mobile-first responsivo

**TECNOLOGIAS:**
- Frontend: React com TypeScript
- Estilização: TailwindCSS
- Ícones: Lucide React
- Estado: React Hooks (useState, useEffect)
- Persistência: localStorage

**REQUISITOS DE QUALIDADE:**
- Código TypeScript tipado
- Componentes reutilizáveis
- Interface intuitiva e moderna
- Animações suaves
- Acessibilidade (ARIA labels)
- Responsivo (mobile, tablet, desktop)
- Performance otimizada

**ESTRUTURA ESPERADA:**
```
task-manager/
├── index.html (arquivo principal)
├── src/
│   ├── App.tsx (componente principal)
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── Dashboard.tsx
│   │   └── FilterBar.tsx
│   ├── types/
│   │   └── Task.ts
│   └── utils/
│       └── storage.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

Gere o projeto completo com todos os arquivos separados e funcionais.

---

## 🎯 O QUE ESPERAR

### 1. Knowledge Base Deve Detectar:
- **Domínio:** fullstack (ou excellence)
- **Keywords:** app, dashboard, CRUD, React, TypeScript
- **Relevância:** ~70-80%

### 2. Aurora Deve Gerar:
- ✅ Arquitetura completa
- ✅ 10+ arquivos separados
- ✅ Código TypeScript tipado
- ✅ Componentes React funcionais
- ✅ TailwindCSS configurado
- ✅ package.json com dependências

### 3. Formato de Saída Esperado:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./src/App.tsx"></script>
</body>
</html>

<script type="text/plain" data-path="src/App.tsx">
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
// ... código completo
</script>

<script type="text/plain" data-path="src/components/TaskCard.tsx">
import React from 'react';
import { Task } from '../types/Task';
// ... código completo
</script>

<script type="text/plain" data-path="src/types/Task.ts">
export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Trabalho' | 'Pessoal' | 'Estudos' | 'Urgente';
  priority: 'Baixa' | 'Média' | 'Alta';
  status: 'pending' | 'completed';
  dueDate: string;
  createdAt: string;
}
</script>

<script type="text/plain" data-path="package.json">
{
  "name": "task-manager",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.3.0"
  }
}
</script>

<script type="text/plain" data-path="README.md">
# Task Manager

Sistema completo de gerenciamento de tarefas...
</script>
```

### 4. Sistema Deve:
- ✅ Extrair automaticamente todos os arquivos
- ✅ Mostrar árvore completa:
  ```
  task-manager/
  ├── index.html
  ├── src/
  │   ├── App.tsx
  │   ├── components/
  │   │   ├── TaskCard.tsx
  │   │   ├── TaskForm.tsx
  │   │   ├── TaskList.tsx
  │   │   ├── Dashboard.tsx
  │   │   └── FilterBar.tsx
  │   ├── types/
  │   │   └── Task.ts
  │   └── utils/
  │       └── storage.ts
  ├── package.json
  ├── tsconfig.json
  ├── tailwind.config.js
  └── README.md
  ```
- ✅ Permitir edição de cada arquivo
- ✅ Exportar ZIP funcional

## 📊 CHECKLIST DE VALIDAÇÃO

### Geração
- [ ] Sistema detectou domínio correto
- [ ] Aurora foi ativado
- [ ] Código gerado em < 30 segundos

### Formato
- [ ] HTML principal visível
- [ ] Arquivos em `<script type="text/plain" data-path="...">`
- [ ] Metadados incluídos (arquitetura, tech stack)

### Extração
- [ ] Árvore de arquivos apareceu automaticamente
- [ ] Todos os arquivos listados
- [ ] Estrutura de pastas correta

### Funcionalidade
- [ ] Pode clicar em cada arquivo
- [ ] Pode editar código
- [ ] Preview funciona (se aplicável)

### Exportação
- [ ] Botão "Exportar Projeto" disponível
- [ ] ZIP gerado com sucesso
- [ ] Estrutura de pastas preservada
- [ ] Todos os arquivos presentes

## 🐛 PROBLEMAS POSSÍVEIS

### Se árvore estiver vazia:
1. Verificar se código tem `<script type="text/plain" data-path="...">`
2. Verificar console do navegador por erros
3. Tentar clicar em "Ver Arquivos" manualmente

### Se exportação falhar:
1. Verificar se todos os arquivos foram extraídos
2. Verificar console por erros de ZIP
3. Tentar exportar arquivo individual

### Se código não funcionar:
1. Verificar se dependências estão corretas
2. Verificar se imports estão corretos
3. Verificar se TypeScript está configurado

## 📝 RESULTADO ESPERADO

Após enviar o prompt, você deve ver:

1. **Console:**
   ```
   🧠 Consultando Knowledge Base...
   📚 Domínios detectados: fullstack
   🎯 Domínio primário: fullstack (relevância: 75%)
   🌟 AURORA BUILDER ATIVADO - Usando Arquiteto + Artesão
   ✅ Contexto de domínio injetado no prompt
   ```

2. **Resposta:**
   - HTML completo com metadados
   - 10+ arquivos em script tags
   - Código TypeScript tipado
   - Componentes React funcionais

3. **Árvore de Arquivos:**
   - Estrutura completa visível
   - Pastas organizadas
   - Todos os arquivos clicáveis

4. **Exportação:**
   - ZIP com nome `task-manager.zip`
   - Estrutura preservada
   - Pronto para `npm install && npm run dev`

## 🎉 SUCESSO CONFIRMADO SE:

✅ Todos os arquivos foram gerados  
✅ Formato `<script type="text/plain">` usado  
✅ Árvore de arquivos completa  
✅ Exportação funcional  
✅ Código TypeScript válido  
✅ Componentes React funcionais  

**Sistema está 100% operacional!** 🚀

---

**Envie este prompt e me mostre o resultado!**
