import { UserForm } from "@/features/users/components/user-form"
import { userDetailsQueryOptions } from "@/features/users/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/user-management/users/$userId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("users:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userDetailsQueryOptions(params.userId)),
})

function RouteComponent() {
  const { data: user, error } = Route.useLoaderData()
  useFetchEror(error)
  return <UserForm initialData={user} />
}
