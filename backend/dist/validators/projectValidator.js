"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectStatusSchema = exports.updateProjectSchema = exports.createProjectSchema = exports.packageCreationSchema = void 0;
const zod_1 = require("zod");
exports.packageCreationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Package name must be at least 2 characters.'),
    description: zod_1.z.string().trim().min(5, 'Package description must be at least 5 characters.'),
    budget: zod_1.z.number().positive('Package budget must be a positive number.'),
    timeline_start: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(zod_1.z.literal('')),
    timeline_end: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(zod_1.z.literal('')),
    scope: zod_1.z.string().trim().min(5, 'Package scope statement is required.'),
    required_experience: zod_1.z.string().trim().optional(),
    skills: zod_1.z.array(zod_1.z.string().uuid('Skill ID must be a valid UUID.')).optional()
});
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(3, 'Project name must be at least 3 characters.'),
    description: zod_1.z.string().trim().min(10, 'Project description must be at least 10 characters.'),
    budget: zod_1.z.number().positive('Project budget must be a positive number.'),
    timeline_start: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(zod_1.z.literal('')),
    timeline_end: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).or(zod_1.z.literal('')),
    property_type: zod_1.z.string().trim().optional(),
    location: zod_1.z.string().trim().min(2, 'Project location is required.'),
    status: zod_1.z.enum(['draft', 'pending_approval', 'published', 'archived'], {
        errorMap: () => ({ message: "Status must be 'draft', 'pending_approval', 'published', or 'archived'." })
    }),
    packages: zod_1.z.array(exports.packageCreationSchema).min(1, 'A project must have at least one work package.')
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(3).optional(),
    description: zod_1.z.string().trim().min(10).optional(),
    budget: zod_1.z.number().positive().optional(),
    timeline_start: zod_1.z.string().optional(),
    timeline_end: zod_1.z.string().optional(),
    property_type: zod_1.z.string().optional(),
    location: zod_1.z.string().optional()
});
exports.updateProjectStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'pending_approval', 'published', 'archived'])
});
