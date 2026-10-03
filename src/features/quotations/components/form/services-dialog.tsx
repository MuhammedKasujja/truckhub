import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EntityId } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  createCarQuotationLineItemSchema,
  RouteServiceInput,
  SmallLineItemRequest,
} from "@/features/quotations/schemas"
import {
  MoneyField,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
  YearPickerField,
} from "@/components/ui/form-fields"
import { generateEmptyLineItem } from "@/features/quotations/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { formatMoney } from "@/lib/format"
import { ServiceRoutesDialog } from "./service-routes"
import { ENGINE_MODES } from "@/common/config"
import Decimal from "@/lib/decimal-config"
import { useQuotationServiceProducts } from "@/features/quotations/hooks/use-quotation-pricings"
import { Service } from "@/features/services/types"
import { useTranslation } from "@/i18n"
import { cn } from "cn"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Status } from "@/components/ui/status"

type ServiceSelectDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
  lineItem?: SmallLineItemRequest
  onLineItemAdded: (lineItem: SmallLineItemRequest) => void
}

export function ServicesDialog({
  clientId,
  open,
  onOpenChange,
  lineItem,
  onLineItemAdded,
}: ServiceSelectDialogProps) {
  const form = useForm<SmallLineItemRequest>({
    resolver: zodResolver(createCarQuotationLineItemSchema),
    defaultValues: lineItem
      ? { ...lineItem }
      : {
          ...generateEmptyLineItem(),
        },
  })

  const { pricing: services } = useQuotationServiceProducts(clientId)

  const unitPrice = form.watch("unit_price")
  const quantity = form.watch("quantity")
  const isRoundTrip = form.watch("is_round_trip")
  const discount = form.watch("discount")
  const lineTotal = form.watch("line_total")
  const subtotal = form.watch("subtotal")
  const locations = form.watch("locations")
  const serviceId = form.watch("service_id")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const locationsFields = useFieldArray({
    control: form.control,
    name: "locations",
  })

  function handleLocationSelected(route: RouteServiceInput) {
    const index = locations.findIndex((r) => r.route_id === route.route_id)
    if (index > -1) locationsFields.remove(index)
    else locationsFields.prepend(route)
  }

  useEffect(() => {
    const price = new Decimal(unitPrice ?? 0)
    const qty = quantity ?? 1
    const subtotal = price.times(qty).times(isRoundTrip === true ? 2 : 1)
    const lineTotal = subtotal.sub(discount ?? 0)
    form.setValue("subtotal", subtotal.toFixed(2))
    form.setValue("line_total", lineTotal.toFixed(2))
  }, [unitPrice, quantity, isRoundTrip, discount])

  useEffect(() => {
    const selectedService = services?.find((s) => selectedIds.includes(s.id))
    const price = selectedService?.base_fare
    form.setValue("unit_price", price ?? "0")
    form.setValue("car_model_id", selectedService?.car_model?.id)
    form.setValue("vehicle_category_id", selectedService?.vehicle_category?.id)
  }, [serviceId])

  useEffect(() => {
    if (lineItem) {
      form.reset({
        ...lineItem,
        source: "service",
        vehicle_addons: [],
        item_type: "small",
      })
    }
  }, [lineItem, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] min-h-[95vh] overflow-hidden p-0 md:min-w-[95vw]">
        <form className="flex w-full flex-col">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Service Pricing
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {formatMoney(form.watch("line_total"))} - locations{" "}
                {locationsFields.fields.length}
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
                  Add to quote
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid flex-1 grid-cols-6 overflow-hidden">
            <div className="col-span-4 flex-1 space-y-4 overflow-y-auto border-r p-6">
              <ServiceList
                services={services ?? []}
                selectionMode="single"
                selectedIds={selectedIds}
                onSelectedIdsChange={(ids) => {
                  setSelectedIds(ids)
                  form.setValue(
                    "service_id",
                    ids.length > 0 ? ids[0] : undefined
                  )
                }}
              />
            </div>
            <div className="col-span-2 flex flex-col overflow-hidden">
              <div className="flex-1 space-y-2 overflow-y-auto p-6">
                <div className="space-y-2.5 rounded-lg border border-dashed bg-background p-4">
                  <Field
                    orientation={"horizontal"}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <YearPickerField
                      required={false}
                      label={"Year Make"}
                      name={"vehicle_year"}
                      control={form.control}
                    />
                    <NumberField
                      required={false}
                      label={"Consumption (km/l)"}
                      name={"estimated_consumption_rate_km"}
                      control={form.control}
                    />
                  </Field>
                  <Field orientation={"horizontal"} className="items-end">
                    <SelectField
                      label={"Engine"}
                      control={form.control}
                      name={"engine_mode"}
                      placeholder="Select engine"
                      options={ENGINE_MODES.map((opt) => ({
                        label: `${opt}`,
                        value: `${opt}`,
                      }))}
                    />
                    <SwitchField
                      label={"Driver"}
                      name={"with_driver"}
                      control={form.control}
                    />
                  </Field>
                </div>
                <ServiceRoutesDialog
                  selectedRoutes={locationsFields.fields}
                  clientId={clientId}
                  onSelected={handleLocationSelected}
                />
              </div>
              <div className="space-y-4 border-t p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:bg-accent">
                <Field
                  orientation={"horizontal"}
                  className="grid gap-4 md:grid-cols-2"
                >
                  <NumberField
                    label={"Quantity"}
                    name={"quantity"}
                    control={form.control}
                  />

                  <MoneyField
                    required={false}
                    label={"Discount"}
                    name={"discount"}
                    control={form.control}
                  />
                </Field>
                <MoneyField
                  label={"Unit Price"}
                  name={"unit_price"}
                  control={form.control}
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

type ServiceSelectionMode = "single" | "multiple"

type ServiceListProps = {
  services: Service[]
  selectionMode?: ServiceSelectionMode
  selectedIds?: EntityId[]
  onSelectedIdsChange?: (ids: EntityId[]) => void
}

function ServiceList({
  services,
  selectionMode,
  selectedIds = [],
  onSelectedIdsChange,
}: ServiceListProps) {
  const tr = useTranslation()

  const selectable = !!selectionMode

  function handleSelected(service: Service) {
    if (!selectionMode) return

    const isSelected = selectedIds.includes(service.id)

    if (selectionMode === "single") {
      onSelectedIdsChange?.(isSelected ? [] : [service.id])
      return
    }

    const nextIds = isSelected
      ? selectedIds.filter((id) => id !== service.id)
      : [...selectedIds, service.id]

    onSelectedIdsChange?.(nextIds)
  }

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {services.map((service) => {
          const isSelected = selectedIds.includes(service.id)

          return (
            <Card
              key={service.id}
              role={selectable ? "button" : undefined}
              tabIndex={selectable ? 0 : undefined}
              aria-pressed={selectable ? isSelected : undefined}
              onClick={selectable ? () => handleSelected(service) : undefined}
              className={cn(
                "rounded-2xl shadow-sm transition hover:shadow-md hover:bg-primary/5",
                selectable && "cursor-pointer",
                isSelected && "ring-2 ring-primary bg-primary/5"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {service.vehicle_category?.name ??
                      `${service.car_model?.car_brand.name} ${
                        service.car_model?.name
                      } (${service.car_model?.manufacture_year})`}
                  </CardTitle>

                  {/* <Badge variant="default">{service.category}</Badge> */}
                </div>

                <CardDescription>{service.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                <div className="h-40 rounded-sm bg-accent" />

                <div className="space-y-1">
                  <div className="flex items-baseline-last justify-between gap-2">
                    <div className="space-y-1.5">
                      <div className="text-start text-xl font-semibold">
                        {formatMoney(service.base_fare)}
                      </div>
                      <div className="flex w-full gap-1 text-sm text-muted-foreground">
                        <div className="text-sm">
                          {tr("services.last_price")}
                        </div>
                        <div>{formatMoney(service.min_fare)}</div>
                      </div>
                    </div>
                    {!service.is_truck && (
                      <Status>{service.seats} seats</Status>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
