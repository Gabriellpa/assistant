import { defineStore } from 'pinia'
import { tauriInvoke, tauriListen } from '../lib/tauri'

const validSendStates = ['idle', 'preview_ready', 'response_ready', 'error', 'missing_api_key']

export const useAssistantStore = defineStore('assistant', {
  state: () => ({
    uiState: 'idle',
    captureMode: 'hotkey',
    context: null,
    messages: [],
    composerText: '',
    attachedImage: null,
    provider: 'chatgpt',
    apiKey: '',
    hasApiKey: false,
    theme: 'dark',
    lastError: '',
    configModalOpen: false,
    interactionMode: 'click_through',
    coreOpacity: 0.92,
    bootstrapped: false
  }),

  getters: {
    canSend(state) {
      return validSendStates.includes(state.uiState)
    },
    isInteractive(state) {
      return state.interactionMode === 'interactive'
    }
  },

  actions: {
    async bootstrap() {
      if (this.bootstrapped) return

      this.unlistenText = await tauriListen('text_captured', (event) => {
        this.context = event.payload.context
        this.uiState = 'preview_ready'
      })

      this.unlistenImage = await tauriListen('image_captured', (event) => {
        this.context = event.payload.context
        this.uiState = 'preview_ready'
      })

      this.unlistenCancelled = await tauriListen('capture_cancelled', () => {
        this.uiState = 'idle'
      })

      const keyIsValid = await tauriInvoke('validate_api_key')
      this.hasApiKey = Boolean(keyIsValid)

      if (!this.hasApiKey) {
        this.uiState = 'missing_api_key'
      }

      this.applyTheme(this.theme)
      await this.setInteractionMode(this.interactionMode)
      this.bootstrapped = true
    },

    async setInteractionMode(mode) {
      const interactive = mode !== 'click_through'
      const result = await tauriInvoke('set_interaction_mode', { interactive })

      if (result === null) {
        this.interactionMode = interactive ? 'interactive' : 'click_through'
        return
      }

      this.interactionMode = result ? 'interactive' : 'click_through'
    },

    async toggleInteractionMode() {
      const nextMode = this.interactionMode === 'interactive' ? 'click_through' : 'interactive'
      await this.setInteractionMode(nextMode)
    },

    async openConfigModal() {
      await this.setInteractionMode('interactive')
      this.configModalOpen = true
    },

    async closeConfigModal() {
      this.configModalOpen = false
      if (this.interactionMode === 'click_through') {
        await this.setInteractionMode('click_through')
      }
    },

    setComposerText(value) {
      this.composerText = value
    },

    setAttachedImage(file) {
      if (!file) {
        this.attachedImage = null
        return
      }

      this.attachedImage = {
        id: `upload-${Date.now()}`,
        path: file.name,
        width: 0,
        height: 0
      }
    },


    setCoreOpacity(value) {
      const parsed = Number(value)
      if (Number.isNaN(parsed)) return
      this.coreOpacity = Math.min(1, Math.max(0.3, parsed))
    },

    setTheme(nextTheme) {
      this.theme = nextTheme === 'light' ? 'light' : 'dark'
      this.applyTheme(this.theme)
    },

    applyTheme(theme) {
      const root = document.documentElement
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light')
      } else {
        root.removeAttribute('data-theme')
      }
    },

    async startHotkeyCapture() {
      this.captureMode = 'hotkey'
      this.uiState = 'capturing_text'
      this.lastError = ''

      try {
        const state = await tauriInvoke('start_text_capture')
        if (!state) {
          this.context = {
            id: 'ctx-local-text-1',
            type: 'text',
            content: 'Texto de captura local (modo web sem Tauri)',
            image: null,
            created_at: Date.now()
          }
          this.uiState = 'preview_ready'
          return
        }

        this.uiState = state
      } catch {
        this.lastError = 'Falha ao capturar com hotkey.'
        this.uiState = 'error'
      }
    },

    async startPenCapture() {
      this.captureMode = 'pen'
      this.uiState = 'capturing_image'
      this.lastError = ''

      try {
        const state = await tauriInvoke('start_selection_mode')
        if (state === 'preview_ready') {
          this.uiState = 'preview_ready'
        }
      } catch {
        this.lastError = 'Falha ao abrir modo caneta/seleção de área.'
        this.uiState = 'error'
      }
    },

    applyManualSelection(bounds) {
      this.context = {
        id: `ctx-manual-${Date.now()}`,
        type: 'image',
        content: null,
        image: {
          id: `img-manual-${Date.now()}`,
          path: `selection:${Math.round(bounds.width)}x${Math.round(bounds.height)}@${Math.round(bounds.x)},${Math.round(bounds.y)}`,
          width: Math.max(1, Math.round(bounds.width)),
          height: Math.max(1, Math.round(bounds.height))
        },
        created_at: Date.now()
      }
      this.uiState = 'preview_ready'
    },

    async cancelCapture() {
      await tauriInvoke('cancel_selection_mode')
      this.uiState = 'idle'
    },

    async saveApiKey() {
      if (!this.apiKey.trim()) {
        this.hasApiKey = false
        this.uiState = 'missing_api_key'
        this.lastError = 'Informe uma API key para salvar.'
        return false
      }

      const payloadKey = `${this.provider}:${this.apiKey.trim()}`
      const result = await tauriInvoke('save_api_key', { key: payloadKey })

      if (result === null) {
        this.hasApiKey = true
        this.uiState = 'idle'
        this.lastError = ''
        this.closeConfigModal()
        return true
      }

      this.hasApiKey = Boolean(result)
      this.uiState = result ? 'idle' : 'error'
      this.lastError = result ? '' : 'Não foi possível salvar a API key.'

      if (result) {
        this.closeConfigModal()
      }

      return Boolean(result)
    },

    async sendMessage() {
      if (!this.composerText.trim() && !this.attachedImage) {
        return
      }

      if (!this.hasApiKey) {
        this.uiState = 'missing_api_key'
        this.lastError = 'Configure sua API key para enviar mensagens à IA.'
        this.openConfigModal()
        return
      }

      this.messages.push({
        role: 'user',
        text: this.composerText || null,
        image: this.attachedImage,
        timestamp: Date.now()
      })

      this.uiState = 'loading_ai'
      this.lastError = ''

      try {
        const response = await tauriInvoke('send_to_ai', {
          request: {
            context: this.context,
            messages: this.messages
          }
        })

        if (!response) {
          this.messages.push({
            role: 'assistant',
            text: 'Resposta local simulada para fluxo sem backend Tauri.',
            image: null,
            timestamp: Date.now()
          })
          this.uiState = 'response_ready'
        } else {
          this.messages.push(response.message)
          this.uiState = 'response_ready'
        }
      } catch (error) {
        if (String(error).includes('missing_api_key')) {
          this.hasApiKey = false
          this.uiState = 'missing_api_key'
          this.lastError = 'API key inválida ou ausente. Revise nas configurações.'
          this.openConfigModal()
        } else {
          this.uiState = 'error'
          this.lastError = 'Falha ao enviar mensagem para IA.'
        }
      } finally {
        this.composerText = ''
        this.attachedImage = null
      }
    }
  }
})
