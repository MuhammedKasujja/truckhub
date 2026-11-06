import { Service } from "@/features/services/types"
import { SearchIcon, SearchXIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceList } from "./service-list"
import { useMemo, useState } from "react"
import { Can } from "@/components/has-permission"
import { Link } from "@tanstack/react-router"
import { PageTitle, PageHeader, PageAction } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ActionIcon } from "@/components/icons"
import { VehicleType } from "@/features/settings/vehicle-config/vehicle-categories/enums"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const vehicleTypeFilters: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Cars" },
  { value: "van", label: "Vans" },
  { value: "truck", label: "Trucks" },
]

type ServiceListWrapperProps = {
  services: Service[]
}

export function ServiceListWrapper({ services }: ServiceListWrapperProps) {
  const [search, setSearch] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>()

  const totalsByType = useMemo(() => {
    const totals: Record<VehicleType, number> = { truck: 0, van: 0, car: 0 }
    for (const service of services) {
      if (service.source in totals) totals[service.source]++
    }
    return totals
  }, [services])

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return services.filter((service) => {
      const matchesSearch =
        !query ||
        [
          service.display_name,
          service.name,
          service.category,
          service.vehicle_category?.name,
          service.car_model?.name,
          service.car_model?.car_brand.name,
        ].some((value) => value?.toLowerCase().includes(query))

      const matchesSource = !vehicleType || service.source === vehicleType
      return matchesSearch && matchesSource
    })
  }, [services, search, vehicleType])

  const hasActiveFilters = search.trim() !== "" || !!vehicleType

  function clearFilters() {
    setSearch("")
    setVehicleType(undefined)
  }

  return (
    <div className="space-y-4">
      <PageHeader className="pb-0">
        <PageTitle>Services</PageTitle>
        <PageAction className="flex gap-2">
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
          <Button
            className="h-8"
            variant={!vehicleType ? "default" : "outline"}
            aria-pressed={!vehicleType}
            onClick={() => setVehicleType(undefined)}
          >
            <Badge variant={!vehicleType ? "secondary" : "outline"}>
              {services.length}
            </Badge>
            All
          </Button>
          {vehicleTypeFilters.map(({ value, label }) => {
            const active = vehicleType === value
            return (
              <Button
                key={value}
                className="h-8"
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => setVehicleType(active ? undefined : value)}
              >
                <Badge variant={active ? "secondary" : "outline"}>
                  {totalsByType[value]}
                </Badge>
                {label}
              </Button>
            )
          })}

          {hasActiveFilters && (
            <Button variant={"ghost"} onClick={clearFilters} className="h-8">
              <XIcon />
              Clear filters
            </Button>
          )}
        </div>
        <Separator />
      </div>
      {filteredServices.length > 0 ? (
        <ServiceList services={filteredServices} />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No services found</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "No services match the current filters."
                : "No services have been created yet."}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters && (
            <EmptyContent>
              <Button variant={"outline"} onClick={clearFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </div>
  )
}
