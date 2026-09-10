import React, { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Truck } from "lucide-react"
import { RoutePricing } from "../../types"

type Props = {
  title: string
  routes: RoutePricing[]
  effectiveDate: string
  subtitle?: string
  isSelectable?: boolean
  onRowSelect?: (rows) => void
}

// Range filter: column value must fall within [min, max] of the filter tuple.
// Used for the Distance column (row.distance_km) directly.
const rangeFilterFn = (row, columnId, filterValue) => {
  const [min, max] = filterValue ?? []
  const value = row.getValue(columnId)
  if (min != null && value < min) return false
  if (max != null && value > max) return false
  return true
}

// Overlap filter: row's [min_hrs, max_hrs] duration window must overlap the
// filter's [min, max] window. Used for the Duration column.
const durationOverlapFilterFn = (row, _columnId, filterValue) => {
  const [min, max] = filterValue ?? []
  const { min_hrs, max_hrs } = row.original
  if (min != null && max_hrs < min) return false
  if (max != null && min_hrs > max) return false
  return true
}

const fmtUGX = (n: number) => n.toLocaleString("en-UG")

// API fields (min_tons, max_tons, price, distance_km, min_hrs, max_hrs) come
// back as decimal strings, e.g. "5.00". Coerce once, centrally.
const num = (v: string) => (typeof v === "string" ? parseFloat(v) : v)
const fmtTon = (v: string) => String(num(v))

// Sample data used only when no `routes` prop is passed, so the component
// still renders standalone. Pass your own `routes` array to reuse it elsewhere.
const SAMPLE_ROUTES = [
  {
    route_id: "12344",
    origin: "Kampala",
    destination: "Kabale",
    distance_km: 410,
    min_hrs: 36,
    max_hrs: 48,
    pricings: [
      { min_tons: 2, max_tons: 5, price: 450000 },
      { min_tons: 6, max_tons: 10, price: 520000 },
      { min_tons: 11, max_tons: 14, price: 550000 },
      { min_tons: 15, max_tons: 19, price: 600000 },
    ],
  },
  {
    route_id: "324835",
    origin: "Kampala",
    destination: "Gulu",
    distance_km: 340,
    min_hrs: 24,
    max_hrs: 36,
    pricings: [
      { min_tons: 2, max_tons: 5, price: 530000 },
      { min_tons: 6, max_tons: 10, price: 570000 },
      { min_tons: 11, max_tons: 14, price: 620000 },
      { min_tons: 15, max_tons: 19, price: 650000 },
    ],
  },
  {
    route_id: "86996",
    origin: "Kampala",
    destination: "Mpondwe",
    distance_km: 440,
    min_hrs: 36,
    max_hrs: 48,
    pricings: [
      { min_tons: 2, max_tons: 5, price: 570000 },
      { min_tons: 6, max_tons: 10, price: 635000 },
      { min_tons: 11, max_tons: 14, price: 670000 },
      { min_tons: 15, max_tons: 19, price: 700000 },
    ],
  },
  {
    route_id: "895495",
    origin: "Kampala",
    destination: "Kisoro",
    distance_km: 480,
    min_hrs: 36,
    max_hrs: 48,
    pricings: [
      { min_tons: 2, max_tons: 5, price: 610000 },
      { min_tons: 6, max_tons: 10, price: 650000 },
      { min_tons: 11, max_tons: 14, price: 690000 },
      { min_tons: 15, max_tons: 19, price: 759000 },
    ],
  },
]

export function RouteTonnagePricingGrid({
  routes = SAMPLE_ROUTES,
  effectiveDate,
  title = "Cargo route rates",
  subtitle,
  isSelectable = false,
  onRowSelect,
}: Props) {
  const [sorting, setSorting] = useState([{ id: "destination", desc: false }])
  const [globalFilter, setGlobalFilter] = useState("")
  const [distMin, setDistMin] = useState("")
  const [distMax, setDistMax] = useState("")
  const [durMin, setDurMin] = useState("")
  const [durMax, setDurMax] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [selectionMode, setSelectionMode] = useState<
    "off" | "single" | "multi"
  >("single")

  // Union of tonnage brackets across all routes, in case different routes
  // in a dataset offer different brackets.
  const tonKeys = useMemo(() => {
    const set = new Set<string>()
    routes.forEach((r) =>
      (r.pricings || []).forEach((p) =>
        set.add(`${num(p.min_tons)}-${num(p.max_tons)}`)
      )
    )
    return Array.from(set).sort(
      (a, b) => Number(a.split("-")[0]) - Number(b.split("-")[0])
    )
  }, [routes])

  // Pivot: one row per route, one column per tonnage bracket
  const data = useMemo(
    () =>
      routes.map((r) => {
        const row = {
          route_id: r.route_id,
          origin: r.origin,
          destination: r.destination,
          distance_km: num(r.distance_km),
          min_hrs: num(r.min_hrs),
          max_hrs: num(r.max_hrs),
        }
        ;(r.pricings || []).forEach((p) => {
          row[`${num(p.min_tons)}-${num(p.max_tons)}`] = num(p.price)
        })
        return row
      }),
    [routes]
  )

  const columns = useMemo(
    () => [
      {
        accessorKey: "destination",
        header: "Destination",
        cell: (info) => (
          <span className="font-medium text-foreground">
            {info.row.original.origin}{" "}
            <span className="text-muted-foreground">→</span> {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "distance_km",
        header: "Distance",
        filterFn: rangeFilterFn,
        cell: (info) => (
          <span className="text-muted-foreground tabular-nums">
            {info.getValue()} km
          </span>
        ),
      },
      {
        id: "duration",
        accessorFn: (row) => row.max_hrs, // sort by upper bound of the window
        header: "Duration",
        filterFn: durationOverlapFilterFn,
        cell: (info) => (
          <span className="text-muted-foreground tabular-nums">
            {info.row.original.min_hrs}–{info.row.original.max_hrs} hrs
          </span>
        ),
      },
      ...tonKeys.map((key) => {
        const [min, max] = key.split("-")
        return {
          accessorKey: key,
          header: `${fmtTon(min)}–${fmtTon(max)}t`,
          cell: (info) => {
            const value = info.getValue()
            return value == null ? (
              <span className="text-muted-foreground/50">—</span>
            ) : (
              <span className="font-semibold text-foreground tabular-nums">
                {fmtUGX(value)}
              </span>
            )
          },
        }
      }),
    ],
    [tonKeys]
  )

  const columnFilters = useMemo(
    () => [
      {
        id: "distance_km",
        value: [
          distMin === "" ? null : Number(distMin),
          distMax === "" ? null : Number(distMax),
        ],
      },
      {
        id: "duration",
        value: [
          durMin === "" ? null : Number(durMin),
          durMax === "" ? null : Number(durMax),
        ],
      },
    ],
    [distMin, distMax, durMin, durMax]
  )

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.destination,
    state: { sorting, globalFilter, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: selectionMode !== "off" && isSelectable,
    enableMultiRowSelection: selectionMode === "multi" && isSelectable,
    globalFilterFn: (row, columnId, value) =>
      row.original.destination.toLowerCase().includes(value.toLowerCase()),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Fire onRowSelect with every currently selected route whenever selection changes.
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const selectedIdsKey = selectedIds.slice().sort().join(",")
  React.useEffect(() => {
    if (!onRowSelect) return
    const selectedRows = data.filter((d) => selectedIds.includes(d.destination))
    onRowSelect(selectedRows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdsKey])

  const clearRangeFilters = () => {
    setDistMin("")
    setDistMax("")
    setDurMin("")
    setDurMax("")
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card font-sans text-sm text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary">
            <Truck size={16} className="text-primary-foreground" />
          </div>
          <div>
            <div className="text-[15px] leading-none font-semibold tracking-tight text-foreground">
              {title}
            </div>
            {(effectiveDate || subtitle) && (
              <div className="mt-1 text-xs text-muted-foreground">
                {effectiveDate && <>Effective {effectiveDate}</>}
                {effectiveDate && subtitle && " · "}
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          {selectedIds.length > 0 && (
            <span className="rounded-full border border-border bg-accent px-2 py-0.5 text-accent-foreground">
              {selectedIds.length} selected
            </span>
          )}
          <span>
            {table.getRowModel().rows.length} of {data.length} routes
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
          <Search size={13} className="shrink-0 text-muted-foreground" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter destination..."
            className="w-32 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5">
          <span className="text-xs text-muted-foreground">Distance (km)</span>
          <input
            type="number"
            value={distMin}
            onChange={(e) => setDistMin(e.target.value)}
            placeholder="min"
            className="w-14 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            value={distMax}
            onChange={(e) => setDistMax(e.target.value)}
            placeholder="max"
            className="w-14 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5">
          <span className="text-xs text-muted-foreground">Duration (hrs)</span>
          <input
            type="number"
            value={durMin}
            onChange={(e) => setDurMin(e.target.value)}
            placeholder="min"
            className="w-14 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            value={durMax}
            onChange={(e) => setDurMax(e.target.value)}
            placeholder="max"
            className="w-14 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

       {isSelectable &&<div className="flex items-center gap-1 rounded-md border border-input bg-background p-1">
          <span className="px-1 text-xs text-muted-foreground">Select</span>
          {[
            { key: "off", label: "Off" } as const,
            { key: "single", label: "Single" } as const,
            { key: "multi", label: "Multi" } as const,
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setSelectionMode(opt.key)
                setRowSelection({})
              }}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                selectionMode === opt.key
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>}

        <div className="ml-auto flex items-center gap-3">
          {(distMin || distMax || durMin || durMax || globalFilter) && (
            <button
              onClick={() => {
                clearRangeFilters()
                setGlobalFilter("")
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setRowSelection({})}
              className="text-xs text-primary hover:underline"
            >
              Clear selection ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDir = header.column.getIsSorted()
                  const sortable = header.column.getCanSort()
                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`border-r border-b border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground select-none ${
                        sortable ? "cursor-pointer hover:text-foreground" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sortable &&
                          (sortDir === "asc" ? (
                            <ArrowUp size={12} />
                          ) : sortDir === "desc" ? (
                            <ArrowDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} className="opacity-30" />
                          ))}
                      </span>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={
                  selectionMode !== "off"
                    ? row.getToggleSelectedHandler()
                    : undefined
                }
                aria-selected={row.getIsSelected()}
                className={`transition-colors ${selectionMode !== "off" ? "cursor-pointer" : ""} ${
                  row.getIsSelected()
                    ? "bg-accent outline outline-1 -outline-offset-1 outline-primary"
                    : "hover:bg-muted/50"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-r border-b border-border px-3 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-sm text-muted-foreground"
                >
                  No routes match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
        Search · sorting, location search filter, range column filters, and row
        selection
      </div>
    </div>
  )
}
