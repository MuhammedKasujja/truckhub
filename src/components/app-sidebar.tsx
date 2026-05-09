"use client";

import * as React from "react";

import { VersionSwitcher } from "@/components/version-switcher";
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
} from "@/components/ui/sidebar";
import { usePathname } from "@tanstack/react-router";
import Link from "next/link";
import type { Route } from "next";
import { GlobalKeys, useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
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
} from "lucide-react";
import { UserPermission } from "@/features/auth/permissions";
import { HasPermission } from "./has-permission";

type SidebarItem = {
  title: GlobalKeys;
  url: Route;
  icon?: LucideIcon;
  permission: UserPermission;
};

type SidebarMenuStruct = {
  versions: string[];
  items: SidebarItem[];
};

const data: SidebarMenuStruct = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  items: [
    {
      title: "routes.dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      permission: "bookings:view",
    },
    {
      title: "routes.rides",
      url: "/rides",
      icon: DatabaseSearch,
      permission: "rides:view",
    },
    {
      title: "routes.bookings",
      url: "/bookings",
      icon: CalendarCheck,
      permission: "bookings:view",
    },
    {
      title: "routes.payments",
      url: "/payments",
      icon: CreditCard,
      permission: "payments:view",
    },
    {
      title: "routes.services",
      url: "/services",
      icon: MonitorCog,
      permission: "services:view",
    },
    {
      title: "routes.customers",
      url: "/customers",
      icon: Users,
      permission: "clients:view",
    },
    {
      title: "routes.drivers",
      url: "/drivers",
      icon: ShieldUser,
      permission: "drivers:view",
    },
    {
      title: "routes.vehicles",
      url: "/vehicles",
      icon: BusFront,
      permission: "vehicles:view",
    },
    {
      title: "routes.users",
      url: "/users",
      icon: Users,
      permission: "users:view",
    },
    {
      title: "routes.reports",
      url: "/reports",
      icon: ChartLine,
      permission: "config:view",
    },
    {
      title: "routes.settings",
      url: "/settings",
      icon: SettingsIcon,
      permission: "config:view",
    },
  ],
};

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
  );
}

export function NavMain({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const tr = useTranslation();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <HasPermission permission={item.permission}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    tooltip={tr(item.title)}
                    className={cn(
                      pathname.includes(item.url) &&
                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear",
                    )}
                  >
                    {item.icon && <item.icon />}
                    <span>{tr(item.title)}</span>
                  </SidebarMenuButton>
                </Link>
              </HasPermission>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
