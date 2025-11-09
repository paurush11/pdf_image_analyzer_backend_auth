import { Request, Response } from 'express';
import { oauthService } from '../services/oauthService';
import { AuthError } from '../types/errors';

export const initiateGoogleAuth = async (req: Request, res: Response) => {
  try {
    const authUrl = oauthService.getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Unable to initate google auth',
    });
  }
};
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || Array.isArray(code)) {
      return res.status(400).json({ message: 'Authorization code is missing or invalid.' });
    }
    const userInfo = await oauthService.exchangeCodeForTokens(code as string);
    res.json({
      message: 'OAuth successful!',
      userInfo,
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'OAuth callback failed',
    });
  }
};
