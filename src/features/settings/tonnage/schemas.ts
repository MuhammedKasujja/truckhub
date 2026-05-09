import z from "zod";

export const TonnageCreateSchema = z.object({
  tonnage: z.string(),
  tonnage_min: z.number(),
  tonnage_max: z.number(),
});

export const TonnageUpdateSchema = z.object({
  id: z.number(),
  ...TonnageCreateSchema.partial().shape,
});

export type TonnageCreateSchemaType = z.infer<typeof TonnageCreateSchema>;

export type TonnageUpdateSchemaType = z.infer<typeof TonnageUpdateSchema>;
