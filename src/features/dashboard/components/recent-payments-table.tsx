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
import { formatDateTime, formatMoney } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Payment } from "@/features/payments/types"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "@/i18n"
import { Can } from "@/components/has-permission"
import { PaymentStatusIndicator } from "@/features/payments/components"
import {
  FrameHeader,
  Frame,
  FrameTitle,
  FramePanel,
} from "@/components/ui/frame"

type PaymentTableprops = {
  payments: Payment[]
  /** Render only the table, without the card chrome */
  embedded?: boolean
}

export function RecentPaymentsTable({ payments, embedded = false }: PaymentTableprops) {
  const tr = useTranslation()
  const table = (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader className="bg-muted">
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
                <TableCell>{payment.client.fullname}</TableCell>
                <TableCell>{formatMoney(payment.amount)}</TableCell>
                <TableCell>
                  <PaymentStatusIndicator status={payment.status} />
                </TableCell>
                <TableCell>
                  {tr(`payments.methods.${payment.method}`)}
                </TableCell>
                <TableCell>{formatDateTime(payment.paid_at)}</TableCell>
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
  )

  if (embedded) return table

  return (
    <Frame>
      <FrameHeader>
        <FrameTitle className="flex justify-between text-lg">
          Recent Payments{" "}
          <Can permission="payments:view">
            <Button type="button" variant={"link"} asChild>
              <Link to={"/payments"}>View All</Link>
            </Button>
          </Can>
        </FrameTitle>
      </FrameHeader>
      <FramePanel>
        {table}
      </FramePanel>
    </Frame>
  )
}
