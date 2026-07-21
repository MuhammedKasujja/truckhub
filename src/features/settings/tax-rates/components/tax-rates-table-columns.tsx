import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, EyeIcon } from "lucide-react"
import { TaxRateForm } from "./tax-rate-form"
import { TaxRate } from "../types"
import { formatNumber } from "@/lib/format"
import { Can } from "@/components/has-permission"

export function getTaxRateColumns(): ColumnDef<TaxRate>[] {
  return [
    // {
    //   accessorKey: "id",
    //   header: "Id",
    //   cell: ({ row }) => {
    //     return <p>{row.original.id}</p>;
    //   },
    // },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <p>{row.original.name}</p>
      },
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => {
        return <p>{formatNumber(row.original.rate)}%</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const taxRate = row.original
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <Can permission="config:tax_rates:edit">
              <TaxRateForm
                initialData={{ ...taxRate }}
                trigger={
                  <Button variant={"outline"} size={"icon"}>
                    <EditIcon />
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
