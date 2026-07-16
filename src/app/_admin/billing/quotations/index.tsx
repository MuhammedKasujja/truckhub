import { QuotationTable } from '@/features/quotations/components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/billing/quotations/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <QuotationTable/>
}
