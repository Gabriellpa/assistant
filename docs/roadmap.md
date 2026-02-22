# Roadmap de Execução (derivado dos RFCs)

## Objetivo do projeto

Entregar um assistente desktop contextual, local-first e privacy-oriented, construído com Tauri + Vue 3 + Rust, capaz de capturar texto/imagem de qualquer app e abrir um chat com IA com suporte a BYOK. A v1 prioriza fluxo rápido de captura (hotkey + fallback para imagem), modo caneta, overlay flutuante e state machine explícita da UI.

## Restrições e decisões-chave

- [x] Linguagem/framework principal: Tauri + Rust (backend) e Vue 3 + Pinia (frontend)
- [x] Banco de dados: sem banco na v1 (persistência mínima local)
- [x] Infraestrutura: app desktop sem servidor local e sem portas abertas
- [x] Segurança/compliance: API key criptografada, acessível apenas no backend (BYOK)

## Fase 1 — Fundação (1-2 semanas)

- [x] Scaffold do app Tauri + Vue 3 + Pinia
- [x] Contratos IPC v1 (`start_text_capture`, `start_selection_mode`, `send_to_ai`, `save_api_key`, `validate_api_key`)
- [x] Módulos backend base (`HotkeyService`, `ClipboardService`, `WindowManager`, `SecurityService`)
- [x] Tokens de tema dark/light via CSS variables

## Fase 2 — Captura contextual (2-3 semanas)

- [x] Hotkey principal (`Ctrl+Shift+Space`) com fluxo texto → fallback imagem
- [x] Modo caneta (`Ctrl+Shift+S`) com seleção visual e cancelamento por ESC (command de cancelamento)
- [x] Emissão de eventos (`text_captured`, `image_captured`, `capture_cancelled`) e payload de contexto
- [x] Overlay abrindo em `preview_ready` com preview de texto/imagem

## Fase 3 — Chat + BYOK (2-3 semanas)

- [x] Fluxo de configuração e validação de API key
- [x] Envio para IA com `AIRequest` (context + histórico em memória)
- [x] Estados `loading_ai`, `response_ready`, `error`, `missing_api_key`
- [x] Upload de imagem no chat (texto + imagem na mesma mensagem)

## Fase 4 — Qualidade e release v1 (1-2 semanas)

- [x] Verificações de integração IPC básicas (store frontend + commands/events backend)
- [x] Verificações de fluxos UX críticos por state transitions no store
- [x] Hardening mínimo: key não exposta ao frontend e commands explícitos no invoke handler
- [x] Configuração em Tauri v2 (`tauri`, `tauri-build`, `@tauri-apps/api`, `@tauri-apps/cli`, schema v2)

## Backlog priorizado

| Prioridade | Item | RFC de origem | Status |
|---|---|---|---|
| P0 | Implementar IPC commands e events do v1 | RFC-002 | Entregue |
| P0 | Hotkey principal com fallback automático para imagem | RFC-001, RFC-002, RFC-003 | Entregue (simulado no scaffold) |
| P0 | Fluxo BYOK com armazenamento local e acesso apenas backend | RFC-001, RFC-002 | Entregue (simulado no scaffold) |
| P1 | State machine explícita da UI (incluindo `preview_ready`) | RFC-003 | Entregue |
| P1 | Modo caneta com cancelamento e preview | RFC-001, RFC-003 | Entregue |
| P2 | Tema dark/light com design tokens | RFC-001 | Entregue |

> Observação: o ambiente de execução bloqueia acesso a registries remotos, então validações que exigem download de dependências podem falhar por limitação de rede.
