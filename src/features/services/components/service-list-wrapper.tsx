import { ServiceGroup } from "@/features/services/types"
import { Grid3X3Icon, ListIcon, PlusIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceTable } from "./service-table"
import { ServiceList } from "./service-list"
import React, { Activity } from "react"
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

type ServiceListWrapperProps = {
  services: ServiceGroup[]
}

export function ServiceListWrapper({ services }: ServiceListWrapperProps) {
  const [view, setView] = React.useState<"table" | "list">("list")
  const serviceList = React.useMemo(() => {
    return services.flatMap((ele) => ele.services)
  }, [services])
  
  const totalNormalServices = React.useMemo(() => {
    return serviceList.filter((s)=>!s.is_truck)
  }, [serviceList])
  
  const totalTrucksServices = React.useMemo(() => {
    return serviceList.filter((s)=>s.is_truck)
  }, [serviceList])

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
                view == "list"
                  ? "border-primary text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setView("list")}
            >
              <ListIcon />
              List
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              className={cn(
                view == "table"
                  ? "border-primary text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setView("table")}
            >
              <Grid3X3Icon />
              Card
            </Button>
          </ButtonGroup>
          <Can permission={"services:create"}>
            <Button asChild>
              <Link to={"/services/new"}>
                <PlusIcon />
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
            <InputGroupInput placeholder="Search services"></InputGroupInput>
          </InputGroup>
          <Button>
            <Badge variant={"outline"}>{serviceList.length}</Badge> Total
          </Button>
          <Button>
            <Badge variant={"outline"}>{totalNormalServices.length}</Badge> Cars
          </Button>
          <Button>
            <Badge variant={"outline"}>{totalTrucksServices.length}</Badge> Trucks
          </Button>
        </div>
        <Separator />
      </div>
      <Activity mode={view === "table" ? "visible" : "hidden"}>
        <ServiceTable services={services} />
      </Activity>
      <Activity mode={view === "list" ? "visible" : "hidden"}>
        <ServiceList services={services} />
      </Activity>
    </div>
  )
}
