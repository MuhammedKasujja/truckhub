import { useSyncExternalStore } from "react"
import { useRouter } from "@tanstack/react-router"
import { useRecentPagesStore } from "@/store/use-recent-pages-store"
import {
  getHistoryPositionServerSnapshot,
  getHistoryPositionSnapshot,
  subscribeHistoryPosition,
} from "@/lib/history-position"

export function useNavigationHistory() {
  const router = useRouter()
  const position = useSyncExternalStore(
    subscribeHistoryPosition,
    getHistoryPositionSnapshot,
    getHistoryPositionServerSnapshot
  )
  const [index, maxIndex] = position.split(":").map(Number)
  const canGoBack = index > 0
  const canGoForward = index < maxIndex

  const history = useRecentPagesStore((state) => state.history)
  const clearHistory = useRecentPagesStore((state) => state.clear)

  const goBack = () => router.history.back()
  const goForward = () => router.history.forward()

  return { goBack, goForward, canGoBack, canGoForward, history, clearHistory }
}
