import z from "zod";

export const EditSettingsSchema = z.object({
  search_radius: z.number(),
  counter_padding: z.number().optional(),
  invoice_terms: z.array(z.string()).optional().nullable(),
  quotation_terms: z.array(z.string()).optional().nullable(),
});

export type Settings = z.infer<typeof EditSettingsSchema>;

export type EditSettingsSchemaType = z.infer<typeof EditSettingsSchema>;
