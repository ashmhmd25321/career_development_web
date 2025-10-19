import { Request, Response } from 'express';
import { createError } from './errorHandler';

export const notFound = (req: Request, res: Response): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  res.status(404).json({
    success: false,
    error: {
      message: error.message,
      path: req.originalUrl,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
};
