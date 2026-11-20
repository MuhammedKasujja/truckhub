import { Star } from "lucide-react"
import { TaxRateForm } from "./tax-rate-form"
import type { ColumnDef } from "@tanstack/react-table"
import type { TaxRate } from "../types"
import type { EntityId } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { formatNumber } from "@/lib/format"

type ColumnOptions = {
  defaultTaxRateId?: EntityId | null
  onMakeDefault?: (taxRate: TaxRate) => void
}

export function getTaxRateColumns({
  defaultTaxRateId,
  onMakeDefault,
}: ColumnOptions = {}): ColumnDef<TaxRate>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const taxRate = row.original
        const isDefault = taxRate.id === defaultTaxRateId
        return (
          <div className="min-w-0 py-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium">{taxRate.name}</span>
              {isDefault && (
                <Badge>
                  <Star />
                  Default
                </Badge>
              )}
            </div>
            {taxRate.description && (
              <p className="max-w-md truncate text-xs text-muted-foreground">
                {taxRate.description}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatNumber(row.original.rate, { fallback: "0" })}%
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const taxRate = row.original
        const isDefault = taxRate.id === defaultTaxRateId
        return (
          <div className="flex justify-end gap-1">
            {!isDefault && onMakeDefault && (
              <Can permission="config:edit">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => onMakeDefault(taxRate)}
                >
                  <Star />
                  Make default
                </Button>
              </Can>
            )}
            <Can permission="config:tax_rates:edit">
              <TaxRateForm
                initialData={{ ...taxRate }}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${taxRate.name}`}
                  >
                    <ActionIcon action="edit" />
                  </Button>
                }
              />
            </Can>
          </div>
        )
      },
    },
  ]
}
