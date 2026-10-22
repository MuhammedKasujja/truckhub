import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  EmailField,
  TelephoneField,
  TextField,
} from "@/components/ui/form-fields"
import { useForm } from "react-hook-form"
import { Company, CompanySchema } from "@/features/settings/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { useEditCompanyDetails } from "@/features/settings/hooks/use-settings"

type EditCompanyDetailsDialogProps = {
  company: Company
  isOpen: boolean
  onOpenChanged: (open: boolean) => void
}

export function EditCompanyDetailsDialog({
  company,
  isOpen,
  onOpenChanged,
}: EditCompanyDetailsDialogProps) {
  const { editCompany } = useEditCompanyDetails()

  const form = useForm<z.infer<typeof CompanySchema>>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      ...company,
      phone: company.phone ?? "",
      phone_2: company.phone_2 ?? "",
    },
  })

  async function onSubmit(data: z.infer<typeof CompanySchema>) {
    editCompany(data, {
      onSuccess: () => {
        form.reset()
        onOpenChanged(false)
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChanged}>
      <DialogContent className="max-w-[90%] ring-4 md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Company Details</DialogTitle>
          <DialogDescription>
            This information will reflect on all the documents as well
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="mb-5">
            <TextField
              label="Company Name"
              control={form.control}
              name="name"
            />
            <Field orientation={"horizontal"} className="gap-4">
              <TelephoneField
                label="Phone"
                control={form.control}
                name="phone"
              />
              <TelephoneField
                label="Phone 2"
                control={form.control}
                name="phone_2"
              />
            </Field>
            <Field orientation={"horizontal"} className="gap-4">
              <EmailField label="Email" control={form.control} name="email" />
              <EmailField
                label="Email 2"
                control={form.control}
                name="email_2"
                required={false}
              />
            </Field>
            <TextField
              label="Address"
              control={form.control}
              name="address"
              required={false}
            />
            <TextField
              label="Website"
              control={form.control}
              name="website"
              type="url"
              required={false}
            />
          </FieldGroup>
          <DialogFooter>
            <Field>
              <SubmitButton isSubmitting={form.formState.isSubmitting} />
            </Field>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
