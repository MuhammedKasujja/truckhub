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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EndShipmentInput, endShipmentSchema } from "../schemas"
import { NumberField } from "@/components/ui/form-fields"

type Props = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EndShipmentDialog({ shipment, onOpenChange, open }: Props) {
  const { endShipment, isPending: isSubmitting } = useEndShipment()

  const form = useForm<EndShipmentInput>({
    resolver: zodResolver(endShipmentSchema),
    defaultValues: {
      unitId: shipment?.id,
    },
  })

  function handleEndShipment(data: EndShipmentInput) {
    if (!shipment?.id) return
    endShipment(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ring-4 sm:max-w-sm md:min-w-lg">
        <form
          id="end-trip-form"
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(handleEndShipment, (errors) => {
            console.log(errors)
          })}
        >
          <DialogHeader>
            <DialogTitle>End Shipment</DialogTitle>
          </DialogHeader>
          <NumberField
            label="Vehicle meter reading"
            control={form.control}
            name="endMileage"
          />
          <DialogFooter>
            <DialogClose>
              <Button type="button" variant={"ghost"}>
                Cancle
              </Button>
            </DialogClose>
            <Button
              form="end-trip-form"
              type={"submit"}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Sending...." : "Yes, End"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
