import { Control } from "react-hook-form"
import { NumberingEntityKey, NumberingPatternType } from "../schemas"
import { TextField } from "@/components/ui/form-fields"

type Props = {
  entityKey: NumberingEntityKey
  control: Control<NumberingPatternType>
}

export function EntityPatternSettings({ control, entityKey }: Props) {
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
    </div>
  )
}