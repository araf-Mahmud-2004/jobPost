import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './errorHandler';

/**
 * Validates the request body, query, or params against a Zod schema
 * @param schema - Zod schema to validate against
 * @param type - The part of the request to validate ('body', 'query', or 'params')
 */
export const validateRequest = (schema: AnyZodObject, type: 'body' | 'query' | 'params' = 'body') => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request part against the schema
      const validatedData = await schema.safeParseAsync(req[type]);
      
      if (!validatedData.success) {
        // Format Zod errors into a more readable format
        const errors = validatedData.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return next(new AppError('Validation failed', 400, { errors }));
      }
      
      // Replace the request part with validated data
      req[type] = validatedData.data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return next(new AppError('Validation failed', 400, { errors }));
      }
      next(error);
    }
  };

/**
 * Middleware to validate request body
 * @param schema - Zod schema for request body
 */
export const validateBody = (schema: AnyZodObject) => validateRequest(schema, 'body');

/**
 * Middleware to validate query parameters
 * @param schema - Zod schema for query parameters
 */
export const validateQuery = (schema: AnyZodObject) => validateRequest(schema, 'query');

/**
 * Middleware to validate route parameters
 * @param schema - Zod schema for route parameters
 */
export const validateParams = (schema: AnyZodObject) => validateRequest(schema, 'params');
