import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookingServiceItem } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { Status } from "@/components/ui/status";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";

type BookingServiceListProps = {
  services: BookingServiceItem[];
};

export function BookingServiceList({ services }: BookingServiceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardAction>
          <Status>{services.length}</Status>
        </CardAction>
      </CardHeader>
      <CardContent>
        {/* <ServiceTable services={services} /> */}
        <ServiceList services={services} />
      </CardContent>
    </Card>
  );
}

function ServiceTable({ services }: BookingServiceListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-25">Service</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.service_id}>
              <TableCell className="font-medium">
                {service.service_name}
              </TableCell>
              <TableCell>{formatPrice(service.cost_per_item)}</TableCell>
              <TableCell>{service.total_items}</TableCell>
              <TableCell>
                {formatPrice(service.cost_per_item * service.total_items)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {formatPrice(
                services.reduce(
                  (prev, service) =>
                    service.cost_per_item * service.total_items + prev,
                  0,
                ) ?? 0,
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

function ServiceList({ services }: BookingServiceListProps) {
  return (
    <div className="grid gap-4">
      {services.map((service, index) => (
        <Item key={`${service.service_id}*${index}`} variant={"outline"}>
          <ItemContent>
            <ItemTitle>{service.service_name}</ItemTitle>
            <ItemDescription>
              {formatPrice(service.cost_per_item * service.total_items)}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              {service.total_items}
            </Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  );
}
