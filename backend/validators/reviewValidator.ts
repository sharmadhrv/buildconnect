import { z } from 'zod';

const scoreRangeSchema = z.number().min(1, 'Rating must be at least 1.').max(5, 'Rating cannot exceed 5.');

export const submitReviewValidatorSchema = z.object({
  rating: scoreRangeSchema,
  feedback: z.string().trim().min(2, 'Written feedback comment is required.'),
  ratings_breakdown: z.object({
    quality: scoreRangeSchema,
    communication: scoreRangeSchema,
    timeliness: scoreRangeSchema,
    professionalism: scoreRangeSchema,
    safety: scoreRangeSchema
  })
});
