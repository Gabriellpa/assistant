# Contextual Desktop Assistant — Planejamento v1

Este repositório agora contém as 3 RFCs que definem a v1 da aplicação e um roadmap direto para execução.

## Documentação principal

- RFCs: `docs/rfcs/`
- Roadmap executável: `docs/roadmap.md`

## Ordem de leitura recomendada

1. RFC-001 (visão de produto e escopo do MVP)
2. RFC-002 (arquitetura técnica e contratos IPC)
3. RFC-003 (state machine da UI e fluxos UX)

## Próximos passos práticos

1. Criar o scaffold do app Tauri + Vue 3 + Pinia.
2. Implementar os contratos IPC v1 e serviços backend-base.
3. Entregar fluxos de captura (hotkey/caneta) com preview.
4. Integrar chat com IA no modelo BYOK.
5. Validar critérios de aceite do backlog P0 em `docs/roadmap.md`.
