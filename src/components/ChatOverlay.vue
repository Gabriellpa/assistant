<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssistantStore } from '../stores/assistant'

const fileInput = ref(null)
const messagesRef = ref(null)
const store = useAssistantStore()
const { uiState, captureMode, context, messages, composerText, canSend, attachedImage, theme, hasApiKey, lastError, configModalOpen, provider, apiKey, interactionMode, coreOpacity } =
  storeToRefs(store)

const selecting = ref(false)
const startPoint = ref({ x: 0, y: 0 })
const endPoint = ref({ x: 0, y: 0 })

const panelPosition = ref({ x: 24, y: 24 })
const draggingPanel = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const selectionRect = computed(() => {
  const x = Math.min(startPoint.value.x, endPoint.value.x)
  const y = Math.min(startPoint.value.y, endPoint.value.y)
  const width = Math.abs(startPoint.value.x - endPoint.value.x)
  const height = Math.abs(startPoint.value.y - endPoint.value.y)
  return { x, y, width, height }
})

const panelStyle = computed(() => ({
  left: `${panelPosition.value.x}px`,
  top: `${panelPosition.value.y}px`,
  opacity: String(coreOpacity.value)
}))

const clampPanel = (nextX, nextY) => {
  const panelWidth = Math.min(740, window.innerWidth - 32)
  const panelHeight = Math.min(760, Math.floor(window.innerHeight * 0.82))

  return {
    x: Math.max(8, Math.min(nextX, window.innerWidth - panelWidth - 8)),
    y: Math.max(8, Math.min(nextY, window.innerHeight - panelHeight - 8))
  }
}

const onPanelDragStart = (event) => {
  draggingPanel.value = true
  dragOffset.value = {
    x: event.clientX - panelPosition.value.x,
    y: event.clientY - panelPosition.value.y
  }
}

const onPanelDragMove = (event) => {
  if (!draggingPanel.value) return

  const nextX = event.clientX - dragOffset.value.x
  const nextY = event.clientY - dragOffset.value.y
  panelPosition.value = clampPanel(nextX, nextY)
}

const onPanelDragEnd = () => {
  draggingPanel.value = false
}

const onKeydown = (event) => {
  if ((event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'l') && event.ctrlKey && event.shiftKey) {
    event.preventDefault()
    store.toggleInteractionMode()
    return
  }

  if (interactionMode.value === 'click_through') {
    return
  }

  if (event.key === 'Escape' && configModalOpen.value) {
    store.closeConfigModal()
    return
  }

  if (event.key === 'Escape' && uiState.value === 'capturing_image') {
    selecting.value = false
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

const onSelectionStart = (event) => {
  selecting.value = true
  startPoint.value = { x: event.clientX, y: event.clientY }
  endPoint.value = { x: event.clientX, y: event.clientY }
}

const onSelectionMove = (event) => {
  if (!selecting.value) return
  endPoint.value = { x: event.clientX, y: event.clientY }
}

const onSelectionEnd = () => {
  if (!selecting.value) return
  selecting.value = false

  const rect = selectionRect.value
  if (rect.width < 4 || rect.height < 4) {
    store.lastError = 'Seleção muito pequena. Tente novamente.'
    return
  }

  store.applyManualSelection(rect)
}

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  }
)

onMounted(() => {
  const initialX = window.innerWidth - Math.min(740, window.innerWidth - 32) - 24
  const initialY = window.innerHeight - Math.min(760, Math.floor(window.innerHeight * 0.82)) - 24
  panelPosition.value = clampPanel(initialX, initialY)

  store.bootstrap()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('mousemove', onPanelDragMove)
  window.addEventListener('mouseup', onPanelDragEnd)
  window.addEventListener('blur', onPanelDragEnd)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onPanelDragMove)
  window.removeEventListener('mouseup', onPanelDragEnd)
  window.removeEventListener('blur', onPanelDragEnd)
})
</script>

<template>
  <section class="overlay-root">
    <section class="overlay" :style="panelStyle" role="dialog" aria-label="Contextual Desktop Assistant">
      <header class="toolbar drag-handle" @mousedown="onPanelDragStart">
        <button :class="['icon', { active: captureMode === 'pen' }]" title="Modo caneta (Ctrl+Shift+S)" @click.stop="store.startPenCapture">✏️</button>
        <button
          :class="['icon', { active: captureMode === 'hotkey' }]"
          title="Captura rápida (Ctrl+Shift+Space)"
          @click.stop="store.startHotkeyCapture"
        >
          ⌨️
        </button>
        <button class="icon" title="Configurações" @click.stop="store.openConfigModal">⚙️</button>
        <button class="icon" title="Alternar tema" @click.stop="store.setTheme(theme === 'dark' ? 'light' : 'dark')">
          {{ theme === 'dark' ? '🌙' : '☀️' }}
        </button>
        <button
          class="icon"
          :title="interactionMode === 'interactive' ? 'Ativar click-through' : 'Ativar modo interativo'"
          @click.stop="store.toggleInteractionMode()"
        >
          {{ interactionMode === 'interactive' ? '🖱️' : '🪟' }}
        </button>
        <button class="icon" title="Minimizar" @click.stop="store.minimizeApp()">—</button>
        <button class="icon" title="Fechar" @click.stop="store.closeApp()">✕</button>
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

      <div ref="messagesRef" class="messages">
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
        <small>Ctrl+Shift+I ou Ctrl+Shift+L alterna interação/click-through.</small>
        <small>Inicializa em interativo; use toggle para click-through quando necessário.</small>
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

          <label>
            Opacidade do core
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              :value="coreOpacity"
              @input="store.setCoreOpacity($event.target.value)"
            />
            <small>{{ Math.round(coreOpacity * 100) }}%</small>
          </label>


          <div class="modal-actions">
            <button class="ghost" @click="store.closeConfigModal">Cancelar</button>
            <button class="primary" @click="store.saveApiKey">Salvar</button>
          </div>
        </section>
      </div>
    </section>

    <div class="selection-layer" v-if="uiState === 'capturing_image'" @mousedown="onSelectionStart" @mousemove="onSelectionMove" @mouseup="onSelectionEnd">
      <div class="selection-tip">Arraste para selecionar a área da captura (ESC cancela)</div>
      <div
        v-if="selecting"
        class="selection-rect"
        :style="{
          left: `${selectionRect.x}px`,
          top: `${selectionRect.y}px`,
          width: `${selectionRect.width}px`,
          height: `${selectionRect.height}px`
        }"
      />
    </div>
  </section>
</template>

<style scoped>
.overlay-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}
.overlay {
  position: fixed;
  width: min(740px, calc(100vw - 32px));
  max-height: min(82vh, 760px);
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto auto;
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}
.toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--border); user-select: none; }
.drag-handle { cursor: move; }
.icon { background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 8px; padding: 4px 8px; cursor: pointer; }
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
.send { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
.hints { display: flex; gap: 12px; flex-wrap: wrap; padding: 0 10px 10px; color: var(--text-muted); }
.selection-layer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  cursor: crosshair;
  z-index: 2000;
  pointer-events: auto;
}
.selection-tip {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 17, 20, 0.85);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
}
.selection-rect {
  position: fixed;
  border: 2px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 20%, transparent);
}
.modal-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.45); display: grid; place-items: center; border-radius: 12px; }
.config-modal { width: min(420px, calc(100% - 24px)); background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: grid; gap: 12px; }
.config-modal h3 { margin: 0; }
.config-modal label { display: grid; gap: 6px; font-size: 13px; }
.config-modal input,
.config-modal select { background: var(--bg); color: var(--text-primary); border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ghost { background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 8px; padding: 8px 12px; cursor: pointer; }
.primary { background: var(--accent); color: #fff; border: 0; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
</style>
