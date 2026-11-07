import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { WalletCards } from "lucide-react"
import { accountPurposes, currencies } from "../enums"
import { accountPurposeMeta, currencyMeta } from "../labels"
import { BankPickerField } from "./bank-pickers"
import type z from "zod"
import type {
  BankAccountUpdateInput} from "@/features/settings/bank-accounts/schemas";
import { SwitchField, TextField } from "@/components/ui/form-fields"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  bankAccountCreateSchema,
  bankAccountUpdateSchema,
} from "@/features/settings/bank-accounts/schemas"
import {
  createBankAccountFn,
  updateBankAccountFn,
} from "@/features/settings/bank-accounts/services"
import {
  FormGroup,
  OptionTile,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type BankAccountFormProps = {
  initialData?: BankAccountUpdateInput
  open: boolean
  onOpenChange: (v: boolean) => void
}

const createDefaults = {
  account_name: "",
  account_number: "",
  branch: "",
  currency: "UGX",
  show_on_invoices: false,
} as const

export function BankAccountForm({
  initialData,
  open,
  onOpenChange,
}: BankAccountFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData

  const formSchema = isEdit ? bankAccountUpdateSchema : bankAccountCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? createDefaults,
  })

  // Start from the saved values every time the dialog opens.
  useEffect(() => {
    if (open) form.reset(initialData ?? createDefaults)
  }, [open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } =
      "id" in values
        ? await updateBankAccountFn({ data: values })
        : await createBankAccountFn({ data: values })

    if (isSuccess) {
      toast.success(message)
      queryInvalidator.bankAccounts.list.invalidate()
      onOpenChange(false)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={WalletCards}
      eyebrow={isEdit ? "Edit bank account" : "New bank account"}
      title={isEdit ? (initialData.account_name ?? "Bank account") : "Add a bank account"}
      description="Where clients pay you and how the account appears on invoices."
      size="lg"
      submitText={isEdit ? "Save changes" : "Add account"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormGroup title="Account">
        <BankPickerField
          label="Bank"
          control={form.control}
          name="bank_id"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Account name"
            control={form.control}
            name="account_name"
            placeholder="As registered with the bank"
          />
          <TextField
            label="Account number"
            control={form.control}
            name="account_number"
          />
          <TextField
            label="Branch"
            control={form.control}
            name="branch"
            placeholder="e.g. Kampala Road"
          />
        </div>
      </FormGroup>

      <FormGroup title="Currency">
        <Controller
          control={form.control}
          name="currency"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <div
                role="radiogroup"
                aria-label="Currency"
                className="grid gap-2 sm:grid-cols-2"
              >
                {currencies.map((c) => (
                  <OptionTile
                    key={c}
                    selected={field.value === c}
                    onSelect={() => field.onChange(c)}
                    title={c}
                    description={currencyMeta[c].label}
                  />
                ))}
              </div>
              {fieldState.error && (
                <p className="text-xs text-destructive">Choose a currency</p>
              )}
            </div>
          )}
        />
      </FormGroup>

      <FormGroup title="Purpose" description="Optional. Helps you tell accounts apart.">
        <Controller
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label="Account purpose"
              className="grid gap-2 sm:grid-cols-2"
            >
              {accountPurposes.map((p) => {
                const meta = accountPurposeMeta[p]
                return (
                  <OptionTile
                    key={p}
                    selected={field.value === p}
                    // Clicking the selected tile clears the purpose.
                    onSelect={() =>
                      field.onChange(field.value === p ? undefined : p)
                    }
                    icon={meta.icon}
                    title={meta.label}
                    description={meta.description}
                  />
                )
              })}
            </div>
          )}
        />
      </FormGroup>

      <div className="rounded-lg border p-3.5">
        <SwitchField
          label="Show on invoices"
          control={form.control}
          name="show_on_invoices"
          description="Print these account details on client invoices so they know where to pay."
        />
      </div>
    </SettingsFormDialog>
  )
}
