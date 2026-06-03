import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { BatchPricingPayload } from "@/features/settings/pricing/schemas"
import { toast } from "sonner"
import { createClientBatchRoutePricingFn } from "../services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

type ClientPricingProps = {
  clientId: string
}

export function ClientRouteTonnagePricingModal({
  clientId,
}: ClientPricingProps) {
  const queryInvaidator = useQueryInvalidator()

  async function handleSubmit(values: BatchPricingPayload) {
    const { error, isSuccess, message } = await createClientBatchRoutePricingFn(
      {
        data: { ...values, client_id: clientId },
      }
    )
    if (isSuccess && message) {
      toast.success(message)
      queryInvaidator.clients.details(clientId).routePricing.invalidate()
    }
    if (error) {
      toast.error(error.message)
    }
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"} size="sm">
          {/* <CreditCard /> */}
          Route Pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] sm:max-w-none">
        <SheetHeader className="border-b">
          <SheetTitle>Route tonnage pricing</SheetTitle>
          <SheetDescription>
            Define tonnage bands then fill prices per route in the grid. Columns
            are generated automatically from your band definitions.
          </SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-5">
          <RoutePricingDataGridForm onSubmit={handleSubmit} />
        </div>
        {/* <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  )
}
