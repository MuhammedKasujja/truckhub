import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useRouter,
} from "@tanstack/react-router"
import {
  CalendarIcon,
  CheckCircle2,
  ClipboardList,
  MapIcon,
  Navigation,
  UserCheck,
} from "lucide-react"
import { Route as ActiveShipmentsRoute } from "@/app/_admin/shipments/active"
import { Route as ConfirmedShipmentsRoute } from "@/app/_admin/shipments/confirmed"
import { Route as RequestedShipmentsRoute } from "@/app/_admin/shipments/requests"
import { Route as CompletedShipmentsRoute } from "@/app/_admin/shipments/completed"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageBackButton } from "@/components/page-header"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"

const shipmentTabs = [
  {
    name: "requests",
    route: RequestedShipmentsRoute.to,
    icon: ClipboardList,
    hint: "Waiting for a vehicle and driver",
  },
  {
    name: "confirmed",
    route: ConfirmedShipmentsRoute.to,
    icon: UserCheck,
    hint: "Assigned and ready to dispatch",
  },
  {
    name: "inTransit",
    route: ActiveShipmentsRoute.to,
    icon: Navigation,
    hint: "Dispatched, on the road or delayed",
  },
  {
    name: "completed",
    route: CompletedShipmentsRoute.to,
    icon: CheckCircle2,
    hint: "Finished, captured or invoiced",
  },
] as const

export const Route = createFileRoute("/_admin/shipments")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("shipments:module"),
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()
  const tr = useTranslation()

  const activeTab =
    shipmentTabs.find((t) => location.pathname.startsWith(t.route)) ??
    shipmentTabs[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="-ml-2">
            <PageBackButton />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
            <p className="text-sm text-muted-foreground">{activeTab.hint}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Can permission="rides:active">
            <Button variant="outline" asChild>
              <Link to={"/calendar"}>
                <CalendarIcon />
                Calendar
              </Link>
            </Button>
          </Can>
          <Can permission="rides:active">
            <Button asChild>
              <Link to={"/live-map"}>
                <MapIcon />
                Live map
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      <Tabs
        value={activeTab.route}
        className="w-full"
        onValueChange={(route) => router.navigate({ to: route })}
      >
        <div className="overflow-x-auto">
          <TabsList>
            {shipmentTabs.map((tab) => (
              <TabsTrigger key={tab.name} value={tab.route} className="gap-1.5">
                <tab.icon className="size-4" />
                {tr(`common.${tab.name}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="mt-4">
          <Outlet />
        </div>
      </Tabs>
    </div>
  )
}
