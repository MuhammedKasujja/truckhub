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

const templates = [
  "invoice",
  "quotation",
  "log_sheet",
  "booking",
  "ride",
  "payment",
  "client_statement",
  "driver",
  "vehicle",
] as const

export function PdfTemplatesWrapper() {
  const [template, setTemplate] = useState<string>("invoice")
  const [pageData, setPageData] = useState<Uint8Array>()

  useEffect(() => {
    setPageData(undefined)
    const loadPdf = async () => {
      const response = await fetch(
        `http://127.0.0.1:8000/v1/reports/templates/${template}/download`
      )

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
      <Select value={template} onValueChange={setTemplate}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {templates.map((temp) => (
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
