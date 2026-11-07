import { createFileRoute } from "@tanstack/react-router"
import {
  UserList,
  UserListSkeleton,
} from "@/features/users/components/user-list"
import { usersQueryOprions } from "@/features/users/query-options"
import { UserSearchParamsCache } from "@/features/users/schemas"

export const Route = createFileRoute("/_admin/settings/user-management/users/")(
  {
    pendingComponent: UserListSkeleton,
    validateSearch: UserSearchParamsCache,
    loaderDeps: ({ search }) => ({ search }),
    component: UserList,
    loader: ({ context, deps: { search } }) => {
      // prefetch data on the server and stream to client
      context.queryClient.prefetchQuery(usersQueryOprions(search))
    },
  }
)
