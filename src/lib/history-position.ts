import type { RouterHistory } from "@tanstack/react-router"

/**
 * Tracks where the current tab is inside its browser session history so the
 * header back/forward buttons can mirror the browser's own buttons.
 *
 * `__TSR_index` (kept by @tanstack/history on every entry) tells us the current
 * position. The browser does not expose how many "forward" entries exist, so we
 * remember the highest reachable index per tab in sessionStorage: a PUSH
 * discards the forward entries, BACK/FORWARD/GO only move within them.
 */

const MAX_INDEX_KEY = "nav-history-max-index"
const LEGACY_STORAGE_KEY = "nav-history-storage"

const SERVER_SNAPSHOT = "0:0"

let history: RouterHistory | undefined
let maxIndex = 0
const listeners = new Set<() => void>()

function currentIndex() {
  return history?.location.state.__TSR_index ?? 0
}

function readMaxIndex() {
  const stored = Number(sessionStorage.getItem(MAX_INDEX_KEY))
  return Number.isFinite(stored) ? stored : 0
}

function writeMaxIndex(value: number) {
  maxIndex = value
  sessionStorage.setItem(MAX_INDEX_KEY, String(value))
}

export function trackHistoryPosition(routerHistory: RouterHistory) {
  history = routerHistory
  // Old custom stack, replaced by real browser history.
  localStorage.removeItem(LEGACY_STORAGE_KEY)

  // Survives reloads in the same tab, like the browser's own history.
  writeMaxIndex(Math.max(readMaxIndex(), currentIndex()))

  return routerHistory.subscribe(({ action }) => {
    const index = currentIndex()
    if (action.type === "PUSH") writeMaxIndex(index)
    else if (index > maxIndex) writeMaxIndex(index)
    listeners.forEach((listener) => listener())
  })
}

export function subscribeHistoryPosition(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** `"<index>:<maxIndex>"`, a primitive so `useSyncExternalStore` can compare it. */
export function getHistoryPositionSnapshot() {
  return history ? `${currentIndex()}:${maxIndex}` : SERVER_SNAPSHOT
}

export function getHistoryPositionServerSnapshot() {
  return SERVER_SNAPSHOT
}
