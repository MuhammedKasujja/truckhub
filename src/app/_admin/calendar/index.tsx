import { compactTime } from "@/features/shipments/components/calendar/sample-data"
import { CalendarSchedule } from "@/features/shipments/components/calendar/schedule-calendar"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/calendar/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid  gap-4">
      {/* <div className="col-span-2"></div>
      <div className="col-span-5"> */}
        <CalendarSchedule compactTime={compactTime} />
      {/* </div> */}
    </div>
  )
}
