import { useMemo, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon } from "lucide-react"
import { downloadCsv } from "../export"
import type { CsvColumn } from "../export"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { WidgetEmpty } from "@/features/dashboard/components/widget-empty"
import { cn } from "@/lib/utils"

export type ReportColumn<T> = {
  id: string
  header: string
  cell: (row: T) => React.ReactNode
  /** Raw value used for sorting and CSV export */
  value: (row: T) => string | number | null | undefined
  align?: "start" | "end"
  sortable?: boolean
}

type ReportTableProps<T> = {
  title: string
  description?: React.ReactNode
  rows: T[]
  columns: ReportColumn<T>[]
  rowKey: (row: T) => string
  /** File name (without extension) for the CSV export; omit to hide the button */
  exportName?: string
  /** Column id sorted descending initially */
  defaultSort?: string
  emptyText?: string
  className?: string
}

export function ReportTable<T>({
  title,
  description,
  rows,
  columns,
  rowKey,
  exportName,
  defaultSort,
  emptyText = "No records for this period",
  className,
}: ReportTableProps<T>) {
  const [sort, setSort] = useState<{ id: string; desc: boolean } | null>(
    defaultSort ? { id: defaultSort, desc: true } : null
  )

  const sorted = useMemo(() => {
    const column = sort && columns.find((c) => c.id === sort.id)
    if (!column) return rows
    return [...rows].sort((a, b) => {
      const av = column.value(a)
      const bv = column.value(b)
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
              numeric: true,
            })
      return sort.desc ? -cmp : cmp
    })
  }, [rows, columns, sort])

  const toggleSort = (id: string) =>
    setSort((prev) =>
      prev?.id === id ? { id, desc: !prev.desc } : { id, desc: true }
    )

  const exportCsv = () => {
    if (!exportName) return
    const csvColumns: CsvColumn<T>[] = columns.map((c) => ({
      header: c.header,
      value: c.value,
    }))
    downloadCsv(exportName, sorted, csvColumns)
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {exportName && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={!rows.length}
            >
              <DownloadIcon />
              CSV
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => {
                    const active = sort?.id === column.id
                    const SortIcon = sort?.desc ? ArrowDownIcon : ArrowUpIcon
                    return (
                      <TableHead
                        key={column.id}
                        className={cn(column.align === "end" && "text-end")}
                        aria-sort={
                          active
                            ? sort.desc
                              ? "descending"
                              : "ascending"
                            : undefined
                        }
                      >
                        {column.sortable === false ? (
                          column.header
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleSort(column.id)}
                            className={cn(
                              "inline-flex items-center gap-1 hover:text-foreground",
                              active && "text-foreground"
                            )}
                          >
                            {column.header}
                            {active && <SortIcon className="size-3" />}
                          </button>
                        )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (
                  <TableRow key={rowKey(row)}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === "end" && "text-end tabular-nums"
                        )}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <WidgetEmpty>{emptyText}</WidgetEmpty>
        )}
      </CardContent>
    </Card>
  )
}
