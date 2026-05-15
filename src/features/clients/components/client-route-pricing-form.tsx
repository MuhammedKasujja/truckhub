import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { CreditCard } from "lucide-react"
import React from "react"
import { useRoutePricingForm } from "../hooks/use-route-pricing-form"
import {
  DatePickerField,
  NumberField,
  TextField,
} from "@/components/ui/form-fields"
import { Card, CardContent } from "@/components/ui/card"
import { SubmitButton } from "@/components/ui/submit-button"

export function ClientRoutePricingForm() {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    form,
    routePricings,
    // tonnageList,
    handleTonnageRow,
    handleAddRoutePricingRow,
    handleSubmit,
  } = useRoutePricingForm()

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DrawerTrigger asChild>
        <Button variant={"secondary"}>
          <CreditCard />
          Route Pricing
        </Button>
      </DrawerTrigger>
      <DrawerContent style={!isMobile ? { width: "80vw" } : undefined}>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit Route Pricing</DrawerTitle>
          <DrawerDescription>
            Manage route pricing for this client
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          id="form-submit-id"
          onSubmit={form.handleSubmit(
            (data) => {},
            (errors) => {
              console.log(errors)
            }
          )}
        >
          <DatePickerField
            label="Effective Date"
            name={"effective_date"}
            control={form.control}
          />
          <Button type="button" onClick={() => handleAddRoutePricingRow()}>
            Add
          </Button>
          {routePricings.map((routePricing, index) => (
            <div key={`routes_pricings_${index}`} className="overflow-y-hidden">
              <div>
                {index}
                <TextField
                  label="Route"
                  name={`routes_pricings.${index}.route`}
                  control={form.control}
                />
                <NumberField
                  label="Distance (km)"
                  name={`routes_pricings.${index}.distance_km`}
                  control={form.control}
                />
                <NumberField
                  label="Delivery Min (hrs)"
                  name={`routes_pricings.${index}.delivery_min_hrs`}
                  control={form.control}
                />
                <NumberField
                  label="Delivery Max (hrs)"
                  name={`routes_pricings.${index}.delivery_max_hrs`}
                  control={form.control}
                />
              </div>
            </div>
          ))}
        </form>
        <DrawerFooter className="pt-2">
          <SubmitButton asChild form="form-submit-id">
            <Button variant="outline">Cancel</Button>
          </SubmitButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
