import z from "zod";

export const LoginSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z.string("Required").min(1, "Required").trim(),
});

export type LoginSchemaType = z.infer<typeof LoginSchema>;
