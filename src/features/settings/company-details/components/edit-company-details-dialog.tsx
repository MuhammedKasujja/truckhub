import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { EmailField, TelephoneField, TextField } from "@/components/ui/form-fields"
import { useForm } from "react-hook-form"
import { Company, CompanySchema } from "../../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { updateCompanyDetailsFn } from "../services"
import { toast } from "sonner"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

type EditCompanyDetailsDialogProps = {
  company: Company
}

export function EditCompanyDetailsDialog({
  company,
}: EditCompanyDetailsDialogProps) {
  const invalidator = useQueryInvalidator()
  const form = useForm<z.infer<typeof CompanySchema>>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      ...company,
      phone: company.phone ?? "",
      phone_2: company.phone_2 ?? "",
    },
  })

  async function onSubmit(data: z.infer<typeof CompanySchema>) {
    const { message, error } = await updateCompanyDetailsFn({ data })
    if (error) {
      toast.error(error.message)
      invalidator.settings.refresh()
    } else {
      toast.success(message)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size={"icon"}>
          <Edit />
        </Button>
      </DialogTrigger>
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
