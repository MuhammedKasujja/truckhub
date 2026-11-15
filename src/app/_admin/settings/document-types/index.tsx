import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { FileCog, Files } from "lucide-react"
import type { DocumentOwnerKind } from "@/features/documents/enums"
import { Can } from "@/components/has-permission"
import { ActionIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentTypeForm } from "@/features/documents/components/document-type-form"
import { DocumentTypesTable } from "@/features/documents/components/document-types-table"
import {
  DOCUMENT_OWNER_LABEL,
  documentOwnerKinds,
} from "@/features/documents/enums"
import {
  SettingsPage,
  SettingsPageHeader,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/settings/document-types/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("config:document_types:view"),
})

function RouteComponent() {
  const [ownerKind, setOwnerKind] = useState<DocumentOwnerKind>("driver")
  const [adding, setAdding] = useState(false)

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={Files}
        title="Document types"
        description="The kinds of document you keep on file, and the rules their files must meet."
        actions={
          <Can permission="config:document_types:edit">
            <Button onClick={() => setAdding(true)}>
              <ActionIcon action="create" />
              Add document type
            </Button>
          </Can>
        }
      />

      <Tabs
        value={ownerKind}
        onValueChange={(value) => setOwnerKind(value as DocumentOwnerKind)}
      >
        <TabsList>
          {documentOwnerKinds.map((kind) => (
            <TabsTrigger key={kind} value={kind}>
              {DOCUMENT_OWNER_LABEL[kind]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SettingsSection
        icon={FileCog}
        title={`${DOCUMENT_OWNER_LABEL[ownerKind]}' documents`}
        description={
          ownerKind === "vehicle"
            ? "Types can be set up now. Uploading vehicle documents is not available yet."
            : "Shown on every driver's page, in this order"
        }
        contentClassName="p-0"
      >
        <DocumentTypesTable ownerKind={ownerKind} />
      </SettingsSection>

      <DocumentTypeForm
        ownerKind={ownerKind}
        open={adding}
        onOpenChange={setAdding}
      />
    </SettingsPage>
  )
}
