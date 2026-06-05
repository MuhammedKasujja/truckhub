import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

const templates = [
  "invoice",
  "quotation",
  "log_sheet",
  "booking",
  "ride",
  "payment",
  "client",
  "driver",
  "vehicle",
] as const

export function PdfTemplatesWrapper() {
    const [template, setTemplate] = useState<string>('invoice')
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
    </div>
  )
}
