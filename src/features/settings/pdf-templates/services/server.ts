import type { ReportTemplate } from "@/common/constants"
import { api } from "@/lib/api"

export async function generateReportTemplatePdf(template: ReportTemplate) {
  const url = `/v1/reports/templates/${template}/download`

  return await api.get(url, {
    responseType: "arraybuffer",
    timeout: 30000,
  })
}
