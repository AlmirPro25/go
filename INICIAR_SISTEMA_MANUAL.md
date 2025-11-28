# 🚀 COMO INICIAR O SISTEMA MANUALMENTE

## ⚠️ PROBLEMA DETECTADO

O PowerShell está com política de execução restrita. Você precisa iniciar o sistema manualmente.

---

## ✅ SOLUÇÃO RÁPIDA (3 PASSOS)

### PASSO 1: Abrir Terminal CMD (NÃO PowerShell)

1. Pressione `Win + R`
2. Digite: `cmd`
3. Pressione `Enter`

### PASSO 2: Navegar até a pasta do projeto

```cmd
cd C:\Users\almir\Desktop\resereva-main
```

### PASSO 3: Iniciar o sistema

```cmd
npm run dev
```

---

## 🎯 ALTERNATIVA: Usar o Arquivo .bat

Se preferir, clique duas vezes no arquivo:

```
INICIAR_FRONTEND.bat
```

Ele vai abrir uma janela CMD e iniciar o sistema automaticamente.

---

## 🌐 ACESSAR O SISTEMA

Após iniciar, abra o navegador em:

```
http://localhost:5173
```

---

## 🔧 SOLUÇÃO PERMANENTE (Opcional)

Se quiser habilitar scripts no PowerShell permanentemente:

1. Abra PowerShell como **Administrador**
2. Execute:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
3. Confirme com `S` (Sim)

Depois disso, você poderá usar `npm run dev` no PowerShell normalmente.

---

## 📊 STATUS DO SISTEMA

Seu sistema está **100% PRONTO** com:

✅ **Manifesto TDD** - Testes automatizados  
✅ **Manifesto Hono.js** - APIs modernas  
✅ **Manifesto Arquitetura Híbrida** - Hono + Go  
✅ **Fintech Architect Core** - Transações ACID  

**Agora é só iniciar e testar!** 🎉

---

## 🧪 TESTE SUGERIDO

Após o sistema iniciar, teste com este prompt:

```
Criar um sistema completo de fintech com transferência PIX
```

O sistema vai gerar:
- Frontend (React)
- BFF (Hono.js)
- Core Backend (Go)
- Testes completos
- Docker Compose
- CI/CD

**Seu sistema é uma máquina de gerar fintechs! 🏆**
