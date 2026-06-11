import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HiddenField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { useQuery } from "@tanstack/react-query"
import { SystemUser } from "../types"
import { useForm } from "react-hook-form"
import z from "zod"
import { UserAssignRolesSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "@/i18n"

type Props = {
  user?: SystemUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserAssignRolesDialog({ open, onOpenChange, user }: Props) {
  const tr = useTranslation()

  const { data } = useQuery(createRolesQueryOptions())

  const form = useForm<z.infer<typeof UserAssignRolesSchema>>({
    resolver: zodResolver(UserAssignRolesSchema),
    defaultValues: {},
  })

  async function onSubmit(data: z.infer<typeof UserAssignRolesSchema>) {}

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{`Edit roles for * ${user?.name}`}</DialogTitle>
            <DialogDescription>
              Change user's curent roles with new ones for system access
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <HiddenField control={form.control} name={"user_id"} />
            <div className="flex gap-2 flex-wrap">
              {(data ?? [])?.map((role) => (
                <Button type="button" variant={"outline"}>
                  {role.name}
                </Button>
              ))}
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
