import { Request, Response, NextFunction } from 'express';
import { jwtVerifier } from '../services/authService';
import { AuthError } from '../types/errors';

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      message: 'No token provided',
      code: 'NO_TOKEN',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await jwtVerifier.verify(token);
    res.locals.user = payload;
    next();
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(403).json({
      message: authError.message || 'Invalid token',
      code: authError.code || 'INVALID_TOKEN',
    });
  }
}
