import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldDescription, FieldError, FieldLabel } from "../../field";
import React from "react";
import { RequiredLabelIcon } from "@/components/required-label-icon";

type Option = { label: string; value: string | number };

type AutoCompleteFieldProps<T extends FieldValues> = {
  label?: string;
  options: readonly Option[];
  control: Control<T>;
  name: FieldPath<T>;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  emptyPlaceholder?: string;
  className?: string;
};

export function AutoCompleteField<T extends FieldValues>({
  options,
  control,
  name,
  label,
  placeholder = "Select...",
  required = true,
  description,
  emptyPlaceholder = "No results found.",
  className,
  disabled = false,
}: AutoCompleteFieldProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const currentOption = options.find((o) => o.value === field.value);

        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={field.name}>
              {label}
              {required && <RequiredLabelIcon />}
            </FieldLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={undefined} // you can manage open state if you want
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !field.value && "text-muted-foreground",
                    fieldState.invalid && "border-destructive",
                  )}
                  disabled={disabled}
                >
                  {currentOption ? currentOption.label : placeholder}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                <Command>
                  <CommandInput
                    disabled={disabled}
                    id={field.name}
                    placeholder={placeholder}
                    // aria-invalid={fieldState.invalid}
                  />
                  <CommandList>
                    <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label.toLowerCase()} // cmdk expects string // this is used for filtering
                          onSelect={() => {
                            field.onChange(option.value);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === option.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {description && <FieldDescription>{description}</FieldDescription>}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

// import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
// import {
//   Combobox,
//   ComboboxContent,
//   ComboboxEmpty,
//   ComboboxInput,
//   ComboboxItem,
//   ComboboxList,
// } from '../combobox'
// import { Field, FieldDescription, FieldError, FieldLabel } from '../field'
// import { AsteriskIcon } from 'lucide-react'
// import { cn } from '@/lib/utils'

// type AutoCompleteFieldProps<F extends FieldValues> = {
//   label?: string
//   options: Readonly<
//     {
//       label: string
//       value: string | number
//     }[]
//   >
//   control: Control<F>
//   name: FieldPath<F>
//   placeholder?: string
//   description?: string
//   required?: boolean
//   emptyPlaceholder?: string
// }

// export function AutoCompleteField<T extends FieldValues>({
//   options,
//   control,
//   name,
//   label,
//   placeholder,
//   required = true,
//   description,
//   emptyPlaceholder = 'No results found.',
// }: Readonly<AutoCompleteFieldProps<T>>) {
//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field, fieldState }) => (
//         <Field data-invalid={fieldState.invalid}>
//           <FieldLabel htmlFor={field.name}>
//             {label}
//             {required && (
//               <AsteriskIcon
//                 className={cn('text-destructive inline size-2.5 align-top')}
//               />
//             )}
//           </FieldLabel>
//           <Combobox
//             items={options}
//             //TODO: fix changing from uncontrolled to controlled component
//             // value={field.value}
//             onValueChange={(val) => {
//               field.onChange(val)
//             }}
//           >
//             <ComboboxInput
//               //TODO: fix changing from uncontrolled to controlled component
//               // {...field}
//               id={field.name}
//               placeholder={placeholder}
//               aria-invalid={fieldState.invalid}
//             />
//             <ComboboxContent>
//               <ComboboxEmpty>{emptyPlaceholder}</ComboboxEmpty>
//               <ComboboxList>
//                 {(item) => (
//                   <ComboboxItem key={item.value} value={item.value}>
//                     {item.label}
//                   </ComboboxItem>
//                 )}
//               </ComboboxList>
//             </ComboboxContent>
//           </Combobox>
//           {description && <FieldDescription>{description}</FieldDescription>}
//           {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
//         </Field>
//       )}
//     />
//   )
// }

{
  /* <Field>
              <FieldLabel htmlFor="small-form-framework">Framework</FieldLabel>
              <Combobox
                items={[
                  'flutter',
                  'Nextjs',
                  'React',
                  'Vue',
                  'Python',
                  'Kotlin',
                ]}
              >
                <ComboboxInput
                  id="small-form-framework"
                  placeholder="Select a framework"
                  required
                />
                <ComboboxContent>
                  <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field> */
}
