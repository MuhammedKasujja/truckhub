import { UserProfileView } from "@/features/users/components"
import { userProfileQueryOptions } from "@/features/users/query-options"
import { requireAuth } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/user-profile/")({
  component: RouteComponent,
  beforeLoad: () => requireAuth(),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      userProfileQueryOptions(context.user.id)
    ),
})

function RouteComponent() {
  const { data: user, error } = Route.useLoaderData()
  if (!user) {
    return <div>Failed to load user profile {error?.message}</div>
  }
  return <UserProfileView user={user} />
}
