import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }
  if (req.file.size > 5 * 1024 * 1024) {
    throw new AppError('File size is too large', 400);
  }
  // Check file type (already handled by multer)

  next();
};

export const validateJobId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // Check if ID is valid format
  // For now, just check if it exists

  if (!id) {
    throw new AppError('Job ID is required', 400);
  }

  next();
};
