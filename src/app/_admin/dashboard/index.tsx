import { createFileRoute } from "@tanstack/react-router"
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat"
import { getDashboardStatistics } from "@/features/dashboard/service"
import { RecentPaymentsTable } from "@/features/dashboard/components/recent-payments-table"
import { RecentBookingTable } from "@/features/dashboard/components/recent-booking-table"
import { RecentRideTable } from "@/features/dashboard/components/recent-ride-table"
import { DollarSign, TrendingUp } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { DateRangePicker } from "@/components/ui/date-range-picker/date-range-picker"
import { DateRangePicker as DateRangePicker2 } from "@/components/ui/date-picker/date-range-picker"

export const Route = createFileRoute("/_admin/dashboard/")({
  component: RouteComponent,
  loader: async () => await getDashboardStatistics(),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()

  if (!data)
    return <div className="flex flex-col gap-2">Error Loading Statistics</div>

  return (
    <div className="flex flex-col gap-5">
      <PageHeader className="pb-0">
        <PageTitle>Dashboard</PageTitle>
        <PageAction>
          <DateRangePicker2
            initialDateFrom={new Date()}
            initialDateTo={
              new Date(new Date().setDate(new Date().getDate() + 7))
            }
          />
          <DateRangePicker
            // onUpdate={(values) => console.log(values)}
            initialDateFrom="2026-01-01"
            initialDateTo="2026-12-31"
            align="start"
            locale="en-GB"
            showCompare={false}
          />
        </PageAction>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat>
          <StatLabel>Payments</StatLabel>
          <StatValue>
            {formatPrice(data.statistics.payments.total_amount)}
          </StatValue>
          <StatIndicator variant="icon" color="success">
            <DollarSign />
          </StatIndicator>
        </Stat>
        <Stat>
          <StatLabel>Bookings</StatLabel>
          <StatValue>{data.statistics.bookings.total}</StatValue>
          <StatIndicator variant="icon" color="success">
            <DollarSign />
          </StatIndicator>
        </Stat>

        <Stat>
          <StatLabel>Customers</StatLabel>
          <StatValue>{data.statistics.customers.total}</StatValue>
          <StatIndicator variant="badge" color="info">
            +24
          </StatIndicator>
        </Stat>

        <Stat>
          <StatLabel>Rides</StatLabel>
          <StatValue>{data.statistics.rides.total}</StatValue>
          <StatIndicator variant="icon" color="warning">
            <TrendingUp />
          </StatIndicator>
          <StatTrend trend="down">Capacity threshold reached</StatTrend>
        </Stat>
      </div>
      <RecentPaymentsTable payments={data.recent_payments} />
      <RecentBookingTable bookings={data.recent_bookings} />
      <RecentRideTable rides={data.recent_rides} />
    </div>
  )
}
