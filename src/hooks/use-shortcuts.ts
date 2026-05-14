import { usePlatform } from "./use-platform"
import { useHotkeys } from "react-hotkeys-hook"
import { useRouter } from "@tanstack/react-router"

export function useGlobalShortcuts() {

  const mainKey = "meta"//usePlatform() === "macos" ? "meta" : "ctrl"
  const router = useRouter()
  useHotkeys(`${mainKey}+shift+c`, () => router.navigate({ to: "/clients/new" }))
  useHotkeys(`${mainKey}+shift+b`, () => router.navigate({ to: "/bookings/new" }))
  useHotkeys(`${mainKey}+shift+r`, () => router.navigate({ to: "/rides/new" }))
  useHotkeys(`${mainKey}+shift+d`, () => router.navigate({ to: "/drivers/new" }))
  useHotkeys(`${mainKey}+shift+v`, () => router.navigate({ to: "/vehicles/new" }))
  useHotkeys(`${mainKey}+shift+s`, () => router.navigate({ to: "/settings" }))
}
