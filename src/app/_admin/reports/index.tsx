import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CalendarRangeIcon,
  DownloadIcon,
  HistoryIcon,
  LockIcon,
  TagIcon,
} from "lucide-react"
import type { LinkProps } from "@tanstack/react-router"
import type { UserPermission } from "@/features/auth/permissions"
import type { IconComponent } from "@/components/icons"
import { requirePermission } from "@/lib/auth"
import { getModuleIcon } from "@/components/icons"
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

export const Route = createFileRoute("/_admin/reports/")({
  beforeLoad: () => requirePermission("reports:module"),
  component: RouteComponent,
})

type ReportLink = {
  title: string
  subtitle: string
  icon: IconComponent
  /** CSS color token used for the icon tile */
  tone: string
  /** Short list of what the report contains */
  includes: string[]
  to: LinkProps["to"]
  permission: UserPermission
}

type ReportGroup = {
  title: string
  description: string
  reports: ReportLink[]
}

const groups: ReportGroup[] = [
  {
    title: "Finance",
    description: "Revenue, receivables, collections and pricing",
    reports: [
      {
        title: "Invoices",
        subtitle:
          "Issued, paid, pending and overdue invoices by client, with receivables aging.",
        icon: getModuleIcon("Invoices"),
        tone: "var(--chart-1)",
        includes: ["Aging", "By status", "By client"],
        to: "/reports/invoices",
        permission: "reports:invoices:view",
      },
      {
        title: "Payments",
        subtitle:
          "Collections by method and date, reconciled against invoices, with outstanding balances.",
        icon: getModuleIcon("Payments"),
        tone: "var(--success)",
        includes: ["By method", "Unapplied", "By client"],
        to: "/reports/payments",
        permission: "reports:payments:view",
      },
      {
        title: "Quotations",
        subtitle:
          "Sent, accepted, expired and converted quotes, with win rate by client and service.",
        icon: getModuleIcon("Quotations"),
        tone: "var(--chart-2)",
        includes: ["Win rate", "By service", "By client"],
        to: "/reports/quotations",
        permission: "reports:quotations:view",
      },
      {
        title: "Pricing",
        subtitle:
          "Pricing rule usage, quoted prices against base fares, and discounting by service.",
        icon: TagIcon,
        tone: "var(--warning)",
        includes: ["vs base fare", "Discounts", "By category"],
        to: "/reports/pricings",
        permission: "reports:pricings:view",
      },
    ],
  },
  {
    title: "Operations",
    description: "Trips, fleet and delivery performance",
    reports: [
      {
        title: "Shipments",
        subtitle:
          "Routes, drivers, distance and fuel cost per trip, with on-time performance by lane.",
        icon: getModuleIcon("Shipments"),
        tone: "var(--primary)",
        includes: ["On-time rate", "Lanes", "Drivers", "Fuel"],
        to: "/reports/shipments",
        permission: "reports:shipments:view",
      },
    ],
  },
  {
    title: "Compliance",
    description: "Who changed what, and when",
    reports: [
      {
        title: "Audit logs",
        subtitle:
          "Every create, edit, delete and approval across the system, by user and record.",
        icon: HistoryIcon,
        tone: "var(--muted-foreground)",
        includes: ["By user", "By record", "Change diff"],
        to: "/reports/audits",
        permission: "reports:audit_logs:view",
      },
    ],
  },
]

function RouteComponent() {
  const { hasPermission } = usePermissions()

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      reports: group.reports.filter((r) => hasPermission(r.permission)),
    }))
    .filter((group) => group.reports.length > 0)

  return (
    <div className="flex flex-col gap-8">
      <PageHeader className="pb-0">
        <PageTitle>Reports</PageTitle>
        <PageDescription className="flex flex-col gap-2">
          Pick a report to open its detailed breakdown — trends, breakdowns and
          per-record tables.
          <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <CalendarRangeIcon className="size-3.5" />
              Any date range, compared with the previous period
            </span>
            <span className="inline-flex items-center gap-1.5">
              <DownloadIcon className="size-3.5" />
              CSV export on every table
            </span>
          </span>
        </PageDescription>
      </PageHeader>

      {visibleGroups.length ? (
        visibleGroups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <p className="text-xs text-muted-foreground">
                {group.description}
              </p>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {group.reports.length}{" "}
                {group.reports.length === 1 ? "report" : "reports"}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.reports.map((report) => (
                <ReportCard key={report.title} {...report} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LockIcon />
            </EmptyMedia>
            <EmptyTitle>No reports available</EmptyTitle>
            <EmptyDescription>
              Your role doesn't include access to any report yet. Ask an
              administrator to grant report permissions.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

function ReportCard({
  title,
  subtitle,
  icon: Icon,
  tone,
  includes,
  to,
}: ReportLink) {
  return (
    <Link
      to={to}
      style={{ "--tone": tone } as React.CSSProperties}
      className="group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--tone)_14%,transparent)] text-(--tone)">
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="leading-tight font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-1.5" aria-label="Includes">
        {includes.map((item) => (
          <li
            key={item}
            className="rounded-full border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground group-hover:text-foreground">
          Open report
        </span>
        <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  )
}
