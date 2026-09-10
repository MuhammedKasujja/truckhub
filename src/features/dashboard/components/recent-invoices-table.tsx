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
import { Invoice } from "@/features/invoices/types"

type RecentInvoiceTableProps = {
  invoices: Invoice[]
}

export function RecentInvoicesTable({ invoices }: RecentInvoiceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardAction>
          <Can permission="bookings:view">
            <Button type="button" variant={"secondary"} asChild>
              <Link to={"/invoices"}>
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
                <TableHead>Quotation</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length ? (
                invoices.map((invoice) => (
                  <TableRow key={`invoice-${invoice.id.toString()}`}>
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>{invoice.client.name}</TableCell>
                    <TableCell>
                      <Badge variant={"outline"}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{formatMoney(invoice.total)}</TableCell>
                    <TableCell>
                      <>-</>
                    </TableCell>
                    <TableCell>
                      {formatDate(invoice.due_date, { timeStyle: undefined })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Empty className="">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Can permission="invoices:create">
                            <Button type="button" asChild size={"icon"}>
                              <Link to={"/invoices/create"}>
                                <PlusIcon />
                              </Link>
                            </Button>
                          </Can>
                        </EmptyMedia>
                        <EmptyTitle>No Invoices Found</EmptyTitle>
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
