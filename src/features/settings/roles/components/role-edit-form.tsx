import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, UserCog } from "lucide-react"
import type z from "zod"
import type { RoleUpdateSchemaType } from "@/features/settings/roles/schemas"
import {
  RoleCreateSchema,
  RoleUpdateSchema,
} from "@/features/settings/roles/schemas"
import { createRoleFn, updateRoleFn } from "@/features/settings/roles/services"
import { TextField, TextareaField } from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { SettingsFormDialog } from "@/features/settings/_components/settings-ui"

type Props = {
  trigger?: React.ReactNode
  initialData?: RoleUpdateSchemaType
  /** Control the dialog from outside instead of through `trigger`. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const emptyValues = { name: "", description: "" }

export function RoleEditForm({
  trigger,
  initialData,
  open: openProp,
  onOpenChange,
}: Props) {
  const queryInvalidator = useQueryInvalidator()
  const [openState, setOpenState] = React.useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChange ?? setOpenState

  const isEdit = !!initialData
  const formSchema = isEdit ? RoleUpdateSchema : RoleCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? emptyValues,
  })

  React.useEffect(() => {
    if (open) form.reset(initialData ?? emptyValues)
    // Only when the dialog opens; initialData is a fresh object each render.
  }, [open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } =
      "id" in values
        ? await updateRoleFn({ data: values })
        : await createRoleFn({ data: values })

    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.roles.list()
      setOpen(false)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        openProp === undefined
          ? (trigger ?? (
              <Button>
                <Plus />
                New role
              </Button>
            ))
          : undefined
      }
      icon={UserCog}
      eyebrow={isEdit ? "Edit role" : "New role"}
      title={isEdit ? (initialData.name ?? "Role") : "Create a role"}
      description={
        isEdit
          ? "Rename the role or change its description."
          : "Name the role, then choose its permissions on the Permissions tab."
      }
      size="sm"
      submitText={isEdit ? "Save changes" : "Create role"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <TextField
        label="Name"
        control={form.control}
        name="name"
        placeholder="e.g. Dispatcher"
      />
      <TextareaField
        required={false}
        label="Description"
        control={form.control}
        name="description"
        placeholder="Who this role is for and what they do"
      />
    </SettingsFormDialog>
  )
}
