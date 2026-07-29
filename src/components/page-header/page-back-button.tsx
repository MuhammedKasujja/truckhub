import { ChevronLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBackNavigation } from "@/hooks/use-back-navigation"

export function PageBackButton() {
  const handleBack = useBackNavigation()

  return (
    <Button variant="ghost" size={"sm"} onClick={() => handleBack()}>
      <ChevronLeftIcon />
    </Button>
  )
}
