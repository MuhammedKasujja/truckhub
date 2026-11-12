import { useMemo } from "react"
import { IconSandbox } from "@tabler/icons-react"
import type { IslandPricingItem } from "../../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { SectionEmpty } from "@/features/settings/_components/settings-ui"
import { LocationRows } from "@/features/settings/islands/components/island-locations"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type IslandPricingTableProps = {
  pricings?: IslandPricingItem[]
  isLoading?: boolean
  /** Shown in the empty state, e.g. a "New pricing" button. */
  emptyAction?: React.ReactNode
  emptyDescription?: string
  className?: string
}

/** Read-only island prices, laid out like the islands table. */
export function IslandPricingTable({
  pricings,
  isLoading,
  emptyAction,
  emptyDescription = "Set a price for each island to charge island deliveries.",
  className,
}: IslandPricingTableProps) {
  const rows = useMemo(
    () => [...(pricings ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [pricings]
  )

  if (!isLoading && rows.length === 0) {
    return (
      <SectionEmpty
        icon={IconSandbox}
        title="No island prices yet"
        description={emptyDescription}
        action={emptyAction}
        className={cn("bg-card py-14", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-xs",
        className
      )}
    >
      <Table className="[&_td]:border-r [&_td]:px-3 [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:px-3 [&_th:last-child]:border-r-0">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-48">Island</TableHead>
            {/* <TableHead className="w-24 text-right">Count</TableHead> */}
            <TableHead className="min-w-64">Locations</TableHead>
            <TableHead className="w-40 text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_row, i) => (
                <TableRow
                  key={i}
                  className="even:bg-muted/40 hover:bg-transparent [&>td]:py-3"
                >
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  {/* <TableCell>
                    <Skeleton className="ml-auto h-4 w-6" />
                  </TableCell> */}
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow
                  key={row.island_id}
                  className="even:bg-muted/40 [&>td]:py-3 [&>td]:align-top"
                >
                  <TableCell className="font-medium">{row.name}</TableCell>
                  {/* <TableCell className="text-right text-muted-foreground tabular-nums">
                    {row.locations.length}
                  </TableCell> */}
                  <TableCell className="whitespace-normal">
                    <LocationRows locations={row.locations} />
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatMoney(row.general_price)}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
