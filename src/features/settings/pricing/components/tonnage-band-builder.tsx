import { useState } from "react"
import { Plus, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TonnageBand {
  id: string // local key only, not sent to API
  min_tons: number | undefined
  max_tons: number | undefined
}

interface BandError {
  min_tons?: string
  max_tons?: string
}

interface TonnageBandBuilderProps {
  bands: TonnageBand[]
  onChange: (bands: TonnageBand[]) => void
}

function validateBand(band: TonnageBand, all: TonnageBand[]): BandError {
  const err: BandError = {}

  if (band.min_tons === undefined || isNaN(band.min_tons)) {
    err.min_tons = "Required"
  } else if (band.min_tons < 0) {
    err.min_tons = "Must be ≥ 0"
  }

  if (band.max_tons === undefined || isNaN(band.max_tons)) {
    err.max_tons = "Required"
  } else if (band.max_tons < 0) {
    err.max_tons = "Must be ≥ 0"
  } else if (
    band.min_tons !== undefined &&
    !isNaN(band.min_tons) &&
    band.max_tons <= band.min_tons
  ) {
    err.max_tons = "Must be greater than min"
  }
  if (band.min_tons !== undefined && band.min_tons > 30) {
    err.min_tons = "Must not exceed 30"
  }
  if (band.max_tons !== undefined && band.max_tons > 30) {
    err.max_tons = "Must not exceed 30"
  }

  // Overlap check against other bands
  if (!err.min_tons && !err.max_tons) {
    const overlaps = all.some(
      (b) =>
        b.id !== band.id &&
        b.min_tons !== undefined &&
        b.max_tons !== undefined &&
        b.min_tons < band.max_tons! &&
        b.max_tons > band.min_tons!
    )
    if (overlaps) err.max_tons = "Overlaps another band"
  }

  return err
}

export function TonnageBandBuilder({
  bands,
  onChange,
}: TonnageBandBuilderProps) {
  const [touched, setTouched] = useState<Set<string>>(new Set())

  function markTouched(id: string, field: "min_tons" | "max_tons") {
    setTouched((prev) => new Set(prev).add(`${id}-${field}`))
  }

  function addBand() {
    onChange([
      ...bands,
      { id: crypto.randomUUID(), min_tons: undefined, max_tons: undefined },
    ])
  }

  function removeBand(id: string) {
    onChange(bands.filter((b) => b.id !== id))
  }

  function updateBand(id: string, field: "min_tons" | "max_tons", raw: string) {
    const value = raw === "" ? undefined : parseFloat(raw)
    onChange(bands.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const allErrors = Object.fromEntries(
    bands.map((b) => [b.id, validateBand(b, bands)])
  )

  const hasAnyError = Object.values(allErrors).some(
    (e) => e.min_tons || e.max_tons
  )

  const validCount = bands.filter((b) => {
    const e = allErrors[b.id]
    return !e.min_tons && !e.max_tons
  }).length

  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Tonnage bands</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Define the min/max bands once — all routes will be prefilled with
              these.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasAnyError && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <Badge variant="secondary" className="font-mono text-xs">
              {validCount} band{validCount !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-5 pb-5">
        {/* Column headers */}
        {bands.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_32px] gap-3 px-1">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              Min (tons)
            </Label>
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">
              Max (tons)
            </Label>
            <span />
          </div>
        )}

        {bands.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No bands yet. Add at least 2 before creating routes.
          </p>
        )}

        {bands.map((band, idx) => {
          const errs = allErrors[band.id]
          const minTouched = touched.has(`${band.id}-min_tons`)
          const maxTouched = touched.has(`${band.id}-max_tons`)

          return (
            <div key={band.id} className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_32px] items-center gap-3">
                {/* Min */}
                <div className="space-y-1">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g. 1"
                    value={band.min_tons ?? ""}
                    aria-label={`Band ${idx + 1} min tons`}
                    aria-invalid={minTouched && !!errs.min_tons}
                    className={cn(
                      minTouched && errs.min_tons && "border-destructive"
                    )}
                    onChange={(e) =>
                      updateBand(band.id, "min_tons", e.target.value)
                    }
                    onBlur={() => markTouched(band.id, "min_tons")}
                  />
                  {minTouched && errs.min_tons && (
                    <p className="text-xs text-destructive">{errs.min_tons}</p>
                  )}
                </div>

                {/* Max */}
                <div className="space-y-1">
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="e.g. 9"
                    value={band.max_tons ?? ""}
                    aria-label={`Band ${idx + 1} max tons`}
                    aria-invalid={maxTouched && !!errs.max_tons}
                    className={cn(
                      maxTouched && errs.max_tons && "border-destructive"
                    )}
                    onChange={(e) =>
                      updateBand(band.id, "max_tons", e.target.value)
                    }
                    onBlur={() => markTouched(band.id, "max_tons")}
                  />
                  {maxTouched && errs.max_tons && (
                    <p className="text-xs text-destructive">{errs.max_tons}</p>
                  )}
                </div>

                {/* Remove */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                    bands.length <= 1 && "pointer-events-none invisible"
                  )}
                  onClick={() => removeBand(band.id)}
                  aria-label={`Remove band ${idx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed text-muted-foreground hover:text-foreground"
          onClick={addBand}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add band
        </Button>
      </CardContent>
    </Card>
  )
}

/** Returns true if all bands are valid and there are at least 2 */
export function bandsAreValid(bands: TonnageBand[]): boolean {
  if (bands.length < 2) return false
  return bands.every((b, _, all) => {
    const e = validateBand(b, all)
    return !e.min_tons && !e.max_tons
  })
}

/** Converts TonnageBand[] into the shape RouteCard ranges expect */
export function bandsToRanges(bands: TonnageBand[]) {
  return bands.map(({ min_tons, max_tons }) => ({
    min_tons: min_tons as number,
    max_tons: max_tons as number,
    price: undefined as any,
    client_id: null,
  }))
}
