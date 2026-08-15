import { MaskInput, MaskPattern } from "../mask-input";

function normalizeUgPhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("256")) {
    digits = digits.slice(3);       // drop country code
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);       // drop trunk prefix
  }

  return digits.slice(0, 9);        // 9-digit national significant number
}

const ugandaPhoneMask: MaskPattern = {
  pattern: "+256 ### ######", // 9 slots after the literal +256 prefix
  transform: (value) => normalizeUgPhoneDigits(value),
  validate: (value) => /^7\d{8}$/.test(value),
};


export function TelephoneInput({
  field,
  invalid,
  id,
  readOnly,
}: {
  field: { value: string; onChange: (v: string) => void; onBlur: () => void }
  invalid: boolean
  readOnly: boolean
  id?: string
}) {

  return (
    <MaskInput
      id={id}
      mask={ugandaPhoneMask}
      placeholder="+256 772 123456"
      inputMode="numeric"
      value={field.value}
      onValueChange={(_masked, unmasked) => field.onChange(unmasked)}
      onBlur={field.onBlur}
      invalid={invalid}
      readOnly={readOnly}
    />
  )
}