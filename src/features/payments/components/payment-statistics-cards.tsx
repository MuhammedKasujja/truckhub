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
            Week Revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-flow-col gap-5">
          <div className="space-y-1.5">
            <CardTitle className="font-bold">
              {formatMoney(statistics?.weekly.newValue)}
            </CardTitle>
            <CardDescription>This week</CardDescription>
          </div>
          <Separator orientation="vertical" />
          <div className="space-y-1.5">
            <CardTitle className="font-bold text-muted-foreground">
              {formatMoney(statistics?.weekly.oldValue)}
            </CardTitle>
            <CardDescription>Last week</CardDescription>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="font-semibold">
            Month Revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-flow-col gap-5">
          <div className="space-y-1.5">
            <CardTitle className="font-bold">
              {formatMoney(statistics?.monthly.newValue)}
            </CardTitle>
            <CardDescription>This month</CardDescription>
          </div>
          <Separator orientation="vertical" />
          <div className="space-y-1.5">
            <CardTitle className="font-bold text-muted-foreground">
              {formatMoney(statistics?.monthly.oldValue)}
            </CardTitle>
            <CardDescription>Last month</CardDescription>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="font-semibold">
            Yearly Revenue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-flow-col gap-5">
          <div className="space-y-1.5">
            <CardTitle className="font-bold">
              {formatMoney(statistics?.yearly.newValue)}
            </CardTitle>
            <CardDescription>This year</CardDescription>
          </div>
          <Separator orientation="vertical" />
          <div className="space-y-1.5">
            <CardTitle className="font-bold text-muted-foreground">
              {formatMoney(statistics?.yearly.oldValue)}
            </CardTitle>
            <CardDescription>Last year</CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
