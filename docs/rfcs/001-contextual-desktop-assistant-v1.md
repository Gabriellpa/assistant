# RFC-001 — Contextual Desktop Assistant (v1)

**Status:** Draft  
**Versão:** 1.0  
**Autor:** Gabriel  
**Data:** 2026-01-29  
**Escopo:** Definição funcional e arquitetural da primeira versão (MVP)

## 1. Objetivo

Definir os requisitos funcionais, não funcionais, arquitetura e UX da **versão 1** de um assistente desktop contextual que auxilia o usuário na compreensão de conteúdos técnicos (texto e imagem) por meio de um chat com IA.

Esta RFC estabelece a base para implementação incremental, permitindo evolução futura sem quebra de conceitos fundamentais.

## 2. Visão Geral do Produto

O **Contextual Desktop Assistant** é uma aplicação desktop que permite ao usuário:

- Capturar **texto ou imagem** a partir de qualquer aplicação
- Iniciar um **chat contextual** com um serviço de IA
- Manter uma UI discreta, flutuante e focada
- Alternar entre **modo hotkey** e **modo caneta**
- Enviar **texto e imagens** para a IA tanto no momento da captura quanto durante o chat

O produto é **single-user**, **local-first** e **privacy-oriented**.

## 3. Escopo da Versão 1 (v1)

### Incluído
- Aplicação desktop baseada em **Tauri**
- UI em **Vue 3**
- Backend local em **Rust**
- Captura de texto via hotkey
- Captura de imagem via:
  - fallback automático no modo hotkey
  - modo caneta explícito
- Chat contextual com IA
- Envio de imagens para IA:
  - na captura
  - diretamente pelo chat
- Tema Dark (preto/roxo)
- Tema Light
- Overlay flutuante
- **Modelo BYOK (Bring Your Own Key) para uso de IA**

### Fora do escopo (v1)
- Login / conta
- Sync em nuvem
- Multi-provider de IA
- Plugins
- OCR avançado configurável
- Compartilhamento
- Histórico persistente avançado

## 4. Arquitetura Geral

### 4.1 Stack Tecnológica

| Camada | Tecnologia |
|------|----------|
| UI | Vue 3 + Composition API |
| State | Pinia |
| Container | Tauri |
| Backend local | Rust |
| Renderização | WebView2 / WebKit |
| Comunicação | IPC (Tauri bridge) |
| IA | ChatGPT Go (inicial) |

### 4.2 Modelo Arquitetural

- UI roda dentro de uma **WebView nativa**
- Backend Rust roda no mesmo processo
- Comunicação ocorre via **bridge IPC segura**
- Nenhuma porta de rede local é exposta

## 5. Modos de Interação

### 5.1 Modo Hotkey (Captura Rápida)

**Objetivo:** Captura rápida e contextual com mínima fricção.

#### Comportamento
1. Usuário seleciona um conteúdo
2. Pressiona hotkey principal
3. Sistema tenta:
   - Capturar texto (clipboard)
   - Caso texto não esteja disponível → capturar imagem da seleção
4. Overlay de chat é aberto com o contexto capturado

#### Hotkey padrão

```txt
Ctrl + Shift + Space
```

#### Regras
- Apenas **uma hotkey principal**
- Fallback automático para imagem
- Feedback visual breve indicando o tipo de captura

### 5.2 Modo Caneta (Seleção Visual)

**Objetivo:** Captura explícita de imagem, sem ambiguidade.

#### Comportamento
1. Usuário clica no ícone de caneta
2. Cursor muda para crosshair
3. Tela entra em modo de seleção
4. Usuário desenha uma área
5. Imagem da área é capturada
6. Overlay de chat é aberto com preview da imagem

#### Hotkey alternativa

```txt
Ctrl + Shift + S
```

#### Regras
- Sempre gera imagem
- ESC cancela a seleção
- Ícone de caneta indica estado ativo

## 6. Envio de Conteúdo para IA

### 6.1 Envio na Captura

- Imagens capturadas via:
  - fallback do modo hotkey
  - modo caneta
- São automaticamente associadas ao contexto inicial do chat

### 6.2 Envio de Imagem no Chat

O usuário pode, a qualquer momento:

- Anexar uma imagem manualmente ao chat
- Combinar texto + imagem na mesma mensagem

#### Exemplos de uso
- “Explique esse diagrama”
- “O que está errado nesse trecho?”
- “O que esse erro visual significa?”

### 6.3 Modelo de Autenticação com IA (BYOK)

A versão 1 do Contextual Desktop Assistant adota o modelo  
**BYOK (Bring Your Own Key)** para integração com serviços de IA.

#### Diretrizes
- O usuário é responsável por fornecer sua própria chave de API de IA
- A aplicação não fornece, intermedia ou cobra pelo uso de IA
- Nenhuma chave é transmitida para serviços que não sejam o provedor de IA configurado

#### Armazenamento da Key
- A chave de API é:
  - armazenada localmente
  - criptografada
  - acessível apenas pelo backend Rust
- O frontend nunca tem acesso direto à chave

#### Comportamento da UI
- Na ausência de uma chave válida:
  - o usuário pode capturar texto e imagem
  - o envio para IA é bloqueado
  - a UI exibe um estado de configuração pendente
- A validação da chave ocorre:
  - no momento da configuração
  - ou na primeira tentativa de uso

#### Evolução
- O modelo BYOK permite, no futuro:
  - múltiplos providers de IA
  - troca dinâmica de provider
  - métricas por provider

## 7. Interface do Usuário (UI)

### 7.1 Layout Base (Overlay)

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

### 7.2 Toolbar

| Ícone | Função |
|----|-------|
| ✏️ | Ativar modo caneta |
| ⌨️ | Indicar captura via hotkey |
| ⚙️ | Configurações (futuro) |

- Ícones pequenos
- Tooltip explicativo
- Estado ativo visualmente destacado

## 8. Tema e Design

### 8.1 Tema Dark (padrão)

- Fundo: preto grafite
- Superfície: cinza escuro
- Primário: roxo
- Texto: branco acinzentado

### 8.2 Tema Light

- Fundo claro
- Primário roxo adaptado
- Mesma hierarquia visual do dark mode

### 8.3 Tokens de Design

- Cores definidas via CSS variables
- Componentes não dependem de cores fixas
- Tema = troca de tokens

## 9. Backend Rust (Responsabilidades)

### Serviços principais

- `HotkeyService`
- `ClipboardService`
- `SelectionModeService`
- `ScreenshotService`
- `AIService` (**compatível com BYOK**)
- `WindowManager`

### Responsabilidades
- Acesso ao SO
- Captura de eventos globais
- Captura de tela
- Comunicação com IA
- Emissão de eventos para UI

## 10. Comunicação JS ↔ Rust

- Comunicação via **IPC**
- Funções expostas explicitamente (`@tauri::command`)
- Nenhum acesso direto ao SO pelo frontend
- Nenhuma comunicação via TCP/HTTP local

## 11. Estados da UI (v1)

- `idle`
- `capturing_text`
- `capturing_image`
- `loading_ai`
- `response_ready`
- `error`
- `missing_api_key`

## 12. Requisitos Não Funcionais

- Inicialização rápida
- Baixo consumo de memória
- UI não intrusiva
- Privacidade por padrão
- Nenhuma coleta remota automática

## 13. Evoluções Planejadas (não vinculantes)

- Dashboard de métricas
- Histórico persistente
- Configuração avançada de hotkeys
- Múltiplos providers de IA
- OCR configurável
- Plugins

## 14. Conclusão

Esta RFC define uma **base sólida, extensível e coerente** para a v1 do Contextual Desktop Assistant.
