import { Service, ServiceGroup } from "@/features/services/types"
import { Grid3X3Icon, ListIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceTable } from "./service-table"
import { ServiceList } from "./service-list"
import React, { Activity, useMemo, useState } from "react"
import { Can } from "@/components/has-permission"
import { Link } from "@tanstack/react-router"
import { PageTitle, PageHeader, PageAction } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ActionIcon } from "@/components/icons"
import { VehicleType } from "@/features/settings/vehicle-categories/enums"

type ServiceListWrapperProps = {
  services: Service[]
}

export function ServiceListWrapper({ services }: ServiceListWrapperProps) {
  const [view, setView] = React.useState<"card" | "list">("card")
  const [search, setSearch] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>()

  const groupedServices: ServiceGroup[] = useMemo(() => {
    const grouped = Object.groupBy(
      services! ?? [],
      (service, _) => service.category
    )

    return Object.entries(grouped).map(([category, services]) => ({
      category: category,
      is_truck: services?.at(0)?.is_truck ?? false,
      services: services ?? [],
    }))
  }, [services])

  const { trucksTotal, vansTotal, carsTotal } = useMemo(() => {
    const trucksTotal = services.filter((s) => s.source === "truck").length
    const vansTotal = services.filter((s) => s.source === "van").length
    const carsTotal = services.filter((s) => s.source === "car").length
    return {
      trucksTotal,
      vansTotal,
      carsTotal,
    }
  }, [services])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.display_name
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesSource = !vehicleType || service.source === vehicleType
      return matchesSearch && matchesSource
    })
  }, [services, search, vehicleType])

  return (
    <div className="space-y-4">
      <PageHeader className="pb-0">
        <PageTitle>Services</PageTitle>
        <PageAction className="flex gap-2">
          <ButtonGroup>
            <Button
              variant={"secondary"}
              type="button"
              className={cn(
                view == "card"
                  ? "border-primary text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setView("card")}
            >
              <Grid3X3Icon />
              Card
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              className={cn(
                view == "list"
                  ? "border-primary text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setView("list")}
            >
              <ListIcon />
              List
            </Button>
          </ButtonGroup>
          <Can permission={"services:create"}>
            <Button asChild>
              <Link to={"/services/new"}>
                <ActionIcon action="create" />
                New Service
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <div className="space-y-1.5">
        <Separator />
        <div className="flex gap-4">
          <InputGroup className="max-w-60">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search services"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            ></InputGroupInput>
          </InputGroup>

          <Button variant={"outline"}>
            <Badge variant={"outline"}>{trucksTotal}</Badge> Trucks
          </Button>
          <Button variant={"outline"}>
            <Badge variant={"outline"}>{vansTotal}</Badge> Vans
          </Button>
          <Button variant={"outline"}>
            <Badge variant={"outline"}>{carsTotal}</Badge> Cars
          </Button>
          <Button variant={"outline"}>
            <Badge variant={"outline"}>{services.length}</Badge> Total
          </Button>
        </div>
        <Separator />
      </div>
      <Activity mode={view === "list" ? "visible" : "hidden"}>
        <ServiceTable services={groupedServices} />
      </Activity>
      <Activity mode={view === "card" ? "visible" : "hidden"}>
        <ServiceList services={filteredServices} />
      </Activity>
    </div>
  )
}
