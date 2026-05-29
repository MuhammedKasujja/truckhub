"use client"
import {
  Bell,
  Globe,
  Home,
  Keyboard,
  Lock,
  Settings,
  FileText,
  ListOrdered,
  LocateFixed,
  Wallet,
  SquareSigma,
  SettingsIcon,
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
import { Route as PermissionsRoute } from "@/app/_admin/settings/permissions"
import { Route as AdvancedSettingsRoute } from "@/app/_admin/settings/advanced"
import { Route as PricingConfigRoute } from "@/app/_admin/settings/pricing-config"
import { Route as BookingRoutes } from "@/app/_admin/settings/booking-routes"
import { Route as TaxRatesRoutes } from "@/app/_admin/settings/tax-rates"
import { Route as RolesRoute } from "@/app/_admin/settings/roles"
import { Route as PdfTemplatesRoute } from "@/app/_admin/settings/pdf-templates"
import { Route as GenerateNumbersRoute } from "@/app/_admin/settings/generate-numbers"
import {
  PageHeader,
  PageTitle,
  PageTitleIcon,
} from "@/components/page-header"
import { cn } from "@/lib/utils"

const data = {
  nav: [
    { name: "Company Details", icon: Home, route: CompanyDetailsRoute.to },
    {
      name: "Pricing Plans",
      icon: Wallet,
      route: PricingConfigRoute.to,
    },
    {
      name: "Vehicle Config",
      icon: Globe,
      route: VehicleConfigDefaultRoute.to,
    },
    {
      name: "Routes",
      icon: LocateFixed,
      route: BookingRoutes.to,
    },
    { name: "Tax Rates", icon: SquareSigma, route: TaxRatesRoutes.to },
    // { name: "Privacy & visibility", icon: Lock },
    {
      name: "Permissions",
      icon: Lock,
      route: PermissionsRoute.to,
    },
    {
      name: "Roles",
      icon: Keyboard,
      route: RolesRoute.to,
    },
    { name: "Notifications", icon: Bell },
    { name: "Advanced", icon: Settings, route: AdvancedSettingsRoute.to },
    { name: "PDF Templates", icon: FileText, route: PdfTemplatesRoute.to },
    {
      name: "Generate Numbers",
      icon: ListOrdered,
      route: GenerateNumbersRoute.to,
    },
  ],
}

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
                  <SidebarMenuButton
                    asChild
                    isActive={item.route == location.pathname}
                    className={cn(item.route == location.pathname && 'border-l-4')}
                  >
                    {item.route ? (
                      <Link to={item.route}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <a href="#">
                        <item.icon />
                        <span>{item.name}</span>
                      </a>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
