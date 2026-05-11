import { ServiceForm } from '@/features/services/components/service-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/services/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ServiceForm/>
}
