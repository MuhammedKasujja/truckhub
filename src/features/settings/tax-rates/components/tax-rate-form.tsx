"use client"
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
import { PlusIcon } from "lucide-react"
import z from "zod"
import {
  TaxRateCreateSchema,
  TaxRateUpdateSchema,
  TaxRateUpdateSchemaType,
} from "@/features/settings/tax-rates/schemas"
import {
  createTaxRateFn,
  updateTaxRateFn,
} from "@/features/settings/tax-rates/services"
import {
  NumberField,
  TextareaField,
  TextField,
} from "@/components/ui/form-fields"
import React from "react"
import { useTranslation } from "@/i18n"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

type Props = {
  trigger?: React.ReactNode
  initialData?: TaxRateUpdateSchemaType
}

export function TaxRateForm({ trigger, initialData }: Props) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()

  const [open, setOpen] = React.useState(false)
  const isEdit = !!initialData

  const formSchema = isEdit ? TaxRateUpdateSchema : TaxRateCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateTaxRateFn({ data: values })
        : createTaxRateFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.taxRates.list()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="font-normal">
            <PlusIcon />
            Tax Rate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Tax Rate" : "Add Tax Rate"}
            </DialogTitle>
            <DialogDescription>Create new Tax Rate</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField label="Name" control={form.control} name={"name"} />
              <NumberField label="Rate" control={form.control} name={"rate"} />
              <TextareaField
                label="Description"
                control={form.control}
                name={"description"}
                required={false}
              />
            </div>
          </div>
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
