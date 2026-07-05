import { useRouter } from "@tanstack/react-router"
import { useHistoryStore } from "@/store/use-navigation-history-store"

export function useNavigationHistory() {
  const router = useRouter()
  const back = useHistoryStore((s) => s.back)
  const forward = useHistoryStore((s) => s.forward)
  const canGoBack = useHistoryStore((s) => s.canGoBack())
  const canGoForward = useHistoryStore((s) => s.canGoForward())

  const goBack = () => {
    const target = back()
    if (target) {
      router.navigate({ to: target.pathname, search: target.search as any })
    }
  }

  const goForward = () => {
    const target = forward()
    if (target) {
      router.navigate({ to: target.pathname, search: target.search as any })
    }
  }

  return { goBack, goForward, canGoBack, canGoForward }
}
