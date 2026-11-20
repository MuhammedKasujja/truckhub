import { format, parseISO } from "date-fns"
import { dashboardRangeLabels } from "../schemas"
import type {
  DashboardRange,
  DashboardSearchParamsInput,
  ResolvedDashboardPeriod,
} from "../schemas"
import type { DateRange } from "@daypicker/react"
import { CalendarDatePicker } from "@/components/calendar-date-picker"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const presets: Exclude<DashboardRange, "custom">[] = [
  "today",
  "7d",
  "30d",
  "mtd",
]

type Props = {
  search: DashboardSearchParamsInput
  period: ResolvedDashboardPeriod
  onChange: (next: DashboardSearchParamsInput) => void
}

export function DashboardRangePicker({ search, period, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs
        value={search.range === "custom" ? "" : search.range}
        onValueChange={(value) => onChange({ range: value as DashboardRange })}
      >
        <TabsList>
          {presets.map((p) => (
            <TabsTrigger key={p} value={p} className="px-2.5">
              {p === "mtd" ? "MTD" : dashboardRangeLabels[p]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <CalendarDatePicker
        date={{ from: parseISO(period.from), to: parseISO(period.to) }}
        onDateSelect={(value) => {
          const range = value as DateRange
          if (!range.from) return
          onChange({
            range: "custom",
            from: format(range.from, "yyyy-MM-dd"),
            to: format(range.to ?? range.from, "yyyy-MM-dd"),
          })
        }}
        variant="outline"
        className={
          search.range === "custom"
            ? "w-fit cursor-pointer border-primary text-primary"
            : "w-fit cursor-pointer"
        }
      />
    </div>
  )
}
