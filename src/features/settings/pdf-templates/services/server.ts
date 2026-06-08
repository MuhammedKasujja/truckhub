import { api } from "@/lib/api"
import { ReportTemplate } from "@/common/constants"

export async function generateReportTemplatePdf(template: ReportTemplate) {
  const url = `/v1/reports/templates/${template}/download`

  return await api.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
  })
}
