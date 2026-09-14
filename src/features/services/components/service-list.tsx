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
import { Service } from "@/features/services/types"
import { useTranslation } from "@/i18n"
import { formatMoney } from "@/lib/format"
import { Link } from "@tanstack/react-router"

type ServiceListProps = {
  services: Service[]
}

export function ServiceList({ services }: ServiceListProps) {
  const tr = useTranslation()

  return (
    <div className="@container">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
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

          <CardContent className="space-y-2 text-sm">
            <div className="h-40 rounded-sm border bg-accent"></div>
            <div className="flex justify-between">
              <span>{tr("services.price")}</span>
              <span className="font-semibold">
                {formatMoney(service.base_fare)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>{tr("services.last_price")}</span>
              <span className="font-semibold">
                {formatMoney(service.min_fare)}
              </span>
            </div>
            {!service.is_truck && (
              <div className="flex justify-between">
                <span>{tr("services.seating_capacity")}</span>
                <span className="font-semibold">{service.seats}</span>
              </div>
            )}
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
