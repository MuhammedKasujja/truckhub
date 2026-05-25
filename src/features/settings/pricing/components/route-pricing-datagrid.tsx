"use client"

import { useCallback, useMemo, useRef } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column"
import { useDataGrid } from "@/hooks/use-data-grid"
import {
  useDataGridUndoRedo,
  type UndoRedoCellUpdate,
} from "@/hooks/use-data-grid-undo-redo"
import { getFilterFn } from "@/lib/data-grid-filters"

import type { TonnageBand } from "./tonnage-band-builder"
import { bandsAreValid } from "./tonnage-band-builder"
import { BookingRoute } from "../../booking-routes/schemas"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoutePricingRow {
  /** Stable row identity — use crypto.randomUUID() for new rows */
  id: string
  route_name: string
  origin: string
  destination: string
  distance_km: string | number | null
  /**
   * Dynamic price columns keyed by band label e.g. "1–4t".
   * Dice UI's DataGrid accesses nested keys via dot-notation accessorKey,
   * but TanStack Table flattens nested accessors — we store prices flat
   * on the row object using a prefixed key: `price__1–4t`.
   */
  [priceKey: `price__${string}`]: number | null | undefined
}

interface RoutePricingDataGridProps {
  bands: TonnageBand[]
  rows: RoutePricingRow[]
  routes: BookingRoute[]
  onChange: (rows: RoutePricingRow[]) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function bandLabel(band: TonnageBand): string {
  return `${band.min_tons}–${band.max_tons}T`
}

export function priceKey(band: TonnageBand): `price__${string}` {
  return `price__${bandLabel(band)}`
}

export function emptyRow(bands: TonnageBand[]): RoutePricingRow {
  const base: RoutePricingRow = {
    id: crypto.randomUUID(),
    route_name: "",
    origin: "",
    destination: "",
    distance_km: null,
  }
  bands.forEach((b) => {
    base[priceKey(b)] = null
  })
  return base
}

/**
 * When bands change, rebuild every row so it has exactly the right price keys.
 * Prices for bands that still exist are preserved; removed bands are dropped;
 * new bands are initialised to null.
 */
export function rebuildRows(
  rows: RoutePricingRow[],
  bands: TonnageBand[]
): RoutePricingRow[] {
  return rows.map((row) => {
    const rebuilt: RoutePricingRow = {
      id: row.id,
      route_name: row.route_name,
      origin: row.origin,
      destination: row.destination,
      distance_km: row.distance_km,
    }
    bands.forEach((b) => {
      rebuilt[priceKey(b)] = row[priceKey(b)] ?? null
    })
    return rebuilt
  })
}

// ---------------------------------------------------------------------------
// Column factory
// ---------------------------------------------------------------------------

function buildColumns(
  bands: TonnageBand[],
  routes: BookingRoute[]
): ColumnDef<RoutePricingRow>[] {
  const filterFn = getFilterFn<RoutePricingRow>()
  const routeOptions = routes.map((route) => ({
    label: route.origin,
    value: route.id.toString(),
  }))
  const metaCols: ColumnDef<RoutePricingRow>[] = [
    getDataGridSelectColumn<RoutePricingRow>(),
    {
      id: "route_name",
      accessorKey: "route_name",
      header: "Route name",
      minSize: 160,
      filterFn,
      // enableSorting: true,
      // enablePinning: false,
      // enableHiding: false,
      meta: {
        label: "Name",
        cell: {
          variant: "select",
          options: routeOptions,
        },
      },
    },
    {
      id: "origin",
      accessorKey: "origin",
      header: "Origin",
      minSize: 120,
      filterFn,
      enableSorting: false,
      enablePinning: false,
      enableHiding: false,
    },
    {
      id: "destination",
      accessorKey: "destination",
      header: "Destination",
      minSize: 120,
      filterFn,
      enableSorting: false,
      enablePinning: false,
      enableHiding: false,
    },
    {
      id: "distance",
      accessorKey: "distance_km",
      header: "Distance (km)",
      minSize: 120,
      filterFn,
      enableSorting: false,
      enablePinning: false,
      enableHiding: false,
    },
  ]

  // Dynamically generated price columns — one per tonnage band.
  // size/minSize/maxSize are intentionally omitted here — they are set
  // via defaultColumn in useDataGrid, which is the correct place in Dice UI
  // because it seeds columnSizeVars (the CSS variable map used for rendering).
  // Per-column overrides would be ignored for dynamically added columns whose
  // IDs weren't known when columnSizeVars was first computed.
  const priceCols: ColumnDef<RoutePricingRow>[] = bands.map((band) => ({
    id: priceKey(band),
    accessorKey: priceKey(band),
    header: bandLabel(band),
    enableSorting: false,
    enablePinning: false,
    enableHiding: false,
    // meta: {
    //   label: `Price (${bandLabel(band)})`,
    //   cell: { variant: "number", min: 0, step: 1 },
    // },
  }))

  return [...metaCols, ...priceCols]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoutePricingDataGrid({
  bands,
  rows,
  routes,
  onChange,
}: RoutePricingDataGridProps) {
  // Build a lookup map from route name → route data for O(1) auto-fill
  // NOTE: Mapping Route name to id since the Route name column options return the route id instead of the name
  const routeByName = useMemo(
    () => new Map(routes.map((r) => [r.id, r])),
    [routes]
  )

  const validBands = bandsAreValid(bands)

  // Once the grid has been shown, keep it mounted even while bands are
  // temporarily invalid (e.g. a new empty band was just added).
  // This prevents the grid from unmounting and losing sort/filter/selection state.
  const hasEverBeenValid = useRef(false)
  if (validBands) hasEverBeenValid.current = true
  const shouldShowGrid = hasEverBeenValid.current

  // Only rebuild columns from bands that are fully valid (both min and max
  // defined, max > min). This freezes the signature while the user is
  // mid-edit on a band field, preventing column rebuilds — and focus theft —
  // on every keystroke.
  const validBandsOnly = useMemo(
    () =>
      bands.filter(
        (b) =>
          b.min_tons !== undefined &&
          b.max_tons !== undefined &&
          !isNaN(b.min_tons) &&
          !isNaN(b.max_tons) &&
          b.max_tons > b.min_tons
      ),
    [bands]
  )

  const bandSignature = useMemo(
    () => validBandsOnly.map((b) => `${b.min_tons}-${b.max_tons}`).join("|"),
    [validBandsOnly]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => buildColumns(validBandsOnly, routes),
    [bandSignature, routes]
  )

  // ── Undo / redo ────────────────────────────────────────────────────────────
  const { trackCellsUpdate, trackRowsAdd, trackRowsDelete } =
    useDataGridUndoRedo({
      data: rows,
      onDataChange: onChange,
      getRowId: (row) => row.id,
    })

  const handleDataChange = useCallback(
    (newRows: RoutePricingRow[]) => {
      // Auto-fill origin, destination, distance_km when route_name changes.
      // We compare old vs new route_name for each row — if it changed and
      // the new value matches a known route, overwrite the derived fields.
      const enriched = newRows.map((newRow, i) => {
        const oldRow = rows[i]
        if (!oldRow) return newRow
        if (newRow.route_name !== oldRow.route_name && newRow.route_name) {
          const match = routeByName.get(newRow.route_name)
          // console.log({
          //   "newRow.route_name": newRow.route_name,
          //   "oldRow.route_name": oldRow.route_name,
          //   match: match,
          // })
          if (match) {
            return {
              ...newRow,
              origin: match.origin,
              destination: match.destination,
              distance_km: match.distance_km ?? null,
            }
          }
        }
        return newRow
      })

      // Diff old vs new to build the undo/redo cell update list
      const cellUpdates: UndoRedoCellUpdate[] = []
      for (let i = 0; i < rows.length; i++) {
        const oldRow = rows[i]
        const newRow = enriched[i]
        if (!oldRow || !newRow) continue
        for (const key of Object.keys(oldRow) as (keyof RoutePricingRow)[]) {
          if (key === "id") continue
          const oldVal = oldRow[key]
          const newVal = newRow[key]

          console.log({
            "index": i,
            key,
            oldVal,
            newVal,
          })
          if (!Object.is(oldVal, newVal)) {
            cellUpdates.push({
              rowId: oldRow.id,
              columnId: key as string,
              previousValue: oldVal,
              newValue: newVal,
            })
          }
        }
      }
      if (cellUpdates.length > 0) trackCellsUpdate(cellUpdates)
      onChange(enriched)
    },
    [rows, routeByName, trackCellsUpdate, onChange]
  )

  // ── Row add / delete ───────────────────────────────────────────────────────
  const handleRowAdd = useCallback(() => {
    const newRow = emptyRow(bands)
    onChange([...rows, newRow])
    trackRowsAdd([newRow])
    return { rowIndex: rows.length, columnId: "route_name" }
  }, [bands, rows, onChange, trackRowsAdd])

  const handleRowsDelete = useCallback(
    (deletedRows: RoutePricingRow[]) => {
      trackRowsDelete(deletedRows)
      const deletedIds = new Set(deletedRows.map((r) => r.id))
      onChange(rows.filter((r) => !deletedIds.has(r.id)))
    },
    [rows, onChange, trackRowsDelete]
  )

  // ── useDataGrid ────────────────────────────────────────────────────────────
  const { table, ...dataGridProps } = useDataGrid({
    data: rows,
    columns,
    onDataChange: handleDataChange,
    onRowAdd: handleRowAdd,
    onRowsDelete: handleRowsDelete,
    getRowId: (row) => row.id,
    enableSearch: true,
    enablePaste: true,
    defaultColumn: {
      size: 130,
      minSize: 110,
      maxSize: 400,
    },
    initialState: {
      columnPinning: {
        // left: ["route_name", "origin", "destination"],
        left: ["route_name"],
      },
      columnVisibility: {
        select: false,
      },
    },
  })

  // ── Patch columnSizeVars for dynamically added columns ────────────────────
  // useDataGrid computes columnSizeVars from table.getState().columnSizing,
  // which only contains columns that have been explicitly resized or were
  // present at init. New dynamic price columns have no entry in columnSizing
  // so their CSS vars are absent and the column renders at ~0px.
  //
  // Fix: iterate all flat headers and inject any missing CSS vars using
  // header.getSize() — which correctly falls back to defaultColumn.size (130).
  const patchedColumnSizeVars = useMemo(() => {
    const vars: Record<string, number> = {
      ...(dataGridProps.columnSizeVars as Record<string, number>),
    }
    for (const header of table.getFlatHeaders()) {
      const headerVar = `--header-${header.id}-size`
      const colVar = `--col-${header.column.id}-size`
      if (!(headerVar in vars)) vars[headerVar] = header.getSize()
      if (!(colVar in vars)) vars[colVar] = header.column.getSize()
    }
    return vars
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataGridProps.columnSizeVars, bandSignature])

  // ── Render ────────────────────────────────────────────────────────────────
  // Never unmount the grid once it has been shown — doing so loses all
  // TanStack Table state (sort, filter, selection, column sizes).
  // Instead show a placeholder overlay when bands are temporarily invalid.
  if (!shouldShowGrid) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-sm text-muted-foreground">
        Define at least 2 valid tonnage bands above to activate the pricing
        grid.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Keyboard shortcuts reference */}
      <DataGridKeyboardShortcuts
        enableSearch
        enableUndoRedo
        enablePaste
        enableRowAdd
        enableRowsDelete
      />

      {/* Banner shown while bands are temporarily invalid */}
      {!validBands && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
          Finish defining your tonnage bands — the grid is paused until all
          bands are valid.
        </div>
      )}

      {/* Grid — always mounted once first shown to preserve table state.
           patchedColumnSizeVars overrides the one in dataGridProps to
           include CSS vars for newly added dynamic price columns. */}
      <div
        style={{
          opacity: validBands ? 1 : 0.4,
          pointerEvents: validBands ? "auto" : "none",
        }}
      >
        <DataGrid
          table={table}
          {...dataGridProps}
          columnSizeVars={patchedColumnSizeVars}
          height={520}
          stretchColumns={false}
        />
      </div>
    </div>
  )
}
