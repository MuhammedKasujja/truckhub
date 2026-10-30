import { useEffect, useRef, useCallback } from "react"

interface UseIdleTimerOptions {
  /** Milliseconds of inactivity before the warning fires */
  promptTimeout: number
  /** Milliseconds of inactivity (from the start) before onIdle fires */
  timeout: number
  /** Called when promptTimeout is reached — show your warning dialog here */
  onPrompt: () => void
  /** Called when `timeout` is reached without activity — log the user out */
  onIdle: () => void
  /** Called when activity resumes after onPrompt fired (dismiss the dialog) */
  onActive?: () => void
  /** DOM events that count as "activity". Sensible defaults provided. */
  events?: string[]
  /** Disable the timer entirely (e.g. while not authenticated) */
  enabled?: boolean
}

const DEFAULT_EVENTS = ["mousedown", "touchstart", "keydown", "focus"]
const THROTTLE_MS = 1000

export function useIdleTimer({
  promptTimeout,
  timeout,
  onPrompt,
  onIdle,
  onActive,
  events = DEFAULT_EVENTS,
  enabled = true,
}: UseIdleTimerOptions) {
  // Latest-callback ref: callers can pass inline functions without
  // re-triggering the effect or restarting timers.
  const cbRef = useRef({ onPrompt, onIdle, onActive })
  useEffect(() => {
    cbRef.current = { onPrompt, onIdle, onActive }
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const promptedRef = useRef(false)
  const lastActivityRef = useRef(Date.now())

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  // Single source of truth: elapsed time since last activity.
  const evaluate = useCallback(() => {
    clearTimer()
    const elapsed = Date.now() - lastActivityRef.current

    if (elapsed >= timeout) {
      promptedRef.current = false
      cbRef.current.onIdle()
      return
    }
    if (elapsed >= promptTimeout) {
      if (!promptedRef.current) {
        promptedRef.current = true
        cbRef.current.onPrompt()
      }
      timerRef.current = setTimeout(evaluate, timeout - elapsed)
    } else {
      timerRef.current = setTimeout(evaluate, promptTimeout - elapsed)
    }
  }, [promptTimeout, timeout, clearTimer])

  // Passive DOM activity: ignored once the warning is showing.
  const onActivity = useCallback(() => {
    if (promptedRef.current) return
    const now = Date.now()
    if (now - lastActivityRef.current < THROTTLE_MS) return
    lastActivityRef.current = now
    evaluate()
  }, [evaluate])

  // Explicit "Stay logged in" only.
  const stayActive = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (promptedRef.current) {
      promptedRef.current = false
      cbRef.current.onActive?.()
    }
    evaluate()
  }, [evaluate])

  useEffect(() => {
    if (!enabled) {
      clearTimer()
      promptedRef.current = false
      return
    }

    lastActivityRef.current = Date.now()
    evaluate()

    events.forEach((e) =>
      window.addEventListener(e, onActivity, { passive: true })
    )

    // On return to the tab, re-check elapsed time. Do NOT reset it.
    const onVisibility = () => {
      if (document.visibilityState === "visible") evaluate()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      clearTimer()
      events.forEach((e) => window.removeEventListener(e, onActivity))
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [enabled, events, evaluate, onActivity, clearTimer])

  return { stayActive }
}
