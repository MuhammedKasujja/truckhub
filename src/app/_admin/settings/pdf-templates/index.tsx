import { PdfTemplatesWrapper } from '@/features/settings/pdf-templates/components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/settings/pdf-templates/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PdfTemplatesWrapper/>
}
