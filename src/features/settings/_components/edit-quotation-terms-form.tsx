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
import { updateQoutationTermsFn } from "../service"
import { toast } from "sonner"
import { useState } from "react"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

const emptyPaymentTerm = {
  value: "",
}
interface EditQuotationTermsFormProps {
  initialData: EditInvoiceTermsRequest
  onSubmit?: (data: EditInvoiceTermsRequest) => void
}

export function EditQuotationTermsForm({
  initialData,
}: EditQuotationTermsFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const queryInvalidator = useQueryInvalidator()

  const form = useForm<EditInvoiceTermsRequest>({
    resolver: zodResolver(EditInvoiceTermsSchema),
    defaultValues: initialData,
  })

  const quotationTermsFields = useFieldArray({
    control: form.control,
    name: "quotationTerms",
  })

  async function onSubmitData(data: EditInvoiceTermsRequest) {
    const { error } = await updateQoutationTermsFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Quotation terms updated successfully")
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
      <DialogContent className="max-w-[90%] ring-4 md:min-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Quotation Terms</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmitData)} className="space-y-4">
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => quotationTermsFields.append(emptyPaymentTerm)}
          >
            <Plus /> Add
          </Button>
          <FieldGroup>
            {quotationTermsFields.fields.map((ele, index) => (
              <Field key={ele.id} orientation={"horizontal"}>
                <TextField
                  control={form.control}
                  name={`quotationTerms.${index}.value`}
                />
                <Button
                  type="button"
                  variant={"destructive"}
                  onClick={() => quotationTermsFields.remove(index)}
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
