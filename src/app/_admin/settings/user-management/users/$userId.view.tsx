import { UserDetailsWrapper } from "@/features/users/components/user-details-wrapper"
import { userDetailsQueryOptions } from "@/features/users/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/user-management/users/$userId/view")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("users:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userDetailsQueryOptions(params.userId)),
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const { data: user, error } = useSuspenseQuery(
    userDetailsQueryOptions(userId)
  )
  useFetchEror(error)
  return <UserDetailsWrapper user={user.data} />
}
