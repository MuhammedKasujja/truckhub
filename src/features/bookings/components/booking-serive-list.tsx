import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/format";
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
import { LineItemResponse } from "@/features/quotations/schemas";

type BookingServiceListProps = {
  lineItems: LineItemResponse[];
};

export function BookingServiceList({ lineItems }: BookingServiceListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
        <CardAction>
          <Status>{lineItems.length}</Status>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ServiceList lineItems={lineItems} />
      </CardContent>
    </Card>
  );
}

function ServiceTable({ lineItems }: BookingServiceListProps) {
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
          {lineItems.map((lineItem) => (
            <TableRow key={lineItem.unit_price}>
              <TableCell className="font-medium">
                {lineItem.unit_price}
              </TableCell>
              <TableCell>{formatMoney(lineItem.cost_per_item)}</TableCell>
              <TableCell>{lineItem.total_items}</TableCell>
              <TableCell>
                {formatMoney(lineItem.cost_per_item * lineItem.total_items)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {formatMoney(
                lineItems.reduce(
                  (prev, lineItem) =>
                    lineItem.cost_per_item * lineItem.total_items + prev,
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

function ServiceList({ lineItems }: BookingServiceListProps) {
  return (
    <div className="grid gap-4">
      {lineItems.map((lineItem, index) => (
        <Item key={`${lineItem.service_id}*${index}`} variant={"outline"}>
          <ItemContent>
            <ItemTitle>{formatMoney(lineItem.line_total)} {lineItem.item_type}</ItemTitle>
            <ItemDescription>
              Qty {lineItem.quantity} - Price {formatMoney(lineItem.unit_price)}, {lineItem.estimated_consumption_rate_km}km/l
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="outline" size="sm">
              {lineItem.total_items}
            </Button>
          </ItemActions>
        </Item>
      ))}
    </div>
  );
}
