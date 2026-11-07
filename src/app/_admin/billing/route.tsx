import {
  Outlet,
  createFileRoute,
  useLocation,
  useRouter,
} from "@tanstack/react-router"
import { BookOpenTextIcon, CalendarRangeIcon, FileTextIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader, PageTitle } from "@/components/page-header"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"

// Literal paths: a route's `.to` isn't set until the router builds the
// route tree, so reading it at module level can give undefined.
const biilingTabs = [
  {
    icon: CalendarRangeIcon,
    name: "overview",
    route: "/billing/overview",
  },
  {
    name: "quotations",
    icon: BookOpenTextIcon,
    route: "/billing/quotations",
  },
  {
    name: "invoices",
    icon: FileTextIcon,
    route: "/invoices",
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

  const activeTab = location.pathname
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
