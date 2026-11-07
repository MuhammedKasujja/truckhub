import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, SlidersHorizontal, Truck } from "lucide-react"
import { assignShipmentVehicleSchema } from "../schemas"
import { useAssignShipmentVehicle } from "../hooks/use-shipment-actions"
import {
  FormSection,
  ShipmentActionDialog,
  closeOnSuccess,
} from "./shipment-action-dialog"
import type {
  AssignShipmentVehicleInput,
  ShipmentVehicleFilters,
} from "../schemas"
import type { Shipment } from "../types"
import { VehiclePickerField } from "@/features/vehicles/components"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import { cn } from "@/lib/utils"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

type FilterKey = keyof ShipmentVehicleFilters

export function ShipmentAssignVehicleDialog({
  shipment,
  onOpenChange,
  open,
}: Props) {
  const { assignShipmentVehicle, isPending } = useAssignShipmentVehicle()
  const { data: config } = useVehicleConfigurations()
  const [filters, setFilters] = useState<ShipmentVehicleFilters>({})

  const form = useForm<AssignShipmentVehicleInput>({
    resolver: zodResolver(assignShipmentVehicleSchema),
    defaultValues: { unitId: shipment?.id },
  })

  useEffect(() => {
    if (open && shipment) {
      form.reset({ unitId: shipment.id })
      setFilters({})
    }
  }, [form, open, shipment])

  const item = shipment?.item
  const requirements: {
    key: FilterKey
    label: string
    display: string | undefined
    value: string | null | undefined
  }[] = item
    ? [
        {
          key: "category_id",
          label: "Category",
          display: config?.vehicle_types.find(
            (e) => e.id === item.vehicle_category_id
          )?.name,
          value: item.vehicle_category_id,
        },
        {
          key: "brand_id",
          label: "Make",
          display: config?.car_brands.find((e) => e.id === item.car_brand_id)
            ?.name,
          value: item.car_brand_id,
        },
        {
          key: "model_id",
          label: "Model",
          display: config?.car_models.find((e) => e.id === item.car_model_id)
            ?.name,
          value: item.car_model_id,
        },
        {
          key: "tonnage",
          label: "Tonnage",
          display: item.tonnage ? `${item.tonnage} t` : undefined,
          value: item.tonnage,
        },
        {
          key: "consumption_rate",
          label: "Fuel economy",
          display: item.estimated_fuel_rate_km
            ? `${item.estimated_fuel_rate_km} km/L`
            : undefined,
          value: item.estimated_consumption_rate_km?.toString(),
        },
      ].filter((r) => !!r.value)
    : []

  function toggle(key: FilterKey, value: string | null | undefined) {
    setFilters((prev) => ({ ...prev, [key]: prev[key] ? undefined : value }))
  }

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={Truck}
      hue="blue"
      title="Assign vehicle"
      description="Pick an available vehicle for this trip."
      formId="assign-vehicle-form"
      submitLabel="Assign vehicle"
      isSubmitting={isPending}
    >
      {item?.item_type === "small" && item.service_id && item.display_name && (
        <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm shadow-xs">
          <span className="text-muted-foreground">Service</span>
          <span className="ml-auto font-medium">{item.display_name}</span>
        </div>
      )}

      {requirements.length > 0 && (
        <FormSection
          icon={SlidersHorizontal}
          hue="amber"
          title="Match requirements"
          description="Turn one on to only list vehicles that meet it."
          action={
            activeCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters({})}
                className="text-xs text-primary hover:underline"
              >
                Clear ({activeCount})
              </button>
            )
          }
        >
          <div className="grid grid-cols-2 gap-2">
            {requirements.map((req) => {
              const active = !!filters[req.key]
              return (
                <button
                  key={req.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(req.key, req.value)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-left transition-colors hover:bg-muted/60",
                    active &&
                      "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/10"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] text-muted-foreground">
                      {req.label}
                    </span>
                    <span className="block truncate text-sm font-medium">
                      {req.display ?? "—"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-transparent"
                    )}
                  >
                    <Check className="size-3" />
                  </span>
                </button>
              )
            })}
          </div>
        </FormSection>
      )}

      <FormSection
        icon={Truck}
        hue="blue"
        title="Vehicle"
        description={
          activeCount > 0
            ? `Showing available vehicles matching ${activeCount} requirement${activeCount === 1 ? "" : "s"}`
            : "Showing all available vehicles"
        }
      >
        <form
          id="assign-vehicle-form"
          onSubmit={form.handleSubmit((values) =>
            closeOnSuccess(
              () => assignShipmentVehicle(values),
              () => onOpenChange(false)
            )
          )}
        >
          <VehiclePickerField
            label="Vehicle"
            name="vehicleId"
            control={form.control}
            filters={{ status: "available", ...filters }}
          />
        </form>
      </FormSection>
    </ShipmentActionDialog>
  )
}
