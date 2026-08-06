import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { formatMoney, formatNumber } from "@/lib/format"
import { EntityId } from "@/schemas"
import { useEffect, useMemo, useState } from "react"
import {
  createDistanceTonnageLineItemSchema,
  DistanceLineItemRequest,
} from "@/features/quotations/schemas"
import { Button } from "@/components/ui/button"
import { MapPin, Search, PackageOpen } from "lucide-react"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { generateDistanceEmptyLineItem } from "../../utils"
import { Checkbox } from "@/components/ui/checkbox"
import { NumberField, SwitchField } from "@/components/ui/form-fields"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useDistanceTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { DistanceTonnagePricingResponse } from "@/features/settings/pricing/types"

const formSchema = z.object({
  ...createDistanceTonnageLineItemSchema.shape,
  // routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type DistancePricingDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
  onLineItemAdded: (lineItem: DistanceLineItemRequest) => void
}

export function DistancePricingSelectDialog({
  clientId,
  open,
  onOpenChange,
  onLineItemAdded,
}: DistancePricingDialogProps) {
  const { data, isLoading } = useDistanceTonnagePricing()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  const [query, setQuery] = useState("")

  const filteredRoutes = useMemo(() => {
    return (data ?? []).filter((route) => {
      const q = query.toLowerCase()
      return (
        route.max_price.toString().toLowerCase().includes(q) ||
        route.min_price.toString().toLowerCase().includes(q) ||
        route.distance_max_km?.toString().toLowerCase().includes(q) ||
        route.distance_min_km?.toString().toLowerCase().includes(q)
      )
    })
  }, [query, data, tonnage, distanceKm])

  useEffect(() => {
    const subtotal = Number(unitPrice) * quantity * (isRoundTrip ? 2 : 1)
    const lineTotal = subtotal
    form.setValue("unit_price", unitPrice)
    form.setValue("subtotal", subtotal)
    form.setValue("line_total", lineTotal)
  }, [quantity, isRoundTrip, unitPrice])

  const isSelected = (pricingId: EntityId) =>
    (data ?? []).find((r) => r.id === pricingId)

  function handleSelect(pricing: DistanceTonnagePricingResponse) {
    form.setValue("unit_price", Number(pricing.max_price))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-hidden p-0 md:min-w-[90vw]">
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
                onClick={form.handleSubmit((data) => {
                  onLineItemAdded(data)
                  onOpenChange(false)
                })}
              >
                Accept
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 overflow-hidden md:grid-cols-5">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-4 overflow-y-auto border-r p-6 md:col-span-3">
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
              {/* <Select items={data?.tonnages ?? []}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Filter by tonnage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {data?.tonnages?.map((item) => (
                      <SelectItem
                        key={item.min_tons}
                        value={item.min_tons.toString()}
                      >
                        {formatNumber(item.min_tons)} –{" "}
                        {formatNumber(item.max_tons)} TONS
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select> */}
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

            {!isLoading && filteredRoutes.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                <PackageOpen className="h-8 w-8" />
                <p className="text-sm">No routes match your search.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {filteredRoutes.map((pricing) => (
                <Item
                  key={pricing.id}
                  variant="outline"
                  className="flex-col items-stretch gap-3 p-4"
                  onClick={() => handleSelect(pricing)}
                >
                  <ItemContent>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <ItemTitle className="text-base">
                        {pricing.distance_min_km} km
                        <span className="mx-1.5 text-muted-foreground">→</span>
                        {pricing.distance_max_km} km
                      </ItemTitle>
                    </div>

                    <ItemDescription>
                      {formatMoney(pricing.min_price)} –{" "}
                      {formatMoney(pricing.max_price)} hrs &nbsp;•&nbsp;
                      {pricing.tonnage_min} - {pricing.tonnage_max} tons
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE (SORTABLE) */}
          <div className="flex flex-col gap-3 overflow-y-auto p-6 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Selected routes
              </h3>
              <span className="text-xs text-muted-foreground">
                {tonnage} tons
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              <PackageOpen className="h-6 w-6" />
              <p className="text-sm">
                Pick a price on the left to add a route here.
              </p>
            </div>
            <Field orientation={"horizontal"}>
              <SwitchField
                label={"Include Driver"}
                name={"with_driver"}
                control={form.control}
              />
              <SwitchField
                label={"Include Loaders"}
                name={"with_loaders"}
                control={form.control}
              />
            </Field>
            <NumberField
              label="Consumption Rate (km/l)"
              control={form.control}
              name="estimated_consumption_rate_km"
            />
            <NumberField
              label="quantity"
              control={form.control}
              name="quantity"
            />
            <NumberField
              label="Unit Price"
              control={form.control}
              name="unit_price"
            />
            <NumberField
              required={false}
              label="Discount"
              control={form.control}
              name="discount"
            />
            <NumberField
              readOnly
              required={false}
              label="Subtotal"
              control={form.control}
              name="subtotal"
            />
            <NumberField
              readOnly
              required={false}
              label="Line total"
              control={form.control}
              name="line_total"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
