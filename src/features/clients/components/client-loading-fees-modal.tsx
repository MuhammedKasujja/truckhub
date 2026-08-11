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
import {
  useClientLoadingOffloadingFees,
  useCreateClientLoadingFees,
} from "../hooks/use-client-loading-fees"

type ClientPricingProps = {
  clientId: string
  clientName: string | undefined
}

export function ClientLoadingFeesModal({
  clientId,
  clientName = "",
}: ClientPricingProps) {
  const { data } = useClientLoadingOffloadingFees(clientId)
  const { createClientLoadingFees, isPending } = useCreateClientLoadingFees()

  async function handleSubmit(values: LoadingOffloadingPricingRequest) {
    createClientLoadingFees(values)
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
          <LoadingOffloadingPricingForm
            initialData={
              data ? { pricings: data, client_id: clientId } : undefined
            }
            isSubmitting={isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
