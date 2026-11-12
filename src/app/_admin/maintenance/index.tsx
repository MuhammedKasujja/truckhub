import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { TriangleAlert } from "lucide-react"
import type { MaintenanceSearchParamsInput } from "@/features/maintanence/schemas"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import {
  PageAction,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  CreateMaintenanceTaskDialog,
  MaintenanceBoard,
  MaintenanceBoardSkeleton,
  MaintenanceFilterBar,
} from "@/features/maintanence/components"
import { maintenanceBoardQueryOptions } from "@/features/maintanence/query-options"
import { maintenanceSearchParams } from "@/features/maintanence/schemas"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/maintenance/")({
  validateSearch: maintenanceSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  beforeLoad: () => requirePermission("maintenance:module"),
  component: RouteComponent,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(maintenanceBoardQueryOptions(search))
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isLoading, error } = useQuery(
    maintenanceBoardQueryOptions(search)
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  function updateSearch(updates: Partial<MaintenanceSearchParamsInput>) {
    void navigate({
      search: (previous) => ({ ...previous, ...updates }),
      replace: true,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader>
        <PageTitle>Maintenance</PageTitle>
        <PageDescription>
          Plan servicing, repairs and inspections, and move tasks along as the
          work happens.
        </PageDescription>
        <PageAction>
          <Can permission="maintenance:create">
            <CreateMaintenanceTaskDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              trigger={
                <Button>
                  <ActionIcon action="create" />
                  New task
                </Button>
              }
            />
          </Can>
        </PageAction>
      </PageHeader>

      <MaintenanceFilterBar search={search} onSearchChange={updateSearch} />

      {isLoading ? (
        <MaintenanceBoardSkeleton columns={search.include_cancelled ? 4 : 3} />
      ) : error ? (
        <Empty className="h-64 border border-dashed bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TriangleAlert />
            </EmptyMedia>
            <EmptyTitle>Couldn't load maintenance tasks</EmptyTitle>
            <EmptyDescription>
              {error.message || "Refresh the page to try again."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MaintenanceBoard
          records={data ?? {}}
          showCancelled={search.include_cancelled}
        />
      )}
    </div>
  )
}
