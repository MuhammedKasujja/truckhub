import { createFileRoute, ErrorComponent } from "@tanstack/react-router"
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@/components/ui/stat"
import {
  RecentPaymentsTable,
  RecentBookingTable,
  RecentRidesTable,
  WeeklyQuotationStatistics,
  AnalyticsCard,
} from "@/features/dashboard/components"
import { DollarSign, TrendingUp } from "lucide-react"
import { formatMoney } from "@/lib/format"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { DateRangePicker } from "@/components/ui/date-range-picker/date-range-picker"
import { DateRangePicker as DateRangePicker2 } from "@/components/ui/date-picker/date-range-picker"
import { dashboardQueryOptions } from "@/features/dashboard/query-options"
import { CalendarDatePicker } from "@/components/calendar-date-picker"

export const Route = createFileRoute("/_admin/dashboard/")({
  component: RouteComponent,
  // errorComponent: ErrorComponent,
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData(dashboardQueryOptions()),
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
          <CalendarDatePicker
            date={{
              from: new Date(),
              // to: dates.to,
            }}
            onDateSelect={({}) => {}}
            // className={`w-fit cursor-pointer ${getInputSizeClass(config.size)}`}
            className={`w-fit cursor-pointer`}
            variant="outline"
          />
          <DateRangePicker2
            initialDateFrom={new Date()}
            initialDateTo={
              new Date(new Date().setDate(new Date().getDate() + 7))
            }
          />
          <DateRangePicker
            onUpdate={(values) => console.log(values)}
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
            {formatMoney(data.statistics.payments.total_amount)}
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
          <StatValue>{data.statistics.clients.total}</StatValue>
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
      {/* <div className="flex">
        <AnalyticsCard />
        <WeeklyQuotationStatistics />
      </div> */}
      <RecentPaymentsTable payments={data.recent_payments} />
      <RecentBookingTable bookings={data.recent_bookings} />
      <RecentRidesTable rides={data.recent_rides} />
    </div>
  )
}
