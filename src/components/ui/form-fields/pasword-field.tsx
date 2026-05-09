import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import React from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../input-group'
import { RequiredLabelIcon } from '@/components/required-label-icon'

type PasswordFieldProps<F extends FieldValues> = {
  label?: string
  control: Control<F>
  name: FieldPath<F>
  placeholder?: string
  description?: string
  required?: boolean
  showIcon?: boolean
}

export function PasswordField<F extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
  showIcon = true,
}: Readonly<PasswordFieldProps<F>>) {
  const [show, setShow] = React.useState(false)
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>
            {label}
            {required && <RequiredLabelIcon />}
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...field}
              type={show ? 'text' : 'password'}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder ?? '********'}
            />
            {showIcon && (
              <InputGroupAddon
                align="inline-end"
                onClick={() => setShow((s) => !s)}
              >
                {show ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </InputGroupAddon>
            )}
          </InputGroup>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
