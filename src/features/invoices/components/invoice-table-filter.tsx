import { CalendarDatePicker } from "@/components/calendar-date-picker"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

const DATE_FILTERS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7 days" },
  { value: "last14", label: "Last 14 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
]

const EXPORT_TYPES = [
  // { label: "Export", value: null },
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
]

export function InvoiceTableFilter() {
  const [type, setType] = useState("last7")
  const [exportType, setExportType] = useState("")
  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex flex-row gap-2">
        <ButtonGroup>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FILTERS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  <span className="text-xs">{o.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" className="text-xs">
            All <span className="text-muted-foreground">100</span>
          </Button>
          <Button variant="outline" className="text-xs">
            Draft <span className="text-muted-foreground">25</span>
          </Button>
          <Button variant="outline" className="text-xs">
            Outstanding <span className="text-muted-foreground">5</span>
          </Button>
          <Button variant="outline" className="text-xs">
            Past Due <span className="text-muted-foreground">10</span>
          </Button>
          <Button variant="outline" className="text-xs">
            Paid <span className="text-muted-foreground">40</span>
          </Button>
        </ButtonGroup>
      </div>
      <Field className="max-w-30">
        <Select value={exportType} onValueChange={setExportType}>
          <SelectTrigger>
            <SelectValue placeholder={"Export"} />
          </SelectTrigger>
          <SelectContent>
            {EXPORT_TYPES.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                <span className="text-xs">{o.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}
