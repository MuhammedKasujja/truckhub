import { useMemo } from "react"
import { PackageOpen } from "lucide-react"
import { formatRange, sortTiers } from "./loading-fees-format"
import type { LoadingOffloadingPricing } from "../../schemas"
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
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

type LoadingOffloadingPricingTableProps = {
  pricings?: LoadingOffloadingPricing[]
  isLoading?: boolean
  /** Shown in the empty state, e.g. a "New pricing" button. */
  emptyAction?: React.ReactNode
  emptyDescription?: string
  className?: string
}

/** Read-only list of loading / offloading fee tiers, lightest first. */
export function LoadingOffloadingPricingTable({
  pricings,
  isLoading,
  emptyAction,
  emptyDescription = "Add fee tiers by tonnage and volume to charge for loading and offloading.",
  className,
}: LoadingOffloadingPricingTableProps) {
  const tiers = useMemo(() => sortTiers(pricings ?? []), [pricings])

  if (!isLoading && tiers.length === 0) {
    return (
      <SectionEmpty
        icon={PackageOpen}
        title="No loading fees yet"
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 pl-4 text-xs text-muted-foreground">
              Tier
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              Tonnage
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">
              CBM (m³)
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              Loading fee
            </TableHead>
            <TableHead className="pr-4 text-right text-xs text-muted-foreground">
              Offloading fee
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_row, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j} className="py-3 first:pl-4 last:pr-4">
                      <Skeleton
                        className={cn(
                          "h-4",
                          j === 0 ? "w-6" : "w-20",
                          j > 2 && "ml-auto"
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : tiers.map((tier, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3 pl-4">
                    <TierNumber value={index + 1} />
                  </TableCell>
                  <TableCell className="py-3">
                    <RangeValue
                      min={tier.tonnage_min}
                      max={tier.tonnage_max}
                      unit="t"
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <RangeValue
                      min={tier.cbm_min}
                      max={tier.cbm_max}
                      unit="m³"
                    />
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium tabular-nums">
                    {formatMoney(tier.loading_fees)}
                  </TableCell>
                  <TableCell className="py-3 pr-4 text-right font-medium tabular-nums">
                    {formatMoney(tier.offloading_fees)}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function TierNumber({ value }: { value: number }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground tabular-nums">
      {value}
    </span>
  )
}

function RangeValue({
  min,
  max,
  unit,
}: {
  min: string
  max: string
  unit: string
}) {
  return (
    <span className="tabular-nums">
      {formatRange(min, max)}
      <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
    </span>
  )
}
