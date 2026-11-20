import { useEffect, useState } from "react"
import type { EntityId } from "@/schemas"
import { PdfViewer } from "@/components/pdf-viewer"
import { generateReportTemplatePdfFn } from "@/features/settings/pdf-templates/services"
import { logger } from "@/lib/logger"

type ClientPdfProps = {
  clientId: EntityId
}

export function ClientPdf({ clientId }: ClientPdfProps) {
  const [pdfData, setPageData] = useState<Uint8Array>()
  useEffect(() => {
    setPageData(undefined)
    const loadPdf = async () => {
      try {
        const response = await generateReportTemplatePdfFn({
          data: { template: "client_statement" },
        })
        const buffer = await response.arrayBuffer()
        setPageData(new Uint8Array(buffer))
      } catch (error) {
        logger.error("Failed to load PDF")
      }
    }

    loadPdf()
  }, [])
  return <PdfViewer file={pdfData} fileName={`client-statement-${clientId}.pdf`} />
}
