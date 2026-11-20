import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FileWarning } from "lucide-react"
import { EXPIRING_WITHIN_DAYS, daysUntilDate } from "../format"
import { expiringDocumentsQueryOptions } from "../query-options"
import { ExpiryBadge } from "./expiry-badge"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

/**
 * Driver documents that have expired or will within a month, soonest first.
 * Renders nothing when there are none, or the user may not see them.
 */
export function ExpiringDriverDocumentsCard() {
  const { hasPermission } = usePermissions()
  const allowed = hasPermission("drivers:documents:expiring")

  const { data } = useQuery({
    ...expiringDocumentsQueryOptions("driver"),
    enabled: allowed,
  })

  if (!allowed || !data?.length) return null

  const documents = [...data].sort(
    (a, b) =>
      daysUntilDate(a.expires_on ?? "9999-12-31") -
      daysUntilDate(b.expires_on ?? "9999-12-31")
  )

  return (
    <section
      aria-label="Expiring driver documents"
      className="mb-5 overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5"
    >
      <div className="flex items-center gap-2.5 border-b border-amber-500/20 px-4 py-3">
        <FileWarning className="size-4 text-amber-700 dark:text-amber-300" />
        <h2 className="text-sm font-semibold">
          {documents.length} driver document
          {documents.length === 1 ? "" : "s"} expired or expiring within{" "}
          {EXPIRING_WITHIN_DAYS} days
        </h2>
      </div>
      <ul className="max-h-56 divide-y divide-amber-500/15 overflow-y-auto">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm"
          >
            <div className="min-w-0">
              <span className="font-medium">{doc.document_type.name}</span>
              <span className="text-muted-foreground">
                {" "}
                · {doc.original_filename}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ExpiryBadge expiresOn={doc.expires_on} />
              <Link
                to="/drivers/$driverId/view"
                params={{ driverId: doc.owner_id }}
                className="text-primary hover:underline"
              >
                View driver
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
