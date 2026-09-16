import { Can } from "@/components/has-permission"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DataList,
  DataListItem,
  DataListItemLabel,
  DataListItemValue,
} from "@/components/ui/data-list"
import { Service } from "@/features/services/types"
import { useTranslation } from "@/i18n"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

type ServiceListProps = {
  services: Service[]
  selectable?: boolean
  onSelected?: (services: Service[]) => void
}

export function ServiceList({
  services,
  selectable = false,
}: ServiceListProps) {
  const tr = useTranslation()
  const [selectedItems, setSelected] = useState<Service[]>([])

  function handleSelected(service: Service) {
    setSelected((prev) => {
      const find = prev.find((s) => s.id === service.id)
      if (find) {
        return prev.filter((s) => s.id !== service.id)
      }
      return [...prev, service]
    })
  }

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={cn(
              "rounded-2xl shadow-sm transition hover:shadow-md",
              selectedItems.find((s) => s.id === service.id) &&
                "ring-2 ring-primary"
            )}
            onClick={selectable ? () => handleSelected(service) : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant="default">{service.category}</Badge>
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
              <div className="h-40 rounded-sm border bg-accent"></div>
              <DataList>
                <DataListItem className="flex w-full justify-between">
                  <DataListItemLabel>{tr("services.price")}</DataListItemLabel>
                  <DataListItemValue className="text-end font-semibold">
                    {formatMoney(service.base_fare)}
                  </DataListItemValue>
                </DataListItem>
                <DataListItem className="flex w-full justify-between py-0">
                  <DataListItemLabel>
                    {tr("services.last_price")}
                  </DataListItemLabel>
                  <DataListItemValue className="text-end font-semibold">
                    {formatMoney(service.min_fare)}
                  </DataListItemValue>
                </DataListItem>
                {!service.is_truck && (
                  <DataListItem className="flex w-full justify-between">
                    <DataListItemLabel>
                      {tr("services.seating_capacity")}
                    </DataListItemLabel>
                    <DataListItemValue className="text-end font-semibold">
                      {service.seats}
                    </DataListItemValue>
                  </DataListItem>
                )}
              </DataList>
              <div className="flex justify-between border-t pt-2 text-xs text-muted-foreground">
                <span>{service.is_truck ? "Truck" : "Car"}</span>
                <Can permission={"services:edit"}>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to={`/services/$serviceId/edit`}
                      params={{ serviceId: service.id }}
                    >
                      Edit
                    </Link>
                  </Button>
                </Can>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
