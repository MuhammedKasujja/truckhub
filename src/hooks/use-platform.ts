import { platform } from "@tauri-apps/plugin-os"

export function usePlatform() {
  const platformName = platform()
  if (platformName === "windows") return "windows"
  else if (platformName === "macos") return "macos"
  else if (platformName === "linux") return "linux"
  else return null
}

export function useIsDesktop() {
  return usePlatform() != null
}
