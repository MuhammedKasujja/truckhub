import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EntityId } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createQuotationLineItemSchema, LineItemRequest } from "../../schemas"
import { CarModelPickerField } from "@/features/settings/car-model/components"
import { CarBrandPickerField } from "@/features/settings/car-brand/components"
import { NumberField, TextField } from "@/components/ui/form-fields"
import { generateEmptyLineItem } from "@/features/quotations/utils"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { useEffect } from "react"

type ServiceSelectDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
  onLineItemAdded: (lineItem: LineItemRequest) => void
}

export function ServicesDialog({
  clientId,
  open,
  onOpenChange,
  onLineItemAdded,
}: ServiceSelectDialogProps) {
  const form = useForm<LineItemRequest>({
    resolver: zodResolver(createQuotationLineItemSchema),
    defaultValues: { ...generateEmptyLineItem("small") },
  })

  const unitPrice = form.watch("unit_price")
  const quantity = form.watch("quantity")

  useEffect(() => {
    const price = unitPrice ?? 0
    const qty = quantity ?? 1
    form.setValue("line_total", price * qty)
    form.setValue("subtotal", price * qty)
  }, [unitPrice, quantity])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-hidden p-0 md:min-w-[90vw]">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Service Pricing
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Select a service
              </span>
              <Button
                type="button"
                className="shrink-0"
                onClick={form.handleSubmit(
                  (data) => {
                    onLineItemAdded(data)
                    onOpenChange(false)
                  },
                  (error) => {
                    console.log("error", error)
                  }
                )}
              >
                Done
              </Button>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-4">
            <Field
              orientation={"horizontal"}
              className="grid gap-4 md:grid-cols-2"
            >
              <CarBrandPickerField
                label={"Car Brand"}
                name={"car_brand_id"}
                control={form.control}
                required={false}
              />
              <CarModelPickerField
                label={"Carr Model"}
                name={"car_model_id"}
                control={form.control}
                required={false}
              />
            </Field>
            <TextField
              required={false}
              label={"Year"}
              name={"vehicle_year"}
              control={form.control}
            />
            <Field
              orientation={"horizontal"}
              className="grid gap-4 md:grid-cols-2"
            >
              <NumberField
                label={"Unit Price"}
                name={"unit_price"}
                control={form.control}
              />
              <NumberField
                label={"Quantity"}
                name={"quantity"}
                control={form.control}
              />
            </Field>
            <NumberField
              label={"Line Total"}
              name={"line_total"}
              control={form.control}
            />
            <NumberField
              required={false}
              label={"Sub total"}
              name={"subtotal"}
              control={form.control}
            />
            <NumberField
              required={false}
              label={"Total"}
              name={"subtotal"}
              control={form.control}
            />
          </div>
        </DialogContent>
      </form>
    </Dialog>
  )
}
