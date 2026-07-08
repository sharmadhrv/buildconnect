import { z } from 'zod';

export const updateBuilderProfileSchema = z.object({
  company_name: z.string().trim().min(2, 'Company name must be at least 2 characters.').optional(),
  company_reg_no: z.string().trim().optional(),
  gst_no: z.string().trim().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format. Must be a valid Indian GSTIN.').optional().or(z.literal('')),
  pan_no: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be a valid 10-character PAN.').optional().or(z.literal('')),
  website: z.string().trim().url('Invalid website URL format.').optional().or(z.literal('')),
  logo_url: z.string().trim().url('Invalid logo URL format.').optional().or(z.literal('')),
  address: z.string().trim().optional()
});

export const verificationDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  url: z.string().url('Document URL must be valid.'),
  type: z.string().min(1, 'Document file type is required.')
});

export const submitBuilderVerificationSchema = z.object({
  company_reg_no: z.string().trim().min(1, 'Company registration number is required.'),
  gst_no: z.string().trim().min(15, 'GSTIN is required for company verification.'),
  pan_no: z.string().trim().length(10, 'PAN is required for company verification.'),
  documents: z.array(verificationDocumentSchema).min(1, 'At least one registration / verification document must be uploaded.')
});

export const uploadFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required.'),
  fileType: z.string().min(1, 'File type is required.'),
  fileData: z.string().min(1, 'Base64 file data is required.')
});
