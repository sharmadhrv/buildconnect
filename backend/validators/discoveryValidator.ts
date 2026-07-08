import { z } from 'zod';

const costBreakdownItemSchema = z.object({
  item: z.string().trim().min(2, 'Item name/description must be at least 2 characters.'),
  quantity: z.number().positive('Quantity must be positive.'),
  unit: z.string().trim().min(1, 'Unit (e.g. Kg, SqFt) is required.'),
  rate: z.number().positive('Unit rate must be positive.'),
  total: z.number().positive('Subtotal must be positive.')
});

export const submitQuotationSchema = z.object({
  proposed_budget: z.number().positive('Proposed budget must be positive.'),
  proposed_timeline_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format.'),
  proposed_timeline_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format.'),
  proposal_notes: z.string().trim().optional(),
  breakdown: z.array(costBreakdownItemSchema).min(1, 'At least one item breakdown must be provided.')
});
