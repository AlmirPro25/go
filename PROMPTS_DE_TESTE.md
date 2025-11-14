# 🧪 PROMPTS DE TESTE DO SISTEMA

## 🎯 Objetivo
Testar todas as funcionalidades implementadas:
- ✅ Sistema de Excelência Máxima (100/100)
- ✅ Detecção correta de Fullstack vs Single-File
- ✅ Remoção de wrapper markdown
- ✅ Geração de código completo

---

## 📋 TESTES RECOMENDADOS

### 1️⃣ TESTE: Landing Page Simples (Single-File)
**Objetivo:** Verificar se gera single-file corretamente

**Prompt:**
```
Crie uma landing page moderna para uma startup de tecnologia em um único arquivo HTML. 
Deve ter hero section, features, depoimentos e formulário de contato.
```

**Resultado Esperado:**
- ✅ Apenas 1 arquivo: `index.html`
- ✅ Código sem ` ```html` no início
- ✅ Score de excelência: 100/100
- ✅ Acessibilidade completa (alt, labels, ARIA)

---

### 2️⃣ TESTE: App Fullstack com Backend (Multi-File)
**Objetivo:** Verificar se detecta fullstack e gera múltiplos arquivos

**Prompt:**
```
Crie um sistema de gerenciamento de tarefas (Todo App) com:
- Backend em NestJS com API REST
- Frontend em Next.js com Tailwind
- Banco de dados PostgreSQL com Prisma
- Autenticação JWT
- Docker Compose para desenvolvimento
```

**Resultado Esperado:**
- ✅ Múltiplos arquivos separados
- ✅ Estrutura: backend/, frontend/, docker-compose.yml
- ✅ Código funcional e completo
- ✅ README com instruções
- ✅ Score de excelência: 100/100

---

### 3️⃣ TESTE: Dashboard Interativo (Padrão)
**Objetivo:** Verificar comportamento padrão (sem especificar single-file ou fullstack)

**Prompt:**
```
Crie um dashboard de analytics com gráficos interativos, 
métricas em tempo real e tabela de dados.
```

**Resultado Esperado:**
- ✅ Gera como fullstack (comportamento padrão)
- ✅ Frontend com gráficos funcionais
- ✅ Código limpo sem wrapper markdown
- ✅ Score de excelência: 100/100

---

### 4️⃣ TESTE: E-commerce Completo (Fullstack Complexo)
**Objetivo:** Testar geração de projeto complexo

**Prompt:**
```
Crie uma plataforma de e-commerce com:
- Catálogo de produtos com filtros
- Carrinho de compras
- Sistema de pagamento (integração Stripe)
- Painel administrativo
- Backend com Express e MongoDB
- Autenticação de usuários
```

**Resultado Esperado:**
- ✅ Projeto fullstack completo
- ✅ Múltiplos arquivos organizados
- ✅ Integrações funcionais
- ✅ Score de excelência: 100/100
- ✅ Documentação completa

---

### 5️⃣ TESTE: Portfolio Pessoal (Single-File Explícito)
**Objetivo:** Verificar detecção explícita de single-file

**Prompt:**
```
Crie um portfolio pessoal para desenvolvedor frontend em um único arquivo HTML.
Deve ser portátil, funcionar offline e ter animações suaves.
```

**Resultado Esperado:**
- ✅ Apenas index.html
- ✅ Funciona offline
- ✅ Animações CSS
- ✅ Score de excelência: 100/100

---

### 6️⃣ TESTE: API REST Pura (Backend Only)
**Objetivo:** Verificar geração de backend sem frontend

**Prompt:**
```
Crie uma API REST em NestJS para gerenciamento de usuários com:
- CRUD completo
- Autenticação JWT
- Validação de dados
- Documentação Swagger
- PostgreSQL com Prisma
```

**Resultado Esperado:**
- ✅ Apenas arquivos backend
- ✅ Estrutura NestJS completa
- ✅ Endpoints funcionais
- ✅ Documentação clara

---

### 7️⃣ TESTE: App com Excelência Excepcional (Score > 100)
**Objetivo:** Testar sistema de bônus

**Prompt:**
```
Crie uma landing page premium para uma empresa de luxo com:
- Dark mode automático (prefers-color-scheme)
- Skip links para acessibilidade
- ARIA labels completos em todos os elementos
- Lazy loading de imagens
- Open Graph tags completos
- Twitter Cards
- Animações suaves com reduced motion support
- Focus visible customizado
- Tipografia fluida com clamp()
```

**Resultado Esperado:**
- ✅ Score: 105-120/100 🏆
- ✅ Mensagem: "EXCELÊNCIA EXCEPCIONAL"
- ✅ Todos os bônus implementados
- ✅ Código perfeito

---

### 8️⃣ TESTE: Clone de Aplicativo Famoso
**Objetivo:** Verificar geração de clones complexos

**Prompt:**
```
Crie um clone do Trello com:
- Boards, listas e cards
- Drag and drop funcional
- Backend com NestJS
- WebSockets para tempo real
- PostgreSQL com Prisma
- Autenticação de usuários
```

**Resultado Esperado:**
- ✅ Projeto fullstack completo
- ✅ Funcionalidades principais implementadas
- ✅ Drag and drop funcional
- ✅ WebSockets configurados

---

## 📊 CHECKLIST DE VALIDAÇÃO

Para cada teste, verifique:

### ✅ Código Gerado
- [ ] Sem ` ```html` no início
- [ ] Sem ` ```javascript` ou outros wrappers
- [ ] Código limpo e formatado
- [ ] Indentação correta

### ✅ Estrutura de Arquivos
- [ ] Single-file: Apenas index.html
- [ ] Fullstack: Múltiplos arquivos organizados
- [ ] README.md presente (quando aplicável)
- [ ] docker-compose.yml (quando aplicável)

### ✅ Qualidade do Código
- [ ] Score de excelência: 100/100 ou mais
- [ ] Acessibilidade completa (alt, labels, ARIA)
- [ ] Responsividade (Tailwind ou media queries)
- [ ] Performance (defer, lazy loading)
- [ ] Segurança (rel="noopener", sem innerHTML)

### ✅ Funcionalidade
- [ ] Código executa sem erros
- [ ] Funcionalidades principais implementam
- [ ] Integrações funcionais
- [ ] Sem placeholders (lorem ipsum, TODO)

### ✅ Console/Logs
- [ ] Mensagens de avaliação aparecem
- [ ] Score é exibido corretamente
- [ ] Refinamentos (se necessário) são registrados
- [ ] Bônus são calculados (quando aplicável)

---

## 🎯 ORDEM RECOMENDADA DE TESTES

1. **Teste 1** (Landing Page Simples) - Validar single-file básico
2. **Teste 2** (App Fullstack) - Validar detecção fullstack
3. **Teste 7** (Excelência Excepcional) - Validar sistema de bônus
4. **Teste 3** (Dashboard) - Validar comportamento padrão
5. **Teste 4** (E-commerce) - Validar projeto complexo
6. **Teste 5** (Portfolio) - Validar single-file explícito
7. **Teste 6** (API REST) - Validar backend only
8. **Teste 8** (Clone Trello) - Validar clone complexo

---

## 📝 TEMPLATE DE RELATÓRIO

Após cada teste, preencha:

```
TESTE #X: [Nome do Teste]
Data: ___/___/2025
Hora: ___:___

✅ Código Gerado:
- Sem wrapper markdown: [ ] SIM [ ] NÃO
- Estrutura correta: [ ] SIM [ ] NÃO
- Arquivos esperados: [ ] SIM [ ] NÃO

✅ Score de Excelência:
- Score obtido: ___/100
- Status: [ ] APROVADO [ ] REPROVADO
- Bônus: +___ pontos (se aplicável)

✅ Funcionalidade:
- Código executa: [ ] SIM [ ] NÃO
- Funcionalidades completas: [ ] SIM [ ] NÃO
- Sem placeholders: [ ] SIM [ ] NÃO

✅ Observações:
_________________________________
_________________________________

✅ Resultado Final: [ ] PASSOU [ ] FALHOU
```

---

## 🚀 COMEÇAR TESTES

**Copie e cole os prompts acima no seu sistema AI Web Weaver!**

Comece pelo **Teste 1** e vá avançando. Boa sorte! 🎉

---

*Criado em: 14/11/2025*
*Versão: 1.0*
