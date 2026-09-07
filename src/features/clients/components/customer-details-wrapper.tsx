import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreditCard, CalendarDays, MapPin, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { formatDate, formatMoney, generateAvatorFallback } from "@/lib/format"
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
import { Can } from "@/components/has-permission"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQueries } from "@tanstack/react-query"
import { EntityId } from "@/schemas"
import {
  clientInvoicesQueryOptions,
  clientPaymentsQueryOptions,
  clientQuotationsQueryOptions,
} from "../query-options"
import { useTranslation } from "@/i18n"
import { EnterPaymentModal } from "@/features/payments/components"
import { useState } from "react"
import { useClientProfileSuspenseQuery } from "../hooks/use-client"

type CustomerDetailsWrapperProps = {
  clientId: EntityId
}

export function CustomerDetailsWrapper({
  clientId,
}: CustomerDetailsWrapperProps) {
  const { data: client } = useClientProfileSuspenseQuery(clientId)

  const [openModal, setOpenModal] = useState(false)

  const [
    { data: paymentsResponse },
    { data: invoicesResponse },
    { data: quotationsResponse },
  ] = useQueries({
    queries: [
      clientPaymentsQueryOptions(clientId),
      clientInvoicesQueryOptions(clientId),
      clientQuotationsQueryOptions(clientId),
    ],
  })

  const tr = useTranslation()

  const payments = paymentsResponse?.data
  const invoices = invoicesResponse?.data
  const quotations = quotationsResponse?.data

  const latestInvoice = invoices?.find((ele) => ele.total)
  const latestPayment = payments?.find((ele) => ele.date)
  const latestQuotation = quotations?.find((ele) => ele.created_at)

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{client?.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-5 space-y-4">
          <div className="flex w-40 items-center justify-center rounded-lg bg-muted text-2xl font-extrabold uppercase dark:bg-background/70">
            {client?.short_name ?? generateAvatorFallback(client?.name)}
          </div>
          <div className="space-y-4">
            <div>{client?.email}</div>
            <div>{client?.phone}</div>
            <div>Balance: {formatMoney(client?.balance)}</div>
            <div>Paid to Date: {formatMoney(client?.paid_to_date)}</div>
          </div>
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
                  {formatMoney(latestPayment.amount)}
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
            <CardTitle>Latest Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            {latestInvoice ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(latestInvoice.created_at)}
                </div>
                <div className="text-lg font-semibold">
                  {latestInvoice.number}
                </div>
                <div className="text-sm">{latestInvoice.status}</div>
                <div className="text-sm text-muted-foreground">
                  {formatMoney(latestInvoice.total)}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link
                    to={"/billing/invoices/$invoiceId/view"}
                    params={{ invoiceId: latestInvoice.id }}
                  >
                    View Invoice
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No invoices found for this customer.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Quotation</CardTitle>
          </CardHeader>
          <CardContent>
            {latestQuotation ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {formatDate(latestQuotation.created_at)}
                </div>
                <div className="text-lg font-semibold">{latestQuotation.number}</div>
                <div className="text-sm">{latestQuotation.status}</div>
                <div className="text-sm text-muted-foreground">
                  {latestQuotation.amount} → {latestQuotation.status}
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link
                    to={"/quotations/$quotationId/view"}
                    params={{ quotationId: latestQuotation.id }}
                  >
                    View Quotation
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No quotations found for this customer.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payments" className="w-full">
            <TabsList>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
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
                          <TableCell>{formatMoney(payment.amount)}</TableCell>
                          <TableCell>
                            {tr(`payments.statuses.${payment.status}`)}
                          </TableCell>
                          <TableCell>
                            {tr(`payments.methods.${payment.payment_mode}`)}
                          </TableCell>
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
                              <Can permission={"payments:create"}>
                                <Button onClick={() => setOpenModal(true)}>
                                  <PlusIcon />
                                  {tr("payments.form.new_payment")}
                                </Button>
                                <EnterPaymentModal
                                  open={openModal}
                                  onOpenChange={() => setOpenModal(false)}
                                  initialData={{
                                    type: "invoice",
                                  }}
                                />
                              </Can>
                            </EmptyContent>
                          </Empty>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="quotations">
              <div className="overflow-hidden rounded-lg border bg-background">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-25">Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations?.length ? (
                      quotations.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            {quote.number}
                          </TableCell>
                          <TableCell>{quote.status}</TableCell>
                          <TableCell>{formatMoney(quote.amount)}</TableCell>
                           <TableCell>
                            {formatDate(quote.created_at)}
                          </TableCell>
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
                              <EmptyTitle>No Quotations Found</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                              <div className="text-sm text-muted-foreground">
                                This customer does not have any quotations yet.
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

            <TabsContent value="invoices">
              <div className="overflow-hidden rounded-lg border bg-background">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-25">Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices?.length ? (
                      invoices.map((inv) => (
                        <TableRow key={inv.id.toString()}>
                          <TableCell className="font-medium">
                            {inv.number}
                          </TableCell>
                          <TableCell>{inv.status}</TableCell>
                          <TableCell>
                            {formatMoney(inv.total)}
                          </TableCell>
                          <TableCell>
                            {formatDate(inv.due_date)}
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
                              <EmptyTitle>No Invoices Found</EmptyTitle>
                            </EmptyHeader>
                            <EmptyContent>
                              <div className="text-sm text-muted-foreground">
                                This customer does not have any invoices yet.
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
  )
}
