import { Link } from "@tanstack/react-router"
import { Cog, Fuel, Milestone, Phone, UserRoundX } from "lucide-react"
import { engineLabel, humanize, vehicleName } from "../format"
import { VehicleStatusIndicator } from "./vehicle-status-indicator"
import { ColorDot, PlateNumber, VehicleIconTile, carColor } from "./vehicle-visuals"
import type { Vehicle } from "../types"
import { formatNumber, generateAvatorFallback } from "@/lib/format"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const MAX_FEATURES = 3

function Metric({
  label,
  value,
  unit,
}: {
  label: string
  value: React.ReactNode
  unit?: string
}) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <p className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold tabular-nums">
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}

export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const isTruck = v.category.is_truck
  const extraFeatures = v.features.length - MAX_FEATURES

  return (
    <Card className="group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md has-[a[data-card-link]:focus-visible]:ring-2 has-[a[data-card-link]:focus-visible]:ring-ring">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <VehicleIconTile isTruck={isTruck} />
        <div className="min-w-0 flex-1">
          <Link
            to="/vehicles/$vehicleId/view"
            params={{ vehicleId: v.id }}
            data-card-link
            className="block truncate font-semibold outline-none after:absolute after:inset-0 group-hover:text-primary"
          >
            {vehicleName(v)}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {v.number} · {v.category.name} · {v.year}
          </p>
        </div>
        <VehicleStatusIndicator status={v.status} className="shrink-0" />
      </div>

      {/* Plates */}
      <div className="flex flex-wrap items-center gap-2 px-4">
        <PlateNumber value={v.plate_number} />
        {v.second_plate_number && <PlateNumber value={v.second_plate_number} />}
      </div>

      {/* Key metrics */}
      <div className="mx-4 mt-3 grid grid-cols-3 divide-x rounded-lg border bg-muted/40">
        <Metric
          label="Engine"
          value={formatNumber(v.tank_capacity)}
          unit="cc"
        />
        <Metric
          label="Economy"
          value={formatNumber(v.fuel_consumption_rate)}
          unit="km/L"
        />
        {isTruck ? (
          <Metric
            label="Payload"
            value={
              v.tonnage_capacity != null ? formatNumber(v.tonnage_capacity) : "-"
            }
            unit={v.tonnage_capacity != null ? "t" : undefined}
          />
        ) : (
          <Metric label="Seats" value={v.seats ?? "-"} />
        )}
      </div>

      {/* Specs line */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Fuel className="size-3.5" aria-hidden />
          {engineLabel(v.engine_type)} · {v.cylinders} cyl
        </span>
        <span className="inline-flex items-center gap-1">
          <Cog className="size-3.5" aria-hidden />
          {humanize(v.gearbox)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Milestone className="size-3.5" aria-hidden />
          {v.drive_train.name}
          {v.total_axles ? ` · ${v.total_axles} axles` : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ColorDot name={v.color} className="size-3" />
          <ColorDot name={v.interior_color} className="-ml-2.5 size-3" />
          <span title={`Exterior / interior`}>
            {carColor(v.color).label} / {carColor(v.interior_color).label}
          </span>
        </span>
      </div>

      {/* Features */}
      <div className="flex min-h-6 flex-1 flex-wrap content-start gap-1.5 px-4 pt-3">
        {v.features.slice(0, MAX_FEATURES).map((f) => (
          <Badge key={f.id} variant="secondary" className="font-normal capitalize">
            {f.name}
          </Badge>
        ))}
        {extraFeatures > 0 && (
          <Badge
            variant="outline"
            className="font-normal"
            title={v.features
              .slice(MAX_FEATURES)
              .map((f) => f.name)
              .join(", ")}
          >
            +{extraFeatures} more
          </Badge>
        )}
      </div>

      {/* Driver */}
      <div className="mt-4 border-t bg-muted/30 px-4 py-3">
        {v.driver ? (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {generateAvatorFallback(v.driver.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium capitalize">
                {v.driver.full_name}
              </p>
              <p className="text-xs text-muted-foreground">Driver</p>
            </div>
            <a
              href={`tel:${v.driver.phone.replace(/\s/g, "")}`}
              className="relative z-10 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Phone className="size-3" aria-hidden />
              {v.driver.phone}
            </a>
          </div>
        ) : (
          <div className="flex h-8 items-center gap-2 text-sm text-muted-foreground">
            <UserRoundX className="size-4" aria-hidden />
            No driver assigned
          </div>
        )}
      </div>
    </Card>
  )
}
