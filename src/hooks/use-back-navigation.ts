import { useRouter } from "@tanstack/react-router"

export function useBackNavigation() {
  const router = useRouter()

  const handleBack = () => {
    if (document.referrer) {
      router.history.back()
    } else {
      router.navigate({ to: "/dashboard", replace: true })
    }
  }
  return handleBack
}
