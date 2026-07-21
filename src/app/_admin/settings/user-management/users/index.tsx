import { PageHeader, PageTitle } from "@/components/page-header"
import {
  UserTable,
  UserTableSkeleton,
} from "@/features/users/components/user-table"
import { usersQueryOprions } from "@/features/users/query-options"
import { UserSearchParamsCache } from "@/features/users/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

export const Route = createFileRoute("/_admin/settings/user-management/users/")(
  {
    validateSearch: UserSearchParamsCache,
    loaderDeps: ({ search }) => ({ search }),
    component: RouteComponent,
    loader: ({ context, deps: { search } }) => {
      // prefetch data on the server and stream to client
      context.queryClient.prefetchQuery(usersQueryOprions(search))
    },
  }
)

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
