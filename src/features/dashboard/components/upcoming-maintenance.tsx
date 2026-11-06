import { Link } from "@tanstack/react-router"
import { WrenchIcon } from "lucide-react"
import { WidgetEmpty } from "./widget-empty"
import type { MaintenanceRecord } from "@/features/maintanence/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

export function UpcomingMaintenance({
  records,
}: {
  records: MaintenanceRecord[]
}) {
  const items = records.slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming maintenance</CardTitle>
        <CardDescription>Next scheduled services</CardDescription>
        <CardAction>
          <Button variant="link" size="sm" asChild>
            <Link to="/maintenance">View all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="flex flex-col divide-y">
            {items.map((record) => (
              <li
                key={record.id.toString()}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground",
                    record.is_overdue &&
                      "border-destructive/25 bg-destructive/10 text-destructive"
                  )}
                >
                  <WrenchIcon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {record.vehicle.plate_number}
                  </p>
                  <p className="truncate text-xs text-muted-foreground capitalize">
                    {record.type} · {record.reason}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-xs tabular-nums">
                    {formatDate(record.scheduled_start, {
                      dateStyle: undefined,
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {record.is_overdue && (
                    <Badge
                      variant="destructive"
                      className="h-4 px-1.5 text-[10px]"
                    >
                      Overdue
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <WidgetEmpty>No services scheduled</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}
