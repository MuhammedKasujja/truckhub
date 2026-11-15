import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileCog } from "lucide-react"
import {
  CONTENT_TYPE_LABEL,
  DOCUMENT_OWNER_LABEL,
  documentContentTypes,
} from "../enums"
import {
  useCreateDocumentType,
  useUpdateDocumentType,
} from "../hooks/use-document-actions"
import {
  createDocumentTypeSchema,
  toDocumentTypeCode,
  toMaxSizeMb,
  updateDocumentTypeSchema,
} from "../schemas"
import type { DocumentContentType, DocumentOwnerKind } from "../enums"
import type {
  CreateDocumentTypeInput,
  UpdateDocumentTypeInput,
} from "../schemas"
import type { DocumentType } from "../types"
import {
  MultiSelectField,
  NumberField,
  SwitchField,
  TextField,
} from "@/components/ui/form-fields"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type FormValues = CreateDocumentTypeInput | UpdateDocumentTypeInput

type Props = {
  /** The kind of record new types attach to. */
  ownerKind: DocumentOwnerKind
  /** The type being edited; leave out to add one. */
  documentType?: DocumentType
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CONTENT_TYPE_OPTIONS = documentContentTypes.map((value) => ({
  value,
  label: CONTENT_TYPE_LABEL[value],
}))

const DEFAULT_CONTENT_TYPES: DocumentContentType[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
]

const isKnownContentType = (value: string): value is DocumentContentType =>
  (documentContentTypes as readonly string[]).includes(value)

function valuesFor(
  ownerKind: DocumentOwnerKind,
  documentType?: DocumentType
): FormValues {
  if (!documentType) {
    return {
      code: "",
      name: "",
      ownerKind,
      isRequired: false,
      requiresExpiry: false,
      isRestricted: false,
      allowedContentTypes: DEFAULT_CONTENT_TYPES,
      maxSizeMb: 5,
      sortOrder: 0,
    }
  }
  return {
    id: documentType.id,
    name: documentType.name,
    isRequired: documentType.is_required,
    requiresExpiry: documentType.requires_expiry,
    isRestricted: documentType.is_restricted,
    allowedContentTypes:
      documentType.allowed_content_types.filter(isKnownContentType),
    maxSizeMb: toMaxSizeMb(documentType.max_size_bytes),
    sortOrder: documentType.sort_order,
    isActive: documentType.is_active,
  }
}

export function DocumentTypeForm({
  ownerKind,
  documentType,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!documentType
  const { createDocumentType, isPending: isCreating } = useCreateDocumentType()
  const { updateDocumentType, isPending: isUpdating } = useUpdateDocumentType()

  const form = useForm<FormValues>({
    resolver: zodResolver(
      isEdit ? updateDocumentTypeSchema : createDocumentTypeSchema
    ),
    defaultValues: valuesFor(ownerKind, documentType),
  })

  React.useEffect(() => {
    if (open) form.reset(valuesFor(ownerKind, documentType))
  }, [form, open, ownerKind, documentType])

  async function onSubmit(values: FormValues) {
    try {
      if ("id" in values) await updateDocumentType(values)
      else await createDocumentType(values)
      onOpenChange(false)
    } catch {
      // The action hook has already shown the API's message
    }
  }

  /** Suggest a code from the name until the user types their own. */
  function suggestCode() {
    if (isEdit || form.getFieldState("code").isDirty) return
    const name = form.getValues("name")
    if (name) {
      form.setValue("code", toDocumentTypeCode(name), { shouldValidate: true })
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={FileCog}
      eyebrow={isEdit ? "Edit document type" : "New document type"}
      title={isEdit ? documentType.name : "Add a document type"}
      description={`A kind of document kept for ${DOCUMENT_OWNER_LABEL[
        documentType?.owner_kind ?? ownerKind
      ].toLowerCase()}, and the rules its files must meet.`}
      submitText={isEdit ? "Save changes" : "Add document type"}
      isSubmitting={isCreating || isUpdating}
      onSubmit={form.handleSubmit(onSubmit)}
      footerNote={
        isEdit
          ? "Changes apply to the next upload; files already stored are kept."
          : undefined
      }
    >
      <FormGroup title="Details">
        <div onBlur={suggestCode}>
          <TextField
            label="Name"
            control={form.control}
            name="name"
            placeholder="e.g. Medical certificate"
          />
        </div>
        {isEdit ? (
          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Code </span>
            <span className="font-mono">{documentType.code}</span>
            <p className="text-xs text-muted-foreground">
              The code cannot change once the type exists.
            </p>
          </div>
        ) : (
          <TextField
            label="Code"
            control={form.control}
            name="code"
            placeholder="medical_certificate"
            description="Lowercase letters, digits and underscores. It cannot be changed later."
          />
        )}
      </FormGroup>

      <FormGroup title="Rules">
        <SwitchField
          label="Required"
          description="A record without one is flagged as missing it"
          control={form.control}
          name="isRequired"
        />
        <SwitchField
          label="Has an expiry date"
          description="An expiry date must be entered with every upload"
          control={form.control}
          name="requiresExpiry"
        />
        <SwitchField
          label="Restricted"
          description="Only administrators can open the files"
          control={form.control}
          name="isRestricted"
        />
      </FormGroup>

      <FormGroup title="Files">
        <MultiSelectField
          label="Allowed file types"
          control={form.control}
          name="allowedContentTypes"
          options={CONTENT_TYPE_OPTIONS}
          placeholder="Choose file types"
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Largest file (MB)"
            control={form.control}
            name="maxSizeMb"
            placeholder="5"
          />
          <NumberField
            label="Position in lists"
            control={form.control}
            name="sortOrder"
            placeholder="0"
            required={false}
          />
        </div>
      </FormGroup>

      {isEdit && (
        <FormGroup title="Status">
          <SwitchField
            label="Active"
            description="Switch off to stop new uploads of this type. Files already stored stay available."
            control={form.control}
            name="isActive"
          />
        </FormGroup>
      )}
    </SettingsFormDialog>
  )
}
