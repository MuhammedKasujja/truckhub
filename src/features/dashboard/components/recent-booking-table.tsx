import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatDate, formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { ArrowUpRight, PlusIcon } from "lucide-react"
import { Booking } from "@/features/bookings/types"
import { Badge } from "@/components/ui/badge"
import { Can } from "@/components/has-permission"

type RecentBookingTableProps = {
  bookings: Booking[]
}

export function RecentBookingTable({ bookings }: RecentBookingTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardAction>
          <Can permission="bookings:view">
            <Button type="button" variant={"secondary"} asChild>
              <Link to={"/bookings"}>
                View
                <ArrowUpRight />
              </Link>
            </Button>
          </Can>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-25">Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length ? (
                bookings.map((booking) => (
                  <TableRow key={`booking-${booking.id.toString()}`}>
                    <TableCell className="font-medium">
                      {booking.number}
                    </TableCell>
                    <TableCell>{booking.client.fullname}</TableCell>
                    <TableCell>
                      <Badge variant={"outline"}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>{formatPrice(booking.amount)}</TableCell>
                    <TableCell>{formatPrice(booking.balance)}</TableCell>
                    <TableCell>
                      {formatDate(booking.estimated_pickup_time)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Empty className="">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Can permission="bookings:create">
                            <Button type="button" asChild size={"icon"}>
                              <Link to={"/bookings/new"}>
                                <PlusIcon />
                              </Link>
                            </Button>
                          </Can>
                        </EmptyMedia>
                        <EmptyTitle>No Bookings Found</EmptyTitle>
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
  )
}
