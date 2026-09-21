import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import z from "zod"
import { TextField } from "@/components/ui/form-fields"
import React from "react"
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

type BankAccountFormProps = {
  trigger: React.ReactNode
  initialData?: BankAccountUpdateInput
}

export function BankAccountForm({
  trigger,
  initialData,
}: BankAccountFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const tr = useTranslation()
  const [open, setOpen] = React.useState(false)
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
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Button variant={"outline"} size={"icon"} type="button">
                <ActionIcon action="create" />
              </Button>
              Bank Account
            </DialogTitle>
            <DialogDescription>Create new Bank Account</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField
              label="Account Number"
              control={form.control}
              name={"account_number"}
            />
            <TextField
              label="Account Name"
              control={form.control}
              name={"account_name"}
            />
            <TextField label="Branch" control={form.control} name={"branch"} />
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
