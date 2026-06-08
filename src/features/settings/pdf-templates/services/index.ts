import { logger } from "@/lib/logger"
import { ReportTemplateSchema } from "../schemas"
import { generateReportTemplatePdf } from "./server"
import { createServerFn } from "@tanstack/react-start"

export const generateReportTemplatePdfFn = createServerFn({ method: "GET" })
  .inputValidator(ReportTemplateSchema)
  .handler(async ({ data }) => {
    try {
      const response = await generateReportTemplatePdf(data.template)

      return new Response(response.data, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${data.template}-demo"}.pdf"`,
        },
      })
    } catch (error: any) {
      logger.error("PDF generation error:", error?.response?.data || error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  })
