# RFC-002 — Arquitetura Técnica Detalhada

**Status:** Draft (pronta para implementação)  
**Versão:** 1.0  
**Autor:** Gabriel  
**Data:** 2026-01-29  
**Escopo:** Definição da arquitetura técnica detalhada da versão 1 do Contextual Desktop Assistant  
**Dependência:** RFC-001 — Contextual Desktop Assistant (v1)

## 1. Objetivo

Definir a **arquitetura técnica detalhada** da versão 1 do Contextual Desktop Assistant, estabelecendo:

- separação clara de responsabilidades entre frontend e backend
- contratos definitivos de comunicação JS ↔ Rust
- serviços internos e suas funções
- decisões técnicas necessárias para implementação

Esta RFC **implementa tecnicamente** as decisões conceituais estabelecidas na RFC-001, sem alterá-las.

## 2. Visão Geral da Arquitetura

O sistema é composto por:

- **Frontend**: UI e lógica de interação (Vue 3)
- **Backend local**: lógica de sistema, segurança e IA (Rust / Tauri)
- **Sistema Operacional**: provedor de recursos nativos

A comunicação entre frontend e backend ocorre exclusivamente via **IPC seguro**, fornecido pelo runtime do Tauri.

## 3. Escopo da RFC-002

### Incluído
- Arquitetura técnica da v1
- Contratos JS ↔ Rust (commands e events)
- Definição de serviços do backend
- Modelo de dados interno
- Fluxos técnicos principais
- Decisões sobre persistência e imagens

### Fora do escopo
- Design visual detalhado
- UX refinada e microinterações
- Implementação de código
- Deploy, distribuição e updates
- Telemetria e analytics

## 4. Princípios Arquiteturais

A arquitetura segue os seguintes princípios:

1. **Local-first**
2. **Single-user**
3. **Security by default**
4. **Separação rígida UI ↔ SO**
5. **Contratos explícitos**
6. **Evolução incremental**
7. **BYOK gerenciado exclusivamente no backend**

## 5. Separação de Responsabilidades

### 5.1 Frontend (Vue 3)

Responsabilidades:

- Renderização da UI
- Gerenciamento de estado visual (Pinia)
- Fluxo do chat
- Input do usuário
- Preview de imagens
- Orquestração de chamadas IPC

O frontend **não**:
- acessa o sistema operacional
- acessa filesystem
- acessa APIs externas
- tem acesso a API keys

### 5.2 Backend (Rust / Tauri)

Responsabilidades:

- Registro e tratamento de hotkeys globais
- Leitura e restauração de clipboard
- Captura de tela e seleção visual
- Gerenciamento de janelas
- Comunicação com IA (BYOK)
- Armazenamento seguro de segredos
- Emissão de eventos para a UI

## 6. Comunicação JS ↔ Rust (IPC)

### 6.1 Modelo de Comunicação

- Comunicação via **IPC nativo do Tauri**
- Não utiliza TCP, HTTP ou WebSocket
- Nenhuma porta local é aberta
- Apenas funções explicitamente expostas são acessíveis

### 6.2 Commands (Frontend → Backend)

Commands são funções Rust anotadas com `@tauri::command`.

Commands principais (v1):

- start_text_capture()
- start_selection_mode()
- send_to_ai(request)
- save_api_key(key)
- validate_api_key()

### 6.3 Events (Backend → Frontend)

Events principais (v1):

- text_captured
- image_captured
- capture_cancelled
- ai_response
- ai_error

## 7. Modelo de Dados (Definitivo – v1)

### 7.1 Contexto Capturado

```ts
Context {
  id: string
  type: "text" | "image"
  content: string | ImageRef
  createdAt: number
}
```

### 7.2 Referência de Imagem

```ts
ImageRef {
  id: string
  path: string
  width: number
  height: number
}
```

**Decisão:** imagens são armazenadas como arquivos temporários locais e referenciadas por path.

### 7.3 Mensagem de Chat

```ts
ChatMessage {
  role: "user" | "assistant"
  text?: string
  image?: ImageRef
  timestamp: number
}
```

### 7.4 Requisição para IA

```ts
AIRequest {
  context: Context
  messages: ChatMessage[]
}
```

### 7.5 Resposta da IA

```ts
AIResponse {
  message: ChatMessage
  error?: {
    code: string
    message: string
  }
}
```

## 8. Serviços do Backend

- HotkeyService
- ClipboardService
- SelectionModeService
- ScreenshotService
- AIService (BYOK)
- SecurityService
- WindowManager

## 9. Persistência (v1)

Persistido:
- API key (criptografada)
- Preferência de tema
- Preferência de hotkeys

Não persistido:
- Histórico de chats
- Contextos antigos
- Métricas

## 10. Fluxos Técnicos Principais

### Hotkey → Texto / Imagem
1. Hotkey capturada
2. Clipboard analisado
3. Fallback para screenshot se necessário
4. Context criado
5. Event emitido
6. Overlay aberto

### Caneta → Imagem
1. Modo caneta ativado
2. Janela fullscreen criada
3. Área selecionada
4. Screenshot salvo
5. Event emitido
6. Overlay aberto

### Chat → IA
1. Mensagem enviada
2. API key validada
3. Prompt montado
4. Requisição HTTPS
5. Resposta normalizada

## 11. Segurança

- API key nunca exposta ao frontend
- IPC com whitelist explícita
- Imagens temporárias com lifecycle controlado
- Nenhuma porta de rede aberta

## 12. Estados da UI

- idle
- capturing_text
- capturing_image
- loading_ai
- response_ready
- error
- missing_api_key

## 13. Evoluções Técnicas Planejadas

- Múltiplos providers de IA
- Persistência de histórico
- Dashboard de métricas
- OCR
- Plugins

## 14. Conclusão

Esta RFC fecha todas as decisões técnicas necessárias para a implementação da versão 1.
