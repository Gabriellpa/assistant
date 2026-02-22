<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssistantStore } from '../stores/assistant'

const fileInput = ref(null)
const store = useAssistantStore()
const { uiState, captureMode, context, messages, composerText, canSend, attachedImage, theme, hasApiKey, lastError, configModalOpen, provider, apiKey } =
  storeToRefs(store)

const onKeydown = (event) => {
  if (event.key === 'Escape' && configModalOpen.value) {
    store.closeConfigModal()
    return
  }

  if (event.key === 'Escape' && ['capturing_text', 'capturing_image'].includes(store.uiState)) {
    store.cancelCapture()
    return
  }

  if (event.key === 'Enter' && !event.shiftKey) {
    const target = event.target
    if (target && target.tagName === 'INPUT' && !configModalOpen.value) {
      event.preventDefault()
      store.sendMessage()
    }
  }
}

const onComposerKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    store.sendMessage()
  }
}

const triggerFilePicker = () => {
  fileInput.value?.click()
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
  <section class="overlay" role="dialog" aria-label="Contextual Desktop Assistant">
    <header class="toolbar">
      <button :class="['icon', { active: captureMode === 'pen' }]" title="Modo caneta (Ctrl+Shift+S)" @click="store.startPenCapture">✏️</button>
      <button
        :class="['icon', { active: captureMode === 'hotkey' }]"
        title="Captura rápida (Ctrl+Shift+Space)"
        @click="store.startHotkeyCapture"
      >
        ⌨️
      </button>
      <button class="icon" title="Configurações" @click="store.openConfigModal">⚙️</button>
      <button class="icon" title="Alternar tema" @click="store.setTheme(theme === 'dark' ? 'light' : 'dark')">
        {{ theme === 'dark' ? '🌙' : '☀️' }}
      </button>
      <span class="state">{{ uiState }}</span>
    </header>

    <div class="notice missing" v-if="uiState === 'missing_api_key'">
      API key não configurada. Abra configurações (⚙️) para selecionar provider e salvar sua chave.
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
      <button class="icon attach" :disabled="!canSend" title="Anexar imagem" @click="triggerFilePicker">📎</button>
      <input ref="fileInput" class="hidden" type="file" accept="image/*" @change="store.setAttachedImage($event.target.files?.[0] || null)" />
      <input
        :value="composerText"
        @input="store.setComposerText($event.target.value)"
        @keydown="onComposerKeydown"
        placeholder="Digite sua pergunta…"
        :disabled="!canSend"
      />
      <button class="send" :disabled="!canSend" @click="store.sendMessage">Enviar</button>
    </footer>

    <section class="hints">
      <small>ESC cancela captura ativa.</small>
      <small v-if="attachedImage">Imagem anexada: {{ attachedImage.path }}</small>
      <small v-if="!hasApiKey">Provider não configurado.</small>
    </section>

    <div class="modal-backdrop" v-if="configModalOpen" @click.self="store.closeConfigModal">
      <section class="config-modal" role="dialog" aria-label="Configurar API key">
        <h3>Configurações de IA (BYOK)</h3>

        <label>
          Provider
          <select v-model="provider">
            <option value="chatgpt">ChatGPT</option>
            <option value="huggingface">Hugging Face</option>
          </select>
        </label>

        <label>
          API key
          <input v-model="apiKey" type="password" placeholder="Cole sua API key" />
        </label>

        <div class="modal-actions">
          <button class="ghost" @click="store.closeConfigModal">Cancelar</button>
          <button class="primary" @click="store.saveApiKey">Salvar</button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.overlay {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: min(740px, calc(100vw - 32px));
  max-height: min(82vh, 760px);
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto auto;
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  z-index: 1000;
}
.toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--border); }
.icon { background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 8px; padding: 4px 8px; }
.icon.active { border-color: var(--accent); }
.state { margin-left: auto; font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
.notice { margin: 10px; padding: 8px 10px; border-radius: 8px; font-size: 13px; }
.notice.missing { background: color-mix(in srgb, var(--accent) 15%, transparent); }
.notice.error { background: color-mix(in srgb, #ef4444 20%, transparent); }
.capture-preview { padding: 10px 14px; border-bottom: 1px solid var(--border); }
.messages { min-height: 220px; max-height: 320px; overflow-y: auto; padding: 14px; display: grid; gap: 8px; }
.msg { padding: 8px; border: 1px solid var(--border); border-radius: 8px; }
.msg.user { border-color: var(--accent); }
.muted { color: var(--text-muted); }
.composer { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; padding: 10px; border-top: 1px solid var(--border); }
.composer input { background: var(--bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.hidden { display: none; }
.send { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; }
.hints { display: flex; gap: 12px; flex-wrap: wrap; padding: 0 10px 10px; color: var(--text-muted); }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); display: grid; place-items: center; border-radius: 12px; }
.config-modal { width: min(420px, calc(100% - 24px)); background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: grid; gap: 12px; }
.config-modal h3 { margin: 0; }
.config-modal label { display: grid; gap: 6px; font-size: 13px; }
.config-modal input,
.config-modal select { background: var(--bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ghost { background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 8px; padding: 8px 12px; }
.primary { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; }
</style>
