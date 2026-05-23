import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import {
  BatchPricingPayload,
  BatchPricingPayloadCreate,
} from "@/features/settings/pricing/schemas"
import { createBatchRouteTonnagePricingFn } from "@/features/settings/pricing/services"
import { jsonFormatter, logger } from "@/lib/logger"
import { toast } from "sonner"

type ClientPricingProps = {
  clientId: string
}

export function ClientRouteTonnagePricingModal({
  clientId,
}: ClientPricingProps) {
  async function handleSubmit(values: BatchPricingPayload) {
    logger.debug(jsonFormatter(values))
    const { data, error } = await createBatchRouteTonnagePricingFn({
      data: { ...values, client_id: clientId },
    })
    if (error) {
      toast.error(error.message)
    }
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"}>
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
        <div className="no-scrollbar overflow-y-auto px-4">
          <RoutePricingDataGridForm onSubmit={handleSubmit} />
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
