# 🧪 Teste - Ver Projetos no Chat

## ✅ Sistema Pronto para Testar!

Você tem **24 projetos** salvos localmente e o botão "Ver Projetos" está implementado!

---

## 🚀 Como Testar

### Passo 1: Verificar Backend
```powershell
# Verificar se backend está rodando
curl http://localhost:5000/api/health

# Se não estiver, iniciar:
cd cli
.\backend-simple.ps1
```

### Passo 2: Iniciar Frontend
```bash
# Em outro terminal
npm run dev
```

### Passo 3: Abrir Aplicação
```
http://localhost:5173
```

### Passo 4: Ir para Modo Chat
```
1. Clique em "Chat" no menu superior
2. Você verá a interface do chat
```

### Passo 5: Clicar em "Ver Projetos"
```
1. Procure os botões de ação na parte inferior
2. Clique no botão azul "📁 Ver Projetos"
3. Modal abre mostrando todos os projetos!
```

---

## 🎯 O Que Você Deve Ver

### Modal de Projetos
```
┌─────────────────────────────────────────────┐
│ 📁 Projetos Salvos                    [X]   │
│ 419 projetos encontrados                    │
├─────────────────────────────────────────────┤
│ [🔍 Buscar...]  [Ordenar ▼]  [🔄 Atualizar]│
├─────────────────────────────────────────────┤
│                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ Projeto  │ │ Projeto  │ │ Projeto  │    │
│ │ 2e72be52 │ │ 4c21df75 │ │ 0e0c8721 │    │
│ │ 1 arquivo│ │ 1 arquivo│ │ 1 arquivo│    │
│ │ Hoje     │ │ Hoje     │ │ Hoje     │    │
│ │ 20:39    │ │ 20:39    │ │ 20:39    │    │
│ │ [Abrir]  │ │ [Abrir]  │ │ [Abrir]  │    │
│ │[Instalar]│ │[Instalar]│ │[Instalar]│    │
│ └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│ ... mais projetos ...                       │
│                                             │
├─────────────────────────────────────────────┤
│ Mostrando 419 de 419 projetos               │
│ Localização: C:\Users\...\projects\         │
└─────────────────────────────────────────────┘
```

---

## 🧪 Testes a Fazer

### Teste 1: Abrir Modal
```
✅ Clicar em "Ver Projetos"
✅ Modal abre
✅ Projetos são carregados
✅ Mostra quantidade correta
```

### Teste 2: Buscar Projeto
```
✅ Digite "2e72be52" na busca
✅ Filtra em tempo real
✅ Mostra apenas projetos correspondentes
✅ Limpar busca mostra todos novamente
```

### Teste 3: Ordenar Projetos
```
✅ Selecionar "Mais Recentes"
✅ Projetos ordenam por data
✅ Selecionar "Nome (A-Z)"
✅ Projetos ordenam alfabeticamente
✅ Selecionar "Tamanho"
✅ Projetos ordenam por número de arquivos
```

### Teste 4: Abrir Projeto
```
✅ Clicar em "Abrir" em um projeto
✅ Windows Explorer abre
✅ Pasta do projeto é mostrada
✅ Arquivos estão lá
```

### Teste 5: Instalar Projeto
```
✅ Clicar em "Instalar" em um projeto
✅ Mensagem de sucesso aparece
✅ App ID é mostrado
✅ App pode ser iniciado via CLI
```

### Teste 6: Atualizar Lista
```
✅ Criar novo projeto no chat
✅ Clicar em "Atualizar" no modal
✅ Novo projeto aparece na lista
✅ Contador atualiza
```

### Teste 7: Fechar Modal
```
✅ Clicar no X
✅ Modal fecha
✅ Chat continua funcionando
✅ Reabrir modal funciona
```

---

## 🎯 Cenários de Uso

### Cenário 1: Encontrar Projeto Específico
```
1. Abrir modal "Ver Projetos"
2. Digitar ID na busca: "2e72be52"
3. Projeto aparece filtrado
4. Clicar em "Abrir"
5. Pasta abre no Explorer
```

### Cenário 2: Instalar Múltiplos Apps
```
1. Abrir modal "Ver Projetos"
2. Ordenar por "Mais Recentes"
3. Clicar em "Instalar" no primeiro
4. Aguardar confirmação
5. Clicar em "Instalar" no segundo
6. Repetir para quantos quiser
```

### Cenário 3: Revisar Projetos do Dia
```
1. Abrir modal "Ver Projetos"
2. Ordenar por "Mais Recentes"
3. Ver todos os 24 projetos de hoje
4. Abrir os que quiser revisar
5. Fechar modal
```

---

## 📊 Dados Atuais

### Seus Projetos
- **Total:** 24 projetos (novos) + 395 (antigos) = 419 total
- **Hoje:** 24 projetos
- **Tamanho:** 0.53 MB (novos)
- **Localização:** `C:\Users\hkli\.aiweaver\projects\`

### Projetos Mais Recentes
1. `2e72be52` - 20:39:32
2. `4c21df75` - 20:39:29
3. `0e0c8721` - 20:39:26
4. `b261132b` - 20:39:23
5. `5d20cbe6` - 20:39:20

---

## 🔧 Solução de Problemas

### Problema: Modal não abre
**Solução:**
```
1. Verificar console do navegador (F12)
2. Ver se há erros
3. Recarregar página (Ctrl+R)
4. Tentar novamente
```

### Problema: Projetos não carregam
**Solução:**
```
1. Verificar se backend está rodando
2. Testar: curl http://localhost:5000/api/projects
3. Reiniciar backend se necessário
4. Clicar em "Atualizar" no modal
```

### Problema: Botão "Abrir" não funciona
**Solução:**
```
1. Verificar se projeto existe no HD
2. Testar: .\cli\project-manager.ps1 open [ID]
3. Verificar permissões do Windows
4. Tentar abrir manualmente
```

### Problema: Botão "Instalar" não funciona
**Solução:**
```
1. Verificar se backend está rodando
2. Ver logs do backend
3. Verificar se projeto tem index.html
4. Tentar via CLI: .\cli\project-manager.ps1 export [ID]
```

---

## 🎉 Checklist de Teste

### Interface
- [ ] Modal abre corretamente
- [ ] Projetos são exibidos
- [ ] Busca funciona
- [ ] Ordenação funciona
- [ ] Botões estão visíveis
- [ ] Modal fecha corretamente

### Funcionalidades
- [ ] Abrir projeto funciona
- [ ] Instalar projeto funciona
- [ ] Atualizar lista funciona
- [ ] Busca filtra corretamente
- [ ] Ordenação muda ordem
- [ ] Contador está correto

### Performance
- [ ] Modal abre rápido (< 1s)
- [ ] Busca é instantânea
- [ ] Scroll é suave
- [ ] Ações são rápidas

### Responsividade
- [ ] Desktop funciona
- [ ] Mobile funciona
- [ ] Tablet funciona
- [ ] Grid adapta

---

## 📞 Comandos Úteis

### Ver Projetos via CLI
```powershell
# Estatísticas
.\cli\project-manager.ps1 stats

# Listar recentes
.\cli\project-manager.ps1 list -Recent -Limit 5

# Abrir projeto
.\cli\project-manager.ps1 browser 2e72be52
```

### Testar Backend
```powershell
# Health check
curl http://localhost:5000/api/health

# Listar projetos
curl http://localhost:5000/api/projects

# Abrir projeto
curl -Method POST http://localhost:5000/api/projects/2e72be52/open
```

---

## 🎊 Resultado Esperado

Após todos os testes, você deve ter:

1. ✅ Modal funcionando perfeitamente
2. ✅ Todos os 419 projetos visíveis
3. ✅ Busca e filtros operacionais
4. ✅ Ações (Abrir, Instalar) funcionando
5. ✅ Interface responsiva e rápida

---

## 🚀 Próximos Passos

Após testar:

1. **Usar no dia a dia** - Criar e gerenciar projetos
2. **Explorar recursos** - Busca, filtros, ações
3. **Personalizar** - Adicionar mais funcionalidades
4. **Compartilhar** - Mostrar para outros

---

**Criado com ❤️ para AI Web Weaver**  
**Data:** 13 de Novembro de 2025  
**Status:** ✅ Pronto para Testar!
