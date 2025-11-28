# 🚨 ALERTA DE SEGURANÇA - AÇÃO IMEDIATA NECESSÁRIA

## ⚠️ API KEY EXPOSTA DETECTADA

Foi detectada uma API Key do Google Gemini no arquivo `.env`:
- **Arquivo:** `.env`
- **Chave:** `AIzaSyCseKMsvxhuV33KMtMCHLErqDoX5e2NTso`
- **Status:** ⚠️ EXPOSTA (modificada no Git)

## 🔒 AÇÕES IMEDIATAS OBRIGATÓRIAS

### 1. REVOGAR A API KEY (URGENTE)

**Faça AGORA antes de qualquer push:**

1. Acesse: https://makersuite.google.com/app/apikey
2. Ou: https://aistudio.google.com/app/apikey
3. Encontre a chave: `AIzaSyCseKMsvxhuV33KMtMCHLErqDoX5e2NTso`
4. Clique em **"Delete"** ou **"Revoke"**
5. Gere uma **NOVA** chave

### 2. LIMPAR O ARQUIVO .env DO GIT

```bash
# Remover .env do stage (se estiver)
git restore --staged .env

# Garantir que .env está no .gitignore
echo .env >> .gitignore

# Verificar
type .gitignore | findstr ".env"
```

### 3. LIMPAR HISTÓRICO (Se já commitou .env antes)

```bash
# Verificar se .env está no histórico
git log --all --full-history -- .env

# Se aparecer commits, limpar histórico:
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# OU usar BFG Repo-Cleaner (mais rápido):
# Download: https://rtyley.github.io/bfg-repo-cleaner/
# java -jar bfg.jar --delete-files .env
```

### 4. ATUALIZAR .env COM NOVA CHAVE

```bash
# Editar .env com a NOVA chave
notepad .env

# Conteúdo deve ser:
VITE_GEMINI_API_KEY=SUA_NOVA_CHAVE_AQUI
VITE_USE_NEURAL_CORE=false
VITE_NEURAL_CORE_URL=http://localhost:3000
```

## ✅ CHECKLIST DE SEGURANÇA

Antes de fazer push, verificar:

- [ ] API Key antiga REVOGADA no Google AI Studio
- [ ] Nova API Key gerada
- [ ] `.env` atualizado com nova chave
- [ ] `.env` NÃO está no stage (`git status`)
- [ ] `.env` está no `.gitignore`
- [ ] Histórico do Git limpo (se necessário)
- [ ] `.env.example` não contém chaves reais ✅ (OK)

## 🛡️ VERIFICAÇÃO FINAL

```bash
# 1. Verificar status
git status

# 2. Verificar se .env aparece
# Se aparecer, PARE e remova:
git restore --staged .env

# 3. Verificar .gitignore
type .gitignore | findstr ".env"

# 4. Verificar diff (não deve mostrar .env)
git diff --cached

# 5. Só então fazer commit
git commit -m "feat: Sistema completo integrado"
```

## 📋 COMANDOS SEGUROS PARA PUSH

```bash
# 1. Garantir que .env não será commitado
git restore --staged .env 2>$null

# 2. Adicionar apenas arquivos seguros
git add services/
git add src/
git add backend/
git add neural-core/
git add proxy-server/
git add components/
git add *.md
git add *.bat
git add .gitignore
git add package.json
git add tsconfig.json
git add vite.config.ts

# 3. Verificar o que será commitado
git status

# 4. Commit
git commit -m "feat: Sistema completo integrado com Mesh Network e Neural Core"

# 5. Push
git push origin main
```

## 🚨 SE JÁ FEZ PUSH COM A CHAVE

Se você já fez push para o GitHub com a chave exposta:

### 1. REVOGAR IMEDIATAMENTE
- Acesse Google AI Studio
- Delete a chave comprometida
- Gere nova chave

### 2. LIMPAR REPOSITÓRIO REMOTO

```bash
# Limpar histórico local
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env" --prune-empty --tag-name-filter cat -- --all

# Forçar push (CUIDADO)
git push origin main --force

# Limpar refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 3. CONSIDERAR NOVO REPOSITÓRIO

Se o histórico estiver muito comprometido:

```bash
# 1. Fazer backup
xcopy /E /I . ..\backup-repo

# 2. Remover .git
rmdir /S /Q .git

# 3. Inicializar novo repo
git init
git add .
git commit -m "Initial commit - Sistema completo"

# 4. Criar novo repositório no GitHub
# 5. Push para novo repo
git remote add origin https://github.com/SEU-USUARIO/NOVO-REPO.git
git push -u origin main
```

## 📚 BOAS PRÁTICAS

### Nunca Commitar:
- ❌ `.env`
- ❌ API Keys
- ❌ Senhas
- ❌ Tokens
- ❌ Certificados privados
- ❌ Credenciais de banco de dados

### Sempre Usar:
- ✅ `.env.example` (sem valores reais)
- ✅ Variáveis de ambiente
- ✅ Secrets do GitHub (para CI/CD)
- ✅ Vault ou gerenciadores de secrets
- ✅ `.gitignore` atualizado

## 🔐 CONFIGURAR SECRETS NO GITHUB

Para CI/CD, use GitHub Secrets:

1. Repositório → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `GEMINI_API_KEY`
4. Value: Sua chave
5. Add secret

No workflow (`.github/workflows/ci.yml`):

```yaml
env:
  VITE_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## 📞 RECURSOS

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Google AI Studio](https://aistudio.google.com/app/apikey)

---

**⚠️ NÃO PROSSIGA COM O PUSH ATÉ COMPLETAR TODAS AS AÇÕES ACIMA**

**Data:** 19/11/2025
**Prioridade:** 🔴 CRÍTICA
