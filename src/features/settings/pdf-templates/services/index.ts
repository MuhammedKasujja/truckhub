import { createServerFn } from "@tanstack/react-start"
import { ReportTemplateSchema } from "../schemas"
import { generateReportTemplatePdf } from "./server"

export const generateReportTemplatePdfFn = createServerFn({ method: "GET" })
  .inputValidator(ReportTemplateSchema)
  .handler(async ({ data }) => {
    try {
      const response = await generateReportTemplatePdf(data.template)

      return new Response(response.data, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${data.template}-sample.pdf"`,
        },
      })
    } catch (error: any) {
      console.error("PDF generation error:", error?.response?.data || error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  })
