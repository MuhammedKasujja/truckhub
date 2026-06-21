import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { TextField } from "@/components/ui/form-fields"
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
    defaultValues: { ...company },
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
      <DialogTrigger>
        <Button type="button" size={"icon"}>
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company Details</DialogTitle>
          <DialogDescription>
            This information will reflect on all the documents as well
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <TextField
              label="Company Name"
              control={form.control}
              name="name"
            />
            <TextField label="Phone" control={form.control} name="phone" />
            <TextField label="Email" control={form.control} name="email" />
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
            <Field>
              <SubmitButton isSubmitting={form.formState.isSubmitting} />
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
