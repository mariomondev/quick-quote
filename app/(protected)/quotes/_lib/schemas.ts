import { z } from "zod";

export const MAX_LINE_ITEMS = 10;

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Price must be positive"), // in cents
  total: z.number(), // computed: quantity * unitPrice
});

export const quoteFormSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  job_description: z.string().min(1, "Job description is required"),
  line_items: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required")
    .max(MAX_LINE_ITEMS, `Maximum ${MAX_LINE_ITEMS} line items allowed`),
  status: z.enum(["draft", "sent", "paid"]),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
export type LineItemValues = z.infer<typeof lineItemSchema>;
