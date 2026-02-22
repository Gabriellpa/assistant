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

  return invoke(command, payload)
}

export async function tauriListen(eventName, handler) {
  const listen = resolveListen()
  if (!listen) {
    return () => {}
  }

  return listen(eventName, handler)
}

export { isTauriRuntime }
