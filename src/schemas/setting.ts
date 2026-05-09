import z from "zod";

export const SettingCreateSchema = z.object({
  key: z.string(),
  value: z.unknown(),
  value_type: z.enum(["int", "bool", "float", "string", "json"]),
});

export const SettingUpdateSchema = z.object({
  id: z.number(),
  ...SettingCreateSchema.partial().shape,
});

export type SettingCreateSchemaType = z.infer<typeof SettingCreateSchema>;

export type SettingUpdateSchemaType = z.infer<typeof SettingUpdateSchema>;
