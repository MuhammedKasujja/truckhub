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
import { formatDate, formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { PlusIcon, ChevronRightIcon } from "lucide-react"
import { RideRequest } from "@/features/ride-requests/types"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/i18n"
import { Can } from "@/components/has-permission"

type RecentRideTableProps = {
  rides: RideRequest[]
}

export function RecentRidesTable({ rides }: RecentRideTableProps) {
  const tr = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Rides</CardTitle>
        <CardAction>
          <Can permission="rides:view">
            <Button type="button" variant={"secondary"} asChild>
              <Link to={"/rides"}>
                View
                <ChevronRightIcon />
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
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rides.length ? (
                rides.map((ride) => (
                  <TableRow key={`ride-${ride.id.toString()}`}>
                    <TableCell className="font-medium">{ride.number}</TableCell>
                    <TableCell className="font-medium">
                      {ride.client.fullname}
                    </TableCell>
                    <TableCell>
                      <Badge variant={"outline"}>
                        {tr(`rides.statues.${ride.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatMoney(ride.amount)}</TableCell>
                    <TableCell>{formatMoney(ride.balance)}</TableCell>
                    <TableCell>{formatDate(ride.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Empty className="">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Can permission="rides:create">
                            <Button type="button" asChild size={"icon"}>
                              <Link to={"/rides/new"}>
                                <PlusIcon />
                              </Link>
                            </Button>
                          </Can>
                        </EmptyMedia>
                        <EmptyTitle>No Rides Found</EmptyTitle>
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
