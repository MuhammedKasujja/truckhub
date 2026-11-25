import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import type { EntityId } from "@/schemas"
import { PageBackButton } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ClientPicker } from "@/features/clients/components/client-pickers"
import { ComposeEmailForm } from "@/features/emails/components/compose-email-form"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/emails/compose")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("mailing:compose"),
})

function RouteComponent() {
  const [clientId, setClientId] = useState<EntityId>()
  // Bumped after each send so the next email starts empty
  const [sent, setSent] = useState(0)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
      <PageBackButton text="Back" />
      <Card>
        <CardHeader>
          <CardTitle>Compose email</CardTitle>
          <CardDescription>
            Type @ in the message to insert an invoice, quotation, trip, client, driver, vehicle or
            user, then pick one of its values. Invoice and quotation PDFs can be attached below it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-1.5 sm:max-w-sm">
            <Label>Client (optional)</Label>
            <ClientPicker
              value={clientId ?? null}
              allowCreate={false}
              placeholder="Suggest this client's addresses"
              onChange={(client) => setClientId(client?.id)}
            />
          </div>
          <ComposeEmailForm key={sent} context={{ clientId }} onSent={() => setSent((n) => n + 1)} />
        </CardContent>
      </Card>
    </div>
  )
}
