"use client"
import {
  Bell,
  Globe,
  Home,
  Settings,
  FileText,
  ListOrdered,
  LocateFixed,
  UserIcon,
  Wallet,
  SquareSigma,
  SettingsIcon,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "@tanstack/react-router"
import { Route as VehicleConfigDefaultRoute } from "@/app/_admin/settings/vehicle-config/car-brands"
import { Route as CompanyDetailsRoute } from "@/app/_admin/settings/company-details"
import { Route as UsersRoute } from "@/app/_admin/settings/user-management/users"
import { Route as AdvancedSettingsRoute } from "@/app/_admin/settings/advanced"
import { Route as PricingConfigRoute } from "@/app/_admin/settings/pricing-config/route-tonnage-pricing"
import { Route as BookingRoutes } from "@/app/_admin/settings/booking-routes"
import { Route as TaxRatesRoutes } from "@/app/_admin/settings/tax-rates"
import { Route as PdfTemplatesRoute } from "@/app/_admin/settings/pdf-templates"
import { Route as GenerateNumbersRoute } from "@/app/_admin/settings/generate-numbers"
import { Route as NotificationsRoute } from "@/app/_admin/settings/notifications"
import { Route as ProfileRoute } from "@/app/_admin/settings/user-profile"
import { PageHeader, PageTitle, PageTitleIcon } from "@/components/page-header"
import { cn } from "@/lib/utils"
import { Can } from "@/components/has-permission"
import { UserPermission } from "@/features/auth/permissions"
import { GlobalKeys } from "@/i18n"

type SidebarItem = {
  // name: GlobalKeys
  name: string
  route: string
  icon: LucideIcon
  permission?: UserPermission
}

type Navbar = { nav: SidebarItem[] }

const data: Navbar = {
  nav: [
    { name: "Company Details", icon: Home, route: CompanyDetailsRoute.to },
    {
      name: "Pricing Plans",
      icon: Wallet,
      route: PricingConfigRoute.to,
      permission: "config:pricing_plans:view",
    },
    {
      name: "Vehicle Config",
      icon: Globe,
      route: VehicleConfigDefaultRoute.to,
      permission: "config:vehicle_config:view",
    },
    {
      name: "Routes",
      icon: LocateFixed,
      route: BookingRoutes.to,
      permission: "config:routes:read",
    },
    {
      name: "Tax Rates",
      icon: SquareSigma,
      route: TaxRatesRoutes.to,
      permission: "config:tax_rates:view",
    },
    {
      name: "User Management",
      icon: Users,
      route: UsersRoute.to,
      permission: "config:user:management",
    },
    { name: "Notifications", icon: Bell, route: NotificationsRoute.to },
    { name: "Advanced", icon: Settings, route: AdvancedSettingsRoute.to },
    { name: "PDF Templates", icon: FileText, route: PdfTemplatesRoute.to },
    {
      name: "Generate Numbers",
      icon: ListOrdered,
      route: GenerateNumbersRoute.to,
      permission: "config:manage_entity_numbers",
    },
    {
      name: "User Profile",
      icon: UserIcon,
      route: ProfileRoute.to,
    },
  ],
} as const

export function SettingsSidebar() {
  const location = useLocation()
  return (
    <Sidebar collapsible="none" className="hidden rounded-xl md:flex">
      <SidebarHeader>
        <PageHeader className="pb-0">
          <PageTitle className="text-xl">
            <PageTitleIcon>
              <SettingsIcon className="h-4 w-4" />
            </PageTitleIcon>
            Settings
          </PageTitle>
        </PageHeader>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.nav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  {item.permission ? (
                    <Can permission={item.permission}>
                      <Link to={item.route}>
                        <SidebarMenuButton
                          isActive={item.route == location.pathname}
                          className={cn(
                            item.route == location.pathname &&
                              "border-l-4 border-primary"
                          )}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </Link>
                    </Can>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={item.route == location.pathname}
                      className={cn(
                        item.route == location.pathname &&
                          "border-l-4 border-primary"
                      )}
                    >
                      <Link to={item.route}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
