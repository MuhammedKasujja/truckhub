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
  EditIcon,
  PlusIcon,
  Trash2Icon,
  ArchiveRestore,
} from "lucide-react"

type Module =
  | "dashboard"
  | "clients"
  | "drivers"
  | "vehicles"
  | "users"
  | "bookings"
  | "rides"
  | "services"
  | "payments"
  | "settings"
  | "reports"

type Actions = "Create" | "Edit" | "Delete" | "Restore" | "Pay"

export function getModuleIcon(module: Module) {
  const moduleIcons: Record<Module, LucideIcon> = {
    dashboard: LayoutDashboard,
    rides: DatabaseSearch,
    bookings: CalendarCheck,
    payments: CreditCard,
    services: MonitorCog,
    clients: Users,
    drivers: ShieldUser,
    vehicles: BusFront,
    users: Users,
    reports: ChartLine,
    settings: SettingsIcon,
  }
  return moduleIcons[module]
}

export function getActionIcon(action: Actions) {
  const actionIcons: Record<Actions, LucideIcon> = {
    Create: PlusIcon,
    Edit: EditIcon,
    Delete: Trash2Icon,
    Restore: ArchiveRestore,
    Pay: CreditCard,
  }
  return actionIcons[action]
}
