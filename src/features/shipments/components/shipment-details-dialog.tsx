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
import {
  ArrowRight,
  Fuel,
  Gauge,
  Mail,
  MapPin,
  Phone,
  PlusIcon,
  ReceiptPoundSterlingIcon,
  Truck,
  User,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { RecordShipmentDetailsDialog } from "./record-shipment-details-dialog"
import { DispatchShipmentDialog } from "./dispatch-shipment-dailog"
import { ShipmentAssignVehicleDialog } from "./shipment-assign-vehicle-dailog"
import { ShipmentAssignDriverDialog } from "./shipment-assign-driver-dailog"
import { EndShipmentDialog } from "./end-shipment-dailog copy"
import { formatDate, formatMoney, formatNumber } from "@/lib/format"
import { Empty, EmptyContent } from "@/components/ui/empty"
import { useShipmentDetails } from "../hooks/use-shipment-details"
import { cn } from "@/lib/utils"
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
  const {} = useShipmentDetails(shipment?.id)
  const trip = shipment

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] min-h-[90vh] flex-col overflow-hidden p-0 md:min-w-[90vw]">
          <div className="flex flex-col">
            <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Shipment<span className="mx-1 text-muted-foreground">•</span>
                {shipment?.number} <Badge>{shipment?.status}</Badge>
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
                    <CardTitle className="text-primary">Vehicle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shipment?.vehicle ? (
                      <div>
                        <PanelField
                          icon={MapPin}
                          label="Plate"
                          value={shipment.vehicle.plate_number}
                        />
                        <PanelField
                          icon={Truck}
                          label="Vehicle No."
                          value={shipment.vehicle.number}
                        />
                        <PanelField
                          icon={Gauge}
                          label="Model Year"
                          value={shipment.vehicle.vehicle_year}
                        />
                        <PanelField
                          icon={Fuel}
                          label="Rated Consumption"
                          value={`${shipment.vehicle.fuel_consumption_rate} L / 100km`}
                        />
                      </div>
                    ) : (
                      <Empty className="border border-dashed">
                        <EmptyContent>
                          <Button
                            variant={"outline"}
                            size={"icon-sm"}
                            onClick={() => setOpenModal("assign-vehicle")}
                          >
                            <PlusIcon />
                          </Button>
                        </EmptyContent>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">Driver</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shipment?.driver ? (
                      <div>
                        <PanelField
                          icon={User}
                          label="Name"
                          value={shipment.driver.fullname}
                        />
                        <PanelField
                          icon={Phone}
                          label="Phone"
                          value={shipment.driver.phone}
                        />
                        <PanelField
                          icon={Mail}
                          label="Email"
                          value={shipment.driver.email}
                        />
                        <PanelField
                          icon={Truck}
                          label="Driver No."
                          value={shipment.driver.number}
                        />
                      </div>
                    ) : (
                      <Empty className="border border-dashed">
                        <EmptyContent>
                          <Button
                            variant={"outline"}
                            size={"icon-sm"}
                            onClick={() => setOpenModal("asign-driver")}
                          >
                            <PlusIcon />
                          </Button>
                        </EmptyContent>
                      </Empty>
                    )}
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
  const trip = shipment
  const distance = trip?.consumption?.distance_km
  const rate = parseFloat(trip?.vehicle?.fuel_consumption_rate ?? "")
  const litersUsed = (((distance ?? 0) / 100) * rate).toFixed(1)
  return (
    <div className="space-y-4">
      {/* Route */}
      <Card className="bg-background/30">
        <CardContent className="pt-4">
          <SectionLabel>Route</SectionLabel>
          {trip?.item.locations.map((r, i) => (
            <RouteRow key={i} origin={r.origin} destination={r.destination} />
          ))}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              trip.item.is_round_trip ? "Round trip" : "One-way",
              `${trip.item.item_type} item`,
              `${trip.item.engine_mode} hire`,
              `Scheduled ${trip.item.scheduled_start} – ${trip.item.scheduled_end}`,
            ].map((t) => (
              <span
                key={t}
                className="rounded-sm bg-accent px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase"
              >
                {t}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Odometer & consumption */}
      {trip.consumption && (
        <Card className="bg-background/15">
          <CardContent className="pt-4">
            <SectionLabel>Odometer &amp; Consumption</SectionLabel>
            <div
              className="mb-5 flex items-center justify-center gap-5 rounded-md p-5"
              // style={{ background: PANEL_ALT, border: `1px solid ${LINE}` }}
            >
              <div className="text-center">
                <div className="rounded border bg-background/60 px-4 py-2 font-mono text-xl font-semibold text-primary">
                  {trip?.consumption?.start_mileage.toLocaleString()}
                </div>
                <p className="mt-2 text-[10px] tracking-widest uppercase">
                  Start (km)
                </p>
              </div>
              <ArrowRight className="h-5 w-5" />
              <div className="text-center">
                <div className="rounded border bg-background/60 px-4 py-2 font-mono text-xl font-semibold text-primary">
                  {trip?.consumption?.end_mileage?.toLocaleString()}
                </div>
                <p className="mt-2 text-[10px] tracking-widest uppercase">
                  End (km)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatBox label="Distance" value={`${distance} km`} />
              <StatBox
                label="Fuel Rate"
                value={`${formatMoney(trip?.consumption?.fuel_rate)} / L`}
              />
              <StatBox
                label="Est. Fuel Used"
                value={`${litersUsed} L`}
                note={`${distance}km × ${rate}L/100km`}
              />
            </div>
          </CardContent>
        </Card>
      )}
      {/* <Card style={{ background: PANEL, border: `1px solid ${LINE}` }}> */}
      <Card className="bg-background/15">
        <CardContent className="pt-4">
          <SectionLabel>Billing</SectionLabel>
          <BillLine
            label="Unit price"
            value={formatMoney(shipment.item.unit_price)}
          />
          <BillLine
            label="Discount"
            value={formatMoney(shipment.item.discount)}
          />
          <BillLine label="Item type" value={shipment.item.item_type} />
          <Separator className="my-1" />
          <div className="pt-3">
            <BillLine
              label="Total due"
              value={formatMoney(
                shipment.item.unit_price - shipment.item.discount
              )}
              total
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BillLine({ label, value, total }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5",
        total ? "border-b-0" : "border-b"
      )}
    >
      <span
        className={cn(
          "text-muted-foreground",
          total ? "text-sm font-bold tracking-wide" : "text-sm"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-mono",
          total ? "text-lg font-semibold text-primary" : "text-sm"
        )}
        // style={{ color: total ? AMBER : TEXT }}
      >
        {value}
      </span>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p
      className="mb-4 text-[11px] font-medium tracking-widest uppercase"
      // style={{ color: TEXT_FAINT }}
    >
      {children}
    </p>
  )
}

function StatBox({ label, value, note }) {
  return (
    <div
      className="rounded-md bg-muted px-4 py-3"
      // style={{ background: PANEL_ALT, border: `1px solid ${LINE}` }}
    >
      <p className="mb-1.5 text-[10px] tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-mono text-base">{value}</p>
      {note && <p className="mt-1 text-[10px] text-muted-foreground">{note}</p>}
    </div>
  )
}

function RouteRow({ origin, destination }) {
  return (
    <div className="flex items-center gap-4 border-t py-3">
      <div
        className="w-24 flex-shrink-0 text-sm font-bold tracking-wide"
        // style={{ color: TEXT }}
      >
        {origin.toUpperCase()}
      </div>
      <div
        className="relative h-px flex-1"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, 0 8px, transparent 8px 16px)`,
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 7,
            height: 7,
            top: "50%",
            left: "94%",
            transform: "translate(-50%,-50%)",
            // background: AMBER,
            // boxShadow: `0 0 0 3px ${AMBER}2e`,
          }}
        />
      </div>
      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
      <div className="text-sm font-bold tracking-wide text-primary">
        {destination.toUpperCase()}
      </div>
    </div>
  )
}

function PanelField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
      <div>
        <p className="mb-0.5 text-[10px] tracking-widest text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-mono text-sm">{value}</p>
      </div>
    </div>
  )
}
