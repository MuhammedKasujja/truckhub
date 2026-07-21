import z from "zod";
import { IDSchema } from "@/schemas";

export const TonnageCreateSchema = z.object({
  tonnage: z.string(),
  tonnage_min: z.number(),
  tonnage_max: z.number(),
});

export const TonnageUpdateSchema = z.object({
  id: IDSchema,
  ...TonnageCreateSchema.partial().shape,
});

export type TonnageCreateSchemaType = z.infer<typeof TonnageCreateSchema>;

export type TonnageUpdateSchemaType = z.infer<typeof TonnageUpdateSchema>;
