"use client"

import { ChevronLeftIcon } from "lucide-react"
import { useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export function PageBackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (document.referrer) {
      router.history.back()
    } else {
      router.navigate({ to: "/dashboard", replace: true })
    }
  }

  return (
    <Button variant="ghost" size={"icon"} onClick={() => handleBack()}>
      <ChevronLeftIcon />
    </Button>
  )
}
