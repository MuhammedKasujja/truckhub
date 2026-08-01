import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Shipment } from "../types"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"
import { ReceiptPoundSterlingIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { RecordShipmentDetailsDialog } from "./record-shipment-details-dialog"
import { DispatchShipmentDialog } from "./dispatch-shipment-dailog"
import { ShipmentAssignVehicleDialog } from "./shipment-assign-vehicle-dailog"
import { ShipmentAssignDriverDialog } from "./shipment-assign-driver-dailog"
import { EndShipmentDialog } from "./end-shipment-dailog copy"
import { formatDate, formatMoney, formatNumber } from "@/lib/format"
type ShipmentDialogProps = {
  shipment?: Shipment
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ShipmentDetailsDialog({
  shipment,
  open,
  onOpenChange,
}: ShipmentDialogProps) {
  const [openModal, setOpenModal] = useState<
    "dispatch" | "record" | "assign-vehicle" | "asign-driver" | "end-shipment"
  >()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] min-h-[90vh] flex-col overflow-hidden p-0 md:min-w-[90vw]">
          <div className="flex flex-col">
            <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Shipment <Badge>{shipment?.status}</Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4">
                <ButtonGroup>
                  <Button
                    variant={"outline"}
                    onClick={() => setOpenModal("dispatch")}
                  >
                    Dispatch
                  </Button>
                  {!shipment?.vehicle && (
                    <Button
                      variant={"outline"}
                      onClick={() => setOpenModal("assign-vehicle")}
                    >
                      Assign Vehicle
                    </Button>
                  )}
                  {!shipment?.driver && (
                    <Button
                      variant={"outline"}
                      onClick={() => setOpenModal("asign-driver")}
                    >
                      Assign Driver
                    </Button>
                  )}
                  <Button
                    variant={"outline"}
                    onClick={() => setOpenModal("end-shipment")}
                  >
                    Finish
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => setOpenModal("record")}
                  >
                    <ReceiptPoundSterlingIcon />
                    Record Details
                  </Button>
                </ButtonGroup>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 p-6 md:grid-flow-col md:grid-cols-6">
              <div className="md:col-span-4">
                {shipment && <ShipmentOverviewDetails shipment={shipment} />}
              </div>
              {/* <Separator/> */}
              <div className="space-y-6 md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>Number: {shipment?.vehicle?.number}</div>
                    <div>Plate No. {shipment?.vehicle?.plate_number}</div>
                    <div>
                      Consumption Rate:{" "}
                      {formatNumber(shipment?.vehicle?.fuel_consumption_rate)}{" "}
                      km/l
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Driver</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>{shipment?.driver?.number}</div>
                    <div>{shipment?.driver?.fullname}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DispatchShipmentDialog
        shipment={shipment}
        open={openModal === "dispatch"}
        onOpenChange={() => setOpenModal(undefined)}
      />
      <ShipmentAssignVehicleDialog
        shipment={shipment}
        open={openModal === "assign-vehicle"}
        onOpenChange={() => setOpenModal(undefined)}
      />
      <ShipmentAssignDriverDialog
        shipment={shipment}
        open={openModal === "asign-driver"}
        onOpenChange={() => setOpenModal(undefined)}
      />
      <RecordShipmentDetailsDialog
        shipment={shipment}
        open={openModal === "record"}
        onOpenChange={() => setOpenModal(undefined)}
      />
      <EndShipmentDialog
        shipment={shipment}
        open={openModal === "end-shipment"}
        onOpenChange={() => setOpenModal(undefined)}
      />
    </>
  )
}

type Props = {
  shipment: Shipment
}

function ShipmentOverviewDetails({ shipment }: Props) {
  return (
    <div className="space-y-4">
      <div>
        {formatDate(shipment.actual_start)} - {formatDate(shipment.actual_end)}
      </div>
      <div>
        Scheduled: {shipment.item.scheduled_start} - {shipment.item.scheduled_end}
      </div>
      <div>{shipment.item.is_round_trip && <>Round Trip</>}</div>
      <div>{shipment.item.engine_mode}</div>
      <div>{shipment.item.item_type}</div>
      <div>{formatMoney(shipment.item.unit_price)}</div>
      <div>{shipment.item.with_driver && <>Needs Driver</>}</div>
      {shipment.item.item_type === "truck" && (
        <div>{shipment.item.with_loaders && <>Needs Loaders</>}</div>
      )}
    </div>
  )
}
