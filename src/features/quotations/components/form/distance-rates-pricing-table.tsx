import { useMemo } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
  type FilterFn,
} from "@tanstack/react-table"
import { DistanceTonnagePricingItem } from "@/features/settings/pricing/types";

/* ---------- Types ---------- */

type Tier = { key: string; min: number; max: number; label: string }

type BandRow = {
  key: string
  min: number
  max: number
  label: string
  cells: Record<string, DistanceTonnagePricingItem | undefined> // keyed by tonnage tier key
}

type RateMatrixProps = {
  data: DistanceTonnagePricingItem[]
  /** Id of the currently selected price, if any. */
  selectedId?: string | null
  onSelect: (price: DistanceTonnagePricingItem) => void
  /** Distance in km used to highlight (or filter to) the matching band. */
  distanceKm?: number
  /** Load in tons used to highlight the matching tonnage column. */
  loadTons?: number
  /** Only show the band that contains `distanceKm`. */
  onlyMatching?: boolean
}

/* ---------- Helpers ---------- */

const num = (n: number | string) => Number(n).toLocaleString("en-UG")

/** Turns the flat API list into one row per distance band and one column per tonnage tier. */
function pivot(data: DistanceTonnagePricingItem[]) {
  const tierMap = new Map<string, Tier>()
  const rowMap = new Map<string, BandRow>()

  for (const p of data) {
    const tMin = Number(p.tonnage_min)
    const tMax = Number(p.tonnage_max)
    const tKey = `${tMin}-${tMax}`
    if (!tierMap.has(tKey)) {
      tierMap.set(tKey, {
        key: tKey,
        min: tMin,
        max: tMax,
        label: `${tMin} – ${tMax} tons`,
      })
    }

    const rKey = `${p.distance_min_km}-${p.distance_max_km}`
    if (!rowMap.has(rKey)) {
      rowMap.set(rKey, {
        key: rKey,
        min: p.distance_min_km,
        max: p.distance_max_km,
        label: `${p.distance_min_km} – ${p.distance_max_km} km`,
        cells: {},
      })
    }
    rowMap.get(rKey)!.cells[tKey] = p
  }

  return {
    tiers: [...tierMap.values()].sort((a, b) => a.min - b.min),
    rows: [...rowMap.values()].sort((a, b) => a.min - b.min),
  }
}

/** Bands have small gaps (50 → 51, 3 → 4), so match "first band whose max is >= value". */
const matchBy = <T extends { max: number }>(items: T[], value: number) =>
  items.find((i) => value <= i.max) ?? items[items.length - 1]

// Custom filter: does this band contain the typed distance?
const containsDistance: FilterFn<BandRow> = (row, _id, km: number) =>
  km <= row.original.max && km >= row.original.min - 1

const columnHelper = createColumnHelper<BandRow>()
const NO_FILTERS: ColumnFiltersState = []

/* ---------- Component ---------- */

export function DistanceRatePricingTable({
  data,
  selectedId,
  onSelect,
  distanceKm,
  loadTons,
  onlyMatching = false,
}: RateMatrixProps) {
  const { tiers, rows } = useMemo(() => pivot(data), [data])

  const hasDistance = distanceKm !== undefined && distanceKm > 0
  const hasLoad = loadTons !== undefined && loadTons > 0
  const matchedRow = hasDistance ? matchBy(rows, distanceKm!) : undefined
  const matchedTier = hasLoad ? matchBy(tiers, loadTons!) : undefined

  // Must be referentially stable: a new array every render makes TanStack
  // recompute the filtered rows on every render, which re-renders, and loops.
  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      onlyMatching && hasDistance
        ? [{ id: "distance", value: distanceKm }]
        : NO_FILTERS,
    [onlyMatching, hasDistance, distanceKm]
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor("label", {
        id: "distance",
        header: "Distance",
        filterFn: containsDistance,
        cell: (c) => (
          <span className="font-medium text-slate-900">{c.getValue()}</span>
        ),
      }),
      // One column per tonnage tier, built from the data
      ...tiers.map((tier) =>
        columnHelper.display({
          id: tier.key,
          header: tier.label,
          cell: ({ row }) => {
            const price = row.original.cells[tier.key]
            if (!price) {
              return (
                <span className="px-3 text-sm text-slate-400">No rate</span>
              )
            }
            const isSelected = selectedId === price.id
            return (
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(price)}
                className={[
                  "min-h-11 w-full rounded-lg border px-3 text-left text-sm transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6b5c]",
                  isSelected
                    ? "border-2 border-[#0f6b5c] bg-[#d6ece6] font-semibold text-[#0b5a4d]"
                    : "border-slate-200 bg-white text-slate-800 hover:border-[#0f6b5c]",
                ].join(" ")}
              >
                {num(price.min_price)} – {num(price.max_price)}
              </button>
            )
          },
        })
      ),
    ],
    [tiers, selectedId, onSelect]
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnFilters },
    autoResetPageIndex: false, // no pagination here; avoids a state update on every filter recompute
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (r) => r.key,
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3.5">
      <p className="text-sm text-slate-600">
        {rows.length} distance bands. Your distance and load are highlighted.
      </p>

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-36" />
            {tiers.map((t) => (
              <col key={t.key} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    scope="col"
                    className={[
                      "border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold",
                      matchedTier?.key === h.column.id
                        ? "text-[#0b5a4d]"
                        : "text-slate-600",
                    ].join(" ")}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={tiers.length + 1}
                  className="p-6 text-sm text-slate-600"
                >
                  No band covers {distanceKm} km. Clear the distance or untick
                  “Only show matching band”.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => {
              const isMatch = matchedRow?.key === row.id
              return (
                <tr
                  key={row.id}
                  className={isMatch ? "bg-[#eaf5f2]" : undefined}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <td key={cell.id} className="p-1">
                      {i === 0 ? (
                        <div className="px-2 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                          {isMatch && (
                            <div className="text-[11px] font-medium text-[#0b5a4d]">
                              Matches {distanceKm} km
                            </div>
                          )}
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
