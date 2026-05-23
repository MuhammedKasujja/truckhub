import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RoutePricingDataGridForm } from "@/features/settings/pricing/components"
import { CreditCard } from "lucide-react"

export function ClientRouteTonnagePricingModal() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"secondary"}>
          {/* <CreditCard /> */}
          Route Pricing
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[80vw] sm:max-w-none">
        <SheetHeader>
          <SheetTitle>Route tonnage pricing</SheetTitle>
          <SheetDescription>
            Define tonnage bands then fill prices per route in the grid. Columns
            are generated automatically from your band definitions.
          </SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto px-4">
          <RoutePricingDataGridForm />
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
