import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { BriefcaseBusiness, Lock, PencilIcon, Plus, Trash2 } from "lucide-react"
import { positionsQueryOptions } from "../query-options"
import { PositionUpdateSchema } from "../schemas"
import {
  createPositionFn,
  deletePositionFn,
  updatePositionFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import { ListSkeleton, LoadError, StatusPill, TableCard } from "./hr-ui"
import type z from "zod"
import type { Position } from "../types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Can } from "@/components/has-permission"
import {
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/ui/form-fields"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SectionEmpty,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

/** One form for both: a new position simply has no id yet. */
const FormSchema = PositionUpdateSchema.partial({ id: true })
type Values = z.infer<typeof FormSchema>

export function PositionList() {
  const {
    data: positions = [],
    isLoading,
    error,
  } = useQuery(positionsQueryOptions())
  const [editing, setEditing] = useState<Position>()
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Position>()

  const remove = useHrAction(
    (id: string) => deletePositionFn({ data: { id } }),
    {
      onDone: () => setDeleting(undefined),
    }
  )

  const openForm = (position?: Position) => {
    setEditing(position)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          The jobs people are hired for. Mechanics can be assigned to
          maintenance tasks.
        </p>
        <Can permission="hr:positions:manage">
          <Button onClick={() => openForm()}>
            <Plus />
            Add position
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : error ? (
        <LoadError message={error.message} />
      ) : positions.length === 0 ? (
        <SectionEmpty
          icon={BriefcaseBusiness}
          title="No positions yet"
          description="Add one, then choose it on each staff member."
          className="bg-card py-14"
        />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>
                    <span className="font-medium">{position.name}</span>
                    {position.description && (
                      <p className="max-w-md truncate text-xs text-muted-foreground">
                        {position.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      {position.code}
                      {position.is_system && (
                        <Lock
                          className="size-3"
                          aria-label="Built in: the code can't change"
                        />
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={position.is_active ? "green" : "grey"}>
                      {position.is_active ? "Active" : "Inactive"}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <Can permission="hr:positions:manage">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${position.name}`}
                          onClick={() => openForm(position)}
                        >
                          <PencilIcon />
                        </Button>
                        {!position.is_system && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${position.name}`}
                            onClick={() => setDeleting(position)}
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <PositionForm
        position={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        isLoading={remove.isPending}
        title={`Delete ${deleting?.name ?? "position"}?`}
        description="A position that staff still hold can't be deleted; move them first."
        confirmLabel="Delete position"
        onConfirm={() => deleting && remove.run(deleting.id)}
      />
    </div>
  )
}

function PositionForm({
  position,
  open,
  onOpenChange,
}: {
  position?: Position
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = !!position
  const isSystem = !!position?.is_system

  const initial = (): Values => ({
    id: position?.id,
    name: position?.name ?? "",
    code: position?.code ?? "",
    description: position?.description ?? "",
    is_active: position?.is_active ?? true,
  })
  const form = useForm<Values>({
    resolver: zodResolver(FormSchema),
    defaultValues: initial(),
  })
  useEffect(() => {
    if (open) form.reset(initial())
  }, [open])

  const save = useHrAction(
    ({ id, is_active, ...values }: Values) =>
      id
        ? updatePositionFn({ data: { id, is_active, ...values } })
        : createPositionFn({ data: values }),
    { onDone: () => onOpenChange(false) }
  )

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={BriefcaseBusiness}
      eyebrow={isEdit ? "Edit position" : "New position"}
      title={isEdit ? position.name : "Add a position"}
      size="sm"
      submitText={isEdit ? "Save changes" : "Add position"}
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <TextField label="Name" name="name" control={form.control} />
        <TextField
          label="Code"
          name="code"
          control={form.control}
          readOnly={isSystem}
        />
      </div>
      {isSystem && (
        <p className="text-xs text-muted-foreground">
          This position is built in. You can rename it, but its code stays the
          same and it can't be switched off.
        </p>
      )}
      <TextareaField
        label="Description"
        name="description"
        control={form.control}
        required={false}
      />
      {isEdit && !isSystem && (
        <SwitchField
          label="Active"
          name="is_active"
          control={form.control}
          description="Inactive positions stay on existing staff records but can't be chosen"
        />
      )}
    </SettingsFormDialog>
  )
}
