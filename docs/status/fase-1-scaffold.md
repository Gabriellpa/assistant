# Fase 1 — Status do Scaffold Técnico

Este documento registra o progresso técnico da Fase 1 sem alterar o roadmap principal, reduzindo conflito de merge em `README.md` e `docs/roadmap.md`.

## Entregas de scaffold implementadas

- Frontend com Vite + Vue 3 + Pinia
- Overlay base (`ChatOverlay`) com store inicial
- Tokens de tema dark/light via CSS variables
- Backend Tauri com commands IPC v1 (stubs)
- Módulos base de serviços em Rust

## Limites atuais (esperado para scaffold)

- Captura de hotkey e screenshot ainda não implementadas (Fase 2)
- Integração com provider de IA ainda não implementada (Fase 3)
- Persistência segura da API key ainda em stub (Fase 3)

## Próximo passo

Avançar para Fase 2 com implementação real de captura contextual (`Ctrl+Shift+Space`, `Ctrl+Shift+S`, fallback para imagem e preview).
