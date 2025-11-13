# 🧪 Teste - Salvar Projeto no PC

## 🎯 Objetivo
Testar o sistema completo de salvar projetos no HD do seu PC.

---

## 📋 Pré-requisitos

### 1. Backend Rodando
```powershell
# Abrir PowerShell na pasta do projeto
cd cli
.\backend-simple.ps1
```

**Você deve ver:**
```
========================================
  AI WEB WEAVER - BACKEND SERVER
========================================

Iniciando servidor na porta 5000...
Servidor rodando em: http://localhost:5000

ENDPOINTS DISPONIVEIS:
  GET    /api/health
  POST   /api/execute
  GET    /api/apps
  GET    /api/projects
  POST   /api/projects
  POST   /api/projects/:id/install
  POST   /api/projects/:id/open

Pressione Ctrl+C para parar
```

### 2. Frontend Rodando
```bash
# Em outro terminal
npm run dev
```

**Você deve ver:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Teste 1: Verificar Backend

### Passo 1: Testar Health Check
```powershell
# Em outro PowerShell
curl http://localhost:5000/api/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "status": "healthy",
  "version": "1.0.0",
  "uptime": "..."
}
```

### Passo 2: Verificar Diretórios
```powershell
# Verificar se pastas foram criadas
Test-Path "$HOME\.aiweaver\projects"
Test-Path "$HOME\.aiweaver\apps"
```

**Resposta esperada:** `True` para ambos

---

## 🧪 Teste 2: Salvar Projeto via API

### Passo 1: Criar Projeto de Teste
```powershell
$body = @{
    name = "Teste Dashboard"
    files = @(
        @{
            path = "index.html"
            content = @"
<!DOCTYPE html>
<html>
<head>
    <title>Teste Dashboard</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        h1 { color: #0066cc; }
    </style>
</head>
<body>
    <h1>Dashboard de Teste</h1>
    <p>Este é um projeto de teste salvo no HD!</p>
</body>
</html>
"@
        },
        @{
            path = "styles.css"
            content = "body { background: #f0f0f0; }"
        }
    )
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method POST -Body $body -ContentType "application/json"
$response | ConvertTo-Json
```

**Resposta esperada:**
```json
{
  "success": true,
  "project": {
    "id": "abc12345",
    "name": "Teste Dashboard",
    "path": "C:\\Users\\SEU_USUARIO\\.aiweaver\\projects\\abc12345",
    "files": [...],
    "createdAt": "2025-11-13 ...",
    "updatedAt": "2025-11-13 ..."
  }
}
```

### Passo 2: Verificar Arquivos no HD
```powershell
# Substituir abc12345 pelo ID retornado
$projectId = "abc12345"
Get-ChildItem "$HOME\.aiweaver\projects\$projectId"
```

**Você deve ver:**
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        13/11/2025     10:30            xxx index.html
-a----        13/11/2025     10:30            xxx styles.css
```

### Passo 3: Abrir Arquivo
```powershell
# Ver conteúdo do arquivo
Get-Content "$HOME\.aiweaver\projects\$projectId\index.html"
```

**Você deve ver o HTML completo!**

---

## 🧪 Teste 3: Salvar via Interface

### Passo 1: Abrir Aplicação
1. Abra http://localhost:5173
2. Vá para o modo "Editor"
3. Digite um prompt: "Crie um dashboard de vendas"

### Passo 2: Aguardar Código
- IA vai gerar o código
- Arquivos aparecem no editor
- **Aguarde 2 segundos** (auto-save)

### Passo 3: Verificar Mensagem
Você deve ver no chat:
```
💾 Salvando projeto...
✅ Projeto salvo em: C:\Users\...\projects\xyz789
```

### Passo 4: Verificar no HD
```powershell
# Abrir pasta de projetos
explorer "$HOME\.aiweaver\projects"
```

**Você deve ver uma pasta com o ID do projeto!**

### Passo 5: Clicar em "Abrir Pasta"
1. No chat, clique no botão **📁 Abrir Pasta**
2. Windows Explorer deve abrir automaticamente
3. Você verá os arquivos do projeto!

---

## 🧪 Teste 4: Instalar como App

### Passo 1: Clicar em "Instalar"
1. No chat, clique no botão **📦 Instalar como App**
2. Aguarde a mensagem de sucesso

**Você deve ver:**
```
📦 Instalando como app...
✅ App instalado! ID: app123
```

### Passo 2: Verificar App Instalado
```powershell
# Listar apps
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/apps"
$response.apps | Format-Table
```

**Você deve ver o app na lista!**

### Passo 3: Verificar Arquivos do App
```powershell
# Ver arquivos do app
Get-ChildItem "$HOME\.aiweaver\apps\app123"
```

**Você deve ver o index.html copiado!**

---

## 🧪 Teste 5: Fluxo Completo

### Cenário: Do Zero ao App Rodando

```
1. Backend rodando ✅
2. Frontend rodando ✅
3. Usuário: "Crie um site de portfólio"
4. IA gera código ✅
5. Auto-save (2s) ✅
6. Projeto salvo no HD ✅
7. Clicar "Instalar" ✅
8. App instalado ✅
9. Clicar "Abrir Pasta" ✅
10. Explorador abre ✅
```

**Tempo total:** ~30 segundos

---

## 🔍 Verificações Importantes

### 1. Estrutura de Pastas
```
C:\Users\SEU_USUARIO\.aiweaver\
├── projects\
│   ├── abc12345\
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   └── xyz789\
│       └── ...
├── apps\
│   ├── app123\
│   │   └── index.html
│   └── app456\
│       └── ...
├── logs\
├── apps.db
└── projects.db
```

### 2. Banco de Dados de Projetos
```powershell
# Ver conteúdo do banco
Get-Content "$HOME\.aiweaver\projects.db" | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Você deve ver todos os projetos salvos!**

### 3. Permissões
```powershell
# Verificar se tem permissão de escrita
Test-Path "$HOME\.aiweaver" -PathType Container
```

---

## ❌ Solução de Problemas

### Problema 1: Backend não inicia
**Erro:** "Porta 5000 já em uso"

**Solução:**
```powershell
# Usar outra porta
.\backend-simple.ps1 -Port 5001

# Atualizar frontend (ProjectFileSystem.ts)
# Mudar: http://localhost:5000 → http://localhost:5001
```

### Problema 2: Projeto não salva
**Erro:** "Failed to fetch"

**Solução:**
```powershell
# Verificar se backend está rodando
curl http://localhost:5000/api/health

# Verificar CORS
# Backend já tem CORS habilitado
```

### Problema 3: Pasta não abre
**Erro:** "Projeto não encontrado"

**Solução:**
```powershell
# Verificar se projeto foi salvo
Get-ChildItem "$HOME\.aiweaver\projects"

# Verificar ID do projeto
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/projects"
$response.projects | Format-Table
```

### Problema 4: Permissão negada
**Erro:** "Access denied"

**Solução:**
```powershell
# Executar PowerShell como Administrador
# Ou mudar pasta de destino
$Global:PROJECTS_DIR = "C:\Temp\aiweaver\projects"
```

---

## 📊 Logs e Debug

### Ver Logs do Backend
```powershell
# Backend mostra logs em tempo real
# Você verá cada requisição:
[POST] /api/projects
[POST] /api/projects/abc123/install
[POST] /api/projects/abc123/open
```

### Ver Logs do Frontend
```javascript
// Abrir DevTools (F12)
// Console mostrará:
console.log('💾 Salvando projeto...');
console.log('✅ Projeto salvo:', project);
```

### Verificar Network
```
1. Abrir DevTools (F12)
2. Aba Network
3. Filtrar: XHR
4. Ver requisições para /api/projects
```

---

## ✅ Checklist de Sucesso

- [ ] Backend iniciou sem erros
- [ ] Frontend iniciou sem erros
- [ ] Health check retorna success
- [ ] Pastas .aiweaver criadas
- [ ] Projeto salvo via API
- [ ] Arquivos criados no HD
- [ ] Projeto salvo via interface
- [ ] Auto-save funcionando
- [ ] Botão "Abrir Pasta" funciona
- [ ] Botão "Instalar" funciona
- [ ] App instalado com sucesso
- [ ] Explorador abre corretamente

---

## 🎉 Resultado Esperado

Ao final dos testes, você deve ter:

1. ✅ Projetos salvos em `C:\Users\SEU_USUARIO\.aiweaver\projects\`
2. ✅ Apps instalados em `C:\Users\SEU_USUARIO\.aiweaver\apps\`
3. ✅ Banco de dados atualizado
4. ✅ Sistema funcionando perfeitamente!

---

## 📞 Próximos Passos

Após confirmar que tudo funciona:

1. **Testar com projetos reais**
   - Criar dashboards complexos
   - Salvar múltiplos arquivos
   - Instalar vários apps

2. **Explorar funcionalidades**
   - Editar arquivos no VS Code
   - Fazer deploy
   - Compartilhar projetos

3. **Personalizar**
   - Mudar pasta de destino
   - Adicionar templates
   - Criar atalhos

---

**Teste criado com ❤️ para AI Web Weaver**
**Data:** 13 de Novembro de 2025
**Status:** Pronto para testar!
