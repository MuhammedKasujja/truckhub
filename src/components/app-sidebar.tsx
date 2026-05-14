"use client"

import * as React from "react"

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
import {
  DatabaseSearch,
  Users,
  MonitorCog,
  LayoutDashboard,
  BusFront,
  ShieldUser,
  ChartLine,
  CreditCard,
  CalendarCheck,
  SettingsIcon,
} from "lucide-react"
import { UserPermission } from "@/features/auth/permissions"
import { Can } from "./has-permission"
import { Route as DashboardRoute } from "@/app/_admin/dashboard"
import { Route as RidesRoute } from "@/app/_admin/rides"
import { Route as BookingsRoute } from "@/app/_admin/bookings"
import { Route as PaymentsRoute } from "@/app/_admin/payments"
import { Route as ServicesRoute } from "@/app/_admin/services"
import { Route as ClientsRoute } from "@/app/_admin/clients"
import { Route as DriversRoute } from "@/app/_admin/drivers"
import { Route as VehiclesRoute } from "@/app/_admin/vehicles"
import { Route as UsersRoute } from "@/app/_admin/users"
import { Route as ReportsRoute } from "@/app/_admin/reports"
import { Route as SettingsDefaultRoute } from "@/app/_admin/settings/company-details"

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
  items: [
    {
      title: "routes.dashboard",
      url: DashboardRoute.to,
      icon: LayoutDashboard,
      permission: "bookings:view",
    },
    {
      title: "routes.rides",
      url: RidesRoute.to,
      icon: DatabaseSearch,
      permission: "rides:view",
    },
    {
      title: "routes.bookings",
      url: BookingsRoute.to,
      icon: CalendarCheck,
      permission: "bookings:view",
    },
    {
      title: "routes.payments",
      url: PaymentsRoute.to,
      icon: CreditCard,
      permission: "payments:view",
    },
    {
      title: "routes.services",
      url: ServicesRoute.to,
      icon: MonitorCog,
      permission: "services:view",
    },
    {
      title: "routes.clients",
      url: ClientsRoute.to,
      icon: Users,
      permission: "clients:view",
    },
    {
      title: "routes.drivers",
      url: DriversRoute.to,
      icon: ShieldUser,
      permission: "drivers:view",
    },
    {
      title: "routes.vehicles",
      url: VehiclesRoute.to,
      icon: BusFront,
      permission: "vehicles:view",
    },
    {
      title: "routes.users",
      url: UsersRoute.to,
      icon: Users,
      permission: "users:view",
    },
    {
      title: "routes.reports",
      url: ReportsRoute.to,
      icon: ChartLine,
      permission: "config:view",
    },
    {
      title: "routes.settings",
      url: SettingsDefaultRoute.to,
      icon: SettingsIcon,
      permission: "config:view",
    },
  ],
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
