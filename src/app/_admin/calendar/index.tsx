import { CalendarSchedule } from "@/features/shipments/components/calendar/schedule-calendar"
import { shipmentsCalendarQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/calendar/")({
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.prefetchQuery(shipmentsCalendarQueryOptions(search)),
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const { data } = useQuery(shipmentsCalendarQueryOptions(search))

  return (
    <div className="grid gap-4">
      {/* <div className="col-span-2"></div>
      <div className="col-span-5"> */}
      <CalendarSchedule shipments={data?.data ?? []} />
      {/* </div> */}
    </div>
  )
}
