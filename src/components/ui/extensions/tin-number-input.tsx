import { MaskInput, MaskPattern } from "../mask-input"

const ugandaTinMask: MaskPattern = {
  pattern: "##########", // 10 digits, no separators
  transform: (value) => value.replace(/\D/g, ""),
  validate: (value) => /^\d{10}$/.test(value),
}

export function TinNumberInput({
  field,
  invalid,
  id,
  readOnly,
  placeholder
}: {
  field: { value: string; onChange: (v: string) => void; onBlur: () => void }
  invalid: boolean
  readOnly: boolean
  placeholder?: string
  id?: string
}) {
  return (
    <MaskInput
      id={id}
      mask={ugandaTinMask}
      inputMode="numeric"
      placeholder="0106438743"
      value={field.value}
      onValueChange={(_masked, unmasked) => field.onChange(unmasked)}
      onBlur={field.onBlur}
      maxLength={10}
      invalid={invalid}
      readOnly={readOnly}
    />
  )
}
