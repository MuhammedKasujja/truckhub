import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon } from "lucide-react"

export function RefreshButton() {
  const queryClient = useQueryClient()

  const handleRefresh = async () => {
    await queryClient.refetchQueries() // Refetches ALL active queries
  }

  return (
    <Button
      variant={"secondary"}
      type="button"
      size={"icon-xs"}
      onClick={handleRefresh}
    >
      <RefreshCwIcon />
    </Button>
  )
}
