import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { IdCard, LockKeyhole, TriangleAlert, UserIcon } from "lucide-react"
import { ChangePasswordForm } from "@/features/auth/components"
import {
  SectionEmpty,
  SettingsPage,
  SettingsPageHeader,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { UserProfileCard, UserProfileView } from "@/features/users/components"
import { userProfileQueryOptions } from "@/features/users/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requireAuth } from "@/lib/auth"

export const Route = createFileRoute("/_admin/settings/user-profile/")({
  component: RouteComponent,
  beforeLoad: () => requireAuth(),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userProfileQueryOptions()),
})

function RouteComponent() {
  const { data: user, error } = useSuspenseQuery(userProfileQueryOptions())

  useFetchEror(error)

  if (!user.data) {
    return (
      <SettingsPage>
        <SectionEmpty
          icon={TriangleAlert}
          title="Couldn't load your profile"
          description={error?.message ?? "Refresh the page to try again."}
        />
      </SettingsPage>
    )
  }

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={UserIcon}
        title="Your profile"
        description="Your account details and sign-in security."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-4">
          <UserProfileCard user={user.data} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <SettingsSection
            icon={IdCard}
            title="Account details"
            description="Ask an administrator to change these"
          >
            <UserProfileView user={user.data} />
          </SettingsSection>

          <SettingsSection
            icon={LockKeyhole}
            title="Password"
            description="Change the password you use to sign in"
          >
            <ChangePasswordForm />
          </SettingsSection>
        </div>
      </div>
    </SettingsPage>
  )
}
