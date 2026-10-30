import { useId } from "react"
import {
  Controller,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { cn } from "cn"
import {
  AvatarUploader,
  type AvatarValue,
} from "@/components/ui/extensions/avatar-uploader"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

type AvatarFieldProps<T extends FieldValues> = {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  description?: string
  /** Name of another field to build the fallback initials from, e.g. "name" */
  nameField?: FieldPath<T>
  /** Saved avatar URL */
  src?: string | null
  maxSizeMB?: number
  disabled?: boolean
  className?: string
}

export function AvatarField<T extends FieldValues>({
  name,
  control,
  label = "Profile picture",
  description,
  nameField,
  src,
  maxSizeMB,
  disabled,
  className,
}: AvatarFieldProps<T>) {
  const uid = useId()
  const inputId = `${uid}-input`
  const descId = `${uid}-description`
  const errId = `${uid}-error`

  // hooks can't be conditional, so always watch something and ignore it if unused
  const watched = useWatch({
    control: control,
    name: (nameField ?? name) as FieldPath<T>,
  })
  const displayName =
    nameField && typeof watched === "string" ? watched : undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field className={cn("space-y-2", className)}>
            {label && (
              <FieldLabel
                htmlFor={field.name}
                className={cn(fieldState.invalid && "text-destructive")}
              >
                {label}
              </FieldLabel>
            )}

            <AvatarUploader
              id={field.name}
              value={field.value as AvatarValue}
              onChange={(v) => {
                field.onChange(v)
                field.onBlur() // mark as touched so "onTouched" modes validate
              }}
              src={src}
              name={displayName}
              maxSizeMB={maxSizeMB}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />

            {description && (
              <FieldDescription className="text-sm text-muted-foreground">
                {description}
              </FieldDescription>
            )}
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )
      }}
    />
  )
}
