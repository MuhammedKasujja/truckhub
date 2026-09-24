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
import {
  CheckboxField,
  SelectField,
  TextField,
} from "@/components/ui/form-fields"
import { FieldGroup } from "@/components/ui/field"
import { useTranslation } from "@/i18n"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { ActionIcon } from "@/components/icons"
import {
  bankAccountCreateSchema,
  BankAccountUpdateInput,
  bankAccountUpdateSchema,
} from "@/features/settings/bank-accounts/schemas"
import {
  createBankAccountFn,
  updateBankAccountFn,
} from "@/features/settings/bank-accounts/services"
import { BankPickerField } from "./bank-pickers"
import { accountPurposes, currencies } from "../enums"

type BankAccountFormProps = {
  initialData?: BankAccountUpdateInput
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function BankAccountForm({
  initialData,
  open,
  onOpenChange,
}: BankAccountFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const tr = useTranslation()
  const isEdit = !!initialData

  const formSchema = isEdit ? bankAccountUpdateSchema : bankAccountCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateBankAccountFn({ data: values })
        : createBankAccountFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      form.reset()
      queryInvalidator.bankAccounts.list.invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error(errors)
          })}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant={"outline"} size={"icon"} type="button">
                <ActionIcon action="create" />
              </Button>
              Bank Account
            </DialogTitle>
            <DialogDescription>Add bank account details</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <BankPickerField
              label="Bank name"
              control={form.control}
              name={"bank_id"}
            />
            <TextField
              label="Account Name"
              control={form.control}
              name={"account_name"}
            />
            <TextField
              label="Account Number"
              control={form.control}
              name={"account_number"}
            />
            <TextField label="Branch" control={form.control} name={"branch"} />
            <SelectField
              label="Currency"
              control={form.control}
              name={"currency"}
              options={currencies.map((ele) => ({
                label: ele,
                value: ele,
              }))}
            />
            <SelectField
              label="Account purpose"
              control={form.control}
              name={"purpose"}
              options={accountPurposes.map((ele) => ({
                label: ele,
                value: ele,
              }))}
            />
            <CheckboxField
              label="Show on invoices"
              control={form.control}
              name={"show_on_invoices"}
              description="Use this account on client invoices"
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
