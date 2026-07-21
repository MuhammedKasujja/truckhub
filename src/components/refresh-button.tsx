import { Button } from "@/components/ui/button"
import { RefreshCwIcon } from "lucide-react"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

export function RefreshButton() {
  const queryClient = useQueryInvalidator()

  const handleRefresh = async () => {
    // Refetches ALL active queries
    await queryClient.app.refresh() 
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
