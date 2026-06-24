import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LoadingOffloadingPricingForm } from "@/features/settings/pricing/components"
import { LoadingOffloadingPricingRequest } from "@/features/settings/pricing/schemas"
import { toast } from "sonner"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { createBatchLoadingPricingFn } from "@/features/settings/pricing/services"

type ClientPricingProps = {
  clientId: string
  clientName: string | undefined
}

export function ClientLoadingFeesModal({
  clientId,
  clientName = "",
}: ClientPricingProps) {
  const queryInvaidator = useQueryInvalidator()

  async function handleSubmit(values: LoadingOffloadingPricingRequest) {
    const { message, error, isSuccess } = await createBatchLoadingPricingFn({
      data: { ...values, client_id: clientId },
    })
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
        <Button variant={"secondary"}>Loading Fees</Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] sm:max-w-none">
        <SheetHeader className="border-b">
          <SheetTitle>{clientName} - Loading Fees</SheetTitle>
        </SheetHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-5">
          <LoadingOffloadingPricingForm onSubmit={handleSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
