import { Fragment, useMemo } from "react"
import { Link, useMatches, useRouter } from "@tanstack/react-router"
import { useTranslations } from "use-intl"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

type Crumb = {
  key: string
  label: string
  /** Set when a route exists at this path, so the crumb can link to it. */
  href?: string
  /** True when no record label was found and the raw id is shown. */
  isRawId: boolean
}

/** Labels for path words that aren't sidebar sections. */
const WORDS: Record<string, string> = {
  new: "New",
  edit: "Edit",
  view: "Details",
  pdf: "PDF",
}

/** Path words whose sidebar title lives under a different `routes.*` key. */
const ROUTE_KEY_ALIASES: Record<string, string> = {
  "live-map": "dispatch",
}

const trimRight = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, "") : path

function humanize(segment: string) {
  const text = decodeURIComponent(segment).replace(/[-_]+/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Shortens long ids (uuids etc.) so they fit in the navbar. */
function formatParam(value: string) {
  const text = decodeURIComponent(value)
  return text.length > 12 ? `${text.slice(0, 8)}…` : text
}

/** Fields that identify a record to a person, most specific first. */
const LABEL_FIELDS = [
  "number",
  "plate_number",
  "display_name",
  "fullname",
  "full_name",
  "name",
] as const

type AnyRecord = Record<string, unknown>

const isRecord = (v: unknown): v is AnyRecord =>
  typeof v === "object" && v !== null

/**
 * Finds the record with this id inside route loader data, which is usually
 * an API response (`{ data: record }`) or several of them (`Promise.all`).
 */
function findRecord(value: unknown, id: string, depth = 0): AnyRecord | null {
  if (depth > 3 || !isRecord(value)) return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findRecord(item, id, depth + 1)
      if (found) return found
    }
    return null
  }
  if (String(value.id) === id) return value
  return findRecord(value.data, id, depth + 1)
}

/** A readable label for the record a param points to, e.g. "QT-0042". */
function recordLabel(loaderData: unknown[], id: string) {
  for (const data of loaderData) {
    const record = findRecord(data, id)
    if (!record) continue
    for (const field of LABEL_FIELDS) {
      const value = record[field]
      if (typeof value === "string" && value.trim()) return value
      if (typeof value === "number") return String(value)
    }
  }
  return null
}

/**
 * Breadcrumbs for the active route, built from the leaf route's path
 * template (to tell ids from words) and the current pathname. Id segments
 * show the record's number (or name) when a route loader has fetched it.
 */
export function AppBreadcrumbs({ className }: { className?: string }) {
  const router = useRouter()
  const matches = useMatches()
  const t = useTranslations()
  const leaf = matches.at(-1)

  const crumbs = useMemo<Crumb[]>(() => {
    if (!leaf) return []

    const pathSegments = leaf.pathname.split("/").filter(Boolean)
    // routeId e.g. "/_admin/quotations/$quotationId/edit": drop pathless
    // layouts ("_admin") and route groups ("(group)").
    const templateSegments = leaf.routeId
      .split("/")
      .filter((s) => s && !s.startsWith("_") && !/^\(.*\)$/.test(s))
    const sameShape = templateSegments.length === pathSegments.length
    const routesByPath = router.routesByPath as unknown as Record<
      string,
      unknown
    >
    // Leaf first: it is the route most likely to have loaded the record.
    const loaderData = matches
      .map((m) => m.loaderData as unknown)
      .filter((d) => d !== undefined)
      .reverse()

    return pathSegments.map((segment, i) => {
      const template = sameShape ? templateSegments[i] : segment
      const isParam = template.startsWith("$")
      const href = "/" + pathSegments.slice(0, i + 1).join("/")
      const templatePath = trimRight(
        "/" +
          (sameShape ? templateSegments : pathSegments)
            .slice(0, i + 1)
            .join("/")
      )

      let label: string
      let isRawId = false
      if (isParam) {
        const named = recordLabel(loaderData, decodeURIComponent(segment))
        isRawId = !named
        label = named ?? formatParam(segment)
      } else if (t.has(`routes.${ROUTE_KEY_ALIASES[segment] ?? segment}`))
        label = t(`routes.${ROUTE_KEY_ALIASES[segment] ?? segment}`)
      else label = WORDS[segment] ?? humanize(segment)

      return {
        key: href,
        label,
        href: templatePath in routesByPath ? href : undefined,
        isRawId,
      }
    })
  }, [matches, router, t])

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb className={cn("min-w-0", className)}>
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          // On small screens keep only the section and the current page.
          const hideOnMobile = !isLast && i !== 0
          const labelClass = cn(
            "truncate",
            crumb.isRawId ? "font-mono text-xs" : "tabular-nums"
          )
          return (
            <Fragment key={crumb.key}>
              {i > 0 && (
                <BreadcrumbSeparator
                  className={cn(hideOnMobile && "hidden md:block")}
                />
              )}
              <BreadcrumbItem
                className={cn(
                  "min-w-0",
                  hideOnMobile && "hidden md:inline-flex"
                )}
              >
                {isLast ? (
                  <BreadcrumbPage
                    className={cn(labelClass, "max-w-56 font-medium")}
                    title={crumb.label}
                  >
                    {crumb.label}
                  </BreadcrumbPage>
                ) : crumb.href ? (
                  <BreadcrumbLink
                    asChild
                    className={cn(labelClass, "max-w-40")}
                  >
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className={cn(labelClass, "max-w-40")}>
                    {crumb.label}
                  </span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
