import { useIsDesktop } from "./use-platform"
import { useRouter } from "@tanstack/react-router"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"

type HistoryEntry = {
  href: string
  pathname: string
  search: Record<string, unknown>
  hash: string
  key?: string
}

// Shape of the slice of router.state we care about
type RouterStateSnapshot = {
  statusCode?: number
  location: {
    pathname: string
    href: string
    search: Record<string, unknown>
    hash: string
    key?: string
  }
  matches?: Array<{ error?: { status?: number }; isUnauthorized?: boolean }>
}

const STORAGE_KEY = "cleanNavigationHistory"
const MAX_STACK_SIZE = 50

// outside component — pure utility, no need to re-create on every render
function sanitizeSearch(
  search: Record<string, unknown>
): Record<string, unknown> {
  const sanitized = { ...search }
  delete sanitized["token"]
  delete sanitized["auth"]
  delete sanitized["secret"]
  return sanitized
}

function isErrorPage(state: RouterStateSnapshot): boolean {
  const hasAuthError = state.matches?.some(
    (m) =>
      m.error?.status === 401 ||
      m.error?.status === 403 ||
      m.isUnauthorized === true
  )
  return (
    state.statusCode === 404 ||
    state.location.pathname.startsWith("/404") ||
    !!hasAuthError
  )
}

export function useNavigationHistory() {
  const router = useRouter()
  const [historyStack, setHistoryStack] = useState<HistoryEntry[]>([])
  // FIX: currentIndex is now state so canGoBack/canGoForward are reactive
  const [currentIndex, setCurrentIndex] = useState(0)
  const isRestoredRef = useRef(false)
  // FIX: mirror both values in refs so the navigation subscription doesn't
  // need them as dependencies (avoids re-registering on every navigation)
  const currentIndexRef = useRef(0)
  const historyStackRef = useRef<HistoryEntry[]>([])

  const [isClient, setIsClient] = useState(false)
  const isDesktopEnv = useIsDesktop()

  const storage = useMemo(() => {
    if (!isClient) return null
    return isDesktopEnv ? localStorage : sessionStorage
  }, [isClient, isDesktopEnv])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Keep refs in sync with state
  useEffect(() => {
    historyStackRef.current = historyStack
  }, [historyStack])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  // Load from storage (client-only)
  useEffect(() => {
    if (!storage) return

    const saved = storage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed: HistoryEntry[] = JSON.parse(saved)
        const restoredIndex = Math.max(0, parsed.length - 1)
        setHistoryStack(parsed)
        setCurrentIndex(restoredIndex)
        historyStackRef.current = parsed
        currentIndexRef.current = restoredIndex
      } catch (e) {
        console.error("Failed to restore navigation history", e)
      }
    }
    isRestoredRef.current = true
  }, [storage])

  // Persist changes
  useEffect(() => {
    if (!storage || !isRestoredRef.current || historyStack.length === 0) return
    storage.setItem(STORAGE_KEY, JSON.stringify(historyStack))
  }, [historyStack, storage])

  // Navigation subscription
  // FIX: no stale-closure risk — reads from refs, so this only needs to be
  // registered once (deps: router, isClient)
  useEffect(() => {
    if (!isClient) return

    const unsubscribe = router.subscribe("onResolved", () => {
      // The onResolved event carries no navigatedTo arg — read from router.state
      const state = router.state as unknown as RouterStateSnapshot
      if (isErrorPage(state)) return

      const location = state.location

      const entry: HistoryEntry = {
        href: location.href,
        pathname: location.pathname,
        search: sanitizeSearch(location.search ?? {}),
        hash: location.hash ?? "",
        key: location.key ?? Date.now().toString(),
      }

      // Read current values from refs (always fresh, no stale closure)
      const stack = historyStackRef.current
      const idx = currentIndexRef.current

      if (stack[stack.length - 1]?.href === entry.href) return

      // Discard any forward history beyond current position, then append
      // FIX: was incorrectly using pre-update historyStack.length for the new index
      const newStack = [...stack.slice(0, idx + 1), entry].slice(
        -MAX_STACK_SIZE
      )
      const newIndex = newStack.length - 1

      historyStackRef.current = newStack
      currentIndexRef.current = newIndex
      setHistoryStack(newStack)
      setCurrentIndex(newIndex)
    })

    return unsubscribe
  }, [router, isClient])

  const goBack = useCallback(() => {
    const idx = currentIndexRef.current
    if (idx <= 0) return
    const newIdx = idx - 1
    const target = historyStackRef.current[newIdx]
    if (!target) return
    currentIndexRef.current = newIdx
    setCurrentIndex(newIdx)
    router.navigate({
      to: target.pathname,
      search: target.search,
      hash: target.hash,
      replace: false,
    })
  }, [router])

  const goForward = useCallback(() => {
    const idx = currentIndexRef.current
    if (idx >= historyStackRef.current.length - 1) return
    const newIdx = idx + 1
    const target = historyStackRef.current[newIdx]
    if (!target) return
    currentIndexRef.current = newIdx
    setCurrentIndex(newIdx)
    router.navigate({
      to: target.pathname,
      search: target.search,
      hash: target.hash,
      replace: false,
    })
  }, [router])

  const clearHistory = useCallback(() => {
    setHistoryStack([])
    setCurrentIndex(0)
    historyStackRef.current = []
    currentIndexRef.current = 0
    storage?.removeItem(STORAGE_KEY)
  }, [storage])

  return {
    historyStack,
    goBack,
    goForward,
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < historyStack.length - 1,
    clearHistory,
    currentEntry: historyStack[currentIndex] ?? null,
  }
}
