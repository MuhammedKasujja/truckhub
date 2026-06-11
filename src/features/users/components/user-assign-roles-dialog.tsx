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
import { toast } from "sonner"
import { userAssignRolesFn } from "../services"

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
    defaultValues: {
      user_id: user?.id,
      roles: (user?.roles ?? []).map((role) => role.id),
    },
  })

  // Force rebuild whenever the user changes if no key is used in the parent component
  //   useEffect(() => {
  //     if (user) {
  //       form.reset({
  //         user_id: user?.id,
  //         roles: (user?.roles ?? []).map((role) => role.id),
  //       })
  //     }
  //   }, [user, form])

  async function onSubmit(data: z.infer<typeof UserAssignRolesSchema>) {
    const { message, error } = await userAssignRolesFn({ data })

    if (message) {
      toast.success(message)
    }
    if (error) {
      toast.error(error.message)
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
            <DialogTitle>{`Edit roles for * ${user?.name}`}</DialogTitle>
            <DialogDescription>
              Change user's curent roles with new ones for system access
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <HiddenField control={form.control} name={"user_id"} />
            <div className="flex flex-wrap gap-2">
              {(data ?? [])?.map((role) => (
                <Button
                  key={role.id}
                  type="button"
                  variant={"outline"}
                  onClick={() => form.setValue("roles", [role.id])}
                >
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
