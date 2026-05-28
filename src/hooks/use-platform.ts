import { useEffect, useState } from "react"
import { isTauri } from "@tauri-apps/api/core"
import { platform, type Platform } from "@tauri-apps/plugin-os"

export function usePlatform() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !isTauri()) return

    if (typeof window !== "undefined" && isTauri()) {
      setCurrentPlatform(platform())
    }
  }, [])

  if (currentPlatform === "windows") return "windows"
  else if (currentPlatform === "macos") return "macos"
  else if (currentPlatform === "linux") return "linux"
  else return null
}

export function useIsDesktop() {
  return typeof window !== "undefined" && isTauri()
}
