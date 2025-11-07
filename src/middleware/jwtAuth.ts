import { Request, Response, NextFunction } from 'express';
import { jwtVerifier } from '../services/authService';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'No token received',
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = await jwtVerifier.verify(token);

    res.locals.user = payload;

    return next();
  } catch (error: any) {
    return res.status(403).json({
      message: 'Token is not valid',
    });
  }
};
