import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { requirePermission } from "@/lib/auth"
import {
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRightIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/reports/")({
  beforeLoad: () => requirePermission("reports:module"),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  return (
    <>
      <PageHeader>
        <PageTitle>Reports</PageTitle>
        <PageDescription>
          Pick a report to open its detailed breakdown — filters, line items,
          trends, and exports.
        </PageDescription>
      </PageHeader>
      <div className="grid gap-5 md:grid-cols-3">
        <ReportCardItem
          title={"Invoices"}
          subtitle={
            "Issued, paid, pending and overdue invoices by client, date range, and amount."
          }
          onClick={() => {}}
        />
        <ReportCardItem
          title={"Quotations"}
          subtitle={
            "Sent, accepted, expired and converted quotes, with win rate by client and product."
          }
          onClick={() => {}}
        />
        <ReportCardItem title={"Payments"} subtitle={"Collections by method and date, reconciled against invoices, with outstanding balances."} onClick={() => {}} />
        <ReportCardItem title={"Shipments"} subtitle={"Routes, drivers, distance and fuel cost per trip, with on-time performance by lane."} onClick={() => {}} />
        <ReportCardItem title={"Pricings"} subtitle={""} onClick={() => {}} />
        <ReportCardItem
          title={"Audit logs"}
          subtitle={"Every create, edit, delete and approval across the system, by user and record."}
          onClick={() => navigate({ to: "/reports/audits" })}
        />
      </div>
    </>
  )
}

type ReportCardItemProps = {
  title: string
  subtitle: string
  onClick: () => void
}

function ReportCardItem({ title, subtitle, onClick }: ReportCardItemProps) {
  return (
    <Card onClick={onClick} className="hover:ring hover:ring-primary cursor-pointer">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <Separator />
      <div className="flex justify-end pr-4">
        <div className="flex items-center gap-2">
          View report
          <ArrowRightIcon className="size-3.5" />
        </div>
      </div>
    </Card>
  )
}
