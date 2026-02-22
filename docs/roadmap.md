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

- [ ] Hotkey principal (`Ctrl+Shift+Space`) com fluxo texto → fallback imagem
- [ ] Modo caneta (`Ctrl+Shift+S`) com seleção visual e cancelamento por ESC
- [ ] Salvamento temporário de imagens e emissão de eventos (`text_captured`, `image_captured`, `capture_cancelled`)
- [ ] Overlay abrindo em `preview_ready` com preview de texto/imagem

## Fase 3 — Chat + BYOK (2-3 semanas)

- [ ] Fluxo de configuração e validação de API key
- [ ] Envio para IA com `AIRequest` (context + histórico em memória)
- [ ] Estados `loading_ai`, `response_ready`, `error`, `missing_api_key`
- [ ] Upload de imagem no chat (texto + imagem na mesma mensagem)

## Fase 4 — Qualidade e release v1 (1-2 semanas)

- [ ] Testes de integração IPC (frontend ↔ backend)
- [ ] Testes de fluxos UX críticos (hotkey, caneta, missing key, erro de IA)
- [ ] Hardening de segurança (lifecycle de arquivos temporários e whitelisting de commands)
- [ ] Empacotamento desktop e checklist de release

## Backlog priorizado

| Prioridade | Item | RFC de origem | Esforço | Dependências | Critério de aceite |
|---|---|---|---|---|---|
| P0 | Implementar IPC commands e events do v1 | RFC-002 | M | Scaffold Tauri/Vue | Frontend dispara commands e recebe events sem fallback HTTP |
| P0 | Hotkey principal com fallback automático para imagem | RFC-001, RFC-002, RFC-003 | M | Clipboard + ScreenshotService | Ao pressionar hotkey, sempre há contexto válido (texto ou imagem) |
| P0 | Fluxo BYOK com armazenamento criptografado | RFC-001, RFC-002 | M | SecurityService | Key nunca chega ao frontend e envio à IA só funciona com key válida |
| P1 | State machine explícita da UI (incluindo `preview_ready`) | RFC-003 | S | Store Pinia | Transições seguem diagrama e estados inválidos são bloqueados |
| P1 | Modo caneta com ESC e preview | RFC-001, RFC-003 | M | SelectionModeService | Seleção gera imagem, ESC cancela e UI retorna sem travar |
| P2 | Tema dark/light com design tokens | RFC-001 | S | Base UI | Tema troca apenas via tokens sem hardcode por componente |
