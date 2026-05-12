"use client"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon } from "lucide-react"
import { useTranslation } from "@/i18n"

export function VersionSwitcher({
  defaultVersion,
}: {
  versions: string[]
  defaultVersion: string
}) {
  const tr = useTranslation()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{tr("app_name")}</span>
            <span className="">v{defaultVersion}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
