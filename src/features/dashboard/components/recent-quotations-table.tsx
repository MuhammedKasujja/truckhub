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
import { ArrowUpRight, PlusIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Can } from "@/components/has-permission"
import { Quotation } from "@/features/quotations/types"

type TableProps = {
  quotations: Quotation[]
}

export function RecentQuotationsTable({ quotations }: TableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Quotations</CardTitle>
        <CardAction>
          <Can permission="quotations:view">
            <Button type="button" variant={"secondary"} asChild>
              <Link to={"/quotations"}>
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
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length ? (
                quotations.map((quotation) => (
                  <TableRow key={`quotation-${quotation.id.toString()}`}>
                    <TableCell className="font-medium">
                      {quotation.number}
                    </TableCell>
                    <TableCell>{quotation.client.name}</TableCell>
                    <TableCell>
                      <Badge variant={"outline"}>{quotation.status}</Badge>
                    </TableCell>
                    <TableCell>{formatMoney(quotation.amount)}</TableCell>
                    <TableCell>
                      {formatDate(quotation.created_at, {
                        timeStyle: undefined,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Empty className="">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Can permission="quotations:create">
                            <Button type="button" asChild size={"icon"}>
                              <Link to={"/quotations/new"}>
                                <PlusIcon />
                              </Link>
                            </Button>
                          </Can>
                        </EmptyMedia>
                        <EmptyTitle>No Quotations Found</EmptyTitle>
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
