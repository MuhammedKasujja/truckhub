import { createFileRoute, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import {
  BookingTable,
  BookingTableSkeleton,
} from "@/features/bookings/components/booking-table"
import { hasPermission } from "@/lib/auth"
import { BookingStatisticsCard } from "@/features/bookings/components"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import {
  createBookingQueryOptions,
  createBookingStatisticsQueryOptions,
} from "@/features/bookings/queries-options"
import { createBookingSearchParams } from "@/features/bookings/schemas"

export const Route = createFileRoute("/_admin/bookings/")({
  component: RouteComponent,
  validateSearch: createBookingSearchParams(),
  beforeLoad: async () => hasPermission("bookings:view"),
  loader: async ({ context, location }) => {
    context.queryClient.prefetchQuery(
      createBookingQueryOptions(location.search)
    )
    return context.queryClient.ensureQueryData(
      createBookingStatisticsQueryOptions()
    )
  },
})

function RouteComponent() {
  const { data: statistics } = Route.useLoaderData()
  const search = Route.useSearch()
  console.log("Search params:", search)
  return (
    <>
      <PageHeader>
        <PageTitle>Bookings</PageTitle>
        <PageAction>
          <Can permission="bookings:create">
            <Button asChild>
              <Link to={"/bookings/new"}>
                <PlusIcon />
                New Booking
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <BookingStatisticsCard statistics={statistics} />
      <Suspense fallback={<BookingTableSkeleton />}>
        <BookingTable />
      </Suspense>
    </>
  )
}
