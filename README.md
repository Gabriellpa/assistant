# Contextual Desktop Assistant — Planejamento v1

Este repositório contém as RFCs da v1 e agora também um scaffold inicial da **Fase 1** (Tauri + Vue 3 + Pinia + IPC base).

## Estrutura

- `docs/rfcs/`: RFC-001, RFC-002 e RFC-003
- `docs/roadmap.md`: plano por fases com backlog
- `src/`: frontend Vue 3 + Pinia
- `src-tauri/`: backend Rust/Tauri com commands IPC

## Como rodar (scaffold)

```bash
npm install
npm run tauri dev
```

## Entregas já feitas na Fase 1

- Scaffold do app com Vite + Vue 3 + Pinia
- Overlay base com toolbar e estado inicial em store
- Tokens de tema dark/light via CSS variables
- Commands IPC v1 expostos no backend Tauri
- Módulos backend-base: `HotkeyService`, `ClipboardService`, `WindowManager`, `SecurityService`

## Próximo passo

Implementar a Fase 2: captura contextual (hotkey + fallback imagem + modo caneta com ESC e preview).
