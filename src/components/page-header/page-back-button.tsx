import { ChevronLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBackNavigation } from "@/hooks/use-back-navigation"

type PageBackButtonProps = {
  text?: string
}

export function PageBackButton({ text }: PageBackButtonProps) {
  const handleBack = useBackNavigation()

  return (
    <Button variant="ghost" size={"sm"} onClick={() => handleBack()}>
      {text ?? <ChevronLeftIcon />}
    </Button>
  )
}

export function PageBackIconButton() {
  const handleBack = useBackNavigation()

  return (
    <Button variant="ghost" size={"sm"} onClick={() => handleBack()}>
      <ChevronLeftIcon />
    </Button>
  )
}
