# 🔥 MANIFESTO TDD EXPANDIDO - TESTES DE CENÁRIOS DE FALHA

## ✅ EXPANSÃO IMPLEMENTADA

O Manifesto TDD foi **massivamente expandido** com foco em **Testes de Cenários de Falha** e **Testes de Integração Robustos**.

---

## 🎯 NOVA FILOSOFIA ADICIONADA

```
"COMO ESSE CÓDIGO PODE QUEBRAR?"
```

Agora o sistema pensa como um **hacker** e um **engenheiro de caos** ao gerar testes.

---

## 🔥 NOVAS SEÇÕES ADICIONADAS

### 1. **Testes de Cenários de Falha** 🚨

O sistema agora gera testes para:

#### 1️⃣ Falhas de Infraestrutura
- ✅ Banco de dados fora do ar
- ✅ API externa indisponível
- ✅ Timeout de rede
- ✅ Disco cheio
- ✅ Memória insuficiente

**Exemplo Gerado:**
```typescript
it('deve lançar erro DatabaseConnectionError quando DB está fora', async () => {
  const mockRepo = {
    findById: jest.fn().mockRejectedValue(
      new Error('ECONNREFUSED: Connection refused')
    )
  };

  await expect(
    service.getUserById('123')
  ).rejects.toThrow('Erro ao conectar com banco de dados');
});
```

#### 2️⃣ Falhas de Dados
- ✅ Dados corrompidos
- ✅ Formato inválido
- ✅ Dados faltando
- ✅ Dados duplicados
- ✅ Dados muito grandes

**Exemplo Gerado:**
```typescript
it('deve rejeitar transação com amount negativo', async () => {
  await expect(
    service.createTransaction({ amount: -100 })
  ).rejects.toThrow('Amount deve ser positivo');
});
```

#### 3️⃣ Falhas de Lógica
- ✅ Divisão por zero
- ✅ Array vazio
- ✅ Null/undefined inesperado
- ✅ Race conditions
- ✅ Deadlocks

**Exemplo Gerado:**
```typescript
it('deve prevenir saque duplo simultâneo', async () => {
  const [result1, result2] = await Promise.allSettled([
    service.withdraw('user123', 100),
    service.withdraw('user123', 100)
  ]);

  // Apenas uma deve ter sucesso
  const successes = [result1, result2].filter(r => r.status === 'fulfilled');
  expect(successes).toHaveLength(1);
});
```

#### 4️⃣ Falhas de Segurança
- ✅ SQL Injection
- ✅ XSS
- ✅ CSRF
- ✅ Autenticação expirada
- ✅ Permissões insuficientes

**Exemplo Gerado:**
```typescript
it('deve prevenir SQL Injection no login', async () => {
  await expect(
    service.login({
      email: "admin' OR '1'='1",
      password: 'anything'
    })
  ).rejects.toThrow('Email inválido');
});
```

---

### 2. **Testes de Integração Automáticos (Supertest)** 🚀

Para **TODA API REST**, o sistema agora gera:

#### Testes de CRUD Completo
```typescript
describe('User API Integration Tests', () => {
  it('deve criar usuário com dados válidos', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'João', email: 'joao@test.com' });

    expect(res.status).toBe(201);
  });

  it('deve retornar 400 com email inválido', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'invalid-email' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 409 se email já existe', async () => {
    // Criar primeiro usuário
    await request(app).post('/api/users').send({ email: 'dup@test.com' });

    // Tentar criar com mesmo email
    const res = await request(app).post('/api/users').send({ email: 'dup@test.com' });

    expect(res.status).toBe(409);
  });
});
```

#### Testes de Transações Financeiras (Fintech)
```typescript
describe('PIX Transfer Integration Tests', () => {
  it('deve realizar transferência com saldo suficiente', async () => {
    const res = await request(app)
      .post('/api/pix/transfer')
      .set('Authorization', \`Bearer \${token}\`)
      .send({ pixKey: 'chave@pix.com', amount: 100 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve rejeitar transferência com saldo insuficiente', async () => {
    const res = await request(app)
      .post('/api/pix/transfer')
      .set('Authorization', \`Bearer \${token}\`)
      .send({ amount: 10000 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Saldo insuficiente');
  });

  it('deve fazer rollback se Mercado Pago falhar', async () => {
    const res = await request(app)
      .post('/api/pix/transfer')
      .send({ pixKey: 'invalid@pix.com', amount: 50 });

    expect(res.status).toBe(500);

    // Verificar que saldo NÃO mudou (rollback)
    const balanceRes = await request(app).get('/api/account/balance');
    expect(balanceRes.body.balance).toBe(1000); // Mesmo saldo
  });
});
```

---

## 📋 CHECKLIST DE TESTES OBRIGATÓRIOS

Para **CADA funcionalidade**, o sistema agora gera testes para:

### ✅ Casos de Sucesso
- Dados válidos
- Fluxo feliz
- Resultado esperado

### ✅ Casos de Erro
- Dados inválidos
- Dados faltando
- Formato incorreto

### ✅ Casos de Edge
- Valores limites (0, -1, MAX_INT)
- Arrays vazios
- Strings vazias
- Null/undefined

### ✅ Casos de Falha de Infraestrutura
- Banco de dados fora
- API externa fora
- Timeout
- Retry logic

### ✅ Casos de Segurança
- SQL Injection
- XSS
- CSRF
- Rate limiting
- Autenticação/Autorização

### ✅ Casos de Concorrência
- Race conditions
- Deadlocks
- Lock otimista

### ✅ Casos de Performance
- Grandes volumes de dados
- Queries lentas
- Memory leaks

---

## 🎯 REGRA DE OURO: PENSE COMO UM HACKER

Ao gerar testes, o sistema SEMPRE pergunta:

1. **"Como eu quebraria esse código?"**
2. **"Que dados maliciosos eu poderia enviar?"**
3. **"O que acontece se o banco cair agora?"**
4. **"E se dois usuários fizerem isso ao mesmo tempo?"**
5. **"Como eu roubaria dinheiro desse sistema?"**

Se o sistema consegue pensar em uma forma de quebrar, **ELE GERA UM TESTE PARA ISSO**.

---

## 🔥 EXEMPLOS PRÁTICOS

### Exemplo 1: Sistema de Login

**Prompt:** "Criar um sistema de login"

**Testes Gerados:**

```typescript
// AuthService.test.ts

// ✅ Casos de Sucesso
it('deve fazer login com credenciais válidas', async () => { /* ... */ });

// ✅ Casos de Erro
it('deve rejeitar login com email inválido', async () => { /* ... */ });
it('deve rejeitar login com senha incorreta', async () => { /* ... */ });

// ✅ Casos de Segurança
it('deve prevenir SQL Injection', async () => { /* ... */ });
it('deve bloquear após 5 tentativas falhas', async () => { /* ... */ });
it('deve invalidar token após logout', async () => { /* ... */ });

// ✅ Casos de Falha de Infraestrutura
it('deve retornar erro se banco está fora', async () => { /* ... */ });
it('deve fazer retry 3 vezes antes de falhar', async () => { /* ... */ });
```

### Exemplo 2: Sistema de Transferência PIX

**Prompt:** "Criar um sistema de transferência PIX"

**Testes Gerados:**

```typescript
// PixService.test.ts

// ✅ Casos de Sucesso
it('deve realizar transferência com saldo suficiente', async () => { /* ... */ });

// ✅ Casos de Erro
it('deve rejeitar transferência com saldo insuficiente', async () => { /* ... */ });
it('deve rejeitar transferência com chave PIX inválida', async () => { /* ... */ });

// ✅ Casos de Falha de Infraestrutura
it('deve lançar erro e NÃO debitar se Mercado Pago está fora', async () => { /* ... */ });
it('deve fazer rollback se transação falhar no meio', async () => { /* ... */ });

// ✅ Casos de Concorrência
it('deve prevenir transferência dupla simultânea', async () => { /* ... */ });
it('deve usar lock otimista para prevenir conflitos', async () => { /* ... */ });

// ✅ Casos de Segurança
it('deve validar CPF antes de transferir', async () => { /* ... */ });
it('deve sanitizar dados antes de salvar', async () => { /* ... */ });
```

---

## 📊 COBERTURA ESPERADA

Com a expansão, a cobertura de testes agora inclui:

### Antes da Expansão
- ✅ Testes unitários básicos
- ✅ Testes de integração simples
- ❌ Testes de cenários de falha
- ❌ Testes de segurança
- ❌ Testes de concorrência

### Depois da Expansão
- ✅ Testes unitários completos
- ✅ Testes de integração robustos
- ✅ **Testes de cenários de falha**
- ✅ **Testes de segurança**
- ✅ **Testes de concorrência**
- ✅ **Testes de rollback**
- ✅ **Testes de retry logic**
- ✅ **Testes de edge cases**

---

## 🚀 IMPACTO

### Antes
```
❌ Código quebra em produção
❌ Bugs descobertos por usuários
❌ Vulnerabilidades de segurança
❌ Race conditions não detectadas
❌ Rollback não testado
```

### Depois
```
✅ Código robusto e resiliente
✅ Bugs descobertos antes de produção
✅ Segurança testada e validada
✅ Concorrência tratada corretamente
✅ Rollback garantido e testado
✅ Sistema pronto para produção
```

---

## 💡 COMO USAR

### Teste 1: Sistema de Login
```
Prompt: "Criar um sistema de login com autenticação JWT"

Resultado:
✅ AuthService.ts
✅ AuthService.test.ts (com testes de falha)
✅ tests/integration/auth-api.test.ts
✅ Testes de SQL Injection
✅ Testes de rate limiting
✅ Testes de token invalidation
```

### Teste 2: Sistema de Pagamento
```
Prompt: "Criar um sistema de pagamento PIX"

Resultado:
✅ PixService.ts
✅ PixService.test.ts (com testes de falha)
✅ tests/integration/pix-transfer.test.ts
✅ Testes de rollback
✅ Testes de saldo insuficiente
✅ Testes de API externa fora
✅ Testes de concorrência
```

---

## 🎓 APRENDIZADO DO SISTEMA

O sistema agora **aprende** que:

1. ✅ **Código pode quebrar de muitas formas**
2. ✅ **Infraestrutura falha (banco, API, rede)**
3. ✅ **Usuários enviam dados maliciosos**
4. ✅ **Concorrência causa problemas**
5. ✅ **Segurança é crítica**
6. ✅ **Rollback é obrigatório em transações**
7. ✅ **Retry logic deve ser testado**
8. ✅ **Edge cases são importantes**

---

## 🏆 RESULTADO FINAL

### Manifesto TDD Original
- Testes unitários
- Testes de integração
- Testes E2E
- Configurações

### Manifesto TDD Expandido
- Testes unitários
- Testes de integração
- Testes E2E
- Configurações
- **+ Testes de cenários de falha**
- **+ Testes de segurança**
- **+ Testes de concorrência**
- **+ Testes de rollback**
- **+ Testes de retry logic**
- **+ Testes de edge cases**
- **+ Checklist completo**
- **+ Mentalidade de hacker**

---

## 💀 MANTRA EXPANDIDO

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         APLICATIVO SEM TESTE É APLICATIVO MORTO              ║
║                                                              ║
║         APLICATIVO SEM TESTE DE FALHA É BOMBA-RELÓGIO        ║
║                                                              ║
║              TESTE DÁ VIDA. SEMPRE GERE TESTES.              ║
║                                                              ║
║              PENSE COMO UM HACKER. QUEBRE O CÓDIGO.          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

**Data de Expansão:** 19 de Novembro de 2025  
**Status:** ✅ EXPANDIDO E OPERACIONAL  
**Impacto:** 🔥 REVOLUCIONÁRIO - Sistema agora pensa em FALHAS e SEGURANÇA
