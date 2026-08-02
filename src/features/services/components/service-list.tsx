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
import { ServiceGroup } from "@/features/services/types"
import { useTranslation } from "@/i18n"
import { formatMoney } from "@/lib/format"
import { Link } from "@tanstack/react-router"
import React from "react"

type ServiceListProps = {
  services: ServiceGroup[]
}

export function ServiceList({ services }: ServiceListProps) {
  const tr = useTranslation()
  const serviceList = React.useMemo(() => {
    return services.flatMap((ele) => ele.services)
  }, [services])

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {serviceList.map((service) => (
        <Card
          key={service.id}
          className="rounded-2xl shadow-sm transition hover:shadow-md"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant="default">{service.category}</Badge>
            </div>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{tr("services.seats")}</span>
              <span>{service.seats}</span>
            </div>

            <div className="flex justify-between">
              <span>{tr("services.price")}</span>
              <span>{formatMoney(service.base_fare)}</span>
            </div>

            <div className="flex justify-between">
              <span>{tr("services.last_price")}</span>
              <span>{formatMoney(service.min_fare)}</span>
            </div>

            <div className="flex justify-between">
              <span>Per Min</span>
              <span>{formatMoney(service.price_per_min)}</span>
            </div>

            <div className="flex justify-between">
              <span>Per Distance</span>
              <span>{formatMoney(service.price_per_unit_distance)}</span>
            </div>

            {/* <div className="flex justify-between">
              <span>Booking Fee</span>
              <span>{formatMoney(service.booking_fee)}</span>
            </div> */}

            {/* <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatMoney(service.tax_fee)}</span>
            </div> */}

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
  )
}
