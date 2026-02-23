import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

const tauriGlobal = () => window.__TAURI__ || null
const tauriInternals = () => window.__TAURI_INTERNALS__ || null

const isTauriRuntime = () => Boolean(tauriGlobal() || tauriInternals())

export async function tauriInvoke(command, payload = {}) {
  if (!isTauriRuntime()) {
    return null
  }

  try {
    return await invoke(command, payload)
  } catch {
    return null
  }
}

export async function tauriListen(eventName, handler) {
  if (!isTauriRuntime()) {
    return () => {}
  }

  try {
    return await listen(eventName, handler)
  } catch {
    return () => {}
  }
}

export { isTauriRuntime }
