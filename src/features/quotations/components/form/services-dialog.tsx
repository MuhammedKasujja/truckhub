import { EntityId } from "@/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  createServiceQuotationLineItemSchema,
  Route,
  ServiceLineItemRequest,
} from "@/features/quotations/schemas"
import {
  MoneyField,
  NumberField,
  SelectField,
  SwitchField,
  YearPickerField,
} from "@/components/ui/form-fields"
import { generateServiceEmptyLineItem } from "@/features/quotations/utils"
import { useEffect, useMemo, useState } from "react"
import { Check, SearchIcon, Settings2, Truck } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { formatMoney } from "@/lib/format"
import { ENGINE_MODES } from "@/common/config"
import Decimal from "@/lib/decimal-config"
import { useQuotationServiceProducts } from "@/features/quotations/hooks/use-quotation-pricings"
import { Service } from "@/features/services/types"
import { useTranslation } from "@/i18n"
import { cn } from "cn"
import { Status } from "@/components/ui/status"
import { RouteSummary } from "./routes-dialog"
import { toast } from "sonner"
import {
  ConfigSection,
  LineItemDialog,
  LineTotals,
  PickHint,
  RoundTripField,
} from "./line-item-dialog"

type ServiceSelectDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
  lineItem?: ServiceLineItemRequest
  onLineItemAdded: (lineItem: ServiceLineItemRequest) => void
}

export function ServicesDialog({
  clientId,
  open,
  onOpenChange,
  lineItem,
  onLineItemAdded,
}: ServiceSelectDialogProps) {
  const form = useForm<ServiceLineItemRequest>({
    resolver: zodResolver(createServiceQuotationLineItemSchema),
    defaultValues: lineItem
      ? { ...lineItem }
      : {
          ...generateServiceEmptyLineItem(),
        },
  })

  const { pricing: services } = useQuotationServiceProducts(clientId)
  const [route, setRoute] = useState<Route>()

  const unitPrice = form.watch("unit_price")
  const quantity = form.watch("quantity")
  const isRoundTrip = form.watch("is_round_trip")
  const discount = form.watch("discount")
  const lineTotal = form.watch("line_total")
  const subtotal = form.watch("subtotal")
  const serviceId = form.watch("service_id")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [query, setQuery] = useState("")

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
    if (!open) return

    if (lineItem) {
      form.reset({
        ...lineItem,
        source: "service",
        vehicle_addons: [],
        item_type: "small",
      })
      setSelectedIds(lineItem.service_id ? [lineItem.service_id] : [])
      setRoute(lineItem.route)
    } else {
      form.reset(generateServiceEmptyLineItem())
      setSelectedIds([])
      setRoute(undefined)
    }
  }, [lineItem, open])

  function handleSubmit() {
    form.handleSubmit(
      (data) => {
        const selectedService = services?.find(
          (s) => form.getValues("service_id") === s.id
        )
        if (!selectedService) {
          toast.error("Please select a vehicle first")
          return
        }
        onLineItemAdded({
          ...data,
          display_name: `${selectedService.display_name}`,
        })
        onOpenChange(false)
      },
      (error) => {
        console.log("error", error)
      }
    )()
  }

  const selectedService = services?.find((s) => s.id === serviceId)
  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return services ?? []
    return (services ?? []).filter((s) =>
      [s.display_name, s.description].some((v) => v?.toLowerCase().includes(q))
    )
  }, [services, query])

  return (
    <LineItemDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Truck}
      title="Vehicle hire"
      description={
        selectedService
          ? selectedService.display_name
          : "Pick a vehicle, set the hire terms and price."
      }
      isEditing={!!lineItem}
      lineTotal={lineTotal}
      onSubmit={handleSubmit}
      pickerTitle="Vehicles"
      pickerDescription={`${services?.length ?? 0} available for this client`}
      pickerAction={
        <InputGroup className="w-64">
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicles..."
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      }
      picker={
        <ServiceList
          services={filteredServices}
          selectionMode="single"
          selectedIds={selectedIds}
          onSelectedIdsChange={(ids) => {
            setSelectedIds(ids)
            form.setValue("service_id", ids.length > 0 ? ids[0] : "")
          }}
        />
      }
      totals={
        <LineTotals
          subtotal={subtotal}
          discount={discount}
          lineTotal={lineTotal}
          isRoundTrip={isRoundTrip}
        >
          <div className="grid grid-cols-2 gap-3">
            <MoneyField
              label={"Unit price"}
              name={"unit_price"}
              control={form.control}
            />
            <MoneyField
              required={false}
              label={"Discount"}
              name={"discount"}
              control={form.control}
            />
          </div>
        </LineTotals>
      }
    >
      {selectedService ? (
        <SelectedServiceCard service={selectedService} />
      ) : (
        <PickHint
          icon={Truck}
          title="No vehicle selected"
          description="Choose one from the list to price this line."
        />
      )}
      <ConfigSection icon={Settings2} title="Hire terms">
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={"Quantity"}
            name={"quantity"}
            control={form.control}
          />
          <YearPickerField
            required={false}
            label={"Year make"}
            name={"vehicle_year"}
            control={form.control}
          />
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
          <NumberField
            required={false}
            label={"Consumption (km/l)"}
            name={"estimated_consumption_rate_km"}
            control={form.control}
          />
        </div>
        <SwitchField
          label={"With driver"}
          description="Include a driver with the vehicle"
          name={"with_driver"}
          control={form.control}
        />
      </ConfigSection>
      <RoundTripField control={form.control} name="is_round_trip" />
      <RouteSummary
        route={route}
        onEdit={(route) => {
          form.setValue("route", route)
          setRoute(route)
        }}
      />
    </LineItemDialog>
  )
}

function SelectedServiceCard({ service }: { service: Service }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs">
      <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <Truck className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Selected vehicle
        </p>
        <p className="truncate font-semibold">{service.display_name}</p>
        <p className="text-sm text-muted-foreground tabular-nums">
          {formatMoney(service.base_fare)}
        </p>
      </div>
    </div>
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

  if (services.length === 0) {
    return (
      <PickHint
        icon={SearchIcon}
        title="No vehicles found"
        description="Try a different search."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {services.map((service) => {
        const isSelected = selectedIds.includes(service.id)

        return (
          <button
            key={service.id}
            type="button"
            disabled={!selectable}
            aria-pressed={selectable ? isSelected : undefined}
            onClick={() => handleSelected(service)}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left shadow-xs transition-all outline-none",
              "hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
              isSelected && "border-primary ring-2 ring-primary/30"
            )}
          >
            <span
              className={cn(
                "absolute top-2.5 right-2.5 z-10 flex size-6 items-center justify-center rounded-full border bg-background/90 text-transparent shadow-xs backdrop-blur transition-colors",
                isSelected &&
                  "border-primary bg-primary text-primary-foreground"
              )}
            >
              <Check className="size-3.5" />
            </span>
            <div className="flex h-36 items-center justify-center bg-muted/60 p-3">
              {service.image_url ? (
                <img
                  src={service.image_url}
                  alt=""
                  className="h-full w-full object-contain transition-transform group-hover:scale-[1.03]"
                />
              ) : (
                <Truck className="size-10 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{service.display_name}</p>
                {service.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="mt-auto flex items-end justify-between gap-2 border-t pt-3">
                <div>
                  <p className="text-lg leading-tight font-bold tabular-nums">
                    {formatMoney(service.base_fare)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tr("services.last_price")}{" "}
                    <span className="tabular-nums">
                      {formatMoney(service.min_fare)}
                    </span>
                  </p>
                </div>
                {!service.is_truck && <Status>{service.seats} seats</Status>}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
