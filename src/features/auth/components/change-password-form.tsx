import { useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check, Circle, KeyRound } from "lucide-react"
import { ChangePasswordSchema } from "../schemas"
import { changePasswordFn } from "../services"
import type z from "zod"
import { PasswordField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { cn } from "@/lib/utils"

const formSchema = ChangePasswordSchema.refine(
  (d) => d.new_password === d.confirm_password,
  { message: "Passwords don't match", path: ["confirm_password"] }
).refine((d) => d.new_password !== d.old_password, {
  message: "Choose a password different from the current one",
  path: ["new_password"],
})

type FormValues = z.infer<typeof formSchema>

const REQUIREMENTS = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
  { label: "Symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

const STRENGTH = [
  { label: "Too weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fair", bar: "bg-warning", text: "text-warning-foreground" },
  { label: "Good", bar: "bg-warning", text: "text-warning-foreground" },
  { label: "Strong", bar: "bg-success", text: "text-success-foreground" },
  { label: "Very strong", bar: "bg-success", text: "text-success-foreground" },
]

function scorePassword(value: string) {
  const passed = REQUIREMENTS.filter((r) => r.test(value)).length
  // A long password outranks a short one that ticks the same boxes.
  return Math.min(passed + (value.length >= 12 ? 1 : 0), 5)
}

export function ChangePasswordForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { old_password: "", new_password: "", confirm_password: "" },
  })

  const [newPassword = "", confirmPassword = ""] = useWatch({
    control: form.control,
    name: ["new_password", "confirm_password"],
  })
  const score = useMemo(() => scorePassword(newPassword), [newPassword])
  const strength = STRENGTH[score]
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword

  async function onSubmit(data: FormValues) {
    const { message, error } = await changePasswordFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(message ?? "Password changed")
      form.reset()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="max-w-sm">
        <PasswordField
          label="Current password"
          control={form.control}
          name="old_password"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <PasswordField
            label="New password"
            control={form.control}
            name="new_password"
          />
          {/* Strength meter */}
          <div className="space-y-1.5" aria-live="polite">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full bg-muted transition-colors",
                    newPassword && i <= score && strength.bar
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {newPassword ? (
                <>
                  Strength:{" "}
                  <span className={cn("font-medium", strength.text)}>
                    {strength.label}
                  </span>
                </>
              ) : (
                "Use a mix of letters, numbers and symbols."
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <PasswordField
            label="Confirm new password"
            control={form.control}
            name="confirm_password"
          />
          {matches && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-success-foreground">
              <Check className="size-3.5" />
              Passwords match
            </p>
          )}
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg border bg-muted/30 p-3 sm:grid-cols-3">
        {REQUIREMENTS.map((req) => {
          const met = req.test(newPassword)
          return (
            <li
              key={req.label}
              className={cn(
                "flex items-center gap-1.5 text-xs text-muted-foreground",
                met && "text-foreground"
              )}
            >
              {met ? (
                <Check className="size-3.5 text-success-foreground" />
              ) : (
                <Circle className="size-3 text-muted-foreground/50" />
              )}
              {req.label}
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <KeyRound className="size-3.5" />
          Don't reuse a password from another site.
        </p>
        <SubmitButton
          text="Update password"
          loadingText="Updating…"
          isSubmitting={form.formState.isSubmitting}
        />
      </div>
    </form>
  )
}
