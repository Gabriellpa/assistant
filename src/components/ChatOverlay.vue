<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssistantStore } from '../stores/assistant'

const store = useAssistantStore()
const { uiState, captureMode, context, messages, composerText, apiKey, canSend, attachedImage, theme, hasApiKey, lastError } =
  storeToRefs(store)

const onKeydown = (event) => {
  if (event.key === 'Escape' && ['capturing_text', 'capturing_image'].includes(store.uiState)) {
    store.cancelCapture()
  }
}

onMounted(() => {
  store.bootstrap()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <section class="overlay">
    <header class="toolbar">
      <button :class="['icon', { active: captureMode === 'pen' }]" title="Modo caneta (Ctrl+Shift+S)" @click="store.startPenCapture">✏️</button>
      <button
        :class="['icon', { active: captureMode === 'hotkey' }]"
        title="Captura rápida (Ctrl+Shift+Space)"
        @click="store.startHotkeyCapture"
      >
        ⌨️
      </button>
      <button class="icon" title="Alternar tema" @click="store.setTheme(theme === 'dark' ? 'light' : 'dark')">
        {{ theme === 'dark' ? '🌙' : '☀️' }}
      </button>
      <span class="state">{{ uiState }}</span>
    </header>

    <div class="notice missing" v-if="uiState === 'missing_api_key'">
      API key não configurada. Você pode capturar conteúdo, mas o envio para IA ficará bloqueado.
    </div>

    <div class="notice error" v-if="uiState === 'error' || lastError">
      {{ lastError || 'Ocorreu um erro inesperado.' }}
    </div>

    <div class="capture-preview" v-if="context">
      <p><strong>Preview:</strong> {{ context.type }}</p>
      <p v-if="context.content">{{ context.content }}</p>
      <p v-else-if="context.image">Imagem: {{ context.image.path }}</p>
    </div>

    <div class="messages">
      <p v-if="messages.length === 0" class="muted">Sem mensagens ainda.</p>
      <article v-for="(message, idx) in messages" :key="idx" class="msg" :class="message.role">
        <strong>{{ message.role }}:</strong>
        <span>{{ message.text || '(sem texto)' }}</span>
        <small v-if="message.image">+ imagem ({{ message.image.path }})</small>
      </article>
    </div>

    <footer class="composer">
      <input
        :value="composerText"
        @input="store.setComposerText($event.target.value)"
        placeholder="Digite sua pergunta…"
        :disabled="!canSend"
      />
      <input type="file" accept="image/*" @change="store.setAttachedImage($event.target.files?.[0] || null)" :disabled="!canSend" />
      <button :disabled="!canSend || !hasApiKey" @click="store.sendMessage">Enviar</button>
    </footer>

    <section class="byok">
      <input v-model="apiKey" type="password" placeholder="Sua API key (BYOK)" />
      <button @click="store.saveApiKey">Salvar key</button>
      <small v-if="attachedImage">Imagem anexada: {{ attachedImage.path }}</small>
    </section>

    <section class="hints">
      <small>ESC cancela captura ativa.</small>
    </section>
  </section>
</template>

<style scoped>
.overlay { width: 680px; background: var(--surface); color: var(--text-primary); border: 1px solid var(--border); border-radius: 12px; }
.toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--border); }
.icon { background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 8px; padding: 4px 8px; }
.icon.active { border-color: var(--accent); }
.state { margin-left: auto; font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
.notice { margin: 10px; padding: 8px 10px; border-radius: 8px; font-size: 13px; }
.notice.missing { background: color-mix(in srgb, var(--accent) 15%, transparent); }
.notice.error { background: color-mix(in srgb, #ef4444 20%, transparent); }
.capture-preview { padding: 10px 14px; border-bottom: 1px solid var(--border); }
.messages { min-height: 180px; padding: 14px; display: grid; gap: 8px; }
.msg { padding: 8px; border: 1px solid var(--border); border-radius: 8px; }
.msg.user { border-color: var(--accent); }
.muted { color: var(--text-muted); }
.composer { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--border); }
.composer input:first-child { flex: 1; background: var(--bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.composer button { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; }
.byok { display: flex; gap: 8px; align-items: center; padding: 10px; border-top: 1px solid var(--border); }
.byok input { flex: 1; background: var(--bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.byok small { color: var(--text-muted); }
.hints { padding: 0 10px 10px; color: var(--text-muted); }
</style>
