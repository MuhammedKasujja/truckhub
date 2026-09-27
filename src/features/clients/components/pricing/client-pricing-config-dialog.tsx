import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useClientProfileQuery } from "@/features/clients/hooks/use-client"
import { EntityId } from "@/schemas"
import { ClientLoadingFeesModal } from "../client-loading-fees-modal"
import { Activity, useState } from "react"
import { ClientRouteTonnagePricingModal } from "../client-route-pricing-modal"

type ClientPricingDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
}
export function ClientPricingConfigDialog({
  clientId,
  open,
  onOpenChange,
}: ClientPricingDialogProps) {
  const { data } = useClientProfileQuery(clientId)
  const [pricing, setPricing] = useState<"route" | "loading">("route")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] min-h-[95vh] flex-col overflow-hidden p-0 md:min-w-[95vw]">
        <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Client Pricing<span className="mx-1 text-muted-foreground">•</span>
            {data?.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <ButtonGroup>
              <Button variant={"outline"} onClick={() => setPricing("route")}>
                Route Pricing
              </Button>
              <Button variant={"outline"} onClick={() => setPricing("loading")}>
                Loading Fees
              </Button>
            </ButtonGroup>
          </DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 gap-0 overflow-hidden">
          <div className="no-scrollbar overflow-y-auto px-6 pb-6">
            <Activity mode={pricing === "loading" ? "visible" : "hidden"}>
              <ClientLoadingFeesModal clientId={clientId} />
            </Activity>
            <Activity mode={pricing === "route" ? "visible" : "hidden"}>
              <ClientRouteTonnagePricingModal clientId={clientId} />
            </Activity>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
