# RFC-003 — UI States & UX Flows

**Status:** Draft  
**Versão:** 1.0  
**Autor:** Gabriel  
**Data:** 2026-01-29  
**Escopo:** Definição dos estados da UI e fluxos de interação da versão 1 do Contextual Desktop Assistant

**Dependências:**
- RFC-001 — Contextual Desktop Assistant (v1)
- RFC-002 — Arquitetura Técnica Detalhada (v1)

## 1. Objetivo

Definir de forma clara e inequívoca:

- os **estados da UI** da versão 1
- os **fluxos de interação do usuário**
- o comportamento visual esperado em cada estado
- as transições entre estados

Esta RFC garante que a UI seja:
- previsível
- consistente
- evolutiva
- alinhada à arquitetura definida

## 2. Visão Geral da Experiência

O Contextual Desktop Assistant é uma **UI flutuante, contextual e temporária**.

Princípios de UX:
- aparece quando necessário
- não compete com o conteúdo principal
- responde rapidamente
- desaparece sem fricção

O usuário pode interagir por:
- **hotkey**
- **modo caneta**
- **input direto no chat**

## 3. Escopo da RFC-003

### Incluído
- Estados da UI (state machine)
- Fluxos principais de interação
- Comportamento visual por estado
- Regras de transição entre estados
- Comportamento em erro e ausência de API key

### Fora do escopo
- Design visual final
- Paleta definitiva
- Animações e microinterações
- Layouts avançados (dashboards)

## 4. Estados da UI (Definitivo – v1)

A UI da v1 é modelada como uma **máquina de estados explícita**.

### 4.1 Lista de Estados

| Estado | Descrição |
|------|----------|
| `idle` | UI aberta sem captura ativa |
| `capturing_text` | Captura de texto via hotkey |
| `capturing_image` | Captura de imagem (caneta ou fallback) |
| `preview_ready` | Conteúdo capturado exibido |
| `loading_ai` | Requisição à IA em andamento |
| `response_ready` | Resposta da IA disponível |
| `missing_api_key` | API key não configurada |
| `error` | Erro técnico ou de IA |

## 5. State Machine (Visão Lógica)

```txt
idle
 ├─ hotkey → capturing_text
 │             └─ fallback → capturing_image
 ├─ caneta → capturing_image
 └─ chat_input → loading_ai

capturing_* → preview_ready
preview_ready → loading_ai
loading_ai → response_ready
loading_ai → error
response_ready → idle | loading_ai
```

## 6. Layout Base da UI

A UI principal é um **overlay flutuante**.

```txt
┌──────────────────────────────┐
│ ✏️   ⌨️   ⚙️                │
├──────────────────────────────┤
│                              │
│  Mensagens do chat            │
│                              │
├──────────────────────────────┤
│ [ Digite sua pergunta… ] ⏎  │
└──────────────────────────────┘
```

## 7. Fluxos de Interação

### 7.1 Fluxo — Hotkey (Texto / Imagem)

1. Usuário seleciona conteúdo
2. Pressiona hotkey principal
3. Estado muda para `capturing_text`
4. Se texto indisponível → `capturing_image`
5. Conteúdo capturado
6. UI entra em `preview_ready`
7. Usuário envia mensagem
8. UI entra em `loading_ai`
9. Resposta → `response_ready`

### 7.2 Fluxo — Modo Caneta (Imagem)

1. Usuário ativa ícone ✏️ ou hotkey
2. UI entra em `capturing_image`
3. Tela entra em modo seleção
4. Área selecionada
5. Preview exibido (`preview_ready`)
6. Usuário envia mensagem
7. IA responde (`response_ready`)

### 7.3 Fluxo — Chat Direto (Sem Captura)

1. UI em `idle`
2. Usuário digita pergunta
3. UI entra em `loading_ai`
4. Resposta exibida (`response_ready`)

### 7.4 Fluxo — Envio de Imagem no Chat

1. Usuário anexa imagem manualmente
2. Imagem aparece no preview da mensagem
3. Usuário envia mensagem
4. UI entra em `loading_ai`
5. Resposta exibida

## 8. Comportamento por Estado

### 8.1 `idle`
- UI visível
- Nenhuma captura ativa
- Input habilitado
- Toolbar neutra

### 8.2 `capturing_text`
- UI minimizada ou oculta
- Feedback visual discreto
- Bloqueio temporário do input

### 8.3 `capturing_image`
- Tela escurecida
- Cursor crosshair
- ESC cancela
- Toolbar indica modo ativo

### 8.4 `preview_ready`
- Conteúdo capturado visível
- Preview de texto ou imagem
- Input habilitado

### 8.5 `loading_ai`
- Input desabilitado
- Indicador de loading
- Cancelamento opcional (futuro)

### 8.6 `response_ready`
- Resposta exibida
- Input reabilitado
- Novo envio permitido

### 8.7 `missing_api_key`
- UI exibe aviso claro
- CTA para configurar key
- Captura continua funcionando
- Envio para IA bloqueado

### 8.8 `error`
- Mensagem de erro clara
- Possibilidade de retry
- Estado retorna para `idle` ou `preview_ready`

## 9. Toolbar — Comportamento

| Ícone | Estado | Comportamento |
|----|------|--------------|
| ✏️ | ativo | Seleção visual |
| ⌨️ | ativo | Última captura via hotkey |
| ⚙️ | neutro | Abre configurações (futuro) |

Regras:
- Apenas **um modo ativo por vez**
- Estado ativo é visualmente destacado

## 10. Acessibilidade e UX

- Hotkeys visíveis em tooltip
- ESC sempre cancela ações
- Feedback visual em todas as transições
- Nenhum estado “silencioso”

## 11. Evoluções Planejadas (não vinculantes)

- Histórico visual de capturas
- Multicontexto
- Fixar overlay
- Modo compacto
- Dashboard separado

## 12. Conclusão

Esta RFC define o comportamento da UI como uma **máquina de estados clara e previsível**, garantindo consistência entre UX e arquitetura.

Com a RFC-003, a v1 do produto possui:
- base conceitual (RFC-001)
- arquitetura técnica (RFC-002)
- experiência do usuário definida (RFC-003)
