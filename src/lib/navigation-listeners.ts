import { useRecentPagesStore } from "@/store/use-recent-pages-store"

export function onNavigationResolved(toLocation: {
  pathname: string
  searchStr: string
}) {
  const entry = {
    pathname: toLocation.pathname,
    search: toLocation.searchStr,
    timestamp: Date.now(),
  }

  useRecentPagesStore.getState().addEntry(entry)
  // future: analytics.track('page_view', entry)
}
