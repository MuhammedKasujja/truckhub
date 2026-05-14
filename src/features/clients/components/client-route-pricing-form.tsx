import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { CreditCard } from "lucide-react"
import React from "react"
import { useRoutePricingForm } from "../hooks/use-route-pricing-form"
import { DatePickerField, TextField } from "@/components/ui/form-fields"
import { Card, CardContent } from "@/components/ui/card"

export function ClientRoutePricingForm() {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)
  const {
    form,
    routePricings,
    // tonnageList,
    handleTonnageRow,
    handleAddRoutePricingRow,
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
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Edit Route Pricing</DrawerTitle>
          <DrawerDescription>
            Manage route pricing for this client
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <DatePickerField
            label="Effective Date"
            name={"effective_date"}
            control={form.control}
          />
          <Button type="button" onClick={() => handleAddRoutePricingRow()}>
            Add
          </Button>
          {routePricings.map((routePricing, index) => (
            <Card key={`routes_pricings_${index}`}>
              <CardContent>
                {index}
                <TextField
                  label="Route"
                  name={`routes_pricings.${index}.route`}
                  control={form.control}
                />
                <TextField
                  label="Distance (km)"
                  name={`routes_pricings.${index}.distance_km`}
                  control={form.control}
                />
                <TextField
                  label="Delivery Min (hrs)"
                  name={`routes_pricings.${index}.delivery_min_hrs`}
                  control={form.control}
                />
                <TextField
                  label="Delivery Max (hrs)"
                  name={`routes_pricings.${index}.delivery_max_hrs`}
                  control={form.control}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
