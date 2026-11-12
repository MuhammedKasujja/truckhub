import { useState } from "react"
import { cn } from "@/lib/utils"

/** Locations shown before "+N more". */
const PREVIEW_LOCATIONS = 6

export const includesText = (text: string, query: string) =>
  text.toLowerCase().includes(query)

/** The preview of an island's locations, which expands to show the rest. */
function useLocationPreview(locations: string[], query: string) {
  const [expanded, setExpanded] = useState(false)

  // Locations matching the search come first so they aren't hidden behind "+N more".
  const isMatch = (location: string) => !!query && includesText(location, query)
  const sorted = [...locations].sort(
    (a, b) => Number(isMatch(b)) - Number(isMatch(a))
  )

  return {
    isMatch,
    shown: expanded ? sorted : sorted.slice(0, PREVIEW_LOCATIONS),
    toggle: sorted.length > PREVIEW_LOCATIONS && (
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {expanded ? "Show less" : `+${sorted.length - PREVIEW_LOCATIONS} more`}
      </button>
    ),
  }
}

const NoLocations = () => (
  <p className="text-xs text-muted-foreground">No locations yet</p>
)

/** Locations as wrapping chips, for cards and compact rows. */
export function LocationChips({
  locations,
  query = "",
}: {
  locations: string[]
  query?: string
}) {
  const { isMatch, shown, toggle } = useLocationPreview(locations, query)
  if (locations.length === 0) return <NoLocations />

  return (
    <ul className="flex flex-wrap gap-1.5">
      {shown.map((location, index) => (
        <li
          key={`${location}-${index}`}
          className={cn(
            "max-w-full truncate rounded-md border bg-muted/40 px-2 py-0.5 text-xs",
            isMatch(location) &&
              "border-primary/40 bg-primary/10 font-medium text-primary"
          )}
        >
          {location}
        </li>
      ))}
      {toggle && <li>{toggle}</li>}
    </ul>
  )
}

/** Locations as striped rows, for table views. */
export function LocationRows({
  locations,
  query = "",
}: {
  locations: string[]
  query?: string
}) {
  const { isMatch, shown, toggle } = useLocationPreview(locations, query)
  if (locations.length === 0) return <NoLocations />

  return (
    <div className="space-y-1">
      <ul className="space-y-1">
        {shown.map((location, index) => (
          <li
            key={`${location}-${index}`}
            className={cn(
              "rounded-md border bg-background px-2.5 py-1 text-xs break-words even:bg-muted/60",
              isMatch(location) &&
                "border-primary/40 bg-primary/10 font-medium text-primary even:bg-primary/10"
            )}
          >
            {location}
          </li>
        ))}
      </ul>
      {toggle}
    </div>
  )
}
