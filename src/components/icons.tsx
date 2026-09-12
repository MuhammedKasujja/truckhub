import { IconReportMoney } from "@tabler/icons-react"
import { cn } from "cn"
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
  FileTextIcon,
  MessagesSquareIcon,
  PanelTopCloseIcon,
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

type Actions =
  | "Create"
  | "Edit"
  | "Delete"
  | "Restore"
  | "Pay"
  | "Email"
  | "Cancle"

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
    Invoices: FileTextIcon,
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
    Email: MessagesSquareIcon,
    Cancle: PanelTopCloseIcon,
  }
  return actionIcons[action]
}

interface ModuleIconProps extends React.ComponentProps<LucideIcon> {
  module: Module
}

export function ModuleIcon({ module, className, ...props }: ModuleIconProps) {
  const Icon = getModuleIcon(module)
  return <Icon className={cn("h-4 w-4", className)} {...props} />
}
