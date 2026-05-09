"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { CreditCard, Edit2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getBookingDetailsById } from "@/features/bookings/services";
import { formatDate, formatPrice } from "@/lib/format";
import { Status } from "@/components/ui/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditPaymentModal } from "@/features/payments/components/edit-payment-modal";
import { Can } from "@/components/has-permission";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { BookingClientWidget } from "./booking-client";
import { BookingServiceList } from "./booking-serive-list";

type BookingDetailsWrapperProps = {
  promises: Promise<[Awaited<ReturnType<typeof getBookingDetailsById>>]>;
};

export function BookingDetailsWrapper({
  promises,
}: BookingDetailsWrapperProps) {
  const [{ data: booking, error }] = React.use(promises);

  useFetchEror(error);

  return (
    <div className="grid gap-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{booking?.number}</CardTitle>
            <CardAction className="flex gap-4">
              {!booking?.is_paid && (
                <Can permission={"payments:create"}>
                  <EditPaymentModal
                    initialData={{
                      entity_id: booking?.id,
                      amount: booking?.balance,
                      type: "booking",
                    }}
                  />
                </Can>
              )}
              <Status>{booking?.status}</Status>
              <Can permission={"bookings:edit"}>
                <Button asChild>
                  <Link href={`/bookings/${booking?.id}/edit`}>
                    <Edit2Icon />
                  </Link>
                </Button>
              </Can>
            </CardAction>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xl font-semibold">
              {formatPrice(booking?.amount)}
            </div>
            <div>{formatPrice(booking?.balance)}</div>
            <div>{formatDate(booking?.created_at)}</div>
          </CardContent>
          <CardFooter className="space-y-4 flex items-center gap-2">
            <Button variant={"outline"}>
              Partial: {formatPrice(booking?.partial)}
            </Button>
            {formatDate(booking?.pickup_time)} -{" "}
            {formatDate(booking?.return_time)}
          </CardFooter>
        </Card>
        <BookingClientWidget client={booking!.customer} />
      </div>
      <div className="grid  md:grid-flow-col gap-4">
        <BookingServiceList services={booking?.services ?? []} />
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border bg-background">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-25">Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booking?.payments.length ? (
                    booking?.payments.map((payment) => (
                      <TableRow key={payment.id.toString()}>
                        <TableCell className="font-medium">
                          {payment.number}
                        </TableCell>
                        <TableCell>{formatPrice(payment.amount)}</TableCell>
                        <TableCell>{payment.status}</TableCell>
                        <TableCell>{payment.payment_mode}</TableCell>
                        <TableCell>{formatDate(payment.date)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <Empty className="">
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <CreditCard />
                            </EmptyMedia>
                            <EmptyTitle>No Payments Found</EmptyTitle>
                          </EmptyHeader>
                          <EmptyContent>
                            {!booking?.is_paid && (
                              <Can permission={"payments:create"}>
                                <EditPaymentModal
                                  initialData={{
                                    entity_id: booking?.id,
                                    amount: booking?.balance,
                                    type: "booking",
                                  }}
                                  trigger={
                                    <Button variant={"outline"}>
                                      Make Payment
                                    </Button>
                                  }
                                />
                              </Can>
                            )}
                          </EmptyContent>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
