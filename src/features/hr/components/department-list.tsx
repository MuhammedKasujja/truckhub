import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Building2, PencilIcon, Plus, Trash2 } from "lucide-react"
import { departmentsQueryOptions, staffListQueryOptions } from "../query-options"
import { DepartmentUpdateSchema } from "../schemas"
import {
  createDepartmentFn,
  deleteDepartmentFn,
  updateDepartmentFn,
} from "../services"
import { useHrAction } from "../use-hr-action"
import {
  ListSkeleton,
  LoadError,
  OptionalSelectField,
  StatusPill,
  TableCard,
} from "./hr-ui"
import type z from "zod"
import type { Department } from "../types"
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

/** One form for both: a new department simply has no id yet. */
const FormSchema = DepartmentUpdateSchema.partial({ id: true })
type Values = z.infer<typeof FormSchema>

/** People who can head a department; the first 100 active staff by name. */
const HEAD_CANDIDATES = { page: 1, perPage: 100, search: "", status: "active" } as const

export function DepartmentList() {
  const { data: departments = [], isLoading, error } = useQuery(
    departmentsQueryOptions()
  )
  const [editing, setEditing] = useState<Department>()
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Department>()

  const remove = useHrAction(
    (id: string) => deleteDepartmentFn({ data: { id } }),
    { onDone: () => setDeleting(undefined) }
  )

  const openForm = (department?: Department) => {
    setEditing(department)
    setFormOpen(true)
  }
  const nameOf = (id: string | null) =>
    departments.find((d) => d.id === id)?.name

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Group staff into departments, each with an optional head.
        </p>
        <Can permission="hr:departments:manage">
          <Button onClick={() => openForm()}>
            <Plus />
            Add department
          </Button>
        </Can>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <LoadError message={error.message} />
      ) : departments.length === 0 ? (
        <SectionEmpty
          icon={Building2}
          title="No departments yet"
          description="Add one, then choose it on each staff member."
          className="bg-card py-14"
        />
      ) : (
        <TableCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Part of</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <span className="font-medium">{department.name}</span>
                    {department.code && (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {department.code}
                      </span>
                    )}
                    {department.description && (
                      <p className="max-w-md truncate text-xs text-muted-foreground">
                        {department.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{nameOf(department.parent_id) ?? "—"}</TableCell>
                  <TableCell>{department.head?.name ?? "—"}</TableCell>
                  <TableCell>
                    <StatusPill tone={department.is_active ? "green" : "grey"}>
                      {department.is_active ? "Active" : "Inactive"}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    <Can permission="hr:departments:manage">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${department.name}`}
                          onClick={() => openForm(department)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${department.name}`}
                          onClick={() => setDeleting(department)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      )}

      <DepartmentForm
        department={editing}
        departments={departments}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        isLoading={remove.isPending}
        title={`Delete ${deleting?.name ?? "department"}?`}
        description="A department with staff or sub-departments can't be deleted; move them first."
        confirmLabel="Delete department"
        onConfirm={() => deleting && remove.run(deleting.id)}
      />
    </div>
  )
}

function DepartmentForm({
  department,
  departments,
  open,
  onOpenChange,
}: {
  department?: Department
  departments: Department[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = !!department
  const { data: staff } = useQuery({
    ...staffListQueryOptions(HEAD_CANDIDATES),
    enabled: open,
  })

  const initial = (): Values => ({
    id: department?.id,
    name: department?.name ?? "",
    code: department?.code ?? "",
    description: department?.description ?? "",
    parent_id: department?.parent_id ?? "",
    head_staff_id: department?.head_staff_id ?? "",
    is_active: department?.is_active ?? true,
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
        ? updateDepartmentFn({ data: { id, is_active, ...values } })
        : createDepartmentFn({ data: values }),
    { onDone: () => onOpenChange(false) }
  )

  const headOptions = (staff?.data ?? []).map((s) => ({
    value: s.id,
    label: s.position ? `${s.name} · ${s.position.name}` : s.name,
  }))
  // The current head may be outside the first page of candidates.
  if (department?.head && !headOptions.some((o) => o.value === department.head!.id)) {
    headOptions.unshift({ value: department.head.id, label: department.head.name })
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Building2}
      eyebrow={isEdit ? "Edit department" : "New department"}
      title={isEdit ? department.name : "Add a department"}
      size="sm"
      submitText={isEdit ? "Save changes" : "Add department"}
      isSubmitting={save.isPending}
      onSubmit={form.handleSubmit((values) => save.run(values))}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <TextField label="Name" name="name" control={form.control} />
        <TextField label="Code" name="code" control={form.control} required={false} />
      </div>
      <TextareaField
        label="Description"
        name="description"
        control={form.control}
        required={false}
      />
      <OptionalSelectField
        label="Part of"
        name="parent_id"
        control={form.control}
        options={departments
          .filter((d) => d.id !== department?.id)
          .map((d) => ({ value: d.id, label: d.name }))}
        noneLabel="No parent department"
      />
      <OptionalSelectField
        label="Head of department"
        name="head_staff_id"
        control={form.control}
        options={headOptions}
        noneLabel="No head"
      />
      {isEdit && (
        <SwitchField
          label="Active"
          name="is_active"
          control={form.control}
          description="Inactive departments stay on existing staff records"
        />
      )}
    </SettingsFormDialog>
  )
}
