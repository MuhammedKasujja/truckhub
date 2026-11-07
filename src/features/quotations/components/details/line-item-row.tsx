import { MapPin, Package, Route as RouteIcon, Truck } from "lucide-react"
import type { MouseEventHandler } from "react"
import type React from "react"
import type { LineItemResponse, Route } from "../../schemas"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  item: LineItemResponse
  idx: number
  actions?: React.ReactNode
  onClick?: MouseEventHandler<HTMLTableRowElement>
}

const SOURCE_META = {
  service: { label: "Vehicle hire", icon: Truck },
  route: { label: "Route haulage", icon: RouteIcon },
  distance: { label: "Distance haulage", icon: Package },
} as const

export function LineItemRow({ item, idx, actions, onClick }: Props) {
  const meta = SOURCE_META[item.source]
  const Icon = meta.icon
  const discount = Number(item.discount ?? 0)

  const chips: string[] = [
    item.engine_mode === "wet" ? "Wet hire" : "Dry hire",
    item.with_driver ? "With driver" : "Self drive",
  ]
  if (item.is_round_trip) chips.push("Round trip")
  if (item.source === "service") {
    if (item.vehicle_year) chips.push(`Year ${item.vehicle_year}`)
  } else {
    if (item.source === "distance") chips.push(`${item.distance_km} km`)
    chips.push(`${item.tonnage} t`)
    chips.push(item.with_loaders ? "With loaders" : "No loaders")
  }

  return (
    <tr
      className={cn(
        "border-b align-top transition-colors last:border-0 hover:bg-muted/40",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <td className="py-4 pr-3 text-xs text-muted-foreground tabular-nums">
        {String(idx + 1).padStart(2, "0")}
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 space-y-2">
            <div>
              <p className="font-medium text-foreground">
                {item.display_name || meta.label}
              </p>
              <p className="text-xs text-muted-foreground">{meta.label}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((chip, i) => (
                <span
                  key={`${chip}-${i}`}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
            <RouteStops route={item.route} />
          </div>
        </div>
      </td>
      <td className="px-3 py-4 text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
        {formatMoney(item.unit_price)}
      </td>
      <td className="px-3 py-4 text-right text-sm text-muted-foreground tabular-nums">
        ×{item.quantity}
      </td>
      <td className="py-4 pl-3 text-right whitespace-nowrap">
        <p className="font-semibold text-foreground tabular-nums">
          {formatMoney(item.line_total)}
        </p>
        {discount > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            −{formatMoney(discount)} discount
          </p>
        )}
      </td>
      {actions && (
        <td className="py-4 pl-3 text-right whitespace-nowrap">{actions}</td>
      )}
    </tr>
  )
}

function RouteStops({ route }: { route: Route | undefined }) {
  if (!route?.origin) return null
  const stops = [route.origin, ...route.checkpoints, route.destination].filter(
    Boolean
  )

  return (
    <ol className="flex flex-wrap items-center gap-y-1 text-xs text-muted-foreground">
      {stops.map((stop, i) => {
        const isLast = i === stops.length - 1
        return (
          <li key={`${stop}-${i}`} className="flex items-center">
            {isLast ? (
              <MapPin className="mr-1 size-3" />
            ) : (
              <span className="mr-1.5 size-1.5 rounded-full bg-muted-foreground/60" />
            )}
            <span
              className={cn(
                (i === 0 || isLast) && "font-medium text-foreground"
              )}
            >
              {stop}
            </span>
            {!isLast && <span className="mx-2 h-px w-4 bg-border" />}
          </li>
        )
      })}
    </ol>
  )
}
