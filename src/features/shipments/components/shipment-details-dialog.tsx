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
  Flag,
  Gauge,
  History,
  Mail,
  Phone,
  Plus,
  Receipt,
  Route as RouteIcon,
  Truck,
  UserRound,
  UserRoundPlus,
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
import { ShimpmentRouteDetails } from "./shipment-route-details"
import { ShipmentHistoryTimeline } from "./shipment-history-timeline"
import { ShipmentStatusIndicator } from "./shipment-status-indicator"
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
              <div className="flex-1 overflow-y-auto">
                <StatusProgress status={shipment.status} />
                <div className="grid gap-5 p-5 lg:grid-cols-3">
                  <div className="space-y-5 lg:col-span-2">
                    <TripSection shipment={shipment} />
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
                    <Section icon={History} title="Activity">
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
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
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

  return (
    <DialogHeader className="flex-col gap-4 border-b p-5 pr-12 text-left sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Truck className="size-6" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {shipment.number ?? "Unnumbered shipment"}
            </DialogTitle>
            <ShipmentStatusIndicator status={shipment.status} />
          </div>
          <DialogDescription>
            {shipment.item.display_name ?? "Shipment"} · Scheduled{" "}
            {formatDate(shipment.item.scheduled_start)}
            {shipment.item.scheduled_end && (
              <> – {formatDate(shipment.item.scheduled_end)}</>
            )}
          </DialogDescription>
          {dispatchBlocked && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3.5" />
              Assign a vehicle and a driver before dispatching
            </p>
          )}
        </div>
      </div>

      {primary && (
        <div className="flex shrink-0 gap-2">
          <Button onClick={() => onAction(primary.key)}>
            <primary.icon className="size-4" />
            {primary.label}
          </Button>
          {secondary.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
  )
}

/* -------------------------------------------------------------------------- */
/*                               Status progress                              */
/* -------------------------------------------------------------------------- */

const STEPS = [
  "Requested",
  "Assigned",
  "Dispatched",
  "In transit",
  "Completed",
  "Captured",
  "Invoiced",
] as const

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
      <div className="flex items-center gap-2 border-b bg-muted/40 px-5 py-3 text-sm text-muted-foreground">
        <Ban className="size-4" />
        This shipment was cancelled.
      </div>
    )
  }

  const current = STEP_INDEX[status]
  const isTrouble = status === "delayed" || status === "idel"

  return (
    <ol className="flex overflow-x-auto border-b bg-muted/30 px-5 py-3">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li
            key={label}
            className="flex min-w-[96px] flex-1 items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                done && "border-primary bg-primary text-primary-foreground",
                active &&
                  (isTrouble
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-primary bg-primary/15 text-primary"),
                !done && !active && "text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "truncate text-xs",
                active ? "font-medium" : "text-muted-foreground"
              )}
            >
              {active && isTrouble
                ? status === "delayed"
                  ? "Delayed"
                  : "Idle"
                : label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-px min-w-3 flex-1",
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

function TripSection({ shipment }: { shipment: Shipment }) {
  const { item } = shipment
  const started = shipment.actual_start ?? shipment.started_at
  const duration = elapsedLabel(started, shipment.actual_end)
  const tonnage = (item as { tonnage?: string | number | null }).tonnage
  const distanceKm = (item as { distance_km?: number | null }).distance_km

  const chips = [
    item.is_round_trip ? "Round trip" : "One way",
    item.item_type === "truck" ? "Truck" : "Small vehicle",
    `${item.engine_mode} hire`,
    item.with_driver ? "With driver" : "Without driver",
    item.with_loaders ? "With loaders" : null,
    tonnage ? `${tonnage} t` : null,
    distanceKm ? `${distanceKm} km quoted` : null,
  ].filter(Boolean) as string[]

  return (
    <Section icon={RouteIcon} title="Trip">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <TimeBlock
            icon={CalendarClock}
            label="Scheduled"
            from={formatDateTime(item.scheduled_start)}
            to={formatDateTime(item.scheduled_end)}
          />
          <TimeBlock
            icon={Flag}
            label="Actual"
            from={started ? formatDateTime(started) : "Not started"}
            to={
              started
                ? shipment.actual_end
                  ? formatDateTime(shipment.actual_end)
                  : "On going"
                : undefined
            }
            hint={
              duration
                ? `${duration}${shipment.actual_end ? "" : " so far"}`
                : undefined
            }
          />
          {shipment.contact_name && (
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">On-site contact</p>
              <p className="font-medium">{shipment.contact_name}</p>
            </div>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <ShimpmentRouteDetails route={tripRoute(shipment)} />
        </div>
      </div>
    </Section>
  )
}

function OdometerSection({ shipment }: { shipment: Shipment }) {
  const c = shipment.consumption
  if (!c) return null

  return (
    <Section icon={Gauge} title="Odometer & fuel">
      <div className="flex items-center gap-3">
        <Reading label="Start" value={c.start_mileage} />
        <div className="h-px flex-1 bg-border" />
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary tabular-nums">
          {formatNumber(c.distance_km, { fallback: "—" })} km
        </span>
        <div className="h-px flex-1 bg-border" />
        <Reading label="End" value={c.end_mileage} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          label="Economy"
          value={`${formatNumber(shipment.vehicle?.fuel_consumption_rate, { fallback: "—" })} km/L`}
        />
        <MiniStat
          label="Fuel used"
          value={`${formatNumber(c.fuel_used_litres, { fallback: "—" })} L`}
        />
        <MiniStat
          label="Avg. price"
          value={c.fuel_rate ? `${formatMoney(c.fuel_rate)} / L` : "—"}
        />
        <MiniStat
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
    <Section icon={Receipt} title="Billing preview">
      <dl className="space-y-2 text-sm">
        <BillLine
          label={`Unit price × ${b.days} day${b.days === 1 ? "" : "s"}`}
          hint={formatMoney(b.unitPrice.toString())}
          value={formatMoney(b.base.toString())}
        />
        <BillLine
          label="Fuel charge"
          value={b.fuel.gt(0) ? formatMoney(b.fuel.toString()) : "Not captured"}
          muted={!b.fuel.gt(0)}
        />
        {b.discount.gt(0) && (
          <BillLine
            label="Discount"
            value={`− ${formatMoney(b.discount.toString())}`}
          />
        )}
        <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5">
          <dt className="font-medium text-primary">Total before tax</dt>
          <dd className="text-lg font-bold text-primary tabular-nums">
            {formatMoney(b.total.toString())}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">
        Tax and loading fees are added on the invoice.
      </p>
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
    <Section icon={Truck} title="Vehicle">
      {vehicle ? (
        <div className="space-y-3">
          <Link
            to="/vehicles/$vehicleId/view"
            params={{ vehicleId: vehicle.id }}
            className="group -m-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
          >
            <span className="rounded-md border-2 border-foreground/80 bg-amber-300 px-2 py-0.5 font-mono text-sm font-bold text-black">
              {vehicle.plate_number}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-medium">
                {vehicle.number}
              </span>
              <span className="block text-xs text-muted-foreground">
                {vehicle.vehicle_year} ·{" "}
                {formatNumber(vehicle.fuel_consumption_rate, { fallback: "—" })}{" "}
                km/L
              </span>
            </span>
            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
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
    <Section icon={UserRound} title="Driver">
      {driver ? (
        <div className="space-y-3">
          <Link
            to="/drivers/$driverId/view"
            params={{ driverId: driver.id }}
            className="group -m-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
              {generateAvatorFallback(driver.fullname)}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-medium">
                {driver.fullname}
              </span>
              <span className="block text-xs text-muted-foreground">
                {driver.number}
              </span>
            </span>
            <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <div className="space-y-1">
            {driver.phone && (
              <ContactLink
                icon={Phone}
                href={`tel:${driver.phone.replace(/\s/g, "")}`}
                value={driver.phone}
              />
            )}
            {driver.email && (
              <ContactLink
                icon={Mail}
                href={`mailto:${driver.email}`}
                value={driver.email}
              />
            )}
          </div>
        </div>
      ) : (
        <EmptySlot
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
  title,
  children,
}: {
  icon: IconType
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function TimeBlock({
  icon: Icon,
  label,
  from,
  to,
  hint,
}: {
  icon: IconType
  label: string
  from: string
  to?: string
  hint?: string
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-3 text-sm">
      <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
        {hint && <span className="ml-auto tabular-nums">{hint}</span>}
      </p>
      <p>{from || "—"}</p>
      {to !== undefined && (
        <p className="text-muted-foreground">→ {to || "—"}</p>
      )}
    </div>
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
      <p className="rounded-md border bg-background px-3 py-1.5 font-mono text-lg font-semibold tabular-nums">
        {formatNumber(value, { fallback: "—" })}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label} (km)</p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "truncate text-sm tabular-nums",
          strong && "font-semibold text-primary"
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
}: {
  label: string
  value: string
  hint?: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">
        {label}
        {hint && <span className="ml-1.5 text-xs">({hint})</span>}
      </dt>
      <dd className={cn("tabular-nums", muted && "text-muted-foreground")}>
        {value}
      </dd>
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
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </a>
  )
}

function EmptySlot({
  text,
  actionLabel,
  onAction,
}: {
  text: string
  actionLabel?: string
  onAction: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
      {text}
      {actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction}>
          <Plus className="size-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
