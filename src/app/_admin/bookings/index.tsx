import { BookingSearchParamsCache } from "@/features/bookings/schemas"
import { generatePageSearchParams } from "@/lib/search-params"
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

export const Route = createFileRoute("/_admin/bookings/")({
  component: RouteComponent,
  beforeLoad: async () => hasPermission("bookings:view"),
  loader: async ({ context, location }) => {
    const searchParams = await generatePageSearchParams(
      location.search,
      BookingSearchParamsCache
    )
    context.queryClient.prefetchQuery(createBookingQueryOptions(searchParams))
    return context.queryClient.ensureQueryData(
      createBookingStatisticsQueryOptions()
    )
  },
})

function RouteComponent() {
  const { data: statistics } = Route.useLoaderData()
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
      <Suspense fallback={<BookingTableSkeleton />}>
        <BookingTable />
      </Suspense>
    </Suspense>
  )
}
