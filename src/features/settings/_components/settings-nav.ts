import { useMemo } from "react"
import {
  Bell,
  Building2,
  FileText,
  Landmark,
  ListOrdered,
  SlidersHorizontal,
  SquareSigma,
  Truck,
  UserIcon,
  Users,
  Wallet,
} from "lucide-react"
import { IconRouteSquare, IconSandbox } from "@tabler/icons-react"
import { useLocation } from "@tanstack/react-router"
import type { FileRouteTypes } from "@/routeTree.gen"
import type { UserPermission } from "@/features/auth/permissions"
import { useAuth } from "@/components/providers/auth-context"

type IconType = React.ComponentType<{ className?: string }>

export type SettingsNavItem = {
  label: string
  /** Where the item links to; checked against the generated route tree. */
  to: FileRouteTypes["to"]
  /** Every path under this one counts as the item being active. */
  base: string
  icon: IconType
  permission?: UserPermission
}

export type SettingsNavGroup = {
  label: string
  items: SettingsNavItem[]
}

/** Settings navigation, grouped by what the settings are about. */
export const settingsNav: SettingsNavGroup[] = [
  {
    label: "Company",
    items: [
      {
        label: "Company details",
        icon: Building2,
        to: "/settings/company-details",
        base: "/settings/company-details",
      },
      {
        label: "Bank accounts",
        icon: Landmark,
        to: "/settings/bank-accounts",
        base: "/settings/bank-accounts",
        permission: "config:banks:view",
      },
      {
        label: "Tax rates",
        icon: SquareSigma,
        to: "/settings/tax-rates",
        base: "/settings/tax-rates",
        permission: "config:tax_rates:view",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Pricing plans",
        icon: Wallet,
        to: "/settings/pricing-config/route-tonnage-pricing",
        base: "/settings/pricing-config",
        permission: "config:pricing:view",
      },
      {
        label: "Routes",
        icon: IconRouteSquare,
        to: "/settings/booking-routes",
        base: "/settings/booking-routes",
        permission: "config:routes:read",
      },
      {
        label: "Islands",
        icon: IconSandbox,
        to: "/settings/islands",
        base: "/settings/islands",
        permission: "config:routes:read",
      },
      {
        label: "Vehicle config",
        icon: Truck,
        to: "/settings/vehicle-config/car-brands",
        base: "/settings/vehicle-config",
        permission: "config:vehicle_config:view",
      },
    ],
  },
  {
    label: "Documents",
    items: [
      {
        label: "PDF templates",
        icon: FileText,
        to: "/settings/pdf-templates",
        base: "/settings/pdf-templates",
      },
      {
        label: "Document numbers",
        icon: ListOrdered,
        to: "/settings/generate-numbers",
        base: "/settings/generate-numbers",
        permission: "config:manage_entity_numbers",
      },
    ],
  },
  {
    label: "Team & system",
    items: [
      {
        label: "User management",
        icon: Users,
        to: "/settings/user-management/users",
        base: "/settings/user-management",
        permission: "config:user:management",
      },
      {
        label: "Notifications",
        icon: Bell,
        to: "/settings/notifications",
        base: "/settings/notifications",
      },
      {
        label: "Advanced",
        icon: SlidersHorizontal,
        to: "/settings/advanced",
        base: "/settings/advanced",
      },
    ],
  },
  {
    label: "You",
    items: [
      {
        label: "Your profile",
        icon: UserIcon,
        to: "/settings/user-profile",
        base: "/settings/user-profile",
      },
    ],
  },
]

export const defaultSettingsPath: FileRouteTypes["to"] = "/settings/company-details"

export function normalizePath(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path
}

export function isPathActive(pathname: string, base: string) {
  const path = normalizePath(pathname)
  return path === base || path.startsWith(`${base}/`)
}

/** The nav groups the current user may see, plus the active item. */
export function useSettingsNav() {
  const { pathname } = useLocation()
  const { hasPermission } = useAuth()

  const groups = useMemo(
    () =>
      settingsNav
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          ),
        }))
        .filter((group) => group.items.length > 0),
    [hasPermission]
  )

  const active = groups
    .flatMap((g) => g.items)
    .find((item) => isPathActive(pathname, item.base))

  return { groups, active, pathname }
}
