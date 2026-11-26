import { useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

/**
 * A modal Radix dialog/sheet blocks clicks outside its content, so a combobox
 * popup inside one has to be portalled into it rather than into <body>.
 * Put `ref` on an element inside the field and pass `container` to ComboboxContent.
 */
export function useDialogPortalContainer() {
  const [container, setContainer] = useState<HTMLElement | undefined>()
  const ref = (el: HTMLElement | null) =>
    setContainer(
      el?.closest<HTMLElement>(
        '[data-slot="dialog-content"], [data-slot="sheet-content"]'
      ) ?? undefined
    )
  return { ref, container }
}

type Props = {
  id: string
  value: string
  onChange: (email: string) => void
  suggestions?: string[]
  placeholder?: string
  invalid?: boolean
}

/** One email address: free text, with known addresses offered as suggestions. */
export function EmailInput({
  id,
  value,
  onChange,
  suggestions = [],
  placeholder,
  invalid,
}: Props) {
  const { ref, container } = useDialogPortalContainer()

  return (
    <div ref={ref}>
      <Combobox
        items={suggestions}
        // The typed text is also the value, so closing the popup never resets it.
        value={value || null}
        onValueChange={(next) => onChange(next ?? "")}
        inputValue={value}
        onInputValueChange={onChange}
      >
        <ComboboxInput
          id={id}
          type="email"
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          showTrigger={suggestions.length > 0}
          className="w-full"
        />
        <ComboboxContent container={container}>
          <ComboboxList>
            {(email: string) => (
              <ComboboxItem key={email} value={email}>
                {email}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
