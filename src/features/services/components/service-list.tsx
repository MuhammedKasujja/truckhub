import { HasPermission } from "@/components/has-permission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceGroup } from "@/features/services/types";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import React from "react";

type ServiceListProps = {
  services: ServiceGroup[];
};

export function ServiceList({ services }: ServiceListProps) {
  const serviceList = React.useMemo(() => {
    return services.flatMap((ele) => ele.services);
  }, [services]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {serviceList.map((service) => (
        <Card key={service.id} className="rounded-2xl shadow-sm hover:shadow-md transition">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <Badge variant="default">{service.category}</Badge>
            </div>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Seats</span>
              <span>{service.seats}</span>
            </div>

            <div className="flex justify-between">
              <span>Base Fare</span>
              <span>{formatPrice(service.base_fare)}</span>
            </div>

            <div className="flex justify-between">
              <span>Min Fare</span>
              <span>{formatPrice(service.min_fare)}</span>
            </div>

            <div className="flex justify-between">
              <span>Per Min</span>
              <span>{formatPrice(service.price_per_min)}</span>
            </div>

            <div className="flex justify-between">
              <span>Per Distance</span>
              <span>{formatPrice(service.price_per_unit_distance)}</span>
            </div>

            <div className="flex justify-between">
              <span>Booking Fee</span>
              <span>{formatPrice(service.booking_fee)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatPrice(service.tax_fee)}</span>
            </div>

            <div className="pt-2 border-t flex justify-between text-xs text-muted-foreground">
              <span>{service.is_truck ? "Truck" : "Car"}</span>
              <HasPermission permission={"services:edit"}>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/services/${service.id}/edit`}>Edit</Link>
                </Button>
              </HasPermission>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
