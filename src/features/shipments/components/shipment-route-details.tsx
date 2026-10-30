import { Route } from "@/features/quotations/schemas"
import { Circle, MapPin } from "lucide-react"

export function ShimpmentRouteDetails({
  route,
}: {
  route: Route
}) {

  const stops = [
    { label: "Origin", name: route.origin },
    ...route.checkpoints.map((name, i) => ({
      label: `Checkpoint ${i + 1}`,
      name,
    })),
    { label: "Destination", name: route.destination },
  ]

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Route</p>
          <p className="text-sm text-muted-foreground">{stops.length} stops</p>
        </div>
      </div>
      <ol>
        {stops.map((s, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex w-5 flex-col items-center pt-1 text-muted-foreground">
              {i === stops.length - 1 ? (
                <MapPin className="size-4" />
              ) : (
                <Circle
                  className={
                    i === 0 ? "mt-0.5 size-3.5 fill-current" : "mt-1 size-2.5"
                  }
                />
              )}
              {i < stops.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-medium">{s.name}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}