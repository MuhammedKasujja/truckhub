import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { FileTextIcon } from "lucide-react"
import { reportTemplatePdfQueryOptions } from "../query-options"
import { TemplatePicker } from "./template-picker"
import type { ReportTemplate } from "@/common/constants"
import { PdfViewer } from "@/components/pdf-viewer"
import {
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"

const DEFAULT_TEMPLATE: ReportTemplate = "invoice"

const route = getRouteApi("/_admin/settings/pdf-templates/")

export function ReportPdfTemplatesWrapper() {
  const navigate = route.useNavigate()
  const template = route.useSearch({
    select: (search) => search.template ?? DEFAULT_TEMPLATE,
  })

  const { data, error, isFetching, refetch } = useQuery(
    reportTemplatePdfQueryOptions(template)
  )

  function selectTemplate(next: ReportTemplate) {
    navigate({
      search: (prev) => ({
        ...prev,
        template: next === DEFAULT_TEMPLATE ? undefined : next,
      }),
    })
  }

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={FileTextIcon}
        title="PDF templates"
        description="Preview the documents the system generates, filled with sample data."
      />
      <PdfViewer
        file={data}
        fileName={`${template}-sample.pdf`}
        isLoading={isFetching}
        error={error}
        onRefresh={() => void refetch()}
        toolbarStart={
          <TemplatePicker value={template} onChange={selectTemplate} />
        }
      />
    </SettingsPage>
  )
}
