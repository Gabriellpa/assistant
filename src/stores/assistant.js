import { defineStore } from 'pinia'

export const useAssistantStore = defineStore('assistant', {
  state: () => ({
    uiState: 'idle',
    captureMode: 'hotkey'
  }),
  actions: {
    setUiState(nextState) {
      this.uiState = nextState
    },
    setCaptureMode(mode) {
      this.captureMode = mode
      this.uiState = mode === 'pen' ? 'capturing_image' : 'capturing_text'
    }
  }
})
