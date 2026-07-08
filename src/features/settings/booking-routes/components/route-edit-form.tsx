"use client"
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
import { useTranslation } from "@/i18n"
import { BookingRoute, RouteCreateSchema, RouteUpdateSchema } from "../schemas"
import z from "zod"
import { NumberField, TextField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { createRouteFn, updateRouteFn } from "../services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"

type RouteEditFormProps = {
  initialData?: BookingRoute
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RouteEditForm({
  open,
  onOpenChange,
  initialData,
}: RouteEditFormProps) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()

  const isEdit = !!initialData

  const formSchema = isEdit ? RouteUpdateSchema : RouteCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateRouteFn({ data: values })
        : createRouteFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.routes.list()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Booking Route" : "Booking Route"}
            </DialogTitle>
            <DialogDescription>Create a new booking route</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-4">
              <TextField
                label="Origin"
                control={form.control}
                name={"origin"}
              />
              <TextField
                label="Destination"
                control={form.control}
                name={"destination"}
              />
              <NumberField
                label="Distance (km)"
                control={form.control}
                name={"distance_km"}
              />
              <NumberField
                label="Min Delivery Hours"
                control={form.control}
                name={"min_hrs"}
              />
              <NumberField
                label="Max Delivery Hours"
                control={form.control}
                name={"max_hrs"}
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
