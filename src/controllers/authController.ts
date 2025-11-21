// controllers/authController.ts
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { formatExpirationTime, isTokenExpired, getRemainingTime } from '../utils/timeUtils';

type AuthErrorShape = { message?: string; statusCode?: number; code?: string };

const toHttpError = (e: unknown, fallbackMsg: string, fallbackCode = 400) => {
  const err = e as AuthErrorShape;
  console.error(err);
  console.error(fallbackMsg);
  console.error(fallbackCode);
  return {
    status: err?.statusCode ?? fallbackCode,
    message: err?.message ?? fallbackMsg,
  };
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password, givenName, phone, name, username } = req.body as {
    email?: string;
    password?: string;
    givenName?: string;
    username?: string;
    phone?: string;
    name?: string;
  };

  if (!email || !username) {
    return res.status(400).json({ message: 'Email and username are required' });
  }
  if (!password || !givenName || !phone) {
    return res.status(400).json({
      message: 'Missing required fields: password, givenName, phone',
    });
  }

  try {
    await authService.signUp({ email, password, givenName, username, phone, name });
    return res.status(200).json({
      message: 'Successfully created. Please verify your email with the code sent.',
    });
  } catch (e) {
    const { status, message } = toHttpError(e, 'Signup failed');
    console.error(e);
    return res.status(status).json({ message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, username, code } = req.body as {
    email?: string;
    username?: string;
    code?: string;
  };

  if (!code || (!email && !username)) {
    return res
      .status(400)
      .json({ message: 'Email or username and verification code are required' });
  }

  try {
    await authService.verifyEmail({ email, username, code });
    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (e) {
    console.error(e);
    const { status, message } = toHttpError(e, 'Email verification failed');
    return res.status(status).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  if (!username && !email) {
    return res.status(400).json({ message: 'Username or email are required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const identifier = username ?? email!; // safe because we checked above

  try {
    const result = await authService.login(identifier, password);
    return res.status(200).json({
      message: 'Login successful',
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
      refreshToken: result.AuthenticationResult?.RefreshToken,
      tokenType: result.AuthenticationResult?.TokenType,
      expiresIn: result.AuthenticationResult?.ExpiresIn,
    });
  } catch (e) {
    const { status, message } = toHttpError(e, 'Login failed', 401);
    return res.status(status).json({ message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  // With secret-hash clients, include the same USERNAME used at login (email)
  const { refreshToken, email } = req.body as { refreshToken?: string; email?: string };
  if (!refreshToken || !email) {
    return res.status(400).json({ message: 'Refresh token and email are required' });
  }
  try {
    const result = await authService.refreshToken(refreshToken, email);
    return res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
      tokenType: result.AuthenticationResult?.TokenType,
      expiresIn: result.AuthenticationResult?.ExpiresIn,
    });
  } catch (e) {
    const { status, message } = toHttpError(e, 'Unable to refresh the token', 401);
    return res.status(status).json({ message });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  try {
    const payload = await authService.verifyAccessToken(token);
    return res.status(200).json({
      message: 'Token is valid',
      valid: true,
      userId: (payload as any).sub,
      userName: (payload as any).username ?? (payload as any)['cognito:username'],
      expiresAt: (payload as any).exp,
      expiresAtFormatted: formatExpirationTime((payload as any).exp),
      isExpired: isTokenExpired((payload as any).exp),
      remainingSeconds: getRemainingTime((payload as any).exp),
    });
  } catch (e) {
    const { status, message } = toHttpError(e, 'Verification failed', 403);
    return res.status(status).json({ message, valid: false });
  }
};
