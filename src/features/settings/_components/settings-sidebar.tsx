"use client"
import {
  Bell,
  Globe,
  Home,
  Keyboard,
  Lock,
  Paintbrush,
  Settings,
} from "lucide-react"
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

const data = {
  nav: [
    { name: "Notifications", icon: Bell },
    { name: "Car Brands", icon: Home, route: "/settings/car-brands" as const },
    {
      name: "Car Models",
      icon: Paintbrush,
      route: "/settings/car-models" as const,
    },
    { name: "Tonnages", icon: Globe, route: "/settings/tonnages" as const },
    {
      name: "Vehicle Types",
      icon: Globe,
      route: "/settings/vehicle-types" as const,
    },
    {
      name: "Drive Trains",
      icon: Globe,
      route: "/settings/drive-trains" as const,
    },
    { name: "Privacy & visibility", icon: Lock },
    {
      name: "Permissions",
      icon: Keyboard,
      route: "/settings/permissions" as const,
    },
    { name: "Advanced", route: "/settings/advanced" as const, icon: Settings },
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
                  <SidebarMenuButton asChild isActive={item.route == location.pathname}>
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
