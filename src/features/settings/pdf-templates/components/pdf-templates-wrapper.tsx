import { REPORT_TEMPLATES, ReportTemplate } from "@/common/constants"
import { PdfViewer } from "@/components/pdf-viewer"
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

export function ReportPdfTemplatesWrapper() {
  const [template, setTemplate] = useState<ReportTemplate>("invoice")
  const [pageData, setPageData] = useState<Uint8Array>()

  // const { data: response } = useQuery(reportTemplatePdfQueryOptions(template))

  useEffect(() => {
    setPageData(undefined)
    const loadPdf = async () => {
      const response = await generateReportTemplatePdfFn({ data: { template } })
      const buffer = await response.arrayBuffer()
      setPageData(new Uint8Array(buffer))
    }

    loadPdf()
  }, [template])

  if (!pageData) {
    return <div>Loading pdf...</div>
  }

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
      <PdfViewer pdfUrl={pageData} />
    </div>
  )
}
