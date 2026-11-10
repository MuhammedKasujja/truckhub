import { createFileRoute } from "@tanstack/react-router"
import { ReportPdfTemplatesWrapper } from "@/features/settings/pdf-templates/components"
import { pdfTemplatesSearchSchema } from "@/features/settings/pdf-templates/schemas"

export const Route = createFileRoute("/_admin/settings/pdf-templates/")({
  component: ReportPdfTemplatesWrapper,
  validateSearch: pdfTemplatesSearchSchema,
})
