import { Control } from "react-hook-form"
import { NumberingEntityKey, NumberingPatternType } from "../schemas"
import { TextField } from "@/components/ui/form-fields"
import { ENTITY_NUMBER_PATTERNS } from "@/common/constants"
import { Card, CardContent } from "@/components/ui/card"
import { CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type Props = {
  entityKey: NumberingEntityKey
  control: Control<NumberingPatternType>
}

export function EntityPatternSettings({ control, entityKey }: Props) {
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.info("Copied!")
    } catch (err) {
      toast.error("Failed to copy")
    }
  }
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex gap-4 md:flex-row">
        <TextField
          label="Counter Padding"
          control={control}
          name={`entities.${entityKey}.counter_padding`}
        />
        <TextField
          required={false}
          readOnly
          label="Last Number"
          control={control}
          name={`entities.${entityKey}.last_number`}
        />
      </div>
      <TextField
        label="Pattern"
        control={control}
        name={`entities.${entityKey}.pattern`}
      />
      <Card>
        <CardContent className="space-y-2">
          {ENTITY_NUMBER_PATTERNS[entityKey].map((pattern, index) => (
            <div
              key={`${pattern}.${entityKey}.${index}`}
              className="flex items-center gap-2"
            >
              {pattern}
              <Button
                size={"sm"}
                variant={"ghost"}
                type="button"
                onClick={() => copyToClipboard(pattern)}
              >
                <CopyIcon size={12} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
