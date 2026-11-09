import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import { IconReceiptTax, IconSend } from "@tabler/icons-react"
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowUpRight,
  Ban,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  FileCheck2,
  Flag,
  Fuel,
  Gauge,
  History,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Receipt,
  Route as RouteIcon,
  Truck,
  UserCheck,
  UserRound,
  UserRoundPlus,
  Wallet,
} from "lucide-react"
import {
  elapsedLabel,
  shipmentActions,
  shipmentBilling,
  tripRoute,
} from "../format"
import { useShipmentDetails } from "../hooks/use-shipment-details"
import { RecordShipmentDetailsDialog } from "./record-shipment-details-dialog"
import { DispatchShipmentDialog } from "./dispatch-shipment-dailog"
import { ShipmentAssignVehicleDialog } from "./shipment-assign-vehicle-dailog"
import { ShipmentAssignDriverDialog } from "./shipment-assign-driver-dailog"
import { EndShipmentDialog } from "./end-shipment-dailog copy"
import { ChangeShipmentVehicleDialog } from "./change-shipment-vehicle-dialog"
import { ShipmentHistoryTimeline } from "./shipment-history-timeline"
import { HUE } from "./shipment-hues"
import {
  SHIPMENT_STATUS_TONE,
  ShipmentStatusIndicator,
} from "./shipment-status-indicator"
import type { Hue } from "./shipment-hues"
import type { ShipmentStatus } from "../enums"
import type { Shipment } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { PlateNumber } from "@/features/vehicles/components/vehicle-visuals"
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  generateAvatorFallback,
} from "@/lib/format"
import { cn } from "@/lib/utils"

type ShipmentDialogProps = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

type ActionKey =
  | "dispatch"
  | "record"
  | "assign-vehicle"
  | "change-vehicle"
  | "assign-driver"
  | "end-shipment"

type IconType = React.ComponentType<{ className?: string }>

const TONE_HUE = {
  info: "blue",
  success: "emerald",
  warning: "amber",
  error: "red",
  default: "slate",
} as const satisfies Record<string, Hue>

const statusHue = (status: ShipmentStatus): Hue =>
  TONE_HUE[SHIPMENT_STATUS_TONE[status]]

export function ShipmentDetailsDialog({
  open,
  onOpenChange,
  ...rest
}: ShipmentDialogProps) {
  const [openModal, setOpenModal] = useState<ActionKey>()
  const { shipment } = useShipmentDetails(rest.shipment)
  const close = () => setOpenModal(undefined)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
          {shipment ? (
            <>
              <DetailsHeader shipment={shipment} onAction={setOpenModal} />
              <div className="flex-1 overflow-y-auto bg-muted/20">
                <StatusProgress status={shipment.status} />
                <div className="grid gap-5 p-5 lg:grid-cols-3">
                  <div className="space-y-5 lg:col-span-2">
                    <JourneySection shipment={shipment} />
                    <OdometerSection shipment={shipment} />
                    <BillingSection shipment={shipment} />
                  </div>
                  <div className="space-y-5">
                    <VehicleSection
                      shipment={shipment}
                      onAction={setOpenModal}
                    />
                    <DriverSection
                      shipment={shipment}
                      onAction={setOpenModal}
                    />
                    <Section icon={History} hue="slate" title="Activity">
                      <ShipmentHistoryTimeline
                        history={shipment.history ?? []}
                      />
                    </Section>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 p-6">
              <DialogTitle className="sr-only">Loading shipment</DialogTitle>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-12 w-full" />
              <div className="grid gap-5 lg:grid-cols-3">
                <Skeleton className="h-64 lg:col-span-2" />
                <Skeleton className="h-64" />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DispatchShipmentDialog
        shipment={shipment}
        open={openModal === "dispatch"}
        onOpenChange={close}
      />
      <ShipmentAssignVehicleDialog
        shipment={shipment}
        open={openModal === "assign-vehicle"}
        onOpenChange={close}
      />
      <ChangeShipmentVehicleDialog
        shipment={shipment}
        open={openModal === "change-vehicle"}
        onOpenChange={close}
      />
      <ShipmentAssignDriverDialog
        shipment={shipment}
        open={openModal === "assign-driver"}
        onOpenChange={close}
      />
      <RecordShipmentDetailsDialog
        shipment={shipment}
        open={openModal === "record"}
        onOpenChange={close}
      />
      <EndShipmentDialog
        shipment={shipment}
        open={openModal === "end-shipment"}
        onOpenChange={close}
      />
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

type ActionDef = { key: ActionKey; label: string; icon: IconType }

function availableActions(shipment: Shipment): ActionDef[] {
  const a = shipmentActions(shipment)
  const list: ActionDef[] = []
  if (a.assignVehicle)
    list.push({ key: "assign-vehicle", label: "Assign vehicle", icon: Truck })
  if (a.assignDriver)
    list.push({
      key: "assign-driver",
      label: "Assign driver",
      icon: UserRoundPlus,
    })
  if (a.dispatch)
    list.push({ key: "dispatch", label: "Dispatch", icon: IconSend })
  if (a.finish)
    list.push({ key: "end-shipment", label: "Finish trip", icon: Flag })
  if (a.capture)
    list.push({
      key: "record",
      label:
        shipment.status === "captured_details"
          ? "Edit trip details"
          : "Capture details",
      icon: IconReceiptTax,
    })
  if (a.changeVehicle)
    list.push({
      key: "change-vehicle",
      label: "Change vehicle",
      icon: ArrowLeftRight,
    })
  return list
}

function DetailsHeader({
  shipment,
  onAction,
}: {
  shipment: Shipment
  onAction: (key: ActionKey) => void
}) {
  const actions = availableActions(shipment)
  const primary = actions.at(0)
  const secondary = actions.slice(1)
  const { dispatchBlocked } = shipmentActions(shipment)
  const hue = HUE[statusHue(shipment.status)]

  const started = shipment.actual_start ?? shipment.started_at
  const billing = shipmentBilling(shipment)
  const quotedKm = (shipment.item as { distance_km?: number | null })
    .distance_km
  const distance = shipment.consumption?.distance_km

  return (
    <div className="relative shrink-0 overflow-hidden border-b">
      {/* status-tinted glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent",
          hue.glow
        )}
      />

      <DialogHeader className="relative flex-col gap-4 p-5 pr-12 text-left sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-xs ring-1 ring-foreground/5",
              hue.tile
            )}
          >
            <Truck className="size-7" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Shipment
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {shipment.number ?? "Unnumbered shipment"}
              </DialogTitle>
              <ShipmentStatusIndicator status={shipment.status} />
            </div>
            <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-medium text-foreground">
                {shipment.item.display_name ?? "Shipment"}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" />
                {formatDate(shipment.item.scheduled_start)} –{" "}
                {formatDate(shipment.item.scheduled_end)}
              </span>
            </DialogDescription>
            {dispatchBlocked && (
              <p className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-3.5" />
                Assign a vehicle and a driver before dispatching
              </p>
            )}
          </div>
        </div>

        {primary && (
          <div className="flex shrink-0 gap-2">
            <Button onClick={() => onAction(primary.key)} className="shadow-sm">
              <primary.icon className="size-4" />
              {primary.label}
            </Button>
            {secondary.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-background/70">
                    More
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  {secondary.map((action) => (
                    <DropdownMenuItem
                      key={action.key}
                      onClick={() => onAction(action.key)}
                    >
                      <action.icon className="size-4" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </DialogHeader>

      {/* Key numbers */}
      <div className="relative grid grid-cols-2 divide-x divide-y border-t bg-background/60 backdrop-blur md:grid-cols-4 md:divide-y-0">
        <HeroStat
          icon={RouteIcon}
          hue="blue"
          label={distance ? "Distance driven" : "Distance quoted"}
          value={
            distance
              ? `${formatNumber(distance)} km`
              : quotedKm
                ? `${quotedKm} km`
                : "—"
          }
        />
        <HeroStat
          icon={Clock}
          hue="violet"
          label={shipment.actual_end ? "Trip duration" : "Time on road"}
          value={elapsedLabel(started, shipment.actual_end) ?? "Not started"}
        />
        <HeroStat
          icon={Fuel}
          hue="amber"
          label="Fuel charge"
          value={
            billing.fuel.gt(0)
              ? formatMoney(billing.fuel.toString())
              : "Not captured"
          }
        />
        <HeroStat
          icon={Wallet}
          hue="emerald"
          label="Total before tax"
          value={formatMoney(billing.total.toString())}
        />
      </div>
    </div>
  )
}

function HeroStat({
  icon: Icon,
  hue,
  label,
  value,
}: {
  icon: IconType
  hue: Hue
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          HUE[hue].tile
        )}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-base font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Status progress                              */
/* -------------------------------------------------------------------------- */

const STEPS: { label: string; icon: IconType }[] = [
  { label: "Requested", icon: ClipboardList },
  { label: "Assigned", icon: UserCheck },
  { label: "Dispatched", icon: IconSend },
  { label: "In transit", icon: Navigation },
  { label: "Completed", icon: Flag },
  { label: "Captured", icon: IconReceiptTax },
  { label: "Invoiced", icon: FileCheck2 },
]

const STEP_INDEX: Record<ShipmentStatus, number> = {
  unassigned: 0,
  vehicle_assigned: 1,
  assigned: 1,
  dispatched: 2,
  in_progress: 3,
  delayed: 3,
  idel: 3,
  completed: 4,
  captured_details: 5,
  invoiced: 6,
  cancelled: -1,
}

function StatusProgress({ status }: { status: ShipmentStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 border-b bg-muted/50 px-5 py-3 text-sm text-muted-foreground">
        <Ban className="size-4" />
        This shipment was cancelled.
      </div>
    )
  }

  const current = STEP_INDEX[status]
  const isTrouble = status === "delayed" || status === "idel"

  return (
    <ol className="flex overflow-x-auto border-b bg-background px-5 py-4">
      {STEPS.map(({ label, icon: Icon }, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={label}
            className="flex min-w-[104px] flex-1 items-center"
            aria-current={active ? "step" : undefined}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active &&
                    (isTrouble
                      ? "border-amber-500 bg-amber-500 text-white ring-4 ring-amber-500/20"
                      : "border-primary bg-primary/10 text-primary ring-4 ring-primary/15"),
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </span>
              <span
                className={cn(
                  "text-[11px] whitespace-nowrap",
                  active
                    ? "font-semibold"
                    : done
                      ? "text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {active && isTrouble
                  ? status === "delayed"
                    ? "Delayed"
                    : "Idle"
                  : label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-1 mb-5 h-0.5 flex-1 rounded-full",
                  done ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Main sections                               */
/* -------------------------------------------------------------------------- */

// How far along the route the truck marker sits, by status
const JOURNEY_PROGRESS: Record<ShipmentStatus, number> = {
  unassigned: 0,
  vehicle_assigned: 0,
  assigned: 0,
  dispatched: 8,
  in_progress: 50,
  delayed: 50,
  idel: 50,
  completed: 100,
  captured_details: 100,
  invoiced: 100,
  cancelled: 0,
}

function JourneySection({ shipment }: { shipment: Shipment }) {
  const { item } = shipment
  const route = tripRoute(shipment)
  const started = shipment.actual_start ?? shipment.started_at
  const progress = JOURNEY_PROGRESS[shipment.status]
  const isTrouble = shipment.status === "delayed" || shipment.status === "idel"
  const tonnage = (item as { tonnage?: string | number | null }).tonnage

  const chips = [
    item.is_round_trip ? "Round trip" : "One way",
    item.item_type === "truck" ? "Truck" : "Small vehicle",
    `${item.engine_mode} hire`,
    item.with_driver ? "With driver" : "Without driver",
    item.with_loaders ? "With loaders" : null,
    tonnage ? `${tonnage} t` : null,
  ].filter(Boolean) as string[]

  return (
    <Section icon={RouteIcon} hue="blue" title="Journey">
      {route ? (
        <div className="rounded-xl border bg-gradient-to-b from-muted/40 to-background p-4">
          {/* Origin → destination track */}
          <div className="flex items-start justify-between gap-4">
            <Endpoint
              align="left"
              label="From"
              place={route.origin}
              time={started ? formatDateTime(started) : undefined}
              scheduled={formatDateTime(item.scheduled_start)}
            />
            <Endpoint
              align="right"
              label="To"
              place={route.destination}
              time={
                shipment.actual_end
                  ? formatDateTime(shipment.actual_end)
                  : undefined
              }
              scheduled={formatDateTime(item.scheduled_end)}
            />
          </div>

          <div className="relative mx-2 mt-5 mb-2 h-8">
            {/* track */}
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[repeating-linear-gradient(90deg,var(--color-border)_0_8px,transparent_8px_14px)]" />
            <div
              className={cn(
                "absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full",
                isTrouble ? "bg-amber-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
            {/* endpoints */}
            <span className="absolute top-1/2 left-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-emerald-500 shadow" />
            <MapPin className="absolute top-1/2 right-0 size-5 translate-x-1/2 -translate-y-[85%] fill-destructive/20 text-destructive" />
            {/* checkpoints */}
            {route.checkpoints.map((stop, i) => (
              <span
                key={`${stop}-${i}`}
                title={stop}
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-muted-foreground"
                style={{
                  left: `${((i + 1) / (route.checkpoints.length + 1)) * 100}%`,
                }}
              />
            ))}
            {/* truck */}
            <span
              className={cn(
                "absolute top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background text-white shadow-md transition-[left]",
                isTrouble ? "bg-amber-500" : "bg-primary"
              )}
              style={{ left: `${progress}%` }}
            >
              <Truck className="size-4" />
            </span>
          </div>

          {route.checkpoints.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Via</span>
              {route.checkpoints.map((stop, i) => (
                <span
                  key={`${stop}-${i}`}
                  className="rounded-full border bg-background px-2 py-0.5"
                >
                  {stop}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No route on this shipment.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border bg-background px-2.5 py-0.5 text-xs capitalize"
          >
            {chip}
          </span>
        ))}
      </div>

      {shipment.contact_name && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <UserRound className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">On-site contact</span>
          <span className="font-medium">{shipment.contact_name}</span>
        </div>
      )}
    </Section>
  )
}

function Endpoint({
  align,
  label,
  place,
  time,
  scheduled,
}: {
  align: "left" | "right"
  label: string
  place: string
  time?: string
  scheduled: string
}) {
  return (
    <div
      className={cn("max-w-[48%] min-w-0", align === "right" && "text-right")}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-base font-semibold" title={place}>
        {place || "—"}
      </p>
      <p className="text-xs text-muted-foreground">
        {time ? (
          <span className="text-foreground">{time}</span>
        ) : (
          <>Planned {scheduled || "—"}</>
        )}
      </p>
    </div>
  )
}

function OdometerSection({ shipment }: { shipment: Shipment }) {
  const c = shipment.consumption
  if (!c) return null

  return (
    <Section icon={Gauge} hue="violet" title="Odometer & fuel">
      <div className="flex items-center gap-3">
        <Reading label="Start" value={c.start_mileage} />
        <div className="flex flex-1 flex-col items-center gap-1">
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 tabular-nums dark:text-violet-300">
            {formatNumber(c.distance_km, { fallback: "—" })} km
          </span>
          <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-violet-500/10 via-violet-500/50 to-violet-500/10" />
        </div>
        <Reading label="End" value={c.end_mileage} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          icon={Gauge}
          label="Economy"
          value={`${formatNumber(shipment.vehicle?.fuel_consumption_rate, { fallback: "—" })} km/L`}
        />
        <MiniStat
          icon={Fuel}
          label="Fuel used"
          value={`${formatNumber(c.fuel_used_litres, { fallback: "—" })} L`}
        />
        <MiniStat
          icon={Receipt}
          label="Avg. price"
          value={c.fuel_rate ? `${formatMoney(c.fuel_rate)} / L` : "—"}
        />
        <MiniStat
          icon={Wallet}
          label="Fuel charge"
          value={formatMoney(c.total_fuel_charge ?? 0)}
          strong
        />
      </div>
    </Section>
  )
}

function BillingSection({ shipment }: { shipment: Shipment }) {
  const b = shipmentBilling(shipment)
  return (
    <Section icon={Receipt} hue="emerald" title="Billing preview">
      <div className="overflow-hidden rounded-xl border bg-background">
        <dl className="space-y-3 p-4 text-sm">
          <BillLine
            label={`Unit price × ${b.days} day${b.days === 1 ? "" : "s"}`}
            hint={formatMoney(b.unitPrice.toString())}
            value={formatMoney(b.base.toString())}
          />
          <BillLine
            label="Fuel charge"
            value={
              b.fuel.gt(0) ? formatMoney(b.fuel.toString()) : "Not captured"
            }
            muted={!b.fuel.gt(0)}
          />
          {b.discount.gt(0) && (
            <BillLine
              label="Discount"
              value={`− ${formatMoney(b.discount.toString())}`}
              className="text-emerald-700 dark:text-emerald-400"
            />
          )}
        </dl>
        <div className="flex items-center justify-between border-t border-dashed bg-emerald-500/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Total before tax</p>
            <p className="text-xs text-muted-foreground">
              Tax and loading fees are added on the invoice
            </p>
          </div>
          <p className="text-xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
            {formatMoney(b.total.toString())}
          </p>
        </div>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Side sections                               */
/* -------------------------------------------------------------------------- */

function VehicleSection({
  shipment,
  onAction,
}: {
  shipment: Shipment
  onAction: (key: ActionKey) => void
}) {
  const { vehicle } = shipment
  const a = shipmentActions(shipment)

  return (
    <Section icon={Truck} hue="blue" title="Vehicle">
      {vehicle ? (
        <div className="space-y-3">
          <Link
            to="/vehicles/$vehicleId/view"
            params={{ vehicleId: vehicle.id }}
            className="group block overflow-hidden rounded-xl border bg-gradient-to-br from-blue-500/10 via-background to-background p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-2">
              <PlateNumber value={vehicle.plate_number} size="lg" />
              <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-3 font-medium">{vehicle.number}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-background/80 px-2 py-1.5 ring-1 ring-border">
                <p className="text-muted-foreground">Year</p>
                <p className="font-medium tabular-nums">
                  {vehicle.vehicle_year || "—"}
                </p>
              </div>
              <div className="rounded-md bg-background/80 px-2 py-1.5 ring-1 ring-border">
                <p className="text-muted-foreground">Economy</p>
                <p className="font-medium tabular-nums">
                  {formatNumber(vehicle.fuel_consumption_rate, {
                    fallback: "—",
                  })}{" "}
                  km/L
                </p>
              </div>
            </div>
          </Link>
          {a.changeVehicle && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onAction("change-vehicle")}
            >
              <ArrowLeftRight className="size-3.5" />
              Change vehicle
            </Button>
          )}
        </div>
      ) : (
        <EmptySlot
          icon={Truck}
          text="No vehicle assigned"
          actionLabel={a.assignVehicle ? "Assign vehicle" : undefined}
          onAction={() => onAction("assign-vehicle")}
        />
      )}
    </Section>
  )
}

function DriverSection({
  shipment,
  onAction,
}: {
  shipment: Shipment
  onAction: (key: ActionKey) => void
}) {
  const { driver } = shipment
  const a = shipmentActions(shipment)

  return (
    <Section icon={UserRound} hue="violet" title="Driver">
      {driver ? (
        <div className="space-y-3">
          <Link
            to="/drivers/$driverId/view"
            params={{ driverId: driver.id }}
            className="group flex items-center gap-3 rounded-xl border bg-gradient-to-br from-violet-500/10 via-background to-background p-3 transition-colors hover:border-primary/40"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-700 uppercase ring-2 ring-background dark:text-violet-300">
              {generateAvatorFallback(driver.full_name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {driver.full_name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {driver.number}
              </span>
            </span>
            <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <div className="grid grid-cols-2 gap-2">
            {driver.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${driver.phone.replace(/\s/g, "")}`}>
                  <Phone className="size-3.5" />
                  Call
                </a>
              </Button>
            )}
            {driver.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${driver.email}`}>
                  <Mail className="size-3.5" />
                  Email
                </a>
              </Button>
            )}
          </div>
          {driver.phone && (
            <p className="text-center text-xs text-muted-foreground tabular-nums">
              {driver.phone}
            </p>
          )}
        </div>
      ) : (
        <EmptySlot
          icon={UserRound}
          text="No driver assigned"
          actionLabel={a.assignDriver ? "Assign driver" : undefined}
          onAction={() => onAction("assign-driver")}
        />
      )}
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Primitives                                */
/* -------------------------------------------------------------------------- */

function Section({
  icon: Icon,
  hue,
  title,
  children,
}: {
  icon: IconType
  hue: Hue
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-xs">
      <h3 className="mb-4 flex items-center gap-2.5 text-sm font-semibold">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg",
            HUE[hue].tile
          )}
        >
          <Icon className="size-4" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Reading({
  label,
  value,
}: {
  label: string
  value: string | undefined
}) {
  return (
    <div className="text-center">
      <p className="rounded-lg bg-foreground px-3 py-2 font-mono text-lg font-semibold tracking-widest text-background tabular-nums shadow-inner">
        {formatNumber(value, { fallback: "——" })}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{label} (km)</p>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  strong = false,
}: {
  icon: IconType
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background px-3 py-2.5",
        strong && "border-violet-500/30 bg-violet-500/5"
      )}
    >
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm font-medium tabular-nums",
          strong && "font-semibold text-violet-700 dark:text-violet-300"
        )}
      >
        {value}
      </p>
    </div>
  )
}

function BillLine({
  label,
  value,
  hint,
  muted = false,
  className,
}: {
  label: string
  value: string
  hint?: string
  muted?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt className={cn(!className && "text-muted-foreground")}>
        {label}
        {hint && <span className="ml-1.5 text-xs opacity-80">({hint})</span>}
      </dt>
      <dd
        className={cn(
          "font-medium tabular-nums",
          muted && "font-normal text-muted-foreground"
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function EmptySlot({
  icon: Icon,
  text,
  actionLabel,
  onAction,
}: {
  icon: IconType
  text: string
  actionLabel?: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/30 p-5 text-center text-sm text-muted-foreground">
      <span className="flex size-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
        <Icon className="size-5" />
      </span>
      {text}
      {actionLabel && (
        <Button size="sm" onClick={onAction}>
          <Plus className="size-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
