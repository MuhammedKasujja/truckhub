import z from "zod"

export const LoginSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z.string("Required").min(1, "Required").trim(),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string("Required").min(1, "Required").trim(),
})

export type LoginSchemaType = z.infer<typeof LoginSchema>

export const ChangePasswordSchema = z.object({
  old_password: z.string("Required").min(2, "Required").trim(),
  new_password: z.string("Required").min(4, "Min 4").trim(),
  confirm_password: z.string("Required").min(4, "Min 4").trim(),
})

export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>
