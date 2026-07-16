import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"


const chartData = [
  { invoice: "draft", visitors: 275, fill: "var(--color-draft)" },
  { invoice: "outstanding", visitors: 200, fill: "var(--color-outstanding)" },
  { invoice: "pastDue", visitors: 187, fill: "var(--color-pastDue)" },
  { invoice: "paid", visitors: 173, fill: "var(--color-paid)" },
  { invoice: "other", visitors: 90, fill: "var(--color-other)" },
]

const chartConfig = {
  visitors: {
    label: "Invoices",
  },
  draft: {
    label: "Draft",
    color: "var(--chart-1)",
  },
  outstanding: {
    label: "Outstanding",
    color: "var(--chart-2)",
  },
  pastDue: {
    label: "Past Due",
    color: "var(--chart-3)",
  },
  paid: {
    label: "Paid",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartPieLegend() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Invoice Variations</CardTitle>
        <CardDescription>January - June 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie data={chartData} dataKey="visitors" />
            <ChartLegend
              content={<ChartLegendContent nameKey="invoice" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
