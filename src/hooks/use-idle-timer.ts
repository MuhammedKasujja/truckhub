// src/hooks/useIdleTimer.ts
import { logger } from "@/lib/logger"
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

const DEFAULT_EVENTS = [
  "mousedown",
  "touchstart",
  "keydown",
  "focus",
  ///
  //   "mousemove",
  //   "scroll",
  //   "wheel",
]

export function useIdleTimer({
  promptTimeout,
  timeout,
  onPrompt,
  onIdle,
  onActive,
  events = DEFAULT_EVENTS,
  enabled = true,
}: UseIdleTimerOptions) {
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPromptedRef = useRef(false)

  const reset = useCallback(() => {
    logger.info("User Activity Tracking")
    // ← Guard: if we're already in the "prompted" state, don't reset
    // from passive DOM events. Only stayActive() can reset from here.
    if (isPromptedRef.current) return

    if (promptTimerRef.current) clearTimeout(promptTimerRef.current)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

    if (isPromptedRef.current) {
      isPromptedRef.current = false
      onActive?.()
      logger.info("User is active")
    }

    promptTimerRef.current = setTimeout(() => {
      isPromptedRef.current = true
      onPrompt()
      logger.info("System is Idle")
      // start the final countdown to logout
      idleTimerRef.current = setTimeout(() => {
        // TODO: Handle clear session trackers after user is logged out
        logger.info("System is about to logout")
        onIdle()
      }, timeout - promptTimeout)
    }, promptTimeout)
  }, [promptTimeout, timeout, onPrompt, onIdle, onActive])

  /** Call from the "stay logged in" button to dismiss the warning and reset */
  const stayActive = useCallback(() => {
    isPromptedRef.current = false
    onActive?.()
    reset()
  }, [reset])

  useEffect(() => {
    if (!enabled) {
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      isPromptedRef.current = false; // ← reset so re-enabling starts clean
      return
    }

    reset() // start the timer immediately

    // deliberate user interaction events
    events.forEach((event) =>
      window.addEventListener(event, reset, { passive: true })
    )

    // tab/window regains focus — separate from element focus bubbling
    window.addEventListener("focus", stayActive)

    function onVisibility() {
      if (document.visibilityState === "visible") stayActive()
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      events.forEach((event) => window.removeEventListener(event, reset))
      window.removeEventListener("focus", stayActive)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [enabled, events, reset, stayActive])

  return { stayActive }
}
