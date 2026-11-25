import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { AlertCircle, Mail, MailX } from "lucide-react"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import {
  SectionEmpty,
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"
import {
  EmailTemplateEditor,
  EmailTemplateList,
  NewCustomTemplateDialog,
} from "@/features/settings/email-templates/components"
import {
  useEmailTemplateCatalog,
  useEmailTemplates,
} from "@/features/settings/email-templates/hooks/use-email-templates"
import {
  emailTemplateCatalogQueryOptions,
  emailTemplatesQueryOptions,
} from "@/features/settings/email-templates/query-options"
import { emailTemplatesSearchSchema } from "@/features/settings/email-templates/schemas"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/settings/email-templates/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("config:email_templates:view"),
  validateSearch: emailTemplatesSearchSchema,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(emailTemplatesQueryOptions()),
      context.queryClient.ensureQueryData(emailTemplateCatalogQueryOptions()),
    ]),
})

function RouteComponent() {
  const { key } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { templates, error } = useEmailTemplates()
  const { catalog } = useEmailTemplateCatalog()
  const { hasPermission } = usePermissions()
  const [adding, setAdding] = useState(false)

  const selected = templates.find((t) => t.key === key) ?? templates.at(0)
  const variables = catalog.find((c) => c.key === selected?.key)?.variables ?? []

  const select = (next: string) =>
    navigate({ search: { key: next }, replace: true, resetScroll: false })

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={Mail}
        title="Email templates"
        description="What clients receive when you email them an invoice or a quotation. Values such as the client's name are filled in when each email is sent."
        actions={
          <Can permission="config:email_templates:edit">
            <Button onClick={() => setAdding(true)}>
              <ActionIcon action="create" />
              Add custom template
            </Button>
          </Can>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn't load the email templates</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <EmailTemplateList
          templates={templates}
          selectedKey={selected?.key}
          onSelect={select}
        />
        {selected ? (
          <EmailTemplateEditor
            // A new key, a save or a reset reloads the editor with the stored version
            key={`${selected.key}:${selected.customized}:${selected.updated_at ?? ""}`}
            template={selected}
            variables={variables}
            canEdit={hasPermission("config:email_templates:edit")}
          />
        ) : (
          <SectionEmpty
            icon={MailX}
            title="No email templates"
            description="The templates couldn't be loaded."
          />
        )}
      </div>

      <NewCustomTemplateDialog
        open={adding}
        onOpenChange={setAdding}
        existingKeys={templates.map((t) => t.key)}
        onCreated={select}
      />
    </SettingsPage>
  )
}
