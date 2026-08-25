import { PdfViewer, SkeletonPdfViewer } from "@/components/pdf-viewer"
import { logger } from "@/lib/logger"
import { EntityId } from "@/schemas"
import { useState, useEffect } from "react"
import { getInvoicePdfFn } from "../services"

type InvoicePdfProps = {
  invoiceId: EntityId
}

export function InvoicePdf({ invoiceId }: InvoicePdfProps) {
  const [pdfData, setPageData] = useState<Uint8Array>()
  useEffect(() => {
    setPageData(undefined)
    const loadPdf = async () => {
      try {
        const response = await getInvoicePdfFn({
          data: { id: invoiceId },
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
