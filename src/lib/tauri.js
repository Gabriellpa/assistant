const isTauriRuntime = () => Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__)

export async function tauriInvoke(command, payload = {}) {
  if (!isTauriRuntime()) {
    return null
  }

  const { invoke } = await import('@tauri-apps/api/core')
  return invoke(command, payload)
}

export async function tauriListen(eventName, handler) {
  if (!isTauriRuntime()) {
    return () => {}
  }

  const { listen } = await import('@tauri-apps/api/event')
  return listen(eventName, handler)
}
