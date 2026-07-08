import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createApiResponse } from '../utils/apiResponse';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';
  
  if (err instanceof ZodError) {
    // Map Zod validation errors
    const validationErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));
    
    res.status(400).json(
      createApiResponse(false, 'Validation failed.', {}, validationErrors)
    );
    return;
  }

  // Handle generic and custom errors
  const errors = err.errors || (process.env.NODE_ENV === 'development' ? err.stack : null);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json(
    createApiResponse(false, message, {}, errors)
  );
};
