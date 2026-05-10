"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "@/components/theme/provider"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const switchTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleTheme = () => {
    //@ts-ignore
    if (!document.startViewTransition) switchTheme()

    //@ts-ignore
    document.startViewTransition(switchTheme)
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className={cn("rounded-full", className)}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
