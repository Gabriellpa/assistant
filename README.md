# Contextual Desktop Assistant — Planejamento v1

Este repositório contém as 3 RFCs oficiais da v1 e a base técnica para iniciar a **Fase 1 (Fundação)**.

## Documentação principal

- RFCs: `docs/rfcs/`
- Roadmap executável: `docs/roadmap.md`
- Status técnico: `docs/status/fase-1-scaffold.md`

## Ordem de leitura recomendada

1. RFC-001 (visão de produto e escopo do MVP)
2. RFC-002 (arquitetura técnica e contratos IPC)
3. RFC-003 (state machine da UI e fluxos UX)

## Escopo da Fase 1 neste repositório

- Scaffold do app Tauri + Vue 3 + Pinia
- Contratos IPC v1 (`start_text_capture`, `start_selection_mode`, `send_to_ai`, `save_api_key`, `validate_api_key`)
- Módulos backend base (`HotkeyService`, `ClipboardService`, `WindowManager`, `SecurityService`)
- Tokens de tema dark/light via CSS variables

## Como rodar (quando houver acesso ao registry)

```bash
npm install
npm run tauri dev
```
