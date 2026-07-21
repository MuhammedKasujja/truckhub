import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { IGNORE_PATHS, MAXIMAM_HISTORY_ENTRIES } from "@/common/config"

interface NavEntry {
  pathname: string
  search: string
  timestamp: number
}

interface NavHistoryState {
  stack: NavEntry[]
  index: number // pointer to current entry in stack
  isTimeTraveling: boolean // true while a back()/forward() navigation is in flight

  push: (entry: NavEntry) => void
  back: () => NavEntry | null
  forward: () => NavEntry | null
  canGoBack: () => boolean
  canGoForward: () => boolean
  clear: () => void
}

export const useHistoryStore = create<NavHistoryState>()(
  persist(
    (set, get) => ({
      stack: [],
      index: -1,
      isTimeTraveling: false,

      push: (entry) => {
        if (IGNORE_PATHS.includes(entry.pathname)) return get()

        const { stack, index, isTimeTraveling } = get()

        // this navigation was caused by back()/forward() itself — don't push, just clear the flag
        if (isTimeTraveling) {
          set({ isTimeTraveling: false })
          return
        }

        // avoid pushing a dup if user "navigates" to the same route they're already on
        const current = stack[index]
        if (
          current &&
          current.pathname === entry.pathname &&
          current.search === entry.search
        ) {
          return
        }

        // new navigation from a non-tip position discards the "future" — same as real browser history
        const truncated = stack.slice(0, index + 1)
        const nextStack = [...truncated, entry].slice(-MAXIMAM_HISTORY_ENTRIES)

        set({ stack: nextStack, index: nextStack.length - 1 })
      },

      back: () => {
        const { stack, index } = get()
        if (index <= 0) return null
        const target = stack[index - 1]
        set({ index: index - 1, isTimeTraveling: true })
        return target
      },

      forward: () => {
        const { stack, index } = get()
        if (index >= stack.length - 1) return null
        const target = stack[index + 1]
        set({ index: index + 1, isTimeTraveling: true })
        return target
      },

      canGoBack: () => get().index > 0,
      canGoForward: () => get().index < get().stack.length - 1,

      clear: () => set({ stack: [], index: -1 }),
    }),
    {
      name: "nav-history-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ stack: state.stack, index: state.index }), // don't persist isTimeTraveling
    }
  )
)
