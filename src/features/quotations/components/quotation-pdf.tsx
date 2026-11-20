import { useEffect, useState } from "react"
import { getQuotationReportPdfFn } from "../services"
import type { EntityId } from "@/schemas"
import { PdfViewer } from "@/components/pdf-viewer"
import { logger } from "@/lib/logger"

type QuotationPdfProps = {
  quotationId: EntityId
}

export function QuotationPdf({ quotationId }: QuotationPdfProps) {
  const [pdfData, setPageData] = useState<Uint8Array>()
  useEffect(() => {
    setPageData(undefined)
    const loadPdf = async () => {
      try {
        const response = await getQuotationReportPdfFn({
          data: { id: quotationId },
        })
        const buffer = await response.arrayBuffer()
        setPageData(new Uint8Array(buffer))
      } catch (error) {
        logger.error("Failed to load PDF")
      }
    }

    loadPdf()
  }, [])

  return <PdfViewer file={pdfData} fileName={`quotation-${quotationId}.pdf`} />
}
