import { z } from 'zod';

export const proposeCounterSchema = z.object({
  budget: z.number().positive('Counter budget must be positive.'),
  notes: z.string().trim().min(2, 'Counter-offer note must describe changes requested.')
});

export const respondCounterSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: "Decision action must be either 'accept' or 'reject'." })
  })
});
