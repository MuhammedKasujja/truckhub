import { BookingSearchParamsCache } from "@/features/bookings/schemas"
import { getBookings, getBookingStatistics } from "@/features/bookings/services"
import { generatePageSearchParams } from "@/lib/search-params"
import { Await, createFileRoute, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import {
  BookingTable,
  BookingTableSkeleton,
} from "@/features/bookings/components/booking-table"
import { requirePermission } from "@/lib/auth"
import { BookingStatisticsCard } from "@/features/bookings/components"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/bookings/")({
  component: RouteComponent,
  loader: async ({ location }) => {
    // awaited immediately
    console.log("Serach Params", location.search)
    const statistics = await getBookingStatistics()

    // const searchParams = await generatePageSearchParams(
    //   location.search,
    //   BookingSearchParamsCache
    // )

    // // deferred
    // const bookingsPromise = getBookings(searchParams)

    return {
      statistics: statistics.data,
      // bookingsPromise,
    }
  },
})

function RouteComponent() {
  const { statistics } = Route.useLoaderData()
  return (
    <Suspense fallback={<BookingTableSkeleton />}>
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
      {/* <Suspense fallback={<BookingTableSkeleton />}>
        <Await promise={bookingsPromise}>
          {(bookings) => (
            <BookingTable promises={Promise.all([bookingsPromise])} />
          )}
        </Await>
      </Suspense> */}
    </Suspense>
  )
}
