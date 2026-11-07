import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Truck } from "lucide-react"
import { assignShipmentVehicleSchema } from "../schemas"
import { useAssignShipmentVehicle } from "../hooks/use-shipment-actions"
import { ShipmentActionDialog, closeOnSuccess } from "./shipment-action-dialog"
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

  return (
    <ShipmentActionDialog
      open={open}
      onOpenChange={onOpenChange}
      shipment={shipment}
      icon={Truck}
      title="Assign vehicle"
      description="Pick an available vehicle for this trip."
      formId="assign-vehicle-form"
      submitLabel="Assign vehicle"
      isSubmitting={isPending}
    >
      {item?.item_type === "small" && item.service_id && item.display_name && (
        <div className="text-sm">
          <p className="text-xs text-muted-foreground">Service</p>
          <p className="font-medium">{item.display_name}</p>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Match requirements</p>
            <p className="text-xs text-muted-foreground">
              Turn on a requirement to only list vehicles that meet it.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {requirements.map((req) => {
              const active = !!filters[req.key]
              return (
                <button
                  key={req.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(req.key, req.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted",
                    active &&
                      "border-primary bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                >
                  {active && <Check className="size-3.5" />}
                  <span className="text-muted-foreground">{req.label}</span>
                  <span className="font-medium">{req.display ?? "—"}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

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
    </ShipmentActionDialog>
  )
}
