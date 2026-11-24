"use client"

import React from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Cog,
  Copy,
  Fingerprint,
  Fuel,
  Gauge,
  Mail,
  Package,
  Palette,
  Phone,
  Sparkles,
  UserRound,
  UserRoundPlus,
  Users,
} from "lucide-react"
import { vehicleAssignDriverFn, vehicleUnAssignDriverFn } from "../services"
import { engineLabel, humanize, vehicleName } from "../format"
import { VehicleStatusIndicator } from "./vehicle-status-indicator"
import { PlateNumber, VehicleIconTile, carColor } from "./vehicle-visuals"
import type { Vehicle, VehicleDriver } from "../types"
import type { EntityId } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { DriverPicker } from "@/features/drivers/components"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  formatDateTime,
  formatNumber,
  generateAvatorFallback,
} from "@/lib/format"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

type VehicleDetailsProps = {
  vehicle: Vehicle
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const hasTonnage = vehicle.tonnage_capacity != null

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      <Link
        to="/vehicles"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All vehicles
      </Link>

      <Hero vehicle={vehicle} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Section
            icon={Fingerprint}
            title="Specifications"
            description="Identification and powertrain"
          >
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <SpecGroup title="Identification">
                <SpecRow label="Vehicle number">
                  <span className="font-mono">{vehicle.number}</span>
                </SpecRow>
                <SpecRow label="Make">
                  {vehicle.car_model.car_brand.name}
                </SpecRow>
                <SpecRow label="Model">{vehicle.car_model.name}</SpecRow>
                <SpecRow label="Type">{vehicle.category.name}</SpecRow>
                <SpecRow label="Year">{vehicle.year}</SpecRow>
              </SpecGroup>

              <SpecGroup title="Powertrain">
                <SpecRow label="Engine">
                  {engineLabel(vehicle.engine_type)}
                </SpecRow>
                <SpecRow label="Transmission">
                  {humanize(vehicle.gearbox)}
                </SpecRow>
                <SpecRow label="Drive train">
                  {vehicle.drive_train.name}
                </SpecRow>
                <SpecRow label="Axles">{vehicle.total_axles ?? "–"}</SpecRow>
                <SpecRow label="Cylinders">{vehicle.cylinders}</SpecRow>
              </SpecGroup>
            </div>
          </Section>

          <Section
            icon={Palette}
            title="Appearance & cabin"
            description={
              hasTonnage ? "Paint, trim and payload" : "Paint, trim and seating"
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <ColorTile label="Exterior" value={vehicle.color} />
              <ColorTile label="Interior" value={vehicle.interior_color} />
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {hasTonnage ? (
                    <Package className="size-5" />
                  ) : (
                    <Users className="size-5" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {hasTonnage ? "Tonnage" : "Seats"}
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {hasTonnage
                      ? `${formatNumber(vehicle.tonnage_capacity)} t`
                      : vehicle.seats}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <FeaturesSection features={vehicle.features} />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-4">
          <DriverPanel vehicle={vehicle} />
          <RecordPanel vehicle={vehicle} />
        </div>
      </div>
    </div>
  )
}

/* ---------- Hero ---------- */

function Hero({ vehicle }: { vehicle: Vehicle }) {
  const isTruck = vehicle.category.is_truck
  const { copyToClipboard } = useCopyToClipboard()

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="relative isolate p-5 sm:p-6">
        {/* Soft brand wash, kept behind content and out of the a11y tree */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 140% at 0% 0%, color-mix(in oklab, var(--primary) 9%, transparent), transparent 70%)",
          }}
        />
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <VehicleIconTile
              isTruck={isTruck}
              className="size-16 rounded-2xl ring-1 ring-primary/15 [&_svg]:size-8"
            />
            <div className="min-w-0 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {vehicle.category.name}
                  <span className="mx-1.5 text-border">/</span>
                  <span className="font-mono normal-case">
                    {vehicle.number}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                    {vehicleName(vehicle)}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {vehicle.year}
                    </span>
                  </h1>
                  <VehicleStatusIndicator status={vehicle.status} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[vehicle.plate_number, vehicle.second_plate_number]
                  .filter((plate): plate is string => !!plate)
                  .map((plate) => (
                    <button
                      key={plate}
                      type="button"
                      onClick={() => copyToClipboard(plate)}
                      title="Copy plate number"
                      className="group inline-flex items-center gap-1.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <PlateNumber value={plate} size="lg" />
                      <Copy className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <Can permission="vehicles:edit">
            <Button asChild className="shrink-0 self-start">
              <Link
                to="/vehicles/$vehicleId/edit"
                params={{ vehicleId: vehicle.id }}
              >
                <ActionIcon action="edit" />
                Edit vehicle
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* Cells draw their own right/bottom borders; the negative margins tuck
          the outer ones under the section's clipped edge. */}
      <dl className="-mr-px -mb-px grid grid-cols-2 border-t bg-muted/30 md:grid-cols-4">
        <Metric
          icon={Gauge}
          label="Engine capacity"
          value={formatNumber(vehicle.tank_capacity)}
          unit="cc"
        />
        <Metric
          icon={Fuel}
          label="Fuel economy"
          value={formatNumber(vehicle.fuel_consumption_rate)}
          unit="km/L"
        />
        {isTruck ? (
          <Metric
            icon={Package}
            label="Payload"
            value={
              vehicle.tonnage_capacity != null
                ? formatNumber(vehicle.tonnage_capacity)
                : "–"
            }
            unit={vehicle.tonnage_capacity != null ? "t" : undefined}
          />
        ) : (
          <Metric icon={Users} label="Seats" value={vehicle.seats} />
        )}
        <Metric
          icon={Cog}
          label="Drive"
          value={vehicle.drive_train.name}
          unit={humanize(vehicle.gearbox)}
        />
      </dl>
    </section>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: IconType
  label: string
  value: React.ReactNode
  unit?: string
}) {
  return (
    <div className="min-w-0 border-r border-b px-5 py-4">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 flex items-baseline gap-1.5 truncate">
        <span className="text-xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="truncate text-sm text-muted-foreground">{unit}</span>
        )}
      </dd>
    </div>
  )
}

/* ---------- Features ---------- */

function FeaturesSection({ features }: { features: Vehicle["features"] }) {
  return (
    <Section
      icon={Sparkles}
      title="Features"
      description="Equipment fitted to this vehicle"
      aside={
        features.length > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary tabular-nums">
            {features.length}
          </span>
        )
      }
    >
      {features.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {features.map((feat) => (
            <Badge
              key={feat.id}
              variant="secondary"
              className="gap-1.5 py-1 font-normal capitalize"
            >
              <CheckCircle2 className="text-primary" aria-hidden />
              {feat.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          No features recorded for this vehicle
        </p>
      )}
    </Section>
  )
}

/* ---------- Driver ---------- */

function DriverPanel({ vehicle }: { vehicle: Vehicle }) {
  const queryInvalidator = useQueryInvalidator()
  const [driver, setDriver] = React.useState<VehicleDriver | null>(
    vehicle.driver
  )
  const [isEditing, setIsEditing] = React.useState(!vehicle.driver)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function refresh(driverIds: (EntityId | undefined)[]) {
    queryInvalidator.vehicles.details(vehicle.id).invalidate()
    driverIds.forEach((id) => {
      if (id != null) queryInvalidator.drivers.details(id).invalidate()
    })
  }

  async function assignDriver() {
    if (!driver) {
      toast.error("Please select a driver")
      return
    }
    setIsSubmitting(true)
    const { isSuccess, error, message } = await vehicleAssignDriverFn({
      data: { vehicleId: vehicle.id, driverId: driver.id },
    })
    setIsSubmitting(false)
    if (isSuccess) {
      toast.success(message)
      setIsEditing(false)
      refresh([driver.id, vehicle.driver?.id])
    } else {
      toast.error(error?.message)
    }
  }

  async function unassignDriver() {
    const current = vehicle.driver
    if (!current) return
    setIsSubmitting(true)
    const { isSuccess, error, message } = await vehicleUnAssignDriverFn({
      data: { id: vehicle.id },
    })
    setIsSubmitting(false)
    if (isSuccess) {
      toast.success(message)
      setDriver(null)
      setIsEditing(true)
      refresh([current.id])
    } else {
      toast.error(error?.message)
    }
  }

  if (vehicle.driver && !isEditing) {
    const d = vehicle.driver
    return (
      <Section icon={UserRound} title="Assigned driver">
        <div className="space-y-4">
          <Link
            to="/drivers/$driverId/view"
            params={{ driverId: d.id }}
            className="group -m-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
          >
            <Avatar className="size-12">
              {d.photo_url && <AvatarImage src={d.photo_url} alt="" />}
              <AvatarFallback className="bg-primary/10 font-medium text-primary">
                {generateAvatorFallback(d.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium capitalize group-hover:text-primary">
                {d.full_name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {d.number}
              </p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${d.phone.replace(/\s/g, "")}`} title={d.phone}>
                <Phone />
                Call
              </a>
            </Button>
            {d.email ? (
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${d.email}`} title={d.email}>
                  <Mail />
                  Email
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <Mail />
                No email
              </Button>
            )}
          </div>

          <dl className="divide-y rounded-lg border px-3 text-sm">
            <InfoRow inset label="Phone" value={d.phone} />
            {d.email && <InfoRow inset label="Email" value={d.email} />}
          </dl>

          <div className="flex items-center justify-end gap-1 border-t pt-3">
            <Can permission="vehicles:unassign">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                disabled={isSubmitting}
                onClick={unassignDriver}
              >
                Unassign
              </Button>
            </Can>
            <Can permission="vehicles:assign">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  setDriver(null)
                  setIsEditing(true)
                }}
              >
                Change driver
              </Button>
            </Can>
          </div>
        </div>
      </Section>
    )
  }

  return (
    <Section
      icon={UserRoundPlus}
      title={vehicle.driver ? "Change driver" : "Assign a driver"}
      description={
        vehicle.driver
          ? `Replace ${vehicle.driver.full_name} on this vehicle`
          : "This vehicle has no driver yet"
      }
    >
      <Can
        permission="vehicles:assign"
        fallbackText="You don't have permission to assign drivers."
      >
        <div className="space-y-3">
          <div className="flex">
            <DriverPicker
              value={driver?.id}
              onSelected={(selected) => {
                if (selected)
                  setDriver({ ...selected, full_name: selected.full_name })
                else setDriver(null)
              }}
            />
          </div>
          <div className="flex gap-2">
            {vehicle.driver && (
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => {
                  setDriver(vehicle.driver)
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={() => assignDriver()}
              disabled={!driver || isSubmitting}
            >
              {isSubmitting ? "Assigning…" : "Assign driver"}
            </Button>
          </div>
        </div>
      </Can>
    </Section>
  )
}

/* ---------- Record ---------- */

function RecordPanel({ vehicle }: { vehicle: Vehicle }) {
  const { copyToClipboard } = useCopyToClipboard()

  return (
    <Section icon={CalendarClock} title="Record">
      <dl className="divide-y text-sm">
        <InfoRow
          label="Created"
          value={formatDateTime(vehicle.created_at) || "–"}
        />
        <InfoRow
          label="Last updated"
          value={formatDateTime(vehicle.updated_at) || "–"}
        />
        <InfoRow
          label="Vehicle ID"
          value={
            <button
              type="button"
              onClick={() => copyToClipboard(String(vehicle.id))}
              title="Copy vehicle ID"
              className="group inline-flex max-w-full items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              <span className="truncate">{vehicle.id}</span>
              <Copy className="size-3 shrink-0 opacity-60 group-hover:opacity-100" />
            </button>
          }
        />
      </dl>
    </Section>
  )
}

/* ---------- Building blocks ---------- */

function Section({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon: IconType
  title: string
  description?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm leading-8 font-semibold">{title}</h2>
            {description && (
              <p className="-mt-1 truncate text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {aside && <div className="shrink-0 pt-1.5">{aside}</div>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function SpecGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      <dl className="divide-y divide-dashed text-sm">{children}</dl>
    </div>
  )
}

function SpecRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{children}</dd>
    </div>
  )
}

function InfoRow({
  label,
  value,
  inset = false,
}: {
  label: string
  value: React.ReactNode
  /** Keep full padding on the first/last row (for bordered lists). */
  inset?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-2.5",
        !inset && "first:pt-0 last:pb-0"
      )}
    >
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  )
}

function ColorTile({ label, value }: { label: string; value: string }) {
  const { label: name, hex } = carColor(value)
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        aria-hidden
        className={cn(
          "size-10 shrink-0 rounded-md border shadow-inner",
          !hex &&
            "bg-[repeating-linear-gradient(45deg,var(--color-muted),var(--color-muted)_4px,transparent_4px,transparent_8px)]"
        )}
        style={hex ? { backgroundColor: hex } : undefined}
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value ? name : "–"}</p>
      </div>
    </div>
  )
}
