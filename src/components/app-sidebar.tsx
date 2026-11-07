import React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  SettingsIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react"

import type { GlobalKeys} from "@/i18n";
import type { UserPermission } from "@/features/auth/permissions"
import type { FileRouteTypes } from "@/routeTree.gen"
import type { IconComponent } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"
import { generateAvatorFallback } from "@/lib/format"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { logoutFn } from "@/features/auth/services"
import { useAuth } from "@/components/providers/auth-context"
import { getModuleIcon } from "@/components/icons"

const APP_VERSION = "1.0.1"

type SidebarItem = {
  title: GlobalKeys
  /**
   * Literal paths, checked against the generated route tree. Don't use a
   * route's `.to` here: it is only set once the router builds the tree,
   * after this module has run, so it can still be undefined.
   */
  url: FileRouteTypes["to"]
  /** Path prefix that marks this item active. Defaults to `url`. */
  match?: string
  icon?: IconComponent
  permission: UserPermission
}

type SidebarSection = {
  label: GlobalKeys
  items: SidebarItem[]
}

const settingsModule: SidebarItem = {
  title: "routes.settings",
  url: "/settings/company-details",
  match: "/settings",
  icon: getModuleIcon("Settings"),
  permission: "config:module",
}

export const sidebarSections: SidebarSection[] = [
  {
    label: "sidebar.operations",
    items: [
      {
        title: "routes.dashboard",
        url: "/dashboard",
        icon: getModuleIcon("Dashboard"),
        permission: "dashboard:view",
      },
      {
        title: "routes.dispatch",
        url: "/live-map",
        icon: getModuleIcon("Dispatches"),
        permission: "dashboard:view",
      },
      {
        title: "routes.shipments",
        url: "/shipments/requests",
        match: "/shipments",
        icon: getModuleIcon("Shipments"),
        permission: "dashboard:view",
      },
      {
        title: "routes.quotations",
        url: "/quotations",
        icon: getModuleIcon("Quotations"),
        permission: "quotations:module",
      },
    ],
  },
  {
    label: "sidebar.fleet",
    items: [
      {
        title: "routes.drivers",
        url: "/drivers",
        icon: getModuleIcon("Drivers"),
        permission: "drivers:module",
      },
      {
        title: "routes.vehicles",
        url: "/vehicles",
        icon: getModuleIcon("Vehicles"),
        permission: "vehicles:module",
      },
      {
        title: "routes.maintenance",
        url: "/maintenance",
        icon: getModuleIcon("Maintenance"),
        permission: "maintenance:module",
      },
    ],
  },
  {
    label: "sidebar.customers",
    items: [
      {
        title: "routes.clients",
        url: "/clients",
        icon: getModuleIcon("Clients"),
        permission: "clients:module",
      },
      {
        title: "routes.services",
        url: "/services",
        icon: getModuleIcon("Services"),
        permission: "services:module",
      },
    ],
  },
  {
    label: "sidebar.finance",
    items: [
      {
        title: "routes.payments",
        url: "/payments",
        icon: getModuleIcon("Payments"),
        permission: "payments:module",
      },
      {
        title: "routes.invoices",
        url: "/invoices",
        icon: getModuleIcon("Invoices"),
        permission: "invoices:module",
      },
      {
        title: "routes.reports",
        url: "/reports",
        icon: getModuleIcon("Reports"),
        permission: "reports:module",
      },
    ],
  },
]

/** Flat list of every module, in priority order (used for post-login redirect). */
export const sibebarModules: SidebarItem[] = [
  ...sidebarSections.flatMap((section) => section.items),
  settingsModule,
]

function isItemActive(pathname: string, item: SidebarItem) {
  const base = (item.match ?? item.url).replace(/\/$/, "")
  return pathname === base || pathname.startsWith(`${base}/`)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasPermission } = usePermissions()

  const sections = sidebarSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPermission(item.permission)),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-12 justify-center border-b border-sidebar-border py-0">
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent className="gap-0 py-1">
        {sections.map((section) => (
          <NavSection key={section.label} section={section} />
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-1 border-t border-sidebar-border">
        {hasPermission(settingsModule.permission) && (
          <SidebarMenu>
            <NavItem item={settingsModule} />
          </SidebarMenu>
        )}
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function SidebarBrand() {
  const tr = useTranslation()
  const { toggleSidebar, state, isMobile } = useSidebar()
  const collapsed = state === "collapsed" && !isMobile

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-1">
        <SidebarMenuButton
          size="lg"
          tooltip={tr("sidebar.expand")}
          onClick={collapsed ? toggleSidebar : undefined}
          className={cn(
            "h-10 hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:size-10!",
            collapsed && "hover:bg-sidebar-accent"
          )}
        >
          <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <TruckIcon className="size-5!" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-semibold tracking-tight">
              {tr("app_name")}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              v{APP_VERSION}
            </span>
          </div>
        </SidebarMenuButton>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={tr("sidebar.collapse")}
            title={tr("sidebar.collapse")}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
          >
            <PanelLeftCloseIcon className="size-[18px]" />
          </button>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function NavSection({ section }: { section: SidebarSection }) {
  const tr = useTranslation()
  return (
    <SidebarGroup className="py-1.5">
      <SidebarGroupLabel className="h-6 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
        {tr(section.label)}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {section.items.map((item) => (
            <NavItem key={item.url} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function NavItem({ item }: { item: SidebarItem }) {
  const tr = useTranslation()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const active = isItemActive(pathname, item)
  const label = tr(item.title)

  return (
    <SidebarMenuItem className="relative">
      {active && (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 -left-2 w-[3px] rounded-r-full bg-primary"
        />
      )}
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={label}
        className={cn(
          "h-9 gap-3 text-sidebar-foreground/75 transition-colors [&_svg]:size-5",
          "group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-2.5!",
          "data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary",
          "data-[active=true]:hover:bg-primary/15 data-[active=true]:hover:text-primary",
          "[&_svg]:text-muted-foreground hover:[&_svg]:text-sidebar-accent-foreground data-[active=true]:[&_svg]:text-primary"
        )}
      >
        <Link
          to={item.url}
          aria-current={active ? "page" : undefined}
          onClick={() => isMobile && setOpenMobile(false)}
        >
          {item.icon && <item.icon />}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavUser() {
  const tr = useTranslation()
  const { user } = useAuth()
  const { isMobile } = useSidebar()
  const logout = useServerFn(logoutFn)

  if (!user) return null

  const avatar = (
    <Avatar className="size-8 rounded-lg">
      <AvatarImage src={user.photo_url} alt={user.name} />
      <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-medium text-primary">
        {generateAvatorFallback(user.name)}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-1!"
            >
              {avatar}
              <div className="grid min-w-0 flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {avatar}
                <div className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/settings/user-profile">
                  <UserIcon />
                  {tr("sidebar.profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={"/settings/company-details"}>
                  <SettingsIcon />
                  {tr("routes.settings")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOutIcon />
              {tr("sidebar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
