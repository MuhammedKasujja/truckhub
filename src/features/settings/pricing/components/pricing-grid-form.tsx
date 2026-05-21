"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  TonnageBandBuilder,
  bandsAreValid,
  type TonnageBand,
} from "./tonnage-band-builder"
import {
  RoutePricingDataGrid,
  priceKey,
  emptyRow,
  rebuildRows,
  type RoutePricingRow,
} from "./route-pricing-datagrid"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PriceRange {
  min_tons: number
  max_tons: number
  price: number
}

interface RoutePayload {
  name: string
  origin: string
  destination: string
  ranges: PriceRange[]
}

interface BatchPayload {
  valid_from: string
  client_id: number | null
  routes: RoutePayload[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPayload(
  validFrom: string,
  bands: TonnageBand[],
  rows: RoutePricingRow[]
): BatchPayload {
  return {
    valid_from: validFrom,
    client_id: null,
    routes: rows
      .filter((r) => r.route_name.trim())
      .map((row) => ({
        name: row.route_name,
        origin: row.origin,
        destination: row.destination,
        ranges: bands
          .map((band) => ({
            min_tons: band.min_tons as number,
            max_tons: band.max_tons as number,
            price: row[priceKey(band)] as number,
          }))
          .filter((r) => r.price !== null && r.price !== undefined),
      }))
      .filter((r) => r.ranges.length >= 2), // enforce min 2 ranges
  }
}

function validate(
  validFrom: string,
  bands: TonnageBand[],
  rows: RoutePricingRow[]
): string | null {
  if (!validFrom) return "Pricing date is required."
  if (!bandsAreValid(bands))
    return "Define at least 2 valid tonnage bands first."

  const filled = rows.filter((r) => r.route_name.trim())
  if (filled.length === 0) return "Add at least one route."

  for (const row of filled) {
    if (!row.origin.trim()) return `"${row.route_name}" is missing an origin.`
    if (!row.destination.trim())
      return `"${row.route_name}" is missing a destination.`

    const filledPrices = bands.filter(
      (b) => row[priceKey(b)] !== null && row[priceKey(b)] !== undefined
    )
    if (filledPrices.length < 2)
      return `"${row.route_name}" needs prices for at least 2 tonnage bands.`
  }
  return null
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_BANDS: TonnageBand[] = [
  { id: "a", min_tons: 1, max_tons: 4 },
  { id: "b", min_tons: 5, max_tons: 9 },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface Props {
  onSubmit?: (payload: BatchPayload) => Promise<void>
}

export function RoutePricingDataGridForm({ onSubmit }: Props) {
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [bands, setBands] = useState<TonnageBand[]>(INITIAL_BANDS)
  const [rows, setRows] = useState<RoutePricingRow[]>(() => [
    emptyRow(INITIAL_BANDS),
    emptyRow(INITIAL_BANDS),
    emptyRow(INITIAL_BANDS),
    emptyRow(INITIAL_BANDS),
  ])
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [message, setMessage] = useState("")

  // When bands change and are valid, resync every row's price keys.
  // Existing prices for bands that still exist are preserved.
  useEffect(() => {
    if (!bandsAreValid(bands)) return
    setRows((prev) =>
      prev.length > 0 ? rebuildRows(prev, bands) : [emptyRow(bands)]
    )
  }, [bands])

  const handleRowsChange = useCallback((updated: RoutePricingRow[]) => {
    setRows(updated)
  }, [])

  async function handleSubmit() {
    const err = validate(validFrom, bands, rows)
    if (err) {
      setStatus("error")
      setMessage(err)
      return
    }

    const payload = buildPayload(validFrom, bands, rows)
    setStatus("loading")

    try {
      if (onSubmit) {
        await onSubmit(payload)
      } else {
        // Default: log to console — replace with your API call
        console.log("Batch payload:", JSON.stringify(payload, null, 2))
        await new Promise((r) => setTimeout(r, 600))
      }
      setStatus("success")
      setMessage("Batch submitted successfully.")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (e: any) {
      setStatus("error")
      setMessage(e?.message ?? "Submission failed.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-medium tracking-tight">
          Route tonnage pricing
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Define tonnage bands then fill prices per route in the grid. Columns
          are generated automatically from your band definitions.
        </p>
      </div>

      {/* Valid from */}
      <div className="w-60 space-y-1.5">
        <Label htmlFor="grid-valid-from" className="text-sm">
          Pricing valid from
        </Label>
        <Input
          id="grid-valid-from"
          type="date"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
        />
      </div>

      {/* Tonnage band builder */}
      <TonnageBandBuilder bands={bands} onChange={setBands} />

      {/* Data grid */}
      <RoutePricingDataGrid
        bands={bands}
        rows={rows}
        onChange={handleRowsChange}
      />

      {/* Feedback */}
      {status === "success" && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Submit */}
      <div className="flex justify-end border-t pt-4">
        <Button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="min-w-36"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit batch
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
