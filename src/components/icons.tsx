import { IconReportMoney } from "@tabler/icons-react"
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
  ListCheckIcon,
  LocateIcon,
} from "lucide-react"

type Module =
  | "Dashboard"
  | "Clients"
  | "Shipments"
  | "Drivers"
  | "Vehicles"
  | "Users"
  | "Bookings"
  | "Rides"
  | "Services"
  | "Payments"
  | "Billing"
  | "Settings"
  | "Reports"
  | "Quotations"
  | "Invoices"

type Actions = "Create" | "Edit" | "Delete" | "Restore" | "Pay"

export function getModuleIcon(module: Module) {
  const moduleIcons: Record<Module, LucideIcon> = {
    Dashboard: LayoutDashboard,
    Shipments: LocateIcon,
    Rides: DatabaseSearch,
    Bookings: CalendarCheck,
    Payments: CreditCard,
    Billing: IconReportMoney,
    Services: MonitorCog,
    Clients: Users,
    Drivers: ShieldUser,
    Vehicles: BusFront,
    Users: Users,
    Reports: ChartLine,
    Settings: SettingsIcon,
    Quotations: ListCheckIcon,
    Invoices: ListCheckIcon,
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
