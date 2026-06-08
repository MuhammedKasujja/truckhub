import z from "zod"
import { REPORT_TEMPLATES } from "@/common/constants"

export const ReportTemplateSchema = z.object({
  template: z.enum(REPORT_TEMPLATES),
})
