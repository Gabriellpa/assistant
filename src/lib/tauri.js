const tauriGlobal = () => window.__TAURI__ || null
const tauriInternals = () => window.__TAURI_INTERNALS__ || null

const isTauriRuntime = () => Boolean(tauriGlobal() || tauriInternals())

const resolveInvoke = () => {
  const tauri = tauriGlobal()
  const internals = tauriInternals()

  if (typeof tauri?.core?.invoke === 'function') {
    return tauri.core.invoke
  }

  if (typeof internals?.invoke === 'function') {
    return internals.invoke
  }

  if (typeof window.__TAURI_INVOKE__ === 'function') {
    return window.__TAURI_INVOKE__
  }

  return null
}

const resolveListen = () => {
  const tauri = tauriGlobal()
  const internals = tauriInternals()

  if (typeof tauri?.event?.listen === 'function') {
    return tauri.event.listen
  }

  if (typeof internals?.event?.listen === 'function') {
    return internals.event.listen
  }

  return null
}

export async function tauriInvoke(command, payload = {}) {
  const invoke = resolveInvoke()
  if (!invoke) {
    return null
  }

  try {
    return await invoke(command, payload)
  } catch {
    return null
  }
}

export async function tauriListen(eventName, handler) {
  const listen = resolveListen()
  if (!listen) {
    return () => {}
  }

  try {
    return await listen(eventName, handler)
  } catch {
    return () => {}
  }
}

export { isTauriRuntime }
