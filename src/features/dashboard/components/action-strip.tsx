import { Link } from "@tanstack/react-router"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockAlertIcon,
  ReceiptIcon,
  WrenchIcon,
} from "lucide-react"
import type { LinkProps } from "@tanstack/react-router"
import type { UserPermission } from "@/features/auth/permissions"
import type { DashboardAlerts } from "../types"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { cn } from "@/lib/utils"

type AlertItem = {
  key: keyof DashboardAlerts
  label: (count: number) => string
  icon: React.ReactNode
  tone: "danger" | "warning"
  permission: UserPermission
  to: LinkProps["to"]
  search?: LinkProps["search"]
}

const items: AlertItem[] = [
  {
    key: "delayed_shipments",
    label: (n) => `${n} shipment${n === 1 ? "" : "s"} delayed`,
    icon: <ClockAlertIcon />,
    tone: "danger",
    permission: "shipments:module",
    to: "/shipments/active",
    search: { status: ["delayed"] },
  },
  {
    key: "unassigned_shipments",
    label: (n) => `${n} unassigned`,
    icon: <AlertTriangleIcon />,
    tone: "warning",
    permission: "shipments:module",
    to: "/shipments/requests",
    search: { status: ["unassigned"] },
  },
  {
    key: "overdue_invoices",
    label: (n) => `${n} invoice${n === 1 ? "" : "s"} overdue`,
    icon: <ReceiptIcon />,
    tone: "danger",
    permission: "invoices:view",
    to: "/invoices",
    search: { status: ["over_due"] },
  },
  {
    key: "maintenance_due",
    label: (n) => `${n} service${n === 1 ? "" : "s"} due this week`,
    icon: <WrenchIcon />,
    tone: "warning",
    permission: "maintenance:view",
    to: "/maintenance",
  },
]

const toneClasses = {
  danger:
    "border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/15",
  warning:
    "border-warning/30 bg-warning/10 text-warning-foreground hover:bg-warning/20",
}

export function ActionStrip({ alerts }: { alerts?: DashboardAlerts }) {
  const { hasPermission } = usePermissions()

  if (!alerts) return null

  const visible = items.filter(
    (item) => (alerts[item.key] ?? 0) > 0 && hasPermission(item.permission)
  )

  if (!visible.length) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-sm text-success-foreground">
        <CheckCircle2Icon className="size-4" />
        All clear. Nothing needs your attention right now.
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label="Needs attention"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="me-1 text-sm font-medium text-muted-foreground">
        Needs attention
      </span>
      {visible.map((item) => (
        <Link
          key={item.key}
          to={item.to}
          search={item.search}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors [&_svg]:size-3.5",
            toneClasses[item.tone]
          )}
        >
          {item.icon}
          {item.label(alerts[item.key] ?? 0)}
          <ChevronRightIcon className="opacity-60" />
        </Link>
      ))}
    </div>
  )
}
