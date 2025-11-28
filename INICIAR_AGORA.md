# 🚀 INICIAR O SISTEMA - GUIA RÁPIDO

## ✅ Status Atual

- ✅ Neural Core rodando na porta 3000
- ✅ Dependências do frontend instaladas
- 🔄 Precisa iniciar o backend na porta 5000

---

## 📋 Passo a Passo

### 1️⃣ Criar Workspace (se não existir)

Abra um terminal PowerShell e execute:

```powershell
mkdir workspace
```

### 2️⃣ Verificar .env

Certifique-se de que existe um arquivo `.env` na raiz com:

```bash
VITE_API_URL=http://localhost:5000/api
```

### 3️⃣ Iniciar Backend

**Abra um NOVO terminal** e execute:

```bash
cd backend
npm run dev
```

Aguarde ver:
```
Server is running on http://localhost:5000
```

### 4️⃣ Iniciar Frontend

**Abra outro NOVO terminal** e execute:

```bash
npm run dev
```

Aguarde ver:
```
Local: http://localhost:5173
```

### 5️⃣ Acessar o Sistema

Abra no navegador:
```
http://localhost:5173
```

---

## 🎯 Testar o Sistema

### Passo 1: Fazer Login
- Registre-se se for a primeira vez
- Faça login para obter o token JWT

### Passo 2: Testar Terminal AI

No chat, digite:

**Teste Básico:**
```
Liste os arquivos do projeto
```

**Teste de Instalação:**
```
Instale o axios
```

**Teste Fintech (Identidade Soberana):**
```
Forje o Nexus Bank
```

---

## 🔧 Troubleshooting

### Backend não inicia?

Verifique se a porta 5000 está livre:

```powershell
# Windows
netstat -ano | findstr :5000

# Se estiver ocupada, mate o processo:
taskkill /PID <PID> /F
```

### Frontend não conecta ao backend?

Verifique o arquivo `.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

### "401 Unauthorized"?

Faça login novamente no frontend para obter um novo token JWT.

---

## 📊 Portas Usadas

| Serviço | Porta | Status |
|---------|-------|--------|
| Neural Core | 3000 | ✅ Rodando |
| Backend Express | 5000 | 🔄 Precisa iniciar |
| Frontend Vite | 5173 | 🔄 Precisa iniciar |

---

## 🎉 Quando Tudo Estiver Rodando

Você terá:

1. ✅ Neural Core (porta 3000) - Amplificador de IA
2. ✅ Backend Express (porta 5000) - API + Terminal
3. ✅ Frontend Vite (porta 5173) - Interface

E poderá usar comandos como:

```
"Forje o Nexus Bank"
```

Que vai:
1. Ativar Identidade Soberana (Arquiteto-Chefe de Fintechs)
2. Gerar backend Go + frontend React + PostgreSQL
3. Escrever arquivos no workspace
4. Executar docker-compose up -d
5. Se der erro, Self-Healing corrige automaticamente

---

🚀 **Bora rodar! Execute os comandos acima em terminais separados.**
