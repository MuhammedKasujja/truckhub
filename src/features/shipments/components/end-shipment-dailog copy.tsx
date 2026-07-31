import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shipment } from "../types"
import { useEndShipment } from "../hooks/use-shipment-actions"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EndShipmentDialog({ shipment, onOpenChange, open }: Props) {
  const { endShipment, isPending: isSubmitting } = useEndShipment()

  function handleEndShipment() {
    if (!shipment?.id) return
    endShipment(shipment?.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>End Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">{shipment?.item.unit_price}</div>
          <DialogFooter>
            <DialogClose>
              <Button type="button" variant={"ghost"}>
                Cancle
              </Button>
            </DialogClose>
            <Button
              type={"button"}
              disabled={isSubmitting}
              onClick={handleEndShipment}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Sending...." : "Yes, End"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
