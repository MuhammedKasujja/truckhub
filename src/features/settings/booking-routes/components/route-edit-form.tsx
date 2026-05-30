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
import { useTranslation } from "@/i18n"
import { useState } from "react"
import { RouteEditSchema } from "../schemas"
import z from "zod"
import { NumberField, TextField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { createRouteFn, updateRouteFn } from "../services"
import { useQueryClient } from "@tanstack/react-query"
import { bookingRoutesQueryKeys } from "../query-options"

export function RouteEditForm() {
  const tr = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof RouteEditSchema>>({
    resolver: zodResolver(RouteEditSchema),
  })

  async function onSubmit(values: z.infer<typeof RouteEditSchema>) {
    const promise =
      "id" in values
        ? updateRouteFn({ data: values })
        : createRouteFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryClient.invalidateQueries({
        queryKey: bookingRoutesQueryKeys.list(),
      })
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-normal">
          <PlusIcon />
          Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Booking Route</DialogTitle>
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
