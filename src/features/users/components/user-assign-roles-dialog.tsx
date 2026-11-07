import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Check, UserCog } from "lucide-react"
import { UserAssignRolesSchema } from "../schemas"
import { userAssignRolesFn } from "../services"
import { usersQueryKeys } from "../query-options"
import type { SystemUser } from "../types"
import type z from "zod"
import { createRolesQueryOptions } from "@/features/settings/roles/query-options"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  SectionEmpty,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"
import { cn } from "@/lib/utils"

type Props = {
  user?: SystemUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormValues = z.infer<typeof UserAssignRolesSchema>

export function UserAssignRolesDialog({ open, onOpenChange, user }: Props) {
  const queryInvalidator = useQueryInvalidator()
  const queryClient = useQueryClient()
  const { data: roles = [], isLoading } = useQuery(createRolesQueryOptions())

  const form = useForm<FormValues>({
    resolver: zodResolver(UserAssignRolesSchema),
    defaultValues: { user_id: user?.id, roles: [] },
  })

  // Start from the user's current roles each time the dialog opens.
  useEffect(() => {
    if (open && user) {
      form.reset({ user_id: user.id, roles: user.roles.map((r) => r.id) })
    }
  }, [open, user, form])

  async function onSubmit(data: FormValues) {
    const { message, error } = await userAssignRolesFn({ data })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(message ?? "Roles updated")
    queryInvalidator.users.list.invalidate()
    queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(data.user_id) })
    onOpenChange(false)
  }

  const selectedCount = form.watch("roles").length

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={UserCog}
      eyebrow="Roles"
      title={user ? `Roles for ${user.name}` : "Assign roles"}
      description="A user can do everything any of their roles allows."
      isSubmitting={form.formState.isSubmitting}
      submitText="Save roles"
      footerNote={`${selectedCount} selected`}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="roles"
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            {!isLoading && roles.length === 0 && (
              <SectionEmpty
                icon={UserCog}
                title="No roles yet"
                description="Create a role on the Roles tab first."
              />
            )}
            <div role="group" aria-label="Roles" className="space-y-2">
              {roles.map((role) => {
                const checked = field.value.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() =>
                      field.onChange(
                        checked
                          ? field.value.filter((id) => id !== role.id)
                          : [...field.value, role.id]
                      )
                    }
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border bg-background p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      checked && "border-primary bg-primary/5 ring-1 ring-primary hover:bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                        checked && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {role.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {role.description || "No description"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {role.permissions.length} permissions
                    </span>
                  </button>
                )
              })}
            </div>
            {fieldState.error && (
              <p className="text-xs text-destructive">
                Pick at least one role.
              </p>
            )}
          </div>
        )}
      />
    </SettingsFormDialog>
  )
}
