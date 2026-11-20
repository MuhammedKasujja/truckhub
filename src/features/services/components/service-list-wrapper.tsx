import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowDownUp,
  Layers,
  Plus,
  SearchIcon,
  SearchXIcon,
  XIcon,
} from "lucide-react"
import { ServiceList } from "./service-list"
import { vehicleTypeMeta } from "./service-card"
import type { Service } from "@/features/services/types"
import type { VehicleType } from "@/features/settings/vehicle-config/vehicle-categories/enums"
import { vehicleTypesList } from "@/features/settings/vehicle-config/vehicle-categories/enums"
import { Button } from "@/components/ui/button"
import { Can } from "@/components/has-permission"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPlural } from "@/lib/format"
import { cn } from "@/lib/utils"

const sortOptions = {
  name: { label: "Name", compare: (a: Service, b: Service) => a.display_name.localeCompare(b.display_name) },
  price_asc: {
    label: "Price: low to high",
    compare: (a: Service, b: Service) => Number(a.base_fare) - Number(b.base_fare),
  },
  price_desc: {
    label: "Price: high to low",
    compare: (a: Service, b: Service) => Number(b.base_fare) - Number(a.base_fare),
  },
  newest: {
    label: "Newest first",
    compare: (a: Service, b: Service) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  },
} as const

type SortKey = keyof typeof sortOptions

type ServiceListWrapperProps = {
  services: Service[]
}

export function ServiceListWrapper({ services }: ServiceListWrapperProps) {
  const [search, setSearch] = useState("")
  const [vehicleType, setVehicleType] = useState<VehicleType>()
  const [sort, setSort] = useState<SortKey>("name")

  const totalsByType = useMemo(() => {
    const totals: Record<VehicleType, number> = { truck: 0, van: 0, car: 0 }
    for (const service of services) {
      if (service.source in totals) totals[service.source]++
    }
    return totals
  }, [services])

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return services
      .filter((service) => {
        const matchesSearch =
          !query ||
          [
            service.display_name,
            service.name,
            service.category,
            service.description,
            service.vehicle_category?.name,
            service.car_model?.name,
            service.car_model?.car_brand.name,
          ].some((value) => value?.toLowerCase().includes(query))

        const matchesType = !vehicleType || service.source === vehicleType
        return matchesSearch && matchesType
      })
      .sort(sortOptions[sort].compare)
  }, [services, search, vehicleType, sort])

  const hasActiveFilters = search.trim() !== "" || !!vehicleType

  function clearFilters() {
    setSearch("")
    setVehicleType(undefined)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Layers className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">Services</h1>
            <p className="text-sm text-muted-foreground">
              The vehicles you hire out and what they cost, used when you
              build quotations.
            </p>
          </div>
        </div>
        <Can permission="services:create">
          <Button asChild>
            <Link to="/services/new">
              <Plus />
              New service
            </Link>
          </Button>
        </Can>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs lg:flex-row lg:items-center">
        <InputGroup className="lg:max-w-72">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by name, brand or model"
            aria-label="Search services"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <InputGroupAddon align="inline-end">
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div
          role="radiogroup"
          aria-label="Vehicle type"
          className="flex flex-wrap gap-1.5"
        >
          <FilterChip
            label="All"
            count={services.length}
            active={!vehicleType}
            onClick={() => setVehicleType(undefined)}
          />
          {vehicleTypesList.map((value) => {
            const meta = vehicleTypeMeta[value]
            return (
              <FilterChip
                key={value}
                label={`${meta.label}s`}
                icon={meta.icon}
                count={totalsByType[value]}
                active={vehicleType === value}
                onClick={() =>
                  setVehicleType(vehicleType === value ? undefined : value)
                }
              />
            )
          })}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full lg:w-48" aria-label="Sort services">
              <ArrowDownUp className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(sortOptions).map(([key, option]) => (
                <SelectItem key={key} value={key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {services.length > 0 && (
        <div className="-mt-1 flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? `${filteredServices.length} of ${formatPlural(services.length, { singular: "service", plural: "services" })}`
              : formatPlural(services.length, { singular: "service", plural: "services" })}
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XIcon />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {filteredServices.length > 0 ? (
        <ServiceList services={filteredServices} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {hasActiveFilters ? (
              <SearchXIcon className="size-5" />
            ) : (
              <Layers className="size-5" />
            )}
          </span>
          <p className="text-sm font-medium">
            {hasActiveFilters ? "No services match" : "No services yet"}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {hasActiveFilters
              ? "Try a different search or vehicle type."
              : "Add the vehicles you hire out with their base and minimum fares."}
          </p>
          <div className="mt-2">
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Can permission="services:create">
                <Button size="sm" asChild>
                  <Link to="/services/new">
                    <Plus />
                    Add the first service
                  </Link>
                </Button>
              </Can>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  label,
  icon: Icon,
  count,
  active,
  onClick,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active &&
          "border-primary bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary"
      )}
    >
      {Icon && <Icon className="size-4" />}
      {label}
      <span
        className={cn(
          "rounded-md bg-muted px-1.5 text-xs tabular-nums text-muted-foreground",
          active && "bg-primary/15 text-primary"
        )}
      >
        {count}
      </span>
    </button>
  )
}
