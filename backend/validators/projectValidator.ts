import { z } from 'zod';

export const packageCreationSchema = z.object({
  name: z.string().trim().min(2, 'Package name must be at least 2 characters.'),
  description: z.string().trim().min(5, 'Package description must be at least 5 characters.'),
  budget: z.number().positive('Package budget must be a positive number.'),
  timeline_start: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(z.literal('')),
  timeline_end: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(z.literal('')),
  scope: z.string().trim().min(5, 'Package scope statement is required.'),
  required_experience: z.string().trim().optional(),
  skills: z.array(z.string().uuid('Skill ID must be a valid UUID.')).optional()
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, 'Project name must be at least 3 characters.'),
  description: z.string().trim().min(10, 'Project description must be at least 10 characters.'),
  budget: z.number().positive('Project budget must be a positive number.'),
  timeline_start: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(z.literal('')),
  timeline_end: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(z.literal('')),
  property_type: z.string().trim().optional(),
  location: z.string().trim().min(2, 'Project location is required.'),
  status: z.enum(['draft', 'pending_approval', 'published', 'archived'], {
    errorMap: () => ({ message: "Status must be 'draft', 'pending_approval', 'published', or 'archived'." })
  }),
  packages: z.array(packageCreationSchema).min(1, 'A project must have at least one work package.')
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10).optional(),
  budget: z.number().positive().optional(),
  timeline_start: z.string().optional(),
  timeline_end: z.string().optional(),
  property_type: z.string().optional(),
  location: z.string().optional()
});

export const updateProjectStatusSchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'published', 'archived'])
});
