import { Link } from "@tanstack/react-router"
import { MapIcon, TruckIcon, UserIcon } from "lucide-react"
import { WidgetEmpty } from "./widget-empty"
import type { ShipmentStatus } from "@/features/shipments/enums"
import type { Shipment } from "@/features/shipments/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShipmentStatusIndicator } from "@/features/shipments/components"

const onRoadStatuses: ShipmentStatus[] = [
  "dispatched",
  "in_progress",
  "delayed",
]

/**
 * Compact "who is on the road right now" list with a jump-off to the full live map.
 * A live map needs streaming positions, which the full /live-map page already handles.
 */
export function LiveOperations({ shipments }: { shipments: Shipment[] }) {
  const onRoad = shipments
    .filter((s) => onRoadStatuses.includes(s.status))
    // delayed first so problems surface
    .sort(
      (a, b) => Number(b.status === "delayed") - Number(a.status === "delayed")
    )
    .slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>On the road</CardTitle>
        <CardDescription>Dispatched and in-progress trips</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to="/live-map">
              <MapIcon />
              Live map
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {onRoad.length ? (
          <ul className="flex flex-col divide-y">
            {onRoad.map((shipment) => (
              <li
                key={shipment.id.toString()}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <TruckIcon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {shipment.vehicle?.plate_number ?? shipment.number ?? "—"}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <UserIcon className="size-3" />
                    {shipment.driver?.full_name ?? "No driver"}
                  </p>
                </div>
                <ShipmentStatusIndicator status={shipment.status} />
              </li>
            ))}
          </ul>
        ) : (
          <WidgetEmpty>No vehicles on the road</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}
