import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { IGNORE_PATHS, MAXIMAM_HISTORY_ENTRIES } from "@/common/config"

interface NavEntry {
  pathname: string
  search: string
  timestamp: number
}

interface NavHistoryState {
  history: NavEntry[]
  addEntry: (entry: NavEntry) => void
  clear: () => void
  back: () => void
  forward: () => void
}

export const useRecentPagesStore = create<NavHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addEntry: (entry) =>
        set((state) => {
          if (IGNORE_PATHS.includes(entry.pathname)) return state

          // remove any existing entry for the same route
          const filtered = state.history.filter(
            (e) => !(e.pathname === entry.pathname && e.search === entry.search)
            // drop `&& e.search === entry.search` if we want to match on pathname only
          )

          return {
            history: [...filtered, entry].slice(-MAXIMAM_HISTORY_ENTRIES),
          }
        }),
      clear: () => set({ history: [] }),
      back: () => set({ history: [] }),
      forward: () => set({ history: [] }),
    }),
    {
      name: "nav-recent-visted-pages-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // don't touch storage until we say so
    }
  )
)
