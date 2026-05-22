"use client"

import { useCallback, useMemo, useRef } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { DataGrid } from "@/components/data-grid/data-grid"
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts"
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu"
import { DataGridFilterMenu } from "@/components/data-grid/data-grid-filter-menu"
import { DataGridViewMenu } from "@/components/data-grid/data-grid-view-menu"
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column"
import { useDataGrid } from "@/hooks/use-data-grid"
import {
  useDataGridUndoRedo,
  type UndoRedoCellUpdate,
} from "@/hooks/use-data-grid-undo-redo"
import { getFilterFn } from "@/lib/data-grid-filters"

import type { TonnageBand } from "./tonnage-band-builder"
import { bandsAreValid } from "./tonnage-band-builder"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoutePricingRow {
  /** Stable row identity — use crypto.randomUUID() for new rows */
  id: string
  route_name: string
  origin: string
  destination: string
  client_id: number | null
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
  onChange: (rows: RoutePricingRow[]) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function bandLabel(band: TonnageBand): string {
  return `${band.min_tons}–${band.max_tons}t`
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
    client_id: null,
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
      client_id: row.client_id,
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

function buildColumns(bands: TonnageBand[]): ColumnDef<RoutePricingRow>[] {
  const filterFn = getFilterFn<RoutePricingRow>()

  const metaCols: ColumnDef<RoutePricingRow>[] = [
    getDataGridSelectColumn<RoutePricingRow>(),
    {
      id: "route_name",
      accessorKey: "route_name",
      header: "Route name",
      minSize: 160,
      filterFn,
      meta: {
        label: "Route name",
        cell: { variant: "short-text" },
      },
    },
    {
      id: "origin",
      accessorKey: "origin",
      header: "Origin",
      minSize: 120,
      filterFn,
      meta: {
        label: "Origin",
        cell: { variant: "short-text" },
      },
    },
    {
      id: "destination",
      accessorKey: "destination",
      header: "Destination",
      minSize: 120,
      filterFn,
      meta: {
        label: "Destination",
        cell: { variant: "short-text" },
      },
    },
    {
      id: "client_id",
      accessorKey: "client_id",
      header: "Client ID",
      minSize: 90,
      meta: {
        label: "Client ID",
        cell: { variant: "number", min: 1, step: 1 },
      },
    },
  ]

  // Dynamically generated price columns — one per tonnage band
  const priceCols: ColumnDef<RoutePricingRow>[] = bands.map((band) => ({
    id: priceKey(band),
    accessorKey: priceKey(band),
    header: bandLabel(band),
    minSize: 110,
    meta: {
      label: `Price (${bandLabel(band)})`,
      cell: { variant: "number", min: 0, step: 1 },
    },
  }))

  return [...metaCols, ...priceCols]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoutePricingDataGrid({
  bands,
  rows,
  onChange,
}: RoutePricingDataGridProps) {
  const validBands = bandsAreValid(bands)

  // Once the grid has been shown, keep it mounted even while bands are
  // temporarily invalid (e.g. a new empty band was just added).
  // This prevents the grid from unmounting and losing sort/filter/selection state.
  const hasEverBeenValid = useRef(false)
  if (validBands) hasEverBeenValid.current = true
  const shouldShowGrid = hasEverBeenValid.current

  // Columns must be a stable reference that only changes when band shapes
  // actually change. We derive a primitive signature string from the bands
  // and use it as the sole memo dependency — so TanStack Table only rebuilds
  // the column model when a band is genuinely added, removed, or edited.
  // This avoids both stale columns (empty deps []) and excessive rebuilds
  // (object reference deps that change every render).
  const bandSignature = useMemo(
    () => bands.map((b) => `${b.min_tons}-${b.max_tons}`).join("|"),
    [bands]
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => buildColumns(bands), [bandSignature])

  // ── Undo / redo ────────────────────────────────────────────────────────────
  const { trackCellsUpdate, trackRowsAdd, trackRowsDelete } =
    useDataGridUndoRedo({
      data: rows,
      onDataChange: onChange,
      getRowId: (row) => row.id,
    })

  const handleDataChange = useCallback(
    (newRows: RoutePricingRow[]) => {
      // Diff old vs new to build the undo/redo cell update list
      const cellUpdates: UndoRedoCellUpdate[] = []
      for (let i = 0; i < rows.length; i++) {
        const oldRow = rows[i]
        const newRow = newRows[i]
        if (!oldRow || !newRow) continue
        for (const key of Object.keys(oldRow) as (keyof RoutePricingRow)[]) {
          if (key === "id") continue
          const oldVal = oldRow[key]
          const newVal = newRow[key]
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
      onChange(newRows)
    },
    [rows, trackCellsUpdate, onChange]
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
    // autoFocus: { rowIndex: 0, columnId: "route_name" },
    initialState: {
      // Pin the 4 meta columns so price columns scroll independently
      columnPinning: {
        left: ["select", "route_name", "origin", "destination", "client_id"],
      },
    },
  })

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
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-orientation="horizontal"
        className="flex items-center gap-2 self-end"
      >
        <DataGridFilterMenu table={table} />
        <DataGridSortMenu table={table} />
        <DataGridViewMenu table={table} />
      </div>

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

      {/* Grid — always mounted once first shown to preserve table state */}
      <div
        style={{
          opacity: validBands ? 1 : 0.4,
          pointerEvents: validBands ? "auto" : "none",
        }}
      >
        <DataGrid
          table={table}
          {...dataGridProps}
          height={520}
          stretchColumns={false}
        />
      </div>
    </div>
  )
}
