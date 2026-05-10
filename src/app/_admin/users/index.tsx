import { PageHeader, PageTitle } from "@/components/page-header"
import {
  UserTable,
  UserTableSkeleton,
} from "@/features/users/components/user-table"
import { usersQueryOprions } from "@/features/users/query-options"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

export const Route = createFileRoute("/_admin/users/")({
  component: RouteComponent,
  loader: ({ context, location }) => {
    // prefetch data on the server and stream to client
    context.queryClient.prefetchQuery(usersQueryOprions(location.search))
  },
})

function RouteComponent() {
  return (
    <Suspense fallback={<UserTableSkeleton />}>
      <PageHeader>
        <PageTitle>Users</PageTitle>
      </PageHeader>
      <UserTable />
    </Suspense>
  )
}
