# Correção de Segurança - Iframe Sandbox

## Problema Identificado

O componente `HtmlPreview.tsx` estava usando uma combinação insegura de atributos no sandbox do iframe:

```html
sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
```

### Por que isso é perigoso?

Quando um iframe tem **ambos** `allow-scripts` e `allow-same-origin`, o código JavaScript dentro do iframe pode:
1. Acessar o DOM do iframe
2. Remover o atributo `sandbox` do próprio iframe
3. Escapar completamente das restrições de segurança

Isso efetivamente anula toda a proteção do sandbox.

## Solução Aplicada

Removemos `allow-same-origin` do atributo sandbox:

```html
sandbox="allow-scripts allow-popups allow-forms allow-modals"
```

### O que isso significa?

- ✅ Scripts ainda podem executar dentro do iframe
- ✅ Popups, formulários e modais ainda funcionam
- ❌ O iframe não pode acessar o mesmo origin do parent
- ✅ O iframe não pode remover suas próprias restrições de sandbox

## Impacto

### Funcionalidades que continuam funcionando:
- Execução de JavaScript no preview
- Interação com formulários
- Abertura de popups
- Exibição de modais
- Comunicação via `postMessage` (usado para console logs e cliques)

### Possíveis limitações:
- O iframe não pode fazer requisições AJAX para o mesmo domínio do parent
- Cookies e localStorage são isolados
- O iframe não pode acessar diretamente o DOM do parent

## Alternativas Consideradas

1. **Remover `allow-scripts`**: Quebraria toda a funcionalidade de preview interativo
2. **Usar CSP (Content Security Policy)**: Adiciona camada extra de segurança, mas não resolve o problema fundamental
3. **Solução atual**: Balanceia segurança e funcionalidade

## Recomendações Futuras

1. Implementar CSP headers para camada adicional de segurança
2. Validar e sanitizar todo conteúdo HTML antes de renderizar no iframe
3. Considerar usar Web Workers para execução de código não confiável
4. Implementar rate limiting para prevenir ataques de DoS

## Referências

- [MDN - iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox)
- [OWASP - iframe Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#sandboxed-frames)
