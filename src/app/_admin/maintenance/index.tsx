import { useState } from "react"
import { maintenanceBoardQueryOptions } from "@/features/maintanence/query-options"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  BoardViewMaintenanceRecord,
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

export const Route = createFileRoute("/_admin/maintenance/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(maintenanceBoardQueryOptions())
  },
})

function RouteComponent() {
  const { data } = useQuery(maintenanceBoardQueryOptions())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <>
      <PageHeader>
        <PageTitle>Vehicle Maintenance</PageTitle>
        <PageDescription>Track maintenance and next steps</PageDescription>
        <PageAction>
          <Button variant={"outline"}>
            <ActionIcon action="filter" />
            Filters
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <ActionIcon action="create" />
            Task
          </Button>
        </PageAction>
      </PageHeader>
      <BoardViewMaintenanceRecord records={data ?? {}} />
      <MaintenanceTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
}
