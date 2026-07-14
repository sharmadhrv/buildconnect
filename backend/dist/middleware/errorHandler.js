"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred.';
    if (err instanceof zod_1.ZodError) {
        // Map Zod validation errors
        const validationErrors = err.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message
        }));
        res.status(400).json((0, apiResponse_1.createApiResponse)(false, 'Validation failed.', {}, validationErrors));
        return;
    }
    // Handle generic and custom errors
    const errors = err.errors || (process.env.NODE_ENV === 'development' ? err.stack : null);
    if (process.env.NODE_ENV === 'development') {
        console.error(`[Error] ${req.method} ${req.url}:`, err);
    }
    res.status(statusCode).json((0, apiResponse_1.createApiResponse)(false, message, {}, errors));
};
exports.errorHandler = errorHandler;
