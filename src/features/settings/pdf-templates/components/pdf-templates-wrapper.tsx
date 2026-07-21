import { REPORT_TEMPLATES, ReportTemplate } from "@/common/constants"
import { PdfViewer, SkeletonPdfViewer } from "@/components/pdf-viewer"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { generateReportTemplatePdfFn } from "../services"
import { logger } from "@/lib/logger"

export function ReportPdfTemplatesWrapper() {
  const [template, setTemplate] = useState<ReportTemplate>("invoice")
  const [pdfData, setPageData] = useState<Uint8Array>()

  // const { data: response } = useQuery(reportTemplatePdfQueryOptions(template))

  useEffect(() => {
    setPageData(undefined)
    const loadPdf = async () => {
      try {
        const response = await generateReportTemplatePdfFn({
          data: { template },
        })
        const buffer = await response.arrayBuffer()
        setPageData(new Uint8Array(buffer))
      } catch (error) {
        logger.error("Failed to load PDF")
      }
    }

    loadPdf()
  }, [template])

  return (
    <div className="space-y-5">
      <Select
        value={template}
        onValueChange={(val) => setTemplate(val as ReportTemplate)}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {REPORT_TEMPLATES.map((temp) => (
              <SelectItem key={temp} value={temp}>
                {temp}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {!pdfData && <SkeletonPdfViewer/>}
      {pdfData && <PdfViewer pdfUrl={pdfData} />}
    </div>
  )
}
