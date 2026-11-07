import { MapPin, Package, Route as RouteIcon, Truck } from "lucide-react"
import type { LineItemResponse } from "../../schemas"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

const SOURCE_META = {
  service: {
    label: "Vehicle hire",
    icon: Truck,
    tile: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  route: {
    label: "Route haulage",
    icon: RouteIcon,
    tile: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  distance: {
    label: "Distance haulage",
    icon: Package,
    tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
} as const

export function QuotationLineItemCard({
  item,
  index,
}: {
  item: LineItemResponse
  index: number
}) {
  const meta = SOURCE_META[item.source]
  const Icon = meta.icon
  const discount = Number(item.discount ?? 0)

  const chips: string[] = [
    item.engine_mode === "wet" ? "Wet hire" : "Dry hire",
    item.with_driver ? "With driver" : "Self drive",
    item.is_round_trip ? "Round trip" : "One way",
  ]
  if (item.source === "service") {
    if (item.vehicle_year) chips.push(`Year ${item.vehicle_year}`)
    chips.push(...item.vehicle_addons.map((a) => a.name))
  } else {
    chips.push(`${item.tonnage} t`)
    chips.push(item.with_loaders ? "With loaders" : "No loaders")
    if (item.source === "distance") chips.push(`${item.distance_km} km`)
  }

  const stops = item.route.origin
    ? [item.route.origin, ...item.route.checkpoints, item.route.destination]
    : []

  return (
    <article className="rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            meta.tile
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {String(index + 1).padStart(2, "0")} · {meta.label}
              </p>
              <h3 className="truncate font-semibold">
                {item.display_name || meta.label}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums">
                {formatMoney(item.line_total)}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatMoney(item.unit_price)} × {item.quantity}
                {discount > 0 && (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {" "}
                    · −{formatMoney(discount)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, i) => (
              <span
                key={`${chip}-${i}`}
                className="rounded-full border bg-background px-2.5 py-0.5 text-xs"
              >
                {chip}
              </span>
            ))}
          </div>

          {stops.length > 0 && (
            <ol className="flex flex-wrap items-center gap-y-1 rounded-lg bg-muted/40 px-3 py-2 text-sm">
              {stops.map((stop, i) => {
                const isFirst = i === 0
                const isLast = i === stops.length - 1
                return (
                  <li key={`${stop}-${i}`} className="flex items-center">
                    {isLast ? (
                      <MapPin className="mr-1.5 size-3.5 text-destructive" />
                    ) : (
                      <span
                        className={cn(
                          "mr-1.5 size-2 rounded-full",
                          isFirst ? "bg-emerald-500" : "bg-muted-foreground"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        (isFirst || isLast) && "font-medium",
                        !isFirst && !isLast && "text-muted-foreground"
                      )}
                    >
                      {stop}
                    </span>
                    {!isLast && (
                      <span className="mx-2 h-px w-5 bg-[repeating-linear-gradient(90deg,var(--color-border)_0_4px,transparent_4px_7px)]" />
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </article>
  )
}
