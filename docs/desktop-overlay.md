# Desktop Overlay (HUD) — Implementação Tauri v2

Este documento descreve a implementação do modo overlay desktop com:

- Always-on-top
- Transparência
- Click-through opcional
- Alternância entre modo interativo e click-through

## Configuração Tauri (produção)

Arquivo: `src-tauri/tauri.conf.json`

Principais flags aplicadas na janela `main`:

- `fullscreen: true`
- `decorations: false`
- `transparent: true`
- `alwaysOnTop: true`
- `skipTaskbar: true`
- `shadow: false`
- `resizable: false`

Isso cria uma janela “HUD-like” ocupando toda a tela sem bordas, mantendo apenas o painel de UI visível no frontend.

## Alternância interativo ↔ click-through

### Backend (Rust)

Command IPC: `set_interaction_mode(interactive: bool)`.

Comportamento:

- `set_ignore_cursor_events(true)` ativa click-through (janela não intercepta mouse)
- `set_focusable(false)` evita foco indevido quando click-through
- `set_ignore_cursor_events(false)` e `set_focusable(true)` retornam ao modo interativo

### Frontend

- Estado: `interactionMode` em `src/stores/assistant.js`
- Ações:
  - `setInteractionMode(mode)`
  - `toggleInteractionMode()`
- UI:
  - botão na toolbar para alternar modo
  - hotkey `Ctrl+Shift+I` para alternância rápida

## Implementação do overlay visual

No componente `ChatOverlay.vue`:

- `overlay-root` cobre a tela inteira (`position: fixed; inset: 0`)
- `pointer-events: none` no root para não bloquear apps atrás
- painel principal com `pointer-events: auto` para interação local
- painel arrastável por drag na toolbar

## Observações por plataforma

### Windows

- `transparent + alwaysOnTop + fullscreen + decorations: false` funciona bem para HUD.
- Em alguns GPUs/drivers pode haver artefatos de composição/transparência (Acrylic/DirectComposition).
- `set_ignore_cursor_events(true)` pode impedir totalmente interação com a janela (esperado); use toggle para voltar.

### macOS

- Transparência e always-on-top dependem de comportamento do WindowServer e Spaces.
- Fullscreen nativo do macOS pode alterar comportamento de múltiplos desktops/Spaces; validar UX desejada.

### Linux (X11/Wayland)

- Click-through e always-on-top podem variar por compositor/window manager.
- Wayland pode impor restrições adicionais para flags de janela.

## Limitações conhecidas

- Click-through é binário no nível da janela (não por região) nesta implementação.
- Para “regiões interativas seletivas” (somente card clicável e resto sempre pass-through) podem ser necessários ajustes nativos adicionais por plataforma.
