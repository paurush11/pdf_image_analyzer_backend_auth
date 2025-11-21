import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { formatExpirationTime, isTokenExpired, getRemainingTime } from '../utils/timeUtils';
import { config } from '../config/environment';
import * as oauthService from '../services/oauthService';

type AuthErrorShape = { message?: string; statusCode?: number; code?: string };

const toHttpError = (e: unknown, fallbackMsg: string, fallbackCode = 400) => {
  const err = e as AuthErrorShape;
  return {
    status: err?.statusCode ?? fallbackCode,
    message: err?.message ?? fallbackMsg,
  };
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password, givenName, phone, name } = req.body as {
    email?: string;
    password?: string;
    givenName?: string;
    phone?: string;
    name?: string;
  };

  if (!email || !password || !givenName || !phone) {
    return res.status(400).json({
      message: 'Missing required fields: email, password, givenName, phone',
    });
  }

  try {
    await authService.signUp({ email, password, givenName, phone, name });
    return res.status(200).json({
      message: 'Successfully created. Please verify your email with the code sent.',
    });
  } catch (e) {
    const { status, message } = toHttpError(e, 'Signup failed');
    return res.status(status).json({ message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }
  try {
    await authService.verifyEmail(email, code);
    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (e) {
    const { status, message } = toHttpError(e, 'Email verification failed');
    return res.status(status).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const result = await authService.login(email, password);
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

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const authUrl = oauthService.buildGoogleAuthUrl();
    return res.redirect(authUrl);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to initiate Google authentication' });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  const { code, error, error_description } = req.query as {
    code?: string;
    error?: string;
    error_description?: string;
  };

  if (error) {
    return res.status(400).json({
      message: 'OAuth authentication failed',
      error,
      error_description,
    });
  }

  if (!code) {
    return res.status(400).json({ message: 'Authorization code is required' });
  }

  try {
    const tokenData = await oauthService.exchangeCodeForTokens(code, config.google.redirectUri);
    const userInfo = await oauthService.getUserInfo(tokenData.access_token);

    return res.status(200).json({
      message: 'Google login successful',
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      user: {
        sub: userInfo.sub,
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
        givenName: userInfo.given_name,
        name: userInfo.given_name || userInfo.preferred_username,
        username: userInfo.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to complete Google authentication',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
