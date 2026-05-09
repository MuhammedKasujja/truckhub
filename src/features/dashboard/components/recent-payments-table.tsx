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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { formatDate, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Payment } from "@/features/payments/types";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type PaymentTableprops = {
  payments: Payment[];
};

export function RecentPaymentsTable({ payments }: PaymentTableprops) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardAction>
          <Button type="button" variant={"secondary"} asChild>
            <Link href={"/payments"}>View<ArrowUpRight/></Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-25">Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length ? (
                payments.map((payment) => (
                  <TableRow key={`payment-${payment.id.toString()}`}>
                    <TableCell className="font-medium">
                      {payment.number}
                    </TableCell>
                    <TableCell>{payment.customer.fullname}</TableCell>
                    <TableCell>{formatPrice(payment.amount)}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{payment.payment_mode}</TableCell>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Empty className="">
                      <EmptyHeader>
                        <EmptyMedia variant="icon"></EmptyMedia>
                        <EmptyTitle>No Payments Found</EmptyTitle>
                      </EmptyHeader>
                      <EmptyContent></EmptyContent>
                    </Empty>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
