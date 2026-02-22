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
    apiKey: '',
    bootstrapped: false
  }),

  getters: {
    canSend(state) {
      return validSendStates.includes(state.uiState)
    }
  },

  actions: {
    async bootstrap() {
      if (this.bootstrapped) return

      const onTextCaptured = async (event) => {
        this.context = event.payload.context
        this.uiState = 'preview_ready'
      }

      const onImageCaptured = async (event) => {
        this.context = event.payload.context
        this.uiState = 'preview_ready'
      }

      const onCaptureCancelled = async () => {
        this.uiState = 'idle'
      }

      this.unlistenText = await tauriListen('text_captured', onTextCaptured)
      this.unlistenImage = await tauriListen('image_captured', onImageCaptured)
      this.unlistenCancelled = await tauriListen('capture_cancelled', onCaptureCancelled)

      this.bootstrapped = true
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

    async startHotkeyCapture() {
      this.captureMode = 'hotkey'
      this.uiState = 'capturing_text'
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
        }
        this.uiState = 'preview_ready'
      } catch {
        this.uiState = 'error'
      }
    },

    async startPenCapture() {
      this.captureMode = 'pen'
      this.uiState = 'capturing_image'
      try {
        const state = await tauriInvoke('start_selection_mode')
        if (!state) {
          this.context = {
            id: 'ctx-local-image-1',
            type: 'image',
            content: null,
            image: {
              id: 'img-local-1',
              path: '/tmp/local-preview.png',
              width: 640,
              height: 360
            },
            created_at: Date.now()
          }
        }
        this.uiState = 'preview_ready'
      } catch {
        this.uiState = 'error'
      }
    },

    async saveApiKey() {
      if (!this.apiKey.trim()) {
        this.uiState = 'missing_api_key'
        return false
      }

      const result = await tauriInvoke('save_api_key', { key: this.apiKey.trim() })
      if (result === null) {
        this.uiState = 'idle'
        return true
      }

      this.uiState = result ? 'idle' : 'error'
      return Boolean(result)
    },

    async sendMessage() {
      if (!this.composerText.trim() && !this.attachedImage) {
        return
      }

      this.messages.push({
        role: 'user',
        text: this.composerText || null,
        image: this.attachedImage,
        timestamp: Date.now()
      })

      this.uiState = 'loading_ai'

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
          this.uiState = 'missing_api_key'
        } else {
          this.uiState = 'error'
        }
      } finally {
        this.composerText = ''
        this.attachedImage = null
      }
    }
  }
})
