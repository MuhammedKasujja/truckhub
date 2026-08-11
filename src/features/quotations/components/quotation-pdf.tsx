import { PdfViewer, SkeletonPdfViewer } from "@/components/pdf-viewer"
import { logger } from "@/lib/logger"
import { EntityId } from "@/schemas"
import { useState, useEffect } from "react"
import { getQuotationReportPdfFn } from "../services"

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

  if (!pdfData) {
    return <SkeletonPdfViewer />
  }
  return <PdfViewer pdfUrl={pdfData} />
}
