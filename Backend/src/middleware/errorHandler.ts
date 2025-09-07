import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: number;
}

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.status = 'fail';
  return error;
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.status = 'fail';
  return error;
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  error.status = 'fail';
  return error;
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleZodError = (err: ZodError): AppError => {
  const errors = err.errors.map((error) => ({
    field: error.path.join('.'),
    message: error.message,
  }));
  
  return new AppError('Validation failed', 400, { errors });
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    // Handle bcrypt errors
    if (error.message.includes('Illegal arguments') || error.message.includes('data and hash arguments required')) {
      error.message = 'Invalid password format';
      error.statusCode = 400;
      error.status = 'fail';
      return sendErrorProd(error, res);
    }

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error instanceof ZodError) error = handleZodError(error);

    sendErrorProd(error, res);
  }
};

interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  details?: ErrorDetail[] | Record<string, unknown>;

  constructor(message: string, statusCode: number, details?: ErrorDetail[] | Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
