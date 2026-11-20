import { expiryLabel, expiryState } from "../format"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

/** When a document expires, coloured once the date is close or has passed. */
export function ExpiryBadge({ expiresOn }: { expiresOn: string | null }) {
  const state = expiryState(expiresOn)
  if (state === "none" || !expiresOn) return null

  return (
    <Badge
      variant={state === "expired" ? "destructive" : "outline"}
      className={cn(
        state === "expiring" &&
          "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
      )}
    >
      {expiryLabel(expiresOn) ?? `Valid until ${formatDate(expiresOn)}`}
    </Badge>
  )
}
