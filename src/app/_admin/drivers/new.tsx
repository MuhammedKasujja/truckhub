import { PageHeader, PageTitle } from "@/components/page-header"
import { DriverForm } from "@/features/drivers/components/driver-form"
import { useCreateDriver } from "@/features/drivers/hooks/user-driver"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/drivers/new")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("drivers:create"),
})

function RouteComponent() {
  const { mutate } = useCreateDriver()
  return (
    <>
      <PageHeader>
        <PageTitle>Add Driver</PageTitle>
      </PageHeader>
      <DriverForm
        mode="create"
        onSubmit={(data) => {
          mutate(data)
        }}
      />
      {/* <DriverRegistrationForm onSubmit={(data)=>{}} /> */}
    </>
  )
}


import * as React from "react";
import { Controller, useForm, useWatch, type Control, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const MIN_AGE = 25;
const MAX_AGE = 55;
const MIN_EXPERIENCE_YEARS = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILES = ["image/jpeg", "image/png", "application/pdf"];

const VEHICLE_TYPES = ["Motorcycle", "Car", "Pickup / Van", "Minibus", "Truck", "Bus"] as const;
const EDUCATION_LEVELS = [
  "Primary",
  "O'Level",
  "O'Level with a driving course",
  "A'Level",
  "Diploma",
  "Degree",
] as const;

const HEALTH_QUESTIONS = [
  { name: "vision", label: "Does the driver have vision problems (eyesight or colour blindness)?" },
  { name: "seriousIllness", label: "Does the driver have any serious illness?" },
  { name: "neuroMusculoskeletal", label: "Does the driver have a neurological or musculoskeletal condition that could affect movement and reaction time?" },
  { name: "suddenCollapse", label: "Does the driver have a condition that could cause sudden collapse (e.g. epilepsy, diabetes, heart attack)?" },
  { name: "anxietyDepression", label: "Does the driver have a history of anxiety or depression?" },
  { name: "medication", label: "Does the driver use any medication?" },
  { name: "stressSleep", label: "Does the driver have stress or sleeping disorders?" },
] as const;

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

const TEST_STATUSES = ["Pending", "Passed", "Failed"] as const;

const yesNo = z.enum(["yes", "no"], { message: "Please answer this question" });

const ageOn = (dob: string, on = new Date()) => {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const m = on.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--;
  return age;
};

const healthShape = Object.fromEntries(
  HEALTH_QUESTIONS.flatMap((q) => [
    [q.name, yesNo],
    [`${q.name}Details`, z.string().optional()],
  ])
) as Record<string, z.ZodTypeAny>;

export const driverSchema = z
  .object({
    fullName: z.string().min(2, "Enter the driver's full name"),
    phone: z.string().min(9, "Enter a valid phone number"),
    nationalId: z.string().min(5, "Enter the national ID number"),
    dateOfBirth: z
      .string()
      .min(1, "Enter the date of birth")
      .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date")
      .refine((v) => {
        const age = ageOn(v);
        return age >= MIN_AGE && age <= MAX_AGE;
      }, `Driver must be between ${MIN_AGE} and ${MAX_AGE} years old at registration`),
    yard: z.string().min(1, "Enter the yard"),

    vehicleType: z.enum(VEHICLE_TYPES, { message: "Select the vehicle type" }),
    yearsExperience: z
      .number({ message: "Enter years of experience" })
      .min(
        MIN_EXPERIENCE_YEARS,
        `At least ${MIN_EXPERIENCE_YEARS} years of experience on the assigned vehicle type is required`
      )
      .max(50, "Enter a realistic number of years"),

    education: z.enum(EDUCATION_LEVELS, { message: "Select the education level" }),

    smoker: z.boolean(),
    drugUser: z.boolean(),

    licenseNumber: z.string().min(3, "Enter the licence number"),
    licenseClass: z.enum(VEHICLE_TYPES, { message: "Select the licence category" }),
    licenseExpiry: z
      .string()
      .min(1, "Enter the licence expiry date")
      .refine((v) => new Date(v) > new Date(), "Licence has expired"),
    licenseCopy: z
      .instanceof(File, { message: "Upload a photocopy of the licence" })
      .refine((f) => f.size <= MAX_FILE_SIZE, "File must be 5MB or smaller")
      .refine((f) => ACCEPTED_FILES.includes(f.type), "Upload a JPG, PNG or PDF"),

    ...healthShape,

    drugAlcoholTest: z.enum(TEST_STATUSES),
    skillsTest: z.enum(TEST_STATUSES),
    practicalTest: z.enum(TEST_STATUSES),

    driverConfirmed: z
      .boolean()
      .refine((v) => v, "Confirm the driver has verified the information"),
    signedQuestionnaire: z
      .instanceof(File)
      .refine((f) => f.size <= MAX_FILE_SIZE, "File must be 5MB or smaller")
      .refine((f) => ACCEPTED_FILES.includes(f.type), "Upload a JPG, PNG or PDF")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.licenseClass && data.vehicleType && data.licenseClass !== data.vehicleType) {
      ctx.addIssue({
        code: "custom",
        path: ["licenseClass"],
        message: "Licence must be valid for the vehicle to be driven",
      });
    }
    for (const q of HEALTH_QUESTIONS) {
      const answer = (data as Record<string, unknown>)[q.name];
      const details = (data as Record<string, unknown>)[`${q.name}Details`] as string | undefined;
      if (answer === "yes" && !details?.trim()) {
        ctx.addIssue({ code: "custom", path: [`${q.name}Details`], message: "Please give details" });
      }
    }
  });

export type DriverFormValues = z.infer<typeof driverSchema>;

/* ------------------------------------------------------------------ */
/* Field helpers (shadcn Field + RHF Controller)                       */
/* ------------------------------------------------------------------ */

type C = Control<DriverFormValues>;
type N = Path<DriverFormValues>;

type BaseProps = {
  control: C;
  name: N;
  label: string;
  description?: string;
  className?: string;
};

function TextField({
  control, name, label, description, className, ...input
}: BaseProps & Omit<React.ComponentProps<typeof Input>, "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...input}
            id={name}
            name={field.name}
            ref={field.ref}
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function NumberField({ control, name, label, description, className }: BaseProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            inputMode="numeric"
            min={0}
            name={field.name}
            ref={field.ref}
            value={(field.value as number | undefined) ?? ""}
            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            onBlur={field.onBlur}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function FileField({ control, name, label, description, className }: BaseProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            onChange={(e) => field.onChange(e.target.files?.[0])}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function SelectField({
  control, name, label, description, className, options, placeholder,
}: BaseProps & { options: readonly string[]; placeholder: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select name={field.name} value={(field.value as string) || undefined} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function CheckField({ control, name, label, className }: Omit<BaseProps, "description">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid} className={className}>
          <Checkbox
            id={name}
            name={field.name}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
            aria-invalid={fieldState.invalid}
          />
          <FieldContent>
            <FieldLabel htmlFor={name} className="font-normal">{label}</FieldLabel>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}

function YesNoField({ control, name, label }: { control: C; name: string; label: string }) {
  const answer = useWatch({ control, name: name as N });
  return (
    <div className="space-y-3">
      <Controller
        control={control}
        name={name as N}
        render={({ field, fieldState }) => (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend variant="label" className="leading-snug">{label}</FieldLegend>
            <RadioGroup
              name={field.name}
              value={(field.value as string) ?? ""}
              onValueChange={field.onChange}
              aria-invalid={fieldState.invalid}
              className="flex gap-6"
            >
              {(["yes", "no"] as const).map((v) => (
                <Field key={v} orientation="horizontal" data-invalid={fieldState.invalid} className="w-auto">
                  <RadioGroupItem value={v} id={`${name}-${v}`} aria-invalid={fieldState.invalid} />
                  <FieldLabel htmlFor={`${name}-${v}`} className="font-normal">
                    {v === "yes" ? "Yes" : "No"}
                  </FieldLabel>
                </Field>
              ))}
            </RadioGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />
      {answer === "yes" && (
        <Controller
          control={control}
          name={`${name}Details` as N}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                id={`${name}Details`}
                name={field.name}
                ref={field.ref}
                value={(field.value as string) ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Give details"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

const healthDefaults = Object.fromEntries(HEALTH_QUESTIONS.map((q) => [`${q.name}Details`, ""]));

export function DriverRegistrationForm({
  onSubmit,
}: {
  onSubmit?: (values: DriverFormValues) => void | Promise<void>;
}) {
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      yard: "Seeta-Mukono",
      yearsExperience: undefined,
      smoker: false,
      drugUser: false,
      licenseNumber: "",
      licenseExpiry: "",
      drugAlcoholTest: "Pending",
      skillsTest: "Pending",
      practicalTest: "Pending",
      driverConfirmed: false,
      ...healthDefaults,
    } as Partial<DriverFormValues>,
  });
  const { control } = form;

  const handleSubmit = async (values: DriverFormValues) => {
    // Save the record. Attach the signed questionnaire copy
    // once the selection process is complete.
    await onSubmit?.(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="mx-auto max-w-2xl space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Driver details</CardTitle>
          <CardDescription>
            Drivers must be {MIN_AGE}–{MAX_AGE} years old at registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="fullName" label="Full name" autoComplete="name" className="sm:col-span-2" />
            <TextField control={control} name="phone" label="Phone number" type="tel" autoComplete="tel" />
            <TextField control={control} name="nationalId" label="National ID number" />
            <TextField control={control} name="dateOfBirth" label="Date of birth" type="date" />
            <TextField control={control} name="yard" label="Yard" />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Experience and education</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <SelectField control={control} name="vehicleType" label="Vehicle type being assigned" options={VEHICLE_TYPES} placeholder="Select type" />
            <NumberField control={control} name="yearsExperience" label="Years driving this vehicle type" description={`Minimum ${MIN_EXPERIENCE_YEARS} years.`} />
            <SelectField control={control} name="education" label="Highest education level" description="O'Level with a driving course is preferred." options={EDUCATION_LEVELS} placeholder="Select level" className="sm:col-span-2" />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Driving licence</CardTitle>
          <CardDescription>Must be valid for the vehicle to be driven.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="licenseNumber" label="Licence number" />
            <SelectField control={control} name="licenseClass" label="Licence category" options={VEHICLE_TYPES} placeholder="Select category" />
            <TextField control={control} name="licenseExpiry" label="Expiry date" type="date" />
            <FileField control={control} name="licenseCopy" label="Licence photocopy" description="Kept in the driver's portfolio. JPG, PNG or PDF, up to 5MB." />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lifestyle</CardTitle>
          <CardDescription>Tick all that apply to the driver.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <CheckField control={control} name="smoker" label="Driver smokes" />
            <CheckField control={control} name="drugUser" label="Driver uses drugs" />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Driver health screening</CardTitle>
          <CardDescription>
            Record any disability or impairment the driver discloses. Add details for every "Yes".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {HEALTH_QUESTIONS.map((q, i) => (
            <React.Fragment key={q.name}>
              {i > 0 && <Separator />}
              <YesNoField control={control} name={q.name} label={q.label} />
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Selection tests</CardTitle>
          <CardDescription>Record the result of each test. Leave as Pending until it is done.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-3">
            <SelectField control={control} name="drugAlcoholTest" label="Drug and alcohol test" options={TEST_STATUSES} placeholder="Select result" />
            <SelectField control={control} name="skillsTest" label="Driving skills test" options={TEST_STATUSES} placeholder="Select result" />
            <SelectField control={control} name="practicalTest" label="Practical driving test" options={TEST_STATUSES} placeholder="Select result" />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Driver confirmation</CardTitle>
          <CardDescription>
            The driver signs the health screening questionnaire. Upload the signed copy
            once the selection process is complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <CheckField control={control} name="driverConfirmed" label="The driver has confirmed this information is true and complete." />
            <FileField control={control} name="signedQuestionnaire" label="Signed questionnaire (optional for now)" description="Scan or photo of the signed copy. JPG, PNG or PDF, up to 5MB." />
          </FieldGroup>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Registering…" : "Register driver"}
      </Button>
    </form>
  );
}

