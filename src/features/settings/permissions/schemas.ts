import z from "zod";
import { IDSchema } from "@/schemas";

export const RoleCreateSchema = z.object({
  name: z.string("Name is required").min(1, "Name is required"),
  description: z.string().optional().nullable(),
});

export const RoleUpdateSchema = z.object({
  id: z.number(),
  ...RoleCreateSchema.partial().shape,
});

export const AssignPermissionsToRoleSchema = z.object({
  roleId: IDSchema,
  permissions: z.array(z.string()),
});

export type AssignPermissionsToRoleSchemaType = z.infer<typeof AssignPermissionsToRoleSchema>;

export type RoleCreateSchemaType = z.infer<typeof RoleCreateSchema>;

export type RoleUpdateSchemaType = z.infer<typeof RoleUpdateSchema>;
