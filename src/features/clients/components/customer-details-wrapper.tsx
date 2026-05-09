"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { CreditCard, Edit2Icon, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  getCustomerDetailsById,
  getCustomerPayments,
  getCustomerBookings,
  getCustomerRides,
} from "@/features/clients/service";
import { formatDate, formatPrice } from "@/lib/format";
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
import { HasPermission } from "@/components/has-permission";
import { EditPaymentModal } from "@/features/payments/components/edit-payment-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { logger } from "@/lib/logger";
import { EntityId } from "@/types";

type CustomerDetailsWrapperProps = {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getCustomerDetailsById>>,
      Awaited<ReturnType<typeof getCustomerPayments>>,
      Awaited<ReturnType<typeof getCustomerBookings>>,
      Awaited<ReturnType<typeof getCustomerRides>>,
    ]
  >;
  customerId: EntityId
};

export function CustomerDetailsWrapper({
  promises,
  customerId,
}: CustomerDetailsWrapperProps) {
  const [
    { data: customer, error },
    { data: payments },
    { data: bookings },
    { data: rides },
  ] = React.use(promises);

  useFetchEror(error);

  const { data } = useSuspenseQuery({
    queryKey: ["client-details", customerId],
    queryFn: () => getCustomerDetailsById(customerId),
  });
  logger.error(`Client data fetched ->> ${data.data?.fullname}`);

  const latestBooking = bookings?.find((ele) => ele.amount);
  const latestPayment = payments?.find((ele) => ele.date);
  const latestRide = rides?.find((ele) => ele.created_at);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{customer?.fullname}</CardTitle>
          <CardAction className="flex gap-4">
            <HasPermission permission={"payments:create"}>
              <EditPaymentModal
                initialData={{
                  type: "booking",
                }}
              />
            </HasPermission>
            <Button asChild size={"icon"}>
              <Link href={`/customers/${customer?.id}/edit`}>
                <Edit2Icon />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>{customer?.email}</div>
          <div>{customer?.phone}</div>
          <div>Balance: {formatPrice(customer?.balance)}</div>
          <div>Paid to Date: {formatPrice(customer?.paid_to_date)}</div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Latest Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {payments && latestPayment ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(latestPayment.date)}
                </div>
                <div className="text-lg font-semibold">
                  {formatPrice(latestPayment.amount)}
                </div>
                <div className="text-sm">{latestPayment.status}</div>
                <div className="text-sm text-muted-foreground">
                  {latestPayment.number}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No payments found for this customer.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Booking</CardTitle>
          </CardHeader>
          <CardContent>
            {latestBooking ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(latestBooking.pickup_time)}
                </div>
                <div className="text-lg font-semibold">
                  {latestBooking.number}
                </div>
                <div className="text-sm">{latestBooking.status}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(latestBooking.amount)}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/bookings/${latestBooking.id}/view`}>
                    View booking
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No bookings found for this customer.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Ride</CardTitle>
          </CardHeader>
          <CardContent>
            {latestRide ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(latestRide.request_start_time)}
                </div>
                <div className="text-lg font-semibold">{latestRide.number}</div>
                <div className="text-sm">{latestRide.status}</div>
                <div className="text-sm text-muted-foreground">
                  {latestRide.origin} → {latestRide.destination}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/rides/${latestRide.id}/view`}>View ride</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No rides found for this customer.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="rides">Rides</TabsTrigger>
            </TabsList>

            <TabsContent value="payments">
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
                    {payments?.length ? (
                      payments.map((payment) => (
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
                          <Empty>
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <CreditCard />
                              </EmptyMedia>
                              <EmptyTitle>No Payments Found</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                              <HasPermission permission={"payments:create"}>
                                <EditPaymentModal
                                  initialData={{
                                    type: "booking",
                                  }}
                                  trigger={
                                    <Button variant="outline">
                                      Make Payment
                                    </Button>
                                  }
                                />
                              </HasPermission>
                            </EmptyContent>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <div className="overflow-hidden rounded-lg border bg-background">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-25">Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.length ? (
                      bookings.map((booking) => (
                        <TableRow key={booking.id.toString()}>
                          <TableCell className="font-medium">
                            {booking.number}
                          </TableCell>
                          <TableCell>{booking.status}</TableCell>
                          <TableCell>
                            {formatDate(booking.pickup_time)}
                          </TableCell>
                          <TableCell>{formatPrice(booking.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Empty>
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <CalendarDays />
                              </EmptyMedia>
                              <EmptyTitle>No Bookings Found</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                              <div className="text-sm text-muted-foreground">
                                This customer does not have any bookings yet.
                              </div>
                            </EmptyContent>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rides">
              <div className="overflow-hidden rounded-lg border bg-background">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-25">Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rides?.length ? (
                      rides.map((ride) => (
                        <TableRow key={ride.id.toString()}>
                          <TableCell className="font-medium">
                            {ride.number}
                          </TableCell>
                          <TableCell>{ride.status}</TableCell>
                          <TableCell>
                            {ride.origin} → {ride.destination}
                          </TableCell>
                          <TableCell>
                            {formatDate(ride.request_start_time)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Empty>
                            <EmptyHeader>
                              <EmptyMedia variant="icon">
                                <MapPin />
                              </EmptyMedia>
                              <EmptyTitle>No Rides Found</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                              <div className="text-sm text-muted-foreground">
                                This customer does not have any rides yet.
                              </div>
                            </EmptyContent>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
