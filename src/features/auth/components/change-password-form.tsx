import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import z from "zod"
import { ChangePasswordSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldGroup } from "@/components/ui/field"
import { TextField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { changePasswordFn } from "../services"
import { toast } from "sonner"

export function ChangePasswordForm() {
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
  })
  async function onSubmit(data: z.infer<typeof ChangePasswordSchema>) {
    console.log("Change Password Form", data)
    const { message, error } = await changePasswordFn({ data })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <TextField
              label="Current Password"
              control={form.control}
              name="old_password"
            />
            <TextField
              label="New Password"
              control={form.control}
              name="new_password"
            />
            <TextField
              label="Confirm Password"
              control={form.control}
              name="confirm_password"
            />
          </FieldGroup>
          <Field className="flex mt-5 justify-end" orientation={'horizontal'}>
            <SubmitButton isSubmitting={form.formState.isSubmitting} />
          </Field>
        </form>
      </CardContent>
    </Card>
  )
}
