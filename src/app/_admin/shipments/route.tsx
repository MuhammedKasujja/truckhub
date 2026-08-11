import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useRouter,
} from "@tanstack/react-router"
import { Route as ActiveShipmentsRoute } from "@/app/_admin/shipments/active"
import { Route as ConfirmedShipmentsRoute } from "@/app/_admin/shipments/confirmed"
import { Route as RequestedShipmentsRoute } from "@/app/_admin/shipments/requests"
import { Route as CompletedShipmentsRoute } from "@/app/_admin/shipments/completed"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import { CalendarIcon, MapIcon } from "lucide-react"
import { useBackNavigation } from "@/hooks/use-back-navigation"

const shipmentTabs = [
  {
    name: "active",
    route: ActiveShipmentsRoute.to,
  },
  {
    name: "confirmed",
    route: ConfirmedShipmentsRoute.to,
  },
  {
    name: "requests",
    route: RequestedShipmentsRoute.to,
  },
  {
    name: "completed",
    route: CompletedShipmentsRoute.to,
  },
] as const

export const Route = createFileRoute("/_admin/shipments")({
  component: RouteComponent,
  beforeLoad: ()=> requirePermission("shipments:module")
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()
  const tr = useTranslation()
  const handleBack = useBackNavigation()

  const activeTab = location.pathname ?? shipmentTabs[0].route
  return (
    <>
      <PageHeader className="pb-4">
        <PageTitle>Shipments</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} size={"sm"} onClick={handleBack}>
            Back
          </Button>
          <Button variant={"outline"} size={"sm"}>
            <CalendarIcon/>
            Calendar
          </Button>
          <Can permission="rides:active">
            <Button size={"sm"} asChild>
              <Link to={"/shipments/live"}>
                <MapIcon />
                Live Map
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(route) => router.navigate({ to: route })}
      >
        <TabsList>
          {shipmentTabs.map((section) => (
            <TabsTrigger key={section.name} value={section.route}>
              {tr(`common.${section.name}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4">
          <Outlet />
        </div>
      </Tabs>
    </>
  )
}
