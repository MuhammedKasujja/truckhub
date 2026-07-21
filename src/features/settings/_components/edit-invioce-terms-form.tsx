import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EditInvoiceTermsRequest, EditInvoiceTermsSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash2 } from "lucide-react"
import { Field, FieldGroup } from "@/components/ui/field"
import { SubmitButton } from "@/components/ui/submit-button"
import { TextField } from "@/components/ui/form-fields"
import { updateInvoiceTermsFn } from "../service"
import { toast } from "sonner"
import { useState } from "react"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

const emptyPaymentTerm = {
  value: "",
}
interface EditInvioceTermsFormProps {
  initialData: EditInvoiceTermsRequest
  onSubmit?: (data: EditInvoiceTermsRequest) => void
}

export function EditInvoiceTermsForm({
  initialData,
}: EditInvioceTermsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryInvalidator = useQueryInvalidator()

  const form = useForm<EditInvoiceTermsRequest>({
    resolver: zodResolver(EditInvoiceTermsSchema),
    defaultValues: initialData,
  })

  const invoiceTermsFields = useFieldArray({
    control: form.control,
    name: "invoiceTerms",
  })

  async function onSubmitData(data: EditInvoiceTermsRequest) {
    // onSubmit(data)
    const { error } = await updateInvoiceTermsFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Invoice terms updated successfully")
      queryInvalidator.settings.refresh()
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"secondary"}>
          <Edit /> Edit Terms
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90%] md:min-w-3xl ring-4">
        <DialogHeader>
          <DialogTitle>Edit Invoice Terms</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmitData)} className="space-y-4">
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => invoiceTermsFields.append(emptyPaymentTerm)}
          >
            <Plus /> Add
          </Button>
          <FieldGroup>
            {invoiceTermsFields.fields.map((ele, index) => (
              <Field key={ele.id} orientation={"horizontal"}>
                <TextField
                  control={form.control}
                  name={`invoiceTerms.${index}.value`}
                />
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => invoiceTermsFields.remove(index)}
                  size={"icon-sm"}
                >
                  <Trash2 />
                </Button>
              </Field>
            ))}
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
