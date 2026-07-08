import { z } from 'zod';

export const updateContractorProfileSchema = z.object({
  business_name: z.string().trim().min(2, 'Business name must be at least 2 characters.').optional(),
  website: z.string().trim().url('Invalid website URL format.').optional().or(z.literal('')),
  address: z.string().trim().optional(),
  preferences: z.object({
    location: z.string().trim().optional(),
    budgetMin: z.number().nonnegative().optional(),
    budgetMax: z.number().nonnegative().optional(),
  }).optional()
});

const contractorDocSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  url: z.string().url('Document URL must be valid.'),
  type: z.string().min(1, 'Document file type is required.')
});

export const submitContractorVerificationSchema = z.object({
  pan_no: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be a valid 10-character PAN.'),
  aadhaar_no: z.string().trim().regex(/^[0-9]{12}$/, 'Invalid Aadhaar format. Must be exactly 12 digits.'),
  business_reg_no: z.string().trim().min(1, 'Business registration number / license ID is required.'),
  documents: z.array(contractorDocSchema).min(1, 'At least one registration / verification document must be uploaded.')
});

export const syncSkillsSchema = z.object({
  skills: z.array(z.string().uuid('Skill ID must be a valid UUID.'))
});

export const syncCategoriesSchema = z.object({
  categories: z.array(z.string().uuid('Category ID must be a valid UUID.'))
});
