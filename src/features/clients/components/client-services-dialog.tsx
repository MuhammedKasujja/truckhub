import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ServiceForm, ServiceList } from "@/features/services/components"
import { EntityId } from "@/schemas"
import {
  useClientServiceProducts,
  useCreateClientService,
} from "../hooks/user-client-services"
import { cn } from "@/lib/utils"
import { Activity, useState } from "react"
import { Button } from "@/components/ui/button"

type ServiceSelectDialogProps = {
  clientId: EntityId
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ClientServicesDialog({
  clientId,
  open,
  onOpenChange,
}: ServiceSelectDialogProps) {
  const { data } = useClientServiceProducts(clientId)
  const { createClientService } = useCreateClientService()
  const [showEdit, setShowEdit] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-[90vh] overflow-hidden p-0 md:min-w-[90vw]">
        <div className="flex w-full flex-col">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Client Services
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Services</span>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setShowEdit((prev) => !prev)}
                >
                  New Service
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid flex-1 grid-cols-6 overflow-hidden">
            <div
              className={cn(
                "flex-1 space-y-4 overflow-y-auto p-6",
                showEdit ? "col-span-4 border-r" : "col-span-6"
              )}
            >
              <ServiceList services={data ?? []} />
            </div>
            <Activity mode={showEdit ? "visible" : "hidden"}>
              <div className="col-span-2 overflow-y-auto p-6">
                <ServiceForm
                  mode="create"
                  onSubmit={(data) => {
                    createClientService({ ...data, clientId })
                  }}
                />
              </div>
            </Activity>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
