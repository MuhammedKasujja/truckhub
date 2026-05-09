import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingCustomer } from "@/features/bookings/types";
import Link from "next/link";

type BookingClientWidgetProps = {
  client: BookingCustomer;
};

export function BookingClientWidget({ client }: BookingClientWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{client.fullname}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <Button variant={"secondary"} asChild>
          <Link href={`/customers/${client.id}/view`}>{client.fullname}</Link>
        </Button> */}
        <div>{client.email}</div>
        <div>{client.phone}</div>
      </CardContent>
    </Card>
  );
}
