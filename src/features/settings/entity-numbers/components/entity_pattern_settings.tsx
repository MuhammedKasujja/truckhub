import { Control, Controller } from "react-hook-form"
import { NumberingEntityKey, NumberingPatternType } from "../schemas"
import { TextField } from "@/components/ui/form-fields"
import {
  ENTITY_NUMBER_PATTERNS,
  ALLOWDED_NUMBER_COUNTER_PATTERNS,
} from "@/common/constants"
import { Card, CardContent } from "@/components/ui/card"
import { CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { Input } from "@/components/ui/input"
import { useTokenInsertion } from "../hooks/use-token-insertion"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  entityKey: NumberingEntityKey
  control: Control<NumberingPatternType>
}

export function EntityPatternSettings({ control, entityKey }: Props) {
  const { inputRef, insertToken } = useTokenInsertion()

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex gap-4 md:flex-row">
        <Controller
          name={`entities.${entityKey}.counter_padding`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Counter Padding
                <RequiredLabelIcon />
              </FieldLabel>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder={"Select"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ALLOWDED_NUMBER_COUNTER_PATTERNS.map((opt) => (
                      <SelectItem
                        key={`entities.${entityKey}.${opt}.counter_padding`}
                        value={opt.toString()}
                      >
                        {'1'.padStart(opt, "0")}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <TextField
          required={false}
          readOnly
          label="Last Number"
          control={control}
          name={`entities.${entityKey}.last_number`}
        />
      </div>
      <Controller
        name={`entities.${entityKey}.pattern`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Pattern
              <RequiredLabelIcon />
            </FieldLabel>
            <Input
              {...field}
              ref={(el) => {
                field.ref(el)
                inputRef.current = el
              }}
              type={"text"}
              id={field.name}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
            />
            {/* {description && <FieldDescription>{description}</FieldDescription>} */}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            <Card className="mt-5">
              <CardContent className="space-y-2">
                {ENTITY_NUMBER_PATTERNS[entityKey].map((pattern, index) => (
                  <Button
                    key={`${pattern}.${entityKey}.${index}`}
                    className="flex items-center gap-2"
                    type="button"
                    variant={"ghost"}
                    size={"sm"}
                    onClick={() =>
                      insertToken(pattern, field.value ?? "", field.onChange)
                    }
                  >
                    {pattern}
                    <CopyIcon size={12} />
                  </Button>
                ))}
              </CardContent>
            </Card>
          </Field>
        )}
      />
    </div>
  )
}
