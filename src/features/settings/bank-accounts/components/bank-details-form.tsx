import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import z from "zod"
import { SelectField, TextField } from "@/components/ui/form-fields"
import { FieldGroup } from "@/components/ui/field"
import { useTranslation } from "@/i18n"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { ActionIcon } from "@/components/icons"
import {
  bankDetailsCreateSchema,
  bankDetailsUpdateSchema,
  BankDetailsUpdateInput,
} from "@/features/settings/bank-accounts/schemas"
import {
  createBankFn,
  updateBankFn,
} from "@/features/settings/bank-accounts/services"
import { bankCountryCodes } from "../enums"

type BankDetailsFormProps = {
  initialData?: BankDetailsUpdateInput
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function BankDetailsForm({
  initialData,
  open,
  onOpenChange
}: BankDetailsFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const tr = useTranslation()
  const isEdit = !!initialData

  const formSchema = isEdit ? bankDetailsUpdateSchema : bankDetailsCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateBankFn({ data: values })
        : createBankFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      form.reset()
      queryInvalidator.banks.list.invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant={"outline"} size={"icon"} type="button">
                <ActionIcon action="create" />
              </Button>
              Bank
            </DialogTitle>
            <DialogDescription>Add Bank details</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField label="Bank name" control={form.control} name={"name"} />
            <SelectField
              label="Country"
              control={form.control}
              name={"country"}
              options={bankCountryCodes.map((ele) => ({
                label: ele,
                value: ele,
              }))}
            />
            <TextField
              label="Swift code"
              control={form.control}
              name={"swift_code"}
              required={false}
            />
          </FieldGroup>
          <DialogFooter className="sm:justify-end">
            <SubmitButton
              text={tr("common.form.submit")}
              isSubmitting={form.formState.isSubmitting}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
