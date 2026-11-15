import { endOfDay, startOfDay } from "date-fns"
import { XIcon } from "lucide-react"
import { OUTSTANDING_INVOICE_STATUSES } from "../enums"
import { useInvoiceStatistics } from "../hooks/use-invoice-statistics"
import type { DateRange } from "@daypicker/react"
import type { InvoiceStatus } from "../enums"
import type { InvoiceListSearchParams } from "../schemas"
import type { InvoiceStatistics } from "../types"
import { CalendarDatePicker } from "@/components/calendar-date-picker"
import { ClientPicker } from "@/features/clients/components/client-pickers"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { ConfigToolbar } from "@/features/settings/vehicle-config/_components/config-ui"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

type StatusFilter = {
  key: keyof InvoiceStatistics
  label: string
  /** Undefined shows every invoice */
  statuses?: readonly InvoiceStatus[]
}

const STATUS_FILTERS: StatusFilter[] = [
  { key: "total", label: "All" },
  { key: "drafts", label: "Draft", statuses: ["draft"] },
  {
    key: "outstanding",
    label: "Outstanding",
    statuses: OUTSTANDING_INVOICE_STATUSES,
  },
  { key: "past_due", label: "Overdue", statuses: ["over_due"] },
  { key: "paid", label: "Paid", statuses: ["paid"] },
]

const sameStatuses = (
  a: readonly InvoiceStatus[] = [],
  b: readonly InvoiceStatus[] = []
) => a.length === b.length && a.every((status) => b.includes(status))

type Filters = Pick<
  InvoiceListSearchParams,
  "status" | "client_id" | "created_at"
>

type Props = {
  search: string
  onSearchChange: (value: string) => void
  filters: Filters
  onFiltersChange: (filters: Partial<Filters>) => void
}

/** Search box, client, created-date and status filters of the invoice list. */
export function InvoiceTableFilter({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
}: Props) {
  const tr = useTranslation()
  const { data: statistics } = useInvoiceStatistics()
  const { status, client_id, created_at } = filters

  // Links from reports and the dashboard can filter by statuses no button covers
  const isCustomStatus =
    !!status?.length &&
    !STATUS_FILTERS.some((filter) => sameStatuses(filter.statuses, status))

  // The URL holds the created-date range as [from, to] timestamps
  const [from, to] = created_at ?? []
  const createdRange: DateRange = {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  }

  return (
    <div className="flex flex-col gap-3">
      <ConfigToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Search invoices"
        filters={
          <>
            <div className="w-56">
              <ClientPicker
                value={client_id}
                placeholder="All clients"
                onChange={(client) =>
                  onFiltersChange({ client_id: client?.id })
                }
              />
            </div>
            <CalendarDatePicker
              date={createdRange}
              placeholder="Created date"
              variant="outline"
              className={cn(
                "w-fit cursor-pointer",
                createdRange.from && "border-primary text-primary"
              )}
              onDateSelect={(value) => {
                const range = value as DateRange
                onFiltersChange({
                  // One picked day covers that whole day
                  created_at: range.from
                    ? [
                        startOfDay(range.from).getTime(),
                        endOfDay(range.to ?? range.from).getTime(),
                      ]
                    : undefined,
                })
              }}
            />
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <ButtonGroup
          aria-label="Filter by status"
          className="max-w-full overflow-x-auto"
        >
          {STATUS_FILTERS.map((filter) => {
            const active = sameStatuses(filter.statuses, status)
            return (
              <Button
                key={filter.key}
                type="button"
                variant="outline"
                aria-pressed={active}
                className={cn(
                  "text-muted-foreground",
                  active &&
                    "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
                )}
                onClick={() =>
                  onFiltersChange({
                    status: filter.statuses && [...filter.statuses],
                  })
                }
              >
                {filter.label}
                <span
                  className={cn(
                    "rounded-md bg-muted px-1.5 text-xs text-muted-foreground tabular-nums",
                    active && "bg-primary/15 text-primary"
                  )}
                >
                  {statistics?.[filter.key]}
                </span>
              </Button>
            )
          })}
        </ButtonGroup>
        {isCustomStatus && (
          <button
            type="button"
            onClick={() => onFiltersChange({ status: undefined })}
            aria-label="Clear status filter"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-primary bg-primary/10 px-2.5 text-sm font-medium text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {status.map((s) => tr(`invoices.statuses.${s}`)).join(", ")}
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
