import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EntityId } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {
  createCarQuotationLineItemSchema,
  SmallLineItemRequest,
} from "@/features/quotations/schemas"
import { CarModelPickerField } from "@/features/settings/car-model/components"
import { CarBrandPickerField } from "@/features/settings/car-brand/components"
import { NumberField, TextField } from "@/components/ui/form-fields"
import { generateEmptyLineItem } from "@/features/quotations/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ServicePickerField } from "@/features/services/components"

type ServiceSelectDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
  onLineItemAdded: (lineItem: SmallLineItemRequest) => void
}

export function ServicesDialog({
  clientId,
  open,
  onOpenChange,
  onLineItemAdded,
}: ServiceSelectDialogProps) {
  const form = useForm<SmallLineItemRequest>({
    resolver: zodResolver(createCarQuotationLineItemSchema),
    defaultValues: { ...generateEmptyLineItem() },
  })

  const unitPrice = form.watch("unit_price")
  const quantity = form.watch("quantity")
  const isRoundTrip = form.watch("is_round_trip")
  const discount = form.watch("discount")

  useEffect(() => {
    const price = unitPrice ?? 0
    const qty = quantity ?? 1
    const subtotal = price * qty * (isRoundTrip === true ? 2 : 1)
    const lineTotal = subtotal - (discount ?? 0)
    form.setValue("subtotal", subtotal)
    form.setValue("line_total", lineTotal)
  }, [unitPrice, quantity, isRoundTrip, discount])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] min-h-[90vh] flex-col overflow-hidden p-0 md:min-w-[90vw]">
        <form className="flex flex-col">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Service Pricing
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Select a service
              </span>
              <div className="flex gap-4">
                <Controller
                  name={`is_round_trip`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      orientation={"horizontal"}
                      className="gap-2"
                    >
                      <FieldLabel htmlFor={field.name} className="text-sm">
                        Round Trip
                      </FieldLabel>
                      <Checkbox
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        checked={field.value ?? false}
                        onCheckedChange={(state: boolean) =>
                          field.onChange(state)
                        }
                      />
                      {fieldState.invalid && (
                        <FieldError
                          className="text-xs"
                          errors={[fieldState.error]}
                        />
                      )}
                    </Field>
                  )}
                />
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
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 space-y-4 overflow-y-scroll px-4 pt-4">
            <Field
              orientation={"horizontal"}
              className="grid gap-4 md:grid-cols-3"
            >
              <ServicePickerField
                label={"Service"}
                name={"service_id"}
                control={form.control}
                required={false}
              />
              <CarBrandPickerField
                label={"Car Brand"}
                name={"car_brand_id"}
                control={form.control}
                required={false}
                onSelected={(_) => {
                  form.setValue("car_model_id", "")
                  form.setValue(
                    "estimated_consumption_rate_km",
                    Number(undefined)
                  )
                  form.setValue("vehicle_year", "")
                }}
              />
              <CarModelPickerField
                label={"Carr Model"}
                name={"car_model_id"}
                carBrandId={form.watch("car_brand_id")}
                control={form.control}
                required={false}
                onSelected={(model) => {
                  form.setValue(
                    "estimated_consumption_rate_km",
                    Number(model?.consumption_rate)
                  )
                  form.setValue(
                    "vehicle_year",
                    model?.manufacture_year ? `${model?.manufacture_year}` : ""
                  )
                }}
              />
            </Field>
            <Field
              orientation={"horizontal"}
              className="grid gap-4 md:grid-cols-2"
            >
              <TextField
                required={false}
                label={"Year Make"}
                name={"vehicle_year"}
                control={form.control}
              />
              <NumberField
                required={false}
                label={"Vehicle Consumption (km/l)"}
                name={"estimated_consumption_rate_km"}
                control={form.control}
              />
            </Field>
            <Field
              orientation={"horizontal"}
              className="grid gap-4 md:grid-cols-3"
            >
              <NumberField
                label={"Quantity"}
                name={"quantity"}
                control={form.control}
              />
              <NumberField
                label={"Unit Price"}
                name={"unit_price"}
                control={form.control}
              />
              <NumberField
                required={false}
                label={"Discount"}
                name={"discount"}
                control={form.control}
              />
            </Field>
            <NumberField
              readOnly
              required={false}
              label={"Sub total"}
              name={"subtotal"}
              control={form.control}
            />
            <NumberField
              readOnly
              required={false}
              label={"Line Total"}
              name={"line_total"}
              control={form.control}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
