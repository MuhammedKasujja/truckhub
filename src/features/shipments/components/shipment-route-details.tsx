import { Circle, MapPin } from "lucide-react"
import type { TripRoute } from "../format"
import { cn } from "@/lib/utils"

export function ShimpmentRouteDetails({
  route,
  className,
}: {
  route: TripRoute | null | undefined
  className?: string
}) {
  if (!route) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No route on this shipment.
      </p>
    )
  }

  const stops = [
    { label: "Origin", name: route.origin },
    ...route.checkpoints.map((name, i) => ({
      label: `Stop ${i + 1}`,
      name,
    })),
    { label: "Destination", name: route.destination },
  ]

  return (
    <ol className={className}>
      {stops.map((stop, i) => {
        const isFirst = i === 0
        const isLast = i === stops.length - 1
        return (
          <li key={`${stop.label}-${i}`} className="flex gap-3">
            <div className="flex w-4 flex-col items-center pt-1">
              {isLast ? (
                <MapPin className="size-4 text-destructive" />
              ) : (
                <Circle
                  className={cn(
                    isFirst
                      ? "size-3.5 fill-emerald-500 text-emerald-500"
                      : "mt-0.5 size-2.5 text-muted-foreground"
                  )}
                />
              )}
              {!isLast && <div className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("min-w-0", !isLast && "pb-4")}>
              <p className="text-xs text-muted-foreground">{stop.label}</p>
              <p className="text-sm font-medium">{stop.name || "—"}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
