<script setup>
import { computed } from 'vue'
import { useAssistantStore } from '../stores/assistant'

const store = useAssistantStore()
const canSend = computed(() => !['loading_ai', 'capturing_text', 'capturing_image'].includes(store.uiState))
</script>

<template>
  <section class="overlay">
    <header class="toolbar">
      <button :class="['icon', { active: store.captureMode === 'pen' }]" @click="store.setCaptureMode('pen')">✏️</button>
      <button :class="['icon', { active: store.captureMode === 'hotkey' }]" @click="store.setCaptureMode('hotkey')">⌨️</button>
      <button class="icon" disabled>⚙️</button>
      <span class="state">{{ store.uiState }}</span>
    </header>

    <div class="messages">
      <p>Fase 1 scaffold pronto.</p>
      <p class="muted">Próximo: integrar IPC real com backend Tauri.</p>
    </div>

    <footer class="composer">
      <input placeholder="Digite sua pergunta…" :disabled="!canSend" />
      <button :disabled="!canSend">Enviar</button>
    </footer>
  </section>
</template>

<style scoped>
.overlay { width: 520px; background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 12px; }
.toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--border); }
.icon { background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 8px; padding: 4px 8px; }
.icon.active { border-color: var(--accent); }
.state { margin-left: auto; font-size: 12px; color: var(--text-muted); }
.messages { min-height: 180px; padding: 14px; }
.muted { color: var(--text-muted); }
.composer { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--border); }
.composer input { flex: 1; background: var(--bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.composer button { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; }
</style>
