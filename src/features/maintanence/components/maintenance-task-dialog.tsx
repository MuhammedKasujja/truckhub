import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MaintenanceTaskEditForm,
  MaintenanceTaskForm,
} from "./maintenance-task-form"
import {
  useCreateMaintenanceRecord,
  useUpdateMaintenanceRecord,
} from "../hooks/use-maintenance"
import { MaintenanceRecord } from "../types"
import { SubmitButton } from "@/components/ui/submit-button"

type MaintenanceTaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record?: MaintenanceRecord
}

export function MaintenanceTaskDialog({
  open,
  onOpenChange,
  record,
}: MaintenanceTaskDialogProps) {
  const createMutation = useCreateMaintenanceRecord()
  const updateMutation = useUpdateMaintenanceRecord()

  function handleCreate(
    data: Parameters<typeof createMutation.mutate>[0]["data"]
  ) {
    createMutation.mutate({ data }, { onSuccess: () => onOpenChange(false) })
  }

  function handleUpdate(
    data: Parameters<typeof updateMutation.mutate>[0]["data"]
  ) {
    updateMutation.mutate({ data }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {record ? "Edit maintenance task" : "Create maintenance task"}
          </DialogTitle>
          <DialogDescription>
            {record
              ? "Update the maintenance task details."
              : "Schedule maintenance for a vehicle."}
          </DialogDescription>
        </DialogHeader>
        {record ? (
          <>
            <MaintenanceTaskEditForm
              key={record.id}
              defaultValues={{
                maintanence_id: record.id,
                type: record.type,
                reason: record.reason,
                expected_end: record.expected_end,
              }}
              onSubmit={handleUpdate}
            />
            <DialogFooter>
              <SubmitButton
                form="task-update"
                text="Save changes"
                isSubmitting={updateMutation.isPending}
              />
            </DialogFooter>
          </>
        ) : (
          <MaintenanceTaskForm
            isPending={createMutation.isPending}
            onSubmit={handleCreate}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
