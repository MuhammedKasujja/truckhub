import {
  createFileRoute,
  Outlet,
  useLocation,
  useRouter,
} from "@tanstack/react-router"
import { Route as OverviewRoute } from "@/app/_admin/billing/overview"
import { Route as QuotationsRoute } from "@/app/_admin/billing/quotations"
import { Route as InvoicesRoute } from "@/app/_admin/billing/invoices"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const biilingTabs = [
  {
    name: "overview",
    route: OverviewRoute.to,
  },
  {
    name: "quotations",
    route: QuotationsRoute.to,
  },
  {
    name: "invoices",
    route: InvoicesRoute.to,
  },
] as const

export const Route = createFileRoute("/_admin/billing")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()

  const activeTab = location.pathname ?? biilingTabs[0].route
  return (
    <>
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(route) => router.navigate({ to: route })}
      >
        <TabsList>
          {biilingTabs.map((section) => (
            <TabsTrigger key={section.name} value={section.route}>
              {section.name}
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
