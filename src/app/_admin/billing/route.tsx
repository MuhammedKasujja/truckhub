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
import { PageHeader, PageTitle } from "@/components/page-header"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { BookOpenTextIcon, CalendarRangeIcon, FileTextIcon } from "lucide-react"

const biilingTabs = [
  {
    icon: CalendarRangeIcon,
    name: "overview",
    route: OverviewRoute.to,
  },
  {
    name: "quotation",
    icon: BookOpenTextIcon,
    route: QuotationsRoute.to,
  },
  {
    name: "invoice",
    icon: FileTextIcon,
    route: InvoicesRoute.to,
  },
] as const

export const Route = createFileRoute("/_admin/billing")({
  component: RouteComponent,
  beforeLoad: ()=> requirePermission("billing:module")
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()
  const tr = useTranslation()

  const activeTab = location.pathname ?? biilingTabs[0].route
  console.log("location", location, "activeTab", activeTab)
  return (
    <>
      <PageHeader>
        <PageTitle>Billing</PageTitle>
      </PageHeader>
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={(route) => router.navigate({ to: route })}
      >
        <TabsList>
          {biilingTabs.map((section) => (
            <TabsTrigger key={section.name} value={section.route}>
              <section.icon/>
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
