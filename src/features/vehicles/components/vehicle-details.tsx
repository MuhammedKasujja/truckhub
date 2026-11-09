"use client"

import React from "react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  CalendarClock,
  CheckCircle2,
  Cog,
  Fingerprint,
  Fuel,
  Gauge,
  Mail,
  Package,
  Palette,
  Phone,
  UserRoundPlus,
  Users,
} from "lucide-react"
import { vehicleAssignDriverFn } from "../services"
import { engineLabel, humanize, vehicleName } from "../format"
import { VehicleStatusIndicator } from "./vehicle-status-indicator"
import { ColorValue, PlateNumber, VehicleIconTile } from "./vehicle-visuals"
import type { Vehicle, VehicleDriver } from "../types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { PageBackButton } from "@/components/page-header"
import { DriverPicker } from "@/features/drivers/components"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatNumber, generateAvatorFallback } from "@/lib/format"

type VehicleDetailsProps = {
  vehicle: Vehicle
}

const dateTime = (value: Date | string | undefined) =>
  value ? new Date(value).toLocaleString() : "-"

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const isTruck = vehicle.category.is_truck

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="-ml-2 pt-1">
              <PageBackButton />
            </div>
            <VehicleIconTile isTruck={isTruck} size="lg" />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {vehicleName(vehicle)}
                </h1>
                <VehicleStatusIndicator status={vehicle.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {vehicle.number} · {vehicle.category.name} · {vehicle.year}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <PlateNumber value={vehicle.plate_number} size="lg" />
                {vehicle.second_plate_number && (
                  <PlateNumber value={vehicle.second_plate_number} size="lg" />
                )}
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

        {/* Key metrics */}
        <div className="grid grid-cols-2 divide-x divide-y border-t bg-muted/30 md:grid-cols-4 md:divide-y-0">
          <Stat
            icon={Gauge}
            label="Engine capacity"
            value={formatNumber(vehicle.tank_capacity)}
            unit="cc"
          />
          <Stat
            icon={Fuel}
            label="Fuel economy"
            value={formatNumber(vehicle.fuel_consumption_rate)}
            unit="km/L"
          />
          {isTruck ? (
            <Stat
              icon={Package}
              label="Tonnage capacity"
              value={
                vehicle.tonnage_capacity != null
                  ? formatNumber(vehicle.tonnage_capacity)
                  : "-"
              }
              unit={vehicle.tonnage_capacity != null ? "t" : undefined}
            />
          ) : (
            <Stat icon={Users} label="Seats" value={vehicle.seats ?? "-"} />
          )}
          <Stat
            icon={Cog}
            label="Cylinders"
            value={vehicle.cylinders ?? "-"}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>
                Identification, powertrain and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SpecGroup icon={Fingerprint} title="Identification">
                <DetailItem label="Vehicle number" value={vehicle.number} />
                <DetailItem
                  label="Plate number"
                  value={<span className="font-mono">{vehicle.plate_number}</span>}
                />
                {isTruck && (
                  <DetailItem
                    label="Second plate"
                    value={
                      vehicle.second_plate_number ? (
                        <span className="font-mono">
                          {vehicle.second_plate_number}
                        </span>
                      ) : (
                        "-"
                      )
                    }
                  />
                )}
                <DetailItem label="Make" value={vehicle.car_model.car_brand.name} />
                <DetailItem label="Model" value={vehicle.car_model.name} />
                <DetailItem label="Type" value={vehicle.category.name} />
                <DetailItem label="Year" value={vehicle.year} />
              </SpecGroup>

              <SpecGroup icon={Cog} title="Powertrain">
                <DetailItem
                  label="Engine type"
                  value={engineLabel(vehicle.engine_type)}
                />
                <DetailItem
                  label="Transmission"
                  value={humanize(vehicle.gearbox)}
                />
                <DetailItem label="Drive train" value={vehicle.drive_train.name} />
                <DetailItem label="Axles" value={vehicle.total_axles ?? "-"} />
              </SpecGroup>

              <SpecGroup icon={Palette} title="Appearance">
                <DetailItem
                  label="Exterior color"
                  value={<ColorValue name={vehicle.color} />}
                />
                <DetailItem
                  label="Interior color"
                  value={<ColorValue name={vehicle.interior_color} />}
                />
                {isTruck && (
                  <DetailItem label="Seats" value={vehicle.seats ?? "-"} />
                )}
              </SpecGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                {vehicle.features.length
                  ? `${vehicle.features.length} equipped`
                  : "No features recorded for this vehicle"}
              </CardDescription>
            </CardHeader>
            {vehicle.features.length > 0 && (
              <CardContent className="flex flex-wrap gap-2">
                {vehicle.features.map((feat) => (
                  <Badge
                    key={feat.id}
                    variant="secondary"
                    className="gap-1.5 py-1 font-normal capitalize"
                  >
                    <CheckCircle2 className="text-primary" aria-hidden />
                    {feat.name}
                  </Badge>
                ))}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <DriverPanel vehicle={vehicle} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarClock className="size-4 text-muted-foreground" />
                Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <RecordRow label="Created" value={dateTime(vehicle.created_at)} />
                <RecordRow label="Last updated" value={dateTime(vehicle.updated_at)} />
                <RecordRow
                  label="Vehicle ID"
                  value={
                    <span className="font-mono text-xs break-all">{vehicle.id}</span>
                  }
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
      queryInvalidator.vehicles.details(vehicle.id).invalidate()
      queryInvalidator.drivers.details(driver.id).invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  if (vehicle.driver && !isEditing) {
    const d = vehicle.driver
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assigned driver</CardTitle>
          <CardAction>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDriver(null)
                setIsEditing(true)
              }}
            >
              Change
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarFallback>{generateAvatorFallback(d.full_name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium capitalize">{d.full_name}</p>
              <p className="text-xs text-muted-foreground">{d.number}</p>
            </div>
          </div>
          <div className="space-y-1 rounded-lg border bg-muted/30 p-1">
            <ContactLink
              icon={Phone}
              href={`tel:${d.phone.replace(/\s/g, "")}`}
              value={d.phone}
            />
            {d.email && (
              <ContactLink icon={Mail} href={`mailto:${d.email}`} value={d.email} />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRoundPlus className="size-4 text-muted-foreground" />
          {vehicle.driver ? "Change driver" : "Assign driver"}
        </CardTitle>
        <CardDescription>
          {vehicle.driver
            ? `Replace ${vehicle.driver.full_name} on this vehicle`
            : "This vehicle has no driver yet"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex">
        <DriverPicker
          value={driver?.id}
          onSelected={(selected) => {
            if (selected) setDriver({ ...selected, name: selected.fullname })
            else setDriver(null)
          }}
        />
      </CardContent>
      <CardFooter className="gap-2">
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
          {isSubmitting ? "Assigning…" : "Assign"}
        </Button>
      </CardFooter>
    </Card>
  )
}

/* ---------- Small pieces ---------- */

type IconType = React.ComponentType<{ className?: string }>

function Stat({
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
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tabular-nums">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

function SpecGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: IconType
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {title}
      </h3>
      <dl className="grid gap-x-6 gap-y-4 rounded-lg border p-4 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </dl>
    </section>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium wrap-break-word">{value}</dd>
    </div>
  )
}

function RecordRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right">{value}</dd>
    </div>
  )
}

function ContactLink({
  icon: Icon,
  href,
  value,
}: {
  icon: IconType
  href: string
  value: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-background"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </a>
  )
}
