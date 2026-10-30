import { useEffect, useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  type Table,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  Eye,
  EyeOff,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CalendarIcon,
} from "lucide-react"
import {
  distanceLabel,
  formatUgx,
  FormValues,
  fromDbRows,
  GridRow,
  numericLeadingSort,
  RateEntry,
  rateKey,
  scheduleToFormValues,
  tonnageLabel,
} from "../../utils/distance-tonnage-pricing-utils"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DistanceTonnagePricingItem } from "../../types"
import { Button } from "@/components/ui/button"

const gridColumnHelper = createColumnHelper<GridRow>()
const listColumnHelper = createColumnHelper<RateEntry>()

type DistancePricingScheduleProps = {
  initialDate?: string
  pricings: DistanceTonnagePricingItem[]
}

export function DistancePricingScheduleGrid({
  pricings,
  initialDate,
}: DistancePricingScheduleProps) {
  const submittedSchedule = useMemo(() => fromDbRows(pricings), [pricings])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const { control, watch, getValues } = useForm<FormValues>({
    defaultValues: scheduleToFormValues(submittedSchedule),
    mode: "onBlur",
  })

  const ratesArray = useFieldArray({
    control,
    name: "rates",
    keyName: "fieldKey",
  })

  const watchedTonnage = watch("tonnageRanges")
  const watchedDistance = watch("distanceRanges")

  const tonnageIdsKey = watchedTonnage.map((t) => t.id).join(",")
  const distanceIdsKey = watchedDistance.map((d) => d.id).join(",")

  // Whenever a bracket is added/removed, keep `rates` in sync: drop entries
  // whose bracket no longer exists, append entries for new combinations.
  // Surgical add/remove (not a full replace) so untouched rows keep their
  // identity and don't lose focus/remount while the user is mid-edit.
  useEffect(() => {
    const current = getValues("rates") || []
    const validKeys = new Set<string>()
    watchedDistance.forEach((d) =>
      watchedTonnage.forEach((t) => validKeys.add(rateKey(d.id, t.id)))
    )

    for (let i = current.length - 1; i >= 0; i -= 1) {
      if (
        !validKeys.has(
          rateKey(current[i].distanceRangeId, current[i].tonnageRangeId)
        )
      ) {
        ratesArray.remove(i)
      }
    }

    const existingKeys = new Set(
      (getValues("rates") || []).map((r) =>
        rateKey(r.distanceRangeId, r.tonnageRangeId)
      )
    )
    const toAppend: RateEntry[] = []
    watchedDistance.forEach((d) => {
      watchedTonnage.forEach((t) => {
        const key = rateKey(d.id, t.id)
        if (!existingKeys.has(key)) {
          toAppend.push({
            distanceRangeId: d.id,
            tonnageRangeId: t.id,
            minPrice: NaN,
            maxPrice: NaN,
          })
        }
      })
    })
    if (toAppend.length) ratesArray.append(toAppend)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tonnageIdsKey, distanceIdsKey])

  // ---------------------------------------------------------------------
  // Grid view: pivot the flat `rates` list into a spreadsheet-style table
  // (two rows - Min / Max - per distance bracket, one column per tonnage
  // bracket). Built with @tanstack/react-table; column show/hide is wired
  // up as a real table feature.
  // ---------------------------------------------------------------------
  const gridData = useMemo<GridRow[]>(() => {
    const rateMap = new Map(
      submittedSchedule.rates.map((r) => [
        rateKey(r.distanceRangeId, r.tonnageRangeId),
        r,
      ])
    )
    const rows: GridRow[] = []
    submittedSchedule.distanceRanges.forEach((d) => {
      const minRow: GridRow = {
        id: `${d.id}-min`,
        distance: distanceLabel(d),
        rowType: "min",
        cells: {},
      }
      const maxRow: GridRow = {
        id: `${d.id}-max`,
        distance: "",
        rowType: "max",
        cells: {},
      }
      submittedSchedule.tonnageRanges.forEach((t) => {
        const rate = rateMap.get(rateKey(d.id, t.id))
        minRow.cells[t.id] = rate ? rate.minPrice : null
        maxRow.cells[t.id] = rate ? rate.maxPrice : null
      })
      rows.push(minRow, maxRow)
    })
    return rows
  }, [submittedSchedule])

  const gridColumns = useMemo(
    () => [
      gridColumnHelper.accessor("distance", {
        id: "distance",
        header: "Distance (KM)",
        cell: (info) => (
          <span className="font-semibold text-accent-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      ...submittedSchedule.tonnageRanges.map((t) =>
        gridColumnHelper.accessor((row) => row.cells[t.id], {
          id: t.id,
          header: tonnageLabel(t),
          cell: (info) => formatUgx(info.getValue()),
        })
      ),
    ],
    [submittedSchedule.tonnageRanges]
  )

  const gridTable = useReactTable({
    data: gridData,
    columns: gridColumns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  // ---------------------------------------------------------------------
  // List view: `rates` fed straight into the table - no transformation -
  // this is the "optimized for table display" payoff. Sortable + searchable.
  // ---------------------------------------------------------------------
  const distanceLabelById = useMemo(
    () =>
      new Map(
        submittedSchedule.distanceRanges.map((d) => [d.id, distanceLabel(d)])
      ),
    [submittedSchedule.distanceRanges]
  )
  const tonnageLabelById = useMemo(
    () =>
      new Map(
        submittedSchedule.tonnageRanges.map((t) => [t.id, tonnageLabel(t)])
      ),
    [submittedSchedule.tonnageRanges]
  )

  const listColumns = useMemo(
    () => [
      listColumnHelper.accessor(
        (r) => distanceLabelById.get(r.distanceRangeId) ?? r.distanceRangeId,
        {
          id: "distance",
          header: "Distance (KM)",
          sortingFn: numericLeadingSort,
          cell: (info) => info.getValue(),
        }
      ),
      listColumnHelper.accessor(
        (r) => tonnageLabelById.get(r.tonnageRangeId) ?? r.tonnageRangeId,
        {
          id: "tonnage",
          header: "Tonnage (MT)",
          sortingFn: numericLeadingSort,
          cell: (info) => info.getValue(),
        }
      ),
      listColumnHelper.accessor("minPrice", {
        id: "minPrice",
        header: "Min price",
        cell: (info) => formatUgx(info.getValue()),
      }),
      listColumnHelper.accessor("maxPrice", {
        id: "maxPrice",
        header: "Max price",
        cell: (info) => formatUgx(info.getValue()),
      }),
    ],
    [distanceLabelById, tonnageLabelById]
  )

  const listTable = useReactTable({
    data: submittedSchedule.rates, // <-- straight from the payload, no shaping needed
    columns: listColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="mx-auto space-y-6">
      <div className="w-full space-y-2.5 md:w-80">
        <Label>Effective Date</Label>
        <Button
          variant={"outline"}
          className="justify-start font-normal md:w-80"
        >
          <CalendarIcon className="mr-1 h-4 w-4 opacity-50" />
          {initialDate}
        </Button>
      </div>

      <SchedulePanel
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        gridTable={gridTable}
        listTable={listTable}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />
    </div>
  )
}

interface SchedulePanelProps {
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  gridTable: Table<GridRow>
  listTable: Table<RateEntry>
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

function SchedulePanel({
  viewMode,
  onViewModeChange,
  gridTable,
  listTable,
  globalFilter,
  onGlobalFilterChange,
}: SchedulePanelProps) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Published schedule
          </h2>
          <p className="text-xs text-slate-400">Rates are VAT exclusive.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                viewMode === "grid"
                  ? "border-[0.5px] bg-primary/5 text-primary"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                viewMode === "list"
                  ? "border-[0.5px] bg-primary/5 text-primary"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              List
            </button>
          </div>

          {viewMode === "grid" && (
            <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1">
              {gridTable
                .getAllLeafColumns()
                .filter((col) => col.id !== "distance")
                .map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={col.getToggleVisibilityHandler()}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${
                      col.getIsVisible()
                        ? "border-[0.5px] bg-primary/5 text-primary"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {col.getIsVisible() ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {String(col.columnDef.header)}
                  </button>
                ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={globalFilter}
                onChange={(e) => onGlobalFilterChange(e.target.value)}
                placeholder="Search distance, tonnage…"
                className="rounded-lg border border-slate-300 py-1.5 pr-3 pl-7 text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {viewMode === "grid" ? (
        <GridTable table={gridTable} />
      ) : (
        <ListTable table={listTable} />
      )}

      <p className="mt-3 text-xs text-slate-400 italic">
        For Kampala-Wakiso, a retainer fee of UGX 4,500,000 (VAT exclusive)
        applies for a radius of 10km from JMS.
      </p>
    </section>
  )
}

function GridTable({ table }: { table: Table<GridRow> }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b bg-background px-3 py-2 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                row.original.rowType === "max"
                  ? "bg-amber-50 dark:bg-background/60"
                  : "bg-card"
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-b px-3 py-2 text-muted-foreground tabular-nums"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListTable({ table }: { table: Table<RateEntry> }) {
  const columnCount = table.getAllLeafColumns().length
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer border-b bg-background px-3 py-2 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase select-none hover:bg-slate-100"
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <SortIcon direction={header.column.getIsSorted()} />
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="odd:bg-card even:bg-background/60">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border-b px-3 py-2 tabular-nums">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td
                colSpan={columnCount}
                className="px-3 py-6 text-center text-xs text-slate-400"
              >
                No rates match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") return <ArrowUp className="h-3 w-3" />
  if (direction === "desc") return <ArrowDown className="h-3 w-3" />
  return <ArrowUpDown className="h-3 w-3 text-slate-300" />
}

// Exported so callers can convert outside the component too - e.g. converting
// an API response into `initialSchedule`, or converting a schedule into rows
// for a bulk insert without waiting for the user to click Save.
