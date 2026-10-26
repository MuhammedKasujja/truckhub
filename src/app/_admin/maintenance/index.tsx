import { useState } from "react"
import { maintenanceBoardQueryOptions } from "@/features/maintanence/query-options"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  BoardViewMaintenanceRecord,
  MaintenanceFilterCard,
  MaintenanceTaskDialog,
} from "@/features/maintanence/components"
import {
  PageAction,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ActionIcon } from "@/components/icons"
import {
  MaintenanceSearchParamsInput,
  maintenanceSearchParams,
} from "@/features/maintanence/schemas"

export const Route = createFileRoute("/_admin/maintenance/")({
  validateSearch: maintenanceSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(maintenanceBoardQueryOptions(search))
  },
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data } = useQuery(maintenanceBoardQueryOptions(search))
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  function updateSearch(updates: Partial<MaintenanceSearchParamsInput>) {
    void navigate({
      search: (previous) => ({ ...previous, ...updates }),
    })
  }

  return (
    <>
      <PageHeader>
        <PageTitle>Vehicle Maintenance</PageTitle>
        <PageDescription>Track maintenance and next steps</PageDescription>
        <PageAction>
          <Button
            variant="outline"
            aria-expanded={showFilters}
            onClick={() => setShowFilters((visible) => !visible)}
          >
            <ActionIcon action="filter" />
            Filters
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <ActionIcon action="create" />
            Task
          </Button>
        </PageAction>
      </PageHeader>
      {showFilters && (
        <div className="mb-5">
          <MaintenanceFilterCard search={search} onSearchChange={updateSearch} />
        </div>
        
      )}
      <BoardViewMaintenanceRecord records={data ?? {}} />
      <MaintenanceTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
}
