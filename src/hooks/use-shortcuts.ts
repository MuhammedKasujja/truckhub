// import { usePlatform } from "./use-platform"
import { useRouter } from "@tanstack/react-router"
import { useHotkey } from '@tanstack/react-hotkeys'

export function useGlobalShortcuts() {
  const router = useRouter()
  useHotkey({ key: 'c', mod: true, shift: true }, () => router.navigate({ to: "/clients/new" }))
  useHotkey({ mod: true, shift: true ,key: 'b' }, () => router.navigate({ to: "/bookings/new" }))
  useHotkey({ mod: true, shift: true ,key: 'r' }, () => router.navigate({ to: "/rides/new" }))
  useHotkey({ mod: true, shift: true ,key: 'd' }, () => router.navigate({ to: "/drivers/new" }))
  useHotkey({ mod: true, shift: true ,key: 'v' }, () => router.navigate({ to: "/vehicles/new" }))
  useHotkey({ mod: true, shift: true ,key: 's' }, () => router.navigate({ to: "/settings/company-details" }))
  useHotkey({ mod: true, shift: true ,key: "n" }, () => router.navigate({ to: "/services/new" }))
}
