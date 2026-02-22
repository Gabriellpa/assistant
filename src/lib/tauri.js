const tauriGlobal = () => window.__TAURI__ || null

const isTauriRuntime = () => Boolean(tauriGlobal())

export async function tauriInvoke(command, payload = {}) {
  const tauri = tauriGlobal()
  if (!tauri) {
    return null
  }

  const invoke = tauri?.core?.invoke
  if (typeof invoke !== 'function') {
    return null
  }

  return invoke(command, payload)
}

export async function tauriListen(eventName, handler) {
  const tauri = tauriGlobal()
  if (!tauri) {
    return () => {}
  }

  const listen = tauri?.event?.listen
  if (typeof listen !== 'function') {
    return () => {}
  }

  return listen(eventName, handler)
}

export { isTauriRuntime }
