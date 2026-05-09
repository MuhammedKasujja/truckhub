import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
import { Input } from '../input'
import { Field } from '../field'

type HiddenFieldProps<F extends FieldValues> = {
  control: Control<F>
  name: FieldPath<F>
}

export function HiddenField<T extends FieldValues>({
  control,
  name,
}: Readonly<HiddenFieldProps<T>>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className='hidden'>
          <Input
            {...field}
            type={'hidden'}
            value={field.value ?? ''}
            autoComplete="off"
          />
        </Field>
      )}
    />
  )
}
