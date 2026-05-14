"use client"
import { Bell, Globe, Home, Keyboard, Lock, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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

const data = {
  nav: [
    { name: "Company Details", icon: Home, route: CompanyDetailsRoute.to },
    {
      name: "Pricing Plans",
      icon: Globe,
      route: PricingConfigRoute.to,
    },
    {
      name: "Vehicle Config",
      icon: Globe,
      route: VehicleConfigDefaultRoute.to,
    },
    { name: "Privacy & visibility", icon: Lock },
    {
      name: "Permissions",
      icon: Keyboard,
      route: PermissionsRoute.to,
    },
    { name: "Notifications", icon: Bell },
    { name: "Advanced", icon: Settings, route: AdvancedSettingsRoute.to },
  ],
}

export function SettingsSidebar() {
  const location = useLocation()
  return (
    <Sidebar collapsible="none" className="hidden rounded-xl md:flex">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.nav.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.route == location.pathname}
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
