import { Link } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"
import { RecentInvoicesTable } from "./recent-invoices-table"
import { RecentPaymentsTable } from "./recent-payments-table"
import { RecentQuotationsTable } from "./recent-quotations-table"
import { WidgetEmpty } from "./widget-empty"
import type { UserPermission } from "@/features/auth/permissions"
import type { Shipment } from "@/features/shipments/types"
import type { DashboardStatistics } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/features/auth/hooks/use-permissions"
import { ShipmentStatusIndicator } from "@/features/shipments/components"
import { formatDate } from "@/lib/format"

const ROWS = 5

type TabKey = "shipments" | "quotations" | "invoices" | "payments"

type TabDef = {
  key: TabKey
  label: string
  permission: UserPermission
  to: "/shipments/active" | "/quotations" | "/invoices" | "/payments"
  render: () => React.ReactNode
}

function RecentShipments({ shipments }: { shipments: Shipment[] }) {
  if (!shipments.length) return <WidgetEmpty>No recent shipments</WidgetEmpty>
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-25">Number</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((s) => (
            <TableRow key={`shipment-${s.id.toString()}`}>
              <TableCell className="font-medium">{s.number ?? "—"}</TableCell>
              <TableCell>{s.vehicle?.plate_number ?? "—"}</TableCell>
              <TableCell>{s.driver?.full_name ?? "—"}</TableCell>
              <TableCell>
                <ShipmentStatusIndicator status={s.status} />
              </TableCell>
              <TableCell>{formatDate(s.item.scheduled_start)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function RecentActivityTabs({ data }: { data: DashboardStatistics }) {
  const { hasPermission } = usePermissions()

  const tabs: TabDef[] = [
    ...(data.recent_shipments
      ? [
          {
            key: "shipments" as const,
            label: "Shipments",
            permission: "shipments:module" as const,
            to: "/shipments/active" as const,
            render: () => (
              <RecentShipments
                shipments={data.recent_shipments!.slice(0, ROWS)}
              />
            ),
          },
        ]
      : []),
    {
      key: "quotations",
      label: "Quotations",
      permission: "quotations:view",
      to: "/quotations",
      render: () => (
        <RecentQuotationsTable
          embedded={false}
          quotations={data.recent_quotations.slice(0, ROWS)}
        />
      ),
    },
    {
      key: "invoices",
      label: "Invoices",
      permission: "invoices:view",
      to: "/invoices",
      render: () => (
        <RecentInvoicesTable
          embedded
          invoices={data.recent_invoices.slice(0, ROWS)}
        />
      ),
    },
    {
      key: "payments",
      label: "Payments",
      permission: "payments:view",
      to: "/payments",
      render: () => (
        <RecentPaymentsTable
          embedded
          payments={data.recent_payments.slice(0, ROWS)}
        />
      ),
    },
  ]

  const visible = tabs.filter((t) => hasPermission(t.permission))
  if (!visible.length) return null

  return (
    <Card>
      <Tabs defaultValue={visible[0].key}>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Recent activity</CardTitle>
          <TabsList>
            {visible.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </CardHeader>
        <CardContent>
          {visible.map((t) => (
            <TabsContent
              key={t.key}
              value={t.key}
              className="flex flex-col gap-2"
            >
              {t.render()}
              <Button variant="link" size="sm" className="self-end" asChild>
                <Link to={t.to}>
                  View all {t.label.toLowerCase()}
                  <ChevronRightIcon />
                </Link>
              </Button>
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  )
}
