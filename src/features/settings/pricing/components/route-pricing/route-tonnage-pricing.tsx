// type Props = {
//   title: string
//   routes: RoutePricing[]
//   effectiveDate: string
//   subtitle?: string
// }

import React, { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Truck } from "lucide-react"

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

const fmtUGX = (n) => n.toLocaleString("en-UG")

// API fields (min_tons, max_tons, price, distance_km, min_hrs, max_hrs) come
// back as decimal strings, e.g. "5.00". Coerce once, centrally.
const num = (v) => (typeof v === "string" ? parseFloat(v) : v)
const fmtTon = (v) => String(num(v))

// Sample data used only when no `routes` prop is passed, so the component
// still renders standalone. Pass your own `routes` array to reuse it elsewhere.
const SAMPLE_ROUTES = [
  {
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

/**
 * RouteRatesTable
 *
 * Reusable across pages — pass in whatever route/pricing data you have.
 *
 * Props:
 *   routes         Array<{ origin, destination, distance_km, min_hrs, max_hrs,
 *                          pricings: Array<{ min_tons, max_tons, price }> }>
 *   effectiveDate  string, e.g. "2026-09-03" (optional)
 *   title          string, header title (optional, defaults to "Cargo route rates")
 *   subtitle       string, small text next to the date (optional, e.g. "Kampala origin")
 *   onRowSelect    (rows: Array) => void — called with the pivoted row data for
 *                  every currently selected route whenever selection changes.
 *                  Empty when the mode switcher is set to "Off" (optional)
 */
export function RouteTonnagePricingGrid({
  routes = SAMPLE_ROUTES,
  effectiveDate,
  title = "Cargo route rates",
  subtitle,
  onRowSelect,
}) {
  const [sorting, setSorting] = useState([{ id: "destination", desc: false }])
  const [globalFilter, setGlobalFilter] = useState("")
  const [distMin, setDistMin] = useState("")
  const [distMax, setDistMax] = useState("")
  const [durMin, setDurMin] = useState("")
  const [durMax, setDurMax] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [selectionMode, setSelectionMode] = useState("single") // "off" | "single" | "multi"

  // Union of tonnage brackets across all routes, in case different routes
  // in a dataset offer different brackets.
  const tonKeys = useMemo(() => {
    const set = new Set()
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
          <span className="text-[#F4F7FA]">
            {info.row.original.origin} <span className="text-[#5C6B7A]">→</span>{" "}
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "distance_km",
        header: "Distance",
        filterFn: rangeFilterFn,
        cell: (info) => (
          <span className="text-[#B9C4D0]">{info.getValue()} km</span>
        ),
      },
      {
        id: "duration",
        accessorFn: (row) => row.max_hrs, // sort by upper bound of the window
        header: "Duration",
        filterFn: durationOverlapFilterFn,
        cell: (info) => (
          <span className="text-[#B9C4D0]">
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
              <span className="text-[#3E4C5C]">—</span>
            ) : (
              <span className="font-semibold text-[#F4C77A]">
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
    enableRowSelection: selectionMode !== "off",
    enableMultiRowSelection: selectionMode === "multi",
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
    <div className="w-full rounded-xl border border-[#233041] bg-[#0F1720] font-mono text-[13px] text-[#E7ECF2]">
      <div className="flex items-center justify-between gap-3 border-b border-[#233041] px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#D97B2E]">
            <Truck size={16} className="text-[#0F1720]" />
          </div>
          <div>
            <div className="text-[15px] leading-none font-semibold tracking-tight text-[#F4F7FA]">
              {title}
            </div>
            {(effectiveDate || subtitle) && (
              <div className="mt-1 text-[11px] text-[#7C8B9C]">
                {effectiveDate && <>Effective {effectiveDate}</>}
                {effectiveDate && subtitle && " · "}
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[11px] text-[#7C8B9C] sm:flex">
          {selectedIds.length > 0 && (
            <span className="rounded border border-[#2B3A4C] bg-[#1C2833] px-1.5 py-0.5 text-[#D97B2E]">
              {selectedIds.length} selected
            </span>
          )}
          <span>
            {table.getRowModel().rows.length} of {data.length} routes
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#233041] bg-[#111B26] px-5 py-3">
        <div className="flex items-center gap-2 rounded-md border border-[#2B3A4C] bg-[#0F1720] px-2.5 py-1.5">
          <Search size={13} className="shrink-0 text-[#5C6B7A]" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter destination..."
            className="w-32 bg-transparent text-[12px] text-[#E7ECF2] outline-none placeholder:text-[#5C6B7A]"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-[#2B3A4C] bg-[#0F1720] px-2.5 py-1.5">
          <span className="text-[11px] text-[#5C6B7A]">Distance (km)</span>
          <input
            type="number"
            value={distMin}
            onChange={(e) => setDistMin(e.target.value)}
            placeholder="min"
            className="w-14 bg-transparent text-[12px] text-[#E7ECF2] outline-none placeholder:text-[#5C6B7A]"
          />
          <span className="text-[#5C6B7A]">–</span>
          <input
            type="number"
            value={distMax}
            onChange={(e) => setDistMax(e.target.value)}
            placeholder="max"
            className="w-14 bg-transparent text-[12px] text-[#E7ECF2] outline-none placeholder:text-[#5C6B7A]"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-[#2B3A4C] bg-[#0F1720] px-2.5 py-1.5">
          <span className="text-[11px] text-[#5C6B7A]">Duration (hrs)</span>
          <input
            type="number"
            value={durMin}
            onChange={(e) => setDurMin(e.target.value)}
            placeholder="min"
            className="w-14 bg-transparent text-[12px] text-[#E7ECF2] outline-none placeholder:text-[#5C6B7A]"
          />
          <span className="text-[#5C6B7A]">–</span>
          <input
            type="number"
            value={durMax}
            onChange={(e) => setDurMax(e.target.value)}
            placeholder="max"
            className="w-14 bg-transparent text-[12px] text-[#E7ECF2] outline-none placeholder:text-[#5C6B7A]"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-[#2B3A4C] bg-[#0F1720] px-1 py-1">
          <span className="px-1 text-[11px] text-[#5C6B7A]">Select</span>
          {[
            { key: "off", label: "Off" },
            { key: "single", label: "Single" },
            { key: "multi", label: "Multi" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setSelectionMode(opt.key)
                setRowSelection({})
              }}
              className={`rounded px-2 py-1 text-[11px] transition-colors ${
                selectionMode === opt.key
                  ? "bg-[#D97B2E] font-medium text-[#0F1720]"
                  : "text-[#7C8B9C] hover:text-[#E7ECF2]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {(distMin || distMax || durMin || durMax || globalFilter) && (
            <button
              onClick={() => {
                clearRangeFilters()
                setGlobalFilter("")
              }}
              className="text-[11px] text-[#D97B2E] hover:underline"
            >
              Clear filters
            </button>
          )}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setRowSelection({})}
              className="text-[11px] text-[#D97B2E] hover:underline"
            >
              Clear selection ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

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
                      className={`border-r border-b border-[#233041] px-3 py-2 text-left text-[11px] font-medium text-[#7C8B9C] select-none ${
                        sortable ? "cursor-pointer hover:text-[#E7ECF2]" : ""
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
                            <ArrowUpDown size={12} className="opacity-25" />
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
                    ? "bg-[#1B2733] outline outline-1 -outline-offset-1 outline-[#D97B2E]"
                    : "hover:bg-[#141F2B]"
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-r border-b border-[#1A2531] px-3 py-2"
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
                  className="px-5 py-8 text-center text-[13px] text-[#5C6B7A]"
                >
                  No routes match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#233041] px-5 py-2.5 text-[10.5px] text-[#5C6B7A]">
        Sorting, search by location, and range column filters, and row selection
      </div>
    </div>
  )
}
