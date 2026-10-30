import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { cn } from "cn"
import {
  ImageUploader,
  ImageUploaderProps,
  type ImageValue,
} from "@/components/ui/extensions/image-uploader"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

type ImageFieldProps<T extends FieldValues> = Pick<
  ImageUploaderProps,
  | "src"
  | "aspect"
  | "width"
  | "maxWidth"
  | "outputSize"
  | "radius"
  | "maxSizeMB"
  | "disabled"
> & {
  name: FieldPath<T>
  control: Control<T>
  label?: string
  description?: string
  className?: string
}

export function ImageField<T extends FieldValues>({
  name,
  control,
  label,
  description,
  className,
  ...uploaderProps
}: ImageFieldProps<T>) {
  // hooks can't be conditional, so always watch something and ignore it if unused
  // const watched = useWatch({
  //   control: control,
  //   name: (nameField ?? name) as FieldPath<T>,
  // })
  // const displayName =
  //   nameField && typeof watched === "string" ? watched : undefined

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

            <ImageUploader
              id={field.name}
              value={field.value as ImageValue}
              onChange={(v) => {
                field.onChange(v)
                field.onBlur() // mark as touched so "onTouched" modes validate
              }}
              {...uploaderProps}
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
