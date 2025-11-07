import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { formatExpirationTime, isTokenExpired, getRemainingTime } from '../utils/timeUtils';
import { AuthError } from '../types/errors';

export const signUp = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      message: 'You missed some field',
    });
  }
  try {
    await authService.signUp(email, password, name);
    return res.status(200).json({
      message: ' Succesfully created',
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Signup failed',
    });
  }
};
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: 'Email and verification code required',
    });
  }

  try {
    await authService.verifyEmail(email, code);
    return res.status(200).json({
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Email Verifcation failed',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'email or password maybe wrong !!',
    });
  }
  try {
    const result = await authService.login(email, password);
    return res.status(200).json({
      message: 'Login successful',
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
      refreshToken: result.AuthenticationResult?.RefreshToken,
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Login failed',
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({
      message: 'Rfersh token required',
    });
  }
  try {
    const result = await authService.refreshToken(refreshToken);
    return res.status(200).json({
      message: 'Token refreshed succesfully',
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Not able to  refresh the token',
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      message: 'Token verification failed',
    });
  }
  try {
    const result = await authService.verifyAccessToken(token);
    return res.status(200).json({
      message: 'Token is valid',
      valid: true,
      userId: result.sub,
      userName: result.username,
      expiresAt: result.exp,
      expiresAtFormatted: formatExpirationTime(result.exp),
      isExpired: isTokenExpired(result.exp),
      remainingSeconds: getRemainingTime(result.exp),
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Verfication failed',
    });
  }
};
