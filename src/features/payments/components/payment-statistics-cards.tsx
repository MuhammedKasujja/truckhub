import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatMoney } from "@/lib/format"
import { PaymentStatistics } from "../types"

type PaymentStatisticsCardProps = {
  statistics: PaymentStatistics | undefined
}

export function PaymentStatisticsCard({
  statistics,
}: PaymentStatisticsCardProps) {
  return (
    <div className="grid gap-5 pb-5 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription className="font-semibold">
            Total Revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-flow-col gap-5">
          <div className="space-y-1.5">
            <CardTitle className="font-bold">
              {formatMoney(statistics?.grandTotal.newValue)}
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <Separator orientation="vertical" />
          <div className="space-y-1.5">
            <CardTitle className="font-bold text-muted-foreground">
              {formatMoney(statistics?.grandTotal.oldValue)}
            </CardTitle>
            <CardDescription>Last month</CardDescription>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="font-semibold">
            Booking Revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-flow-col gap-5">
          <div className="space-y-1.5">
            <CardTitle className="font-bold">
              {formatMoney(statistics?.bookings.newValue)}
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <Separator orientation="vertical" />
          <div className="space-y-1.5">
            <CardTitle className="font-bold text-muted-foreground">
              {formatMoney(statistics?.bookings.oldValue)}
            </CardTitle>
            <CardDescription>Last month</CardDescription>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="font-semibold">
            Ride Revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-flow-col gap-5">
          <div className="space-y-1.5">
            <CardTitle className="font-bold">
              {formatMoney(statistics?.rides.newValue)}
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <Separator orientation="vertical" />
          <div className="space-y-1.5">
            <CardTitle className="font-bold text-muted-foreground">
              {formatMoney(statistics?.rides.oldValue)}
            </CardTitle>
            <CardDescription>Last month</CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
