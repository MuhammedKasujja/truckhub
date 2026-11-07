import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  CalendarClock,
  Circle,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  RefreshCcw,
  Route as RouteIcon,
  Satellite,
  Search,
  Send,
  Truck,
  UserRound,
  X,
} from "lucide-react"
import type { ShipmentStatus } from "@/features/shipments/enums"
import type { Shipment } from "@/features/shipments/types"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { ModuleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Map, MapControls } from "@/components/ui/map"
import { Skeleton } from "@/components/ui/skeleton"
import { MAP_DARK_STYLE_URL, MAP_LIGHT_STYLE_URL } from "@/config/constants"
import { ShipmentStatusIndicator } from "@/features/shipments/components"
import { ShipmentDetailsDialog } from "@/features/shipments/components/shipment-details-dialog"
import { shipmentsActiveQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { formatDateTime, generateAvatorFallback } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_admin/live-map/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.prefetchQuery(shipmentsActiveQueryOptions(search)),
})

const REFRESH_INTERVAL_MS = 30_000
// Kampala, zoomed out to the wider region until trips carry coordinates
const DEFAULT_CENTER: [number, number] = [32.5825, 0.3476]

type StatusFilter =
  | "all"
  | Extract<ShipmentStatus, "in_progress" | "dispatched" | "delayed">

type TripRoute = { origin: string; checkpoints: string[]; destination: string }

const tripRoute = (shp: Shipment): TripRoute | null => {
  const item = shp.item as { route?: TripRoute | null }
  return item.route ?? null
}

const elapsedSince = (date?: Date | string) => {
  if (!date) return null
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 60_000)
  )
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

function RouteComponent() {
  const search = Route.useSearch()
  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    ...shipmentsActiveQueryOptions(search),
    refetchInterval: REFRESH_INTERVAL_MS,
  })
  const shipments = useMemo(() => data?.data ?? [], [data])

  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedId, setSelectedId] = useState<Shipment["id"]>()
  const [detailsOpen, setDetailsOpen] = useState(false)

  const counts = useMemo(
    () => ({
      all: shipments.length,
      in_progress: shipments.filter((s) => s.status === "in_progress").length,
      dispatched: shipments.filter((s) => s.status === "dispatched").length,
      delayed: shipments.filter((s) => s.status === "delayed").length,
    }),
    [shipments]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (
      shipments
        .filter((s) => statusFilter === "all" || s.status === statusFilter)
        .filter((s) => {
          if (!q) return true
          const route = tripRoute(s)
          return [
            s.number,
            s.driver?.fullname,
            s.vehicle?.plate_number,
            s.vehicle?.number,
            s.contact_name,
            route?.origin,
            route?.destination,
          ].some((v) => v?.toLowerCase().includes(q))
        })
        // Delayed trips first so problems surface
        .sort(
          (a, b) =>
            Number(b.status === "delayed") - Number(a.status === "delayed")
        )
    )
  }, [shipments, statusFilter, query])

  // Keep a valid selection as the list refreshes or filters change
  useEffect(() => {
    if (!visible.some((s) => s.id === selectedId)) {
      setSelectedId(visible.at(0)?.id)
    }
  }, [visible, selectedId])

  const selected = shipments.find((s) => s.id === selectedId)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Live map
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Trips on the road right now ·{" "}
            <UpdatedAgo timestamp={dataUpdatedAt} />
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw
              className={cn("size-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/shipments/active">
              <ModuleIcon module="Shipments" /> Shipments
            </Link>
          </Button>
        </div>
      </div>

      {/* Status tiles, which double as filters */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatusTile
          icon={Truck}
          label="On the road"
          hint="All active trips"
          count={counts.all}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <StatusTile
          icon={Navigation}
          label="In transit"
          hint="Moving to next stop"
          count={counts.in_progress}
          tone="info"
          active={statusFilter === "in_progress"}
          onClick={() => setStatusFilter("in_progress")}
        />
        <StatusTile
          icon={Send}
          label="Dispatched"
          hint="Waiting to start"
          count={counts.dispatched}
          tone="success"
          active={statusFilter === "dispatched"}
          onClick={() => setStatusFilter("dispatched")}
        />
        <StatusTile
          icon={AlertTriangle}
          label="Delayed"
          hint="Need attention"
          count={counts.delayed}
          tone="warning"
          active={statusFilter === "delayed"}
          onClick={() => setStatusFilter("delayed")}
        />
      </div>

      {/* Fleet list + map */}
      <div className="grid gap-4 lg:h-[calc(100vh-17rem)] lg:min-h-[560px] lg:grid-cols-[minmax(320px,380px)_1fr]">
        <Card className="flex max-h-[70vh] min-h-0 flex-col gap-0 overflow-hidden py-0 lg:max-h-none">
          <div className="space-y-2 border-b p-3">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search trip, driver, plate or place"
                aria-label="Search active trips"
              />
              {query && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <p className="px-1 text-xs text-muted-foreground tabular-nums">
              {visible.length} of {shipments.length} trips
              {statusFilter !== "all" && (
                <>
                  {" · "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setStatusFilter("all")}
                  >
                    Show all
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <Empty className="h-full">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Truck />
                  </EmptyMedia>
                  <EmptyTitle>
                    {shipments.length
                      ? "No matching trips"
                      : "No trips on the road"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {shipments.length
                      ? "Try a different search or status."
                      : "Dispatched and in-transit trips will show up here."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="divide-y">
                {visible.map((shp) => (
                  <TripRow
                    key={shp.id}
                    shipment={shp}
                    selected={shp.id === selectedId}
                    onSelect={() => setSelectedId(shp.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="relative h-[60vh] gap-0 overflow-hidden py-0 lg:h-auto">
          <Map
            center={DEFAULT_CENTER}
            zoom={6.5}
            styles={{ light: MAP_LIGHT_STYLE_URL, dark: MAP_DARK_STYLE_URL }}
          >
            <MapControls position="bottom-right" showZoom showFullscreen />
          </Map>

          {selected && (
            <SelectedTripPanel
              shipment={selected}
              onOpenDetails={() => setDetailsOpen(true)}
            />
          )}

          <div className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full border bg-background/90 px-2.5 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <Satellite className="size-3.5" />
            GPS tracking not connected
          </div>
        </Card>
      </div>

      <ShipmentDetailsDialog
        key={selected?.id}
        shipment={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 Components                                 */
/* -------------------------------------------------------------------------- */

type IconType = React.ComponentType<{ className?: string }>
type Tone = "info" | "success" | "warning"

const TONE_CLASSES: Record<Tone, string> = {
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

function StatusTile({
  icon: Icon,
  label,
  hint,
  count,
  tone,
  active,
  onClick,
}: {
  icon: IconType
  label: string
  hint: string
  count: number
  tone?: Tone
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-xs transition-colors hover:bg-muted/50",
        active && "border-primary ring-1 ring-primary",
        tone === "warning" && count > 0 && !active && "border-amber-500/40"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          tone ? TONE_CLASSES[tone] : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs text-muted-foreground">
          {label}
        </span>
        <span className="block text-2xl leading-tight font-bold tabular-nums">
          {count}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {hint}
        </span>
      </span>
    </button>
  )
}

function TripRow({
  shipment: shp,
  selected,
  onSelect,
}: {
  shipment: Shipment
  selected: boolean
  onSelect: () => void
}) {
  const route = tripRoute(shp)
  const elapsed = elapsedSince(shp.actual_start ?? shp.started_at)

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected}
        className={cn(
          "w-full space-y-2 border-l-4 border-l-transparent px-3 py-3 text-left transition-colors hover:bg-muted/50",
          shp.status === "delayed" && "border-l-amber-500",
          selected && "border-l-primary bg-primary/5 hover:bg-primary/10"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold">
            {shp.number ?? "Unnumbered trip"}
          </span>
          <ShipmentStatusIndicator status={shp.status} />
        </div>

        {route && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="truncate">{route.origin}</span>
            <RouteIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{route.destination}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserRound className="size-3.5" />
            {shp.driver?.fullname ?? "No driver"}
          </span>
          {shp.vehicle && (
            <span className="inline-flex items-center gap-1">
              <Truck className="size-3.5" />
              {shp.vehicle.plate_number || shp.vehicle.number}
            </span>
          )}
          {elapsed && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <CalendarClock className="size-3.5" />
              {elapsed} on road
            </span>
          )}
        </div>
      </button>
    </li>
  )
}

function SelectedTripPanel({
  shipment: shp,
  onOpenDetails,
}: {
  shipment: Shipment
  onOpenDetails: () => void
}) {
  const route = tripRoute(shp)
  const stops = route
    ? [route.origin, ...route.checkpoints, route.destination]
    : []
  const started = shp.actual_start ?? shp.started_at

  return (
    <div className="absolute inset-x-3 bottom-3 max-h-[calc(100%-4rem)] overflow-y-auto rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:top-3 sm:right-auto sm:bottom-auto sm:w-80">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Selected trip</p>
          <p className="truncate text-lg font-semibold">
            {shp.number ?? "Unnumbered trip"}
          </p>
        </div>
        <ShipmentStatusIndicator status={shp.status} />
      </div>

      {/* Driver & vehicle */}
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
          {shp.driver ? generateAvatorFallback(shp.driver.fullname) : "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {shp.driver?.fullname ?? "No driver assigned"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {shp.vehicle
              ? `${shp.vehicle.plate_number || shp.vehicle.number}`
              : "No vehicle"}
          </p>
        </div>
        {shp.driver?.phone && (
          <Button size="icon" variant="outline" className="size-8" asChild>
            <a
              href={`tel:${shp.driver.phone.replace(/\s/g, "")}`}
              aria-label={`Call ${shp.driver.fullname}`}
            >
              <Phone className="size-3.5" />
            </a>
          </Button>
        )}
      </div>

      {/* Route */}
      {stops.length > 0 && (
        <ol className="mt-4">
          {stops.map((stop, i) => {
            const isLast = i === stops.length - 1
            return (
              <li key={`${stop}-${i}`} className="flex gap-2.5">
                <div className="flex w-4 flex-col items-center pt-1 text-muted-foreground">
                  {isLast ? (
                    <MapPin className="size-3.5 text-destructive" />
                  ) : (
                    <Circle
                      className={cn(
                        i === 0
                          ? "size-3 fill-emerald-500 text-emerald-500"
                          : "mt-0.5 size-2"
                      )}
                    />
                  )}
                  {!isLast && <div className="my-0.5 w-px flex-1 bg-border" />}
                </div>
                <p className={cn("text-sm", !isLast && "pb-2.5")}>{stop}</p>
              </li>
            )
          })}
        </ol>
      )}

      <dl className="mt-3 space-y-1.5 border-t pt-3 text-xs">
        <InfoRow label="Started" value={formatDateTime(started) || "—"} />
        <InfoRow
          label="Scheduled end"
          value={formatDateTime(shp.item.scheduled_end) || "—"}
        />
        {shp.contact_name && (
          <InfoRow label="Contact" value={shp.contact_name} />
        )}
      </dl>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full"
        onClick={onOpenDetails}
      >
        Open trip details
      </Button>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{value}</dd>
    </div>
  )
}

function UpdatedAgo({ timestamp }: { timestamp: number }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  if (!timestamp) return <Loader2 className="inline size-3 animate-spin" />
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  return (
    <span className="tabular-nums">
      {seconds < 10
        ? "updated just now"
        : seconds < 60
          ? `updated ${seconds}s ago`
          : `updated ${Math.floor(seconds / 60)}m ago`}
    </span>
  )
}
