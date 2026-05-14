import { Request, Response, NextFunction } from 'express';
import { env } from '@/config/env';
import { AppError } from '@/utils/AppError';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== env.API_KEY) {
    return next(new AppError('Unauthorized — invalid or missing API key', 401));
  }
  next();
}
