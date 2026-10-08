import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatMoney, formatNumber } from "@/lib/format"
import { EntityId } from "@/schemas"
import { useEffect, useState } from "react"
import {
  createDistanceTonnageLineItemSchema,
  DistanceLineItemRequest,
  Route,
} from "@/features/quotations/schemas"
import { Button } from "@/components/ui/button"
import { Search, PackageOpen } from "lucide-react"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { generateDistanceEmptyLineItem } from "../../utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  NumberField,
  MoneyField,
  SelectField,
  SwitchField,
} from "@/components/ui/form-fields"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useDistanceTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { DistanceTonnagePricingItem } from "@/features/settings/pricing/types"
import { ENGINE_MODES } from "@/common/config"
import Decimal from "@/lib/decimal-config"
import { Card, CardContent } from "@/components/ui/card"
import { DistanceRatePricingTable } from "./distance-rates-pricing-table"
import { RouteSummary } from "./routes-dialog"

const formSchema = z.object({
  ...createDistanceTonnageLineItemSchema.shape,
  // routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type DistancePricingDialogProps = {
  clientId: EntityId
  open: boolean
  lineItem?: DistanceLineItemRequest
  onOpenChange: (v: boolean) => void
  onLineItemAdded: (lineItem: DistanceLineItemRequest) => void
}

export function DistancePricingSelectDialog({
  open,
  lineItem,
  onOpenChange,
  onLineItemAdded,
}: DistancePricingDialogProps) {
  const { data: response, isLoading } = useDistanceTonnagePricing()
  const [selectedDistanceRange, setSelectedDistanceRange] =
    useState<DistanceTonnagePricingItem>()
  const [route, setRoute] = useState<Route>()

  const data = response?.pricings ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: lineItem
      ? { ...lineItem }
      : {
          ...generateDistanceEmptyLineItem(),
          // routes:  [],
        },
    mode: "onChange",
  })

  const { watch } = form

  const quantity = watch("quantity")
  const isRoundTrip = watch("is_round_trip")
  const tonnage = watch("tonnage")
  const distanceKm = watch("distance_km")
  const unitPrice = watch("unit_price")
  const subtotal = watch("subtotal")
  const discount = watch("discount")
  const lineTotal = watch("line_total")

  const [query, setQuery] = useState("")

  useEffect(() => {
    const subtotal = new Decimal(unitPrice ?? 0)
      .times(quantity ?? 0)
      .times(isRoundTrip ? 2 : 1)
    const lineTotal = subtotal.minus(discount ?? 0)
    form.setValue("subtotal", subtotal.toFixed(2))
    form.setValue("line_total", lineTotal.toFixed(2))
  }, [quantity, isRoundTrip, unitPrice, discount])

  function handleSelect(pricing: DistanceTonnagePricingItem) {
    setSelectedDistanceRange(pricing)
    form.setValue("unit_price", pricing.max_price)
    form.setValue("tonnage", pricing.tonnage_max)
    form.setValue(
      "distance_km",
      pricing.distance_max_km
        ? pricing.distance_max_km
        : pricing.distance_min_km
    )
  }

  useEffect(() => {
    if (!open) return
    if (lineItem) {
      form.reset({ ...lineItem })
      setRoute(lineItem.route)
    } else {
      form.reset({ ...generateDistanceEmptyLineItem() })
      setRoute(undefined)
    }
    setSelectedDistanceRange(undefined)
    setQuery("")
    // setRouteError(false)
  }, [open, lineItem])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] min-h-[95vh] overflow-hidden p-0 md:min-w-[95vw]">
        <form className="flex w-full flex-col">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Distance Pricing
            </DialogTitle>

            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Distance {distanceKm} km/l
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
                      <Checkbox
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        checked={field.value ?? false}
                        onCheckedChange={(state: boolean) =>
                          field.onChange(state)
                        }
                      />
                      <FieldLabel htmlFor={field.name} className="text-sm">
                        Round Trip
                      </FieldLabel>
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
                  onClick={form.handleSubmit((data) => {
                    const title = `${data.distance_km} km`
                    onLineItemAdded({ ...data, display_title: title })
                    onOpenChange(false)
                  })}
                >
                  Add to quote
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="grid flex-1 overflow-hidden md:grid-cols-6">
            {/* LEFT SIDE */}
            <div className="col-span-4 flex-1 space-y-4 overflow-y-auto border-r p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <InputGroup className="flex-1">
                  <InputGroupInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by origin or destination..."
                  />
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                </InputGroup>
                <NumberField
                  className="w-32"
                  control={form.control}
                  name={"distance_km"}
                />
                <NumberField
                  className="w-32"
                  control={form.control}
                  name={"tonnage"}
                />
              </div>

              {isLoading && (
                <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
                  Loading routes...
                </div>
              )}

              <DistanceRatePricingTable
                data={data}
                selectedId={selectedDistanceRange?.id}
                onSelect={handleSelect}
                distanceKm={distanceKm}
                loadTons={tonnage}
              />
            </div>

            {/* RIGHT SIDE (SORTABLE) */}
            <div className="col-span-2 flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <div className="rounded-lg border border-dashed p-4">
                  {selectedDistanceRange ? (
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex w-full justify-between text-muted-foreground">
                        <div className="text-muted-foreground">
                          Selected rate
                        </div>
                        <Button
                          type="button"
                          variant={"ghost"}
                          size={"sm"}
                          onClick={() => setSelectedDistanceRange(undefined)}
                        >
                          Clear
                        </Button>
                      </div>

                      <div className="text-lg font-semibold">
                        {selectedDistanceRange.distance_min_km} -{" "}
                        {selectedDistanceRange.distance_max_km} km{" "}
                        {formatNumber(selectedDistanceRange.tonnage_min)} -{" "}
                        {formatNumber(selectedDistanceRange.tonnage_max)} tons
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <PackageOpen className="h-6 w-6" />
                      <p className="text-sm">
                        Pick a price on the left to add a route here.
                      </p>
                    </div>
                  )}
                </div>
                <Card>
                  <CardContent className="space-y-4">
                    <Field orientation={"horizontal"}>
                      <NumberField
                        required={false}
                        label="Distance"
                        control={form.control}
                        name={"distance_km"}
                      />
                      <NumberField
                        required={false}
                        label="Tonnage"
                        control={form.control}
                        name={"tonnage"}
                      />
                    </Field>
                    <Field orientation={"horizontal"}>
                      <SelectField
                        label={"Engine"}
                        control={form.control}
                        name={"engine_mode"}
                        required={false}
                        placeholder="Select engine"
                        options={ENGINE_MODES.map((opt) => ({
                          label: `${opt}`,
                          value: `${opt}`,
                        }))}
                      />
                      <NumberField
                        label="Consumption (km/l)"
                        control={form.control}
                        name="estimated_consumption_rate_km"
                      />
                    </Field>
                    <Field orientation={"horizontal"}>
                      <SwitchField
                        label={"Driver"}
                        name={"with_driver"}
                        control={form.control}
                      />
                      <SwitchField
                        label={"Loaders"}
                        name={"with_loaders"}
                        control={form.control}
                      />
                    </Field>
                  </CardContent>
                </Card>
                <RouteSummary
                  route={route}
                  onEdit={(r) => {
                    form.setValue("route", r)
                    setRoute(r)
                  }}
                />
              </div>
              <div className="space-y-4 border-t p-5 dark:bg-accent">
                <Field orientation={"horizontal"}>
                  <NumberField
                    label="Quantity"
                    control={form.control}
                    name="quantity"
                  />
                  <MoneyField
                    required={false}
                    label="Discount"
                    control={form.control}
                    name="discount"
                  />
                </Field>
                <NumberField
                  label="Unit Price"
                  control={form.control}
                  name="unit_price"
                />
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-muted-foreground">Subtotal</div>
                  <div className="text-sm">{formatMoney(subtotal)}</div>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-muted-foreground">Discount</div>
                  <div className="text-sm">
                    {discount ? -formatMoney(discount) : "__"}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-semibold">Line total</div>
                  <div className="text-xl font-bold text-primary">
                    {formatMoney(lineTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
