import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2 } from "lucide-react"
import type z from "zod"
import type { Company} from "@/features/settings/schemas";
import {
  EmailField,
  TelephoneField,
  TextField,
  TextareaField,
} from "@/components/ui/form-fields"
import { CompanySchema } from "@/features/settings/schemas"
import { useEditCompanyDetails } from "@/features/settings/hooks/use-settings"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type EditCompanyDetailsDialogProps = {
  company: Company
  isOpen: boolean
  onOpenChanged: (open: boolean) => void
}

type CompanyFormValues = z.infer<typeof CompanySchema>

/** Turns the empty strings of cleared optional inputs into null. */
function emptyToNull<T extends Record<string, unknown>>(values: T): T {
  return Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
  ) as T
}

export function EditCompanyDetailsDialog({
  company,
  isOpen,
  onOpenChanged,
}: EditCompanyDetailsDialogProps) {
  const { editCompany, isPending } = useEditCompanyDetails()

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      ...company,
      phone_2: company.phone_2 ?? "",
      email_2: company.email_2 ?? "",
      address: company.address ?? "",
      website: company.website ?? "",
      description: company.description ?? "",
    },
  })

  function onSubmit(data: CompanyFormValues) {
    editCompany(emptyToNull(data), {
      onSuccess: () => onOpenChanged(false),
    })
  }

  return (
    <SettingsFormDialog
      open={isOpen}
      onOpenChange={onOpenChanged}
      icon={Building2}
      eyebrow="Company profile"
      title="Edit company details"
      description="These details appear on every invoice and quotation."
      size="lg"
      isSubmitting={isPending}
      submitDisabled={!form.formState.isDirty}
      footerNote={form.formState.isDirty ? "Unsaved changes" : undefined}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormGroup title="Identity">
        <TextField label="Company name" control={form.control} name="name" />
        <TextareaField
          label="Description"
          control={form.control}
          name="description"
          placeholder="A short line about what the company does"
          required={false}
        />
      </FormGroup>

      <FormGroup
        title="Contact"
        description="The primary phone and email are printed on documents."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TelephoneField label="Phone" control={form.control} name="phone" />
          <TelephoneField
            label="Secondary phone"
            control={form.control}
            name="phone_2"
            required={false}
          />
          <EmailField label="Email" control={form.control} name="email" />
          <EmailField
            label="Secondary email"
            control={form.control}
            name="email_2"
            required={false}
          />
        </div>
      </FormGroup>

      <FormGroup title="Location & web">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Address"
            control={form.control}
            name="address"
            placeholder="Plot 12, Kampala Road"
            required={false}
          />
          <TextField
            label="Website"
            control={form.control}
            name="website"
            type="url"
            placeholder="https://example.com"
            required={false}
          />
        </div>
      </FormGroup>
    </SettingsFormDialog>
  )
}
