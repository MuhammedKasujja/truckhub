import { Link } from "@tanstack/react-router"
import { WidgetEmpty } from "./widget-empty"
import type { ShipmentStatus } from "@/features/shipments/enums"
import type { DashboardStatistics } from "../types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/i18n"

type Stage = {
  status: ShipmentStatus
  color: string
  to: "/shipments/requests" | "/shipments/confirmed" | "/shipments/active"
}

/** Ordered by how a shipment moves through the operation. */
const stages: Stage[] = [
  { status: "unassigned", color: "var(--warning)", to: "/shipments/requests" },
  { status: "assigned", color: "var(--info)", to: "/shipments/confirmed" },
  {
    status: "vehicle_assigned",
    color: "var(--info)",
    to: "/shipments/confirmed",
  },
  { status: "dispatched", color: "var(--primary)", to: "/shipments/active" },
  { status: "in_progress", color: "var(--primary)", to: "/shipments/active" },
  { status: "delayed", color: "var(--destructive)", to: "/shipments/active" },
]

export function ShipmentPipeline({
  counts,
}: {
  counts: NonNullable<DashboardStatistics["shipments_by_status"]>
}) {
  const tr = useTranslation()
  const rows = stages.map((s) => ({ ...s, count: counts[s.status] ?? 0 }))
  const total = rows.reduce((sum, r) => sum + r.count, 0)
  const max = Math.max(1, ...rows.map((r) => r.count))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Shipment pipeline</CardTitle>
        <CardDescription>{total} open shipments</CardDescription>
        <CardAction>
          <Button variant="link" size="sm" asChild>
            <Link to="/shipments/active">View</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {total ? (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => (
              <li key={row.status}>
                <Link
                  to={row.to}
                  search={{ status: [row.status] }}
                  className="group grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm"
                >
                  <span className="truncate text-muted-foreground group-hover:text-foreground">
                    {tr(`shipments.status.${row.status}`)}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full transition-[width]"
                      style={{
                        width: `${(row.count / max) * 100}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </span>
                  <span className="text-end font-medium tabular-nums">
                    {row.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <WidgetEmpty>No open shipments</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}
