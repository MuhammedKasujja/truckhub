import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Status } from "@/components/ui/status"
import { LiveRideMap } from "@/features/ride-requests/components"
import { useActiveShipments } from "@/features/shipments/hooks/use-shipments"
import { shipmentsActiveQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { Shipment } from "@/features/shipments/types"
import { IconFilter2 } from "@tabler/icons-react"
import { createFileRoute } from "@tanstack/react-router"
import { cn } from "cn"
import {
  RefreshCcwIcon,
  RouteIcon,
  SearchIcon,
  TimerIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

const activeShipmentStatuses = [
  "dispatched",
  "in_progress",
  "delayed",
  "completed",
  "idel",
] as const

type ActiveShipmentStatus = (typeof activeShipmentStatuses)[number]

export const Route = createFileRoute("/_admin/live-map/")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.prefetchQuery(shipmentsActiveQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()
  const { shipments, refetch } = useActiveShipments(search)
  const [selectedShipment, setSelectedShipment] = useState<Shipment>()
  const [status, setStatus] = useState<ActiveShipmentStatus>()

  useEffect(() => {
    setSelectedShipment(shipments?.at(0))
  }, [shipments])

  return (
    <div className="space-y-6">
      <PageHeader className="pb-0">
        <PageTitle>Live Map</PageTitle>
        <PageAction>
          <Button variant={"ghost"} onClick={() => refetch()}>
            <RefreshCcwIcon /> Refresh
          </Button>
        </PageAction>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="space-y-2">
              <div className="text-sm font-normal">Active Trips</div>
              <div className="text-3xl font-bold">{shipments?.length ?? 0}</div>
            </CardTitle>
            <CardDescription className="text-xs">
              Across all orders
            </CardDescription>
            <CardAction className="rounded-xl bg-info/10 p-2 text-info">
              <TruckIcon />
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="space-y-2">
              <div className="text-sm font-normal">On Route</div>
              <div className="text-3xl font-bold">
                {shipments?.filter(
                  (s) => s.status == "dispatched" || s.status == "in_progress"
                ).length ?? 0}
              </div>
            </CardTitle>
            <CardDescription className="text-xs">
              On route to next stop
            </CardDescription>
            <CardAction className="rounded-xl bg-success/10 p-2 text-success">
              <RouteIcon />
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="space-y-2">
              <div className="text-sm font-normal">Delayed</div>
              <div className="text-3xl font-bold">
                {shipments?.filter((s) => s.status == "delayed").length ?? 0}
              </div>
            </CardTitle>
            <CardDescription className="text-xs">
              Require attention
            </CardDescription>
            <CardAction className="rounded-xl bg-warning/10 p-2 text-warning">
              <TimerIcon />
            </CardAction>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardContent className="grid gap-5 md:grid-cols-5">
          <div className="text-lg font-semibold">
            {selectedShipment?.number}
          </div>
          <div className="flex items-center gap-1.5">
            <UserIcon className="size-4 text-muted-foreground" />
            <span className="font-semibold">
              {selectedShipment?.driver?.fullname}
            </span>
          </div>
          <div className="">
            <Status>{selectedShipment?.status}</Status>
          </div>
          <div className=""></div>
          <div className=""></div>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="h-[80vh] rounded-xl md:col-span-2">
          <CardHeader>
            <CardTitle className="py-2">Active fleet</CardTitle>
            <CardDescription className="space-y-2">
              <div className="flex items-center gap-2">
                <InputGroup>
                  <InputGroupInput placeholder="Search fleet..." />
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                </InputGroup>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full p-1"
                      asChild
                    >
                      <IconFilter2 />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32" align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuRadioGroup
                        value={status}
                        onValueChange={setStatus}
                      >
                        {activeShipmentStatuses.map((sta) => (
                          <DropdownMenuRadioItem key={sta} value={sta}>
                            {sta}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>{shipments?.length ?? 0} Trips</div>
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto px-0">
            {shipments?.map((shp) => (
              <div
                key={shp.id}
                className={cn(
                  "cursor-pointer space-y-2 border-y border-l-6 border-l-transparent px-2.5 py-4",
                  selectedShipment?.id === shp.id &&
                    "border-y-0 border-primary bg-background"
                )}
                onClick={() => setSelectedShipment(shp)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{shp.number}</div>
                  <Status>{shp.status}</Status>
                </div>
                <div>{shp.driver?.fullname}</div>
                <div className="text-muted-foreground">
                  {shp.item.locations.map((loc) => (
                    <div>
                      {loc?.origin} - {loc.destination}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="md:col-span-5">
          <LiveRideMap />
        </div>
      </div>
    </div>
  )
}
