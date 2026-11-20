import { Link, useNavigate } from "@tanstack/react-router"
import { SettingsIcon } from "lucide-react"
import { isPathActive, useSettingsNav } from "./settings-nav"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Grouped settings navigation shown beside the page on wide screens. */
export function SettingsSidebar({ className }: { className?: string }) {
  const { groups, pathname } = useSettingsNav()

  return (
    <aside
      className={cn(
        "sticky top-4 hidden max-h-[calc(100svh-6rem)] w-60 shrink-0 flex-col overflow-y-auto rounded-xl border bg-card shadow-xs md:flex",
        className
      )}
    >
      <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SettingsIcon className="size-4" />
        </span>
        <span className="text-sm font-semibold">Settings</span>
      </div>

      <nav aria-label="Settings" className="flex flex-col gap-4 p-2 pb-3">
        {groups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="px-2.5 pt-1 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isPathActive(pathname, item.base)
              return (
                <Link
                  key={item.base}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    active &&
                      "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
                  )}
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}

/** Section picker that replaces the sidebar on narrow screens. */
export function SettingsMobileNav({ className }: { className?: string }) {
  const { groups, active } = useSettingsNav()
  const navigate = useNavigate()
  const items = groups.flatMap((g) => g.items)

  return (
    <div className={cn("md:hidden", className)}>
      <Select
        value={active?.base}
        onValueChange={(base) => {
          const item = items.find((i) => i.base === base)
          if (item) navigate({ to: item.to })
        }}
      >
        <SelectTrigger className="w-full" aria-label="Settings section">
          <SelectValue placeholder="Choose a settings section" />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.items.map((item) => (
                <SelectItem key={item.base} value={item.base}>
                  <item.icon className="size-4" />
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
