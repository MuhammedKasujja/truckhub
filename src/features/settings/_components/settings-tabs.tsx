import { Link, Outlet, useLocation } from "@tanstack/react-router"
import { isPathActive } from "./settings-nav"
import type { FileRouteTypes } from "@/routeTree.gen"
import { cn } from "@/lib/utils"

type IconType = React.ComponentType<{ className?: string }>

export type SettingsTab = {
  label: string
  to: FileRouteTypes["to"]
  icon?: IconType
}

/**
 * Link-based tab bar for settings sections that have sub-pages (pricing,
 * vehicle config, user management), followed by the active sub-page.
 * A tab stays active on nested pages, e.g. a user's edit page under Users.
 */
export function SettingsTabsLayout({ tabs }: { tabs: SettingsTab[] }) {
  const { pathname } = useLocation()

  return (
    <div className="flex w-full flex-col gap-5">
      <nav
        aria-label="Section"
        className="-mx-1 flex gap-1 overflow-x-auto border-b px-1"
      >
        {tabs.map((tab) => {
          const active = isPathActive(pathname, tab.to.replace(/\/+$/, ""))
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                active && "border-primary font-medium text-primary hover:text-primary"
              )}
            >
              {tab.icon && <tab.icon className="size-4" />}
              {tab.label}
            </Link>
          )
        })}
      </nav>
      <Outlet />
    </div>
  )
}
