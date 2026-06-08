import { Button } from "@/components/ui/button"
import { AutoCompleteField } from "@/components/ui/form-fields"
import { PlusIcon } from "lucide-react"

export function ClientPicker() {
  return (
    <div className="flex gap-4">
      <AutoCompleteField
        label={"Client"}
        name={"client_id"}
        control={form.control}
        options={(clientsResponse?.data ?? []).map((ele) => ({
          label: ele.name,
          value: ele.id,
        }))}
      />
      <Button size={"icon"}>
        <PlusIcon />
      </Button>
    </div>
  )
}
