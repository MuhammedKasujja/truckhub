import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChangePasswordForm } from "@/features/auth/components"
import { PasswordStrengthChecker } from "@/features/auth/components/password-checker"
import { UserProfileView } from "@/features/users/components"
import { userProfileQueryOptions } from "@/features/users/query-options"
import { requireAuth } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"
import { ShieldIcon, UserIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/settings/user-profile/")({
  component: RouteComponent,
  beforeLoad: () => requireAuth(),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userProfileQueryOptions()),
})

function RouteComponent() {
  const { data: user, error } = Route.useLoaderData()
  if (!user) {
    return <div>Failed to load user profile {error?.message}</div>
  }
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList>
        <TabsTrigger value={"profile"}>
          <UserIcon />
          User Profile
        </TabsTrigger>
        <TabsTrigger value={"change-password"}>
          <ShieldIcon />
          Change Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <UserProfileView user={user} />
      </TabsContent>
      <TabsContent value="change-password">
        <ChangePasswordForm />
        <PasswordStrengthChecker/>
      </TabsContent>
    </Tabs>
  )
}
