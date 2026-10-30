import { toast } from "sonner"
import { BatchPricingPayload } from "../../schemas"
import { createBatchRoutePricingFn } from "../../services"
import { RoutePricingDataGridForm } from "./pricing-grid-form"
import { Button } from "@/components/ui/button"
import { CreditCardIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function EditCompanyRoutePricingDialog() {
  async function handleSubmit(data: BatchPricingPayload) {
    const { message, error, isSuccess } = await createBatchRoutePricingFn({
      data,
    })

    if (error) {
      toast.error(error.message)
    }

    if (isSuccess) {
      toast.success(message)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"}>
          <CreditCardIcon />
          Edit Route Pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] sm:max-w-none">
        <SheetHeader className="border-b">
          <SheetTitle>Company Route tonnage pricing</SheetTitle>
          <SheetDescription>
            Define tonnage bands then fill prices per route in the grid. Columns
            are generated automatically from your band definitions.
          </SheetDescription>
        </SheetHeader>
        <div className="no-scrollbar overflow-y-auto px-4 pb-5">
          <RoutePricingDataGridForm onSubmit={handleSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
