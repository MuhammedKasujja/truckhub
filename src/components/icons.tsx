import { IconFileTypePdf, IconReportMoney } from "@tabler/icons-react"
import { cn } from "cn"
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
  PanelTopCloseIcon,
  MailIcon,
} from "lucide-react"
import { ComponentType, SVGProps } from "react"

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

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
  | "create"
  | "edit"
  | "delete"
  | "restore"
  | "pay"
  | "email"
  | "cancel"
  | "download-pdf"
  | "view-pdf"

export function getModuleIcon(module: Module): IconComponent {
  const moduleIcons: Record<Module, IconComponent> = {
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

export function getActionIcon(action: Actions): IconComponent {
  const actionIcons: Record<Actions, IconComponent> = {
    create: PlusIcon,
    edit: EditIcon,
    delete: Trash2Icon,
    restore: ArchiveRestore,
    pay: CreditCard,
    email: MailIcon,
    cancel: PanelTopCloseIcon,
    "download-pdf": IconFileTypePdf,
    "view-pdf": IconFileTypePdf,
  }
  return actionIcons[action]
}

interface ModuleIconProps extends SVGProps<SVGSVGElement> {
  module: Module
}

export function ModuleIcon({ module, className, ...props }: ModuleIconProps) {
  const Icon = getModuleIcon(module)
  return <Icon className={cn("h-4 w-4", className)} {...props} />
}

interface ActionIconProps extends SVGProps<SVGSVGElement> {
  action: Actions
}

export function ActionIcon({ action, className, ...props }: ActionIconProps) {
  const Icon = getActionIcon(action)
  return <Icon className={cn("h-4 w-4", className)} {...props} />
}
