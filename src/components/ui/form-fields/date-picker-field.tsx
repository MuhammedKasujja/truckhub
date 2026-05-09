import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import React from "react";
import { RequiredLabelIcon } from "@/components/required-label-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

type DatePickerFieldProps<F extends FieldValues> = {
  label?: string;
  control: Control<F>;
  name: FieldPath<F>;
  placeholder?: string;
  description?: string;
  required?: boolean;
  startDate?: Date;
  endDate?: Date;
};

export function DatePickerField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = true,
  description,
  startDate,
  endDate,
}: Readonly<DatePickerFieldProps<T>>) {
  const [isOpen, setIsOpen] = React.useState(false);

  const newStartDate = React.useMemo(() => {
    if (startDate) return startDate;

    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }, [startDate]);

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
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full font-normal",
                  !field.value && "text-muted-foreground",
                )}
              >
                {field.value ? (
                  `${format(field.value, "PPP")}`
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={field.value}
                onSelect={(selectedDate) => {
                  field.onChange(selectedDate);
                }}
                onDayClick={() => setIsOpen(false)}
                startMonth={newStartDate}
                endMonth={endDate}
                // disabled={(date) =>
                //   Number(date) < Date.now() - 1000 * 60 * 60 * 24 ||
                //   Number(date) > Date.now() + 1000 * 60 * 60 * 24 * 30
                // }
                defaultMonth={field.value}
              />
            </PopoverContent>
          </Popover>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
