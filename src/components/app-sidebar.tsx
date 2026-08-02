import React from "react"

import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useLocation, useMatchRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { GlobalKeys, useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { UserPermission } from "@/features/auth/permissions"
import { Can } from "./has-permission"
import { Route as DashboardRoute } from "@/app/_admin/dashboard"
import { Route as ShipmentRoute } from "@/app/_admin/shipments/active"
import { Route as RidesRoute } from "@/app/_admin/rides"
import { Route as BookingsRoute } from "@/app/_admin/bookings"
import { Route as PaymentsRoute } from "@/app/_admin/payments"
import { Route as ServicesRoute } from "@/app/_admin/services"
import { Route as ClientsRoute } from "@/app/_admin/clients"
import { Route as DriversRoute } from "@/app/_admin/drivers"
import { Route as VehiclesRoute } from "@/app/_admin/vehicles"
import { Route as ReportsRoute } from "@/app/_admin/reports"
import { Route as BillingModuleRoute } from "@/app/_admin/billing/overview"
import { Route as SettingsDefaultRoute } from "@/app/_admin/settings/company-details"
import { Route as QuotationsRoute } from "@/app/_admin/quotations"
import { getModuleIcon } from "@/components/icons"

export const sibebarModules: SidebarItem[] = [
  {
    title: "routes.dashboard",
    url: DashboardRoute.to,
    icon: getModuleIcon("Dashboard"),
    permission: "dashboard:view",
  },
  {
    title: "routes.dispatch",
    url: ShipmentRoute.to,
    icon: getModuleIcon("Shipments"),
    permission: "dashboard:view",
  },
  {
    title: "routes.quotations",
    url: QuotationsRoute.to,
    icon: getModuleIcon("Quotations"),
    permission: "rides:module",
  },
  {
    title: "routes.rides",
    url: RidesRoute.to,
    icon: getModuleIcon("Rides"),
    permission: "rides:module",
  },
  {
    title: "routes.bookings",
    url: BookingsRoute.to,
    icon: getModuleIcon("Bookings"),
    permission: "bookings:module",
  },
  {
    title: "routes.payments",
    url: PaymentsRoute.to,
    icon: getModuleIcon("Payments"),
    permission: "payments:module",
  },
  {
    title: "routes.services",
    url: ServicesRoute.to,
    icon: getModuleIcon("Services"),
    permission: "services:module",
  },
  {
    title: "routes.clients",
    url: ClientsRoute.to,
    icon: getModuleIcon("Clients"),
    permission: "clients:module",
  },
  {
    title: "routes.drivers",
    url: DriversRoute.to,
    icon: getModuleIcon("Drivers"),
    permission: "drivers:module",
  },
  {
    title: "routes.vehicles",
    url: VehiclesRoute.to,
    icon: getModuleIcon("Vehicles"),
    permission: "vehicles:module",
  },
  {
    title: "routes.billing",
    url: BillingModuleRoute.to,
    icon: getModuleIcon("Billing"),
    permission: "billing:module",
  },
  {
    title: "routes.reports",
    url: ReportsRoute.to,
    icon: getModuleIcon("Reports"),
    permission: "reports:module",
  },
  {
    title: "routes.settings",
    url: SettingsDefaultRoute.to,
    icon: getModuleIcon("Settings"),
    permission: "config:module",
  },
] as const

// type SidebarItem = (typeof sibebarModules)[number]

type SidebarItem = {
  title: GlobalKeys
  url: string
  icon?: LucideIcon
  permission: UserPermission
}

type SidebarMenuStruct = {
  versions: string[]
  items: SidebarItem[]
}

const data: SidebarMenuStruct = {
  versions: ["1.0.1"],
  items: sibebarModules,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.items} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export function NavMain({ items }: { items: SidebarItem[] }) {
  const location = useLocation()
  const tr = useTranslation()
  const matchRoute = useMatchRoute()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Can permission={item.permission}>
                <Link to={item.url}>
                  <SidebarMenuButton
                    tooltip={tr(item.title)}
                    className={cn(
                      location.pathname.includes(item.url) &&
                        "min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                    )}
                  >
                    {item.icon && <item.icon />}
                    <span>{tr(item.title)}</span>
                  </SidebarMenuButton>
                </Link>
              </Can>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
