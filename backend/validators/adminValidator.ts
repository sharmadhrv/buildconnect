import { z } from 'zod';

export const reviewVerificationSchema = z.object({
  entityType: z.enum(['builder', 'contractor'], {
    errorMap: () => ({ message: "Entity type must be either 'builder' or 'contractor'." })
  }),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: "Review action must be either 'approve' or 'reject'." })
  }),
  remarks: z.string().trim().optional()
});

export const suspendUserSchema = z.object({
  suspend: z.boolean({
    required_error: "suspend flag is required."
  })
});
