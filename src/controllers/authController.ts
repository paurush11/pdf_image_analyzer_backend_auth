import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { formatExpirationTime, isTokenExpired, getRemainingTime } from '../utils/timeUtils';
import { AuthError } from '../types/errors';

export class AuthController {
  @Timing()
  @RateLimit(5, 60000)
  async signUp(req: Request, res: Response) {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        message: 'You missed some field',
      });
    }
    try {
      await authService.signUp(email, password, name);
      return res.status(200).json({
        message: 'Successfully created',
      });
    } catch (error: unknown) {
      const authError = error as AuthError;
      res.status(authError.statusCode || 400).json({
        message: authError.message || 'Signup failed',
      });
    }
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

  @Timing()
  async verifyEmail(req: Request, res: Response) {
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
        message: authError.message || 'Email Verification failed',
      });
    }
  }

  try {
    await authService.verifyEmail(email, code);
    return res.status(200).json({
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Email Verification failed',
    });
  }

  @Timing()
  async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        message: 'Refresh token required',
      });
    }
    try {
      const result = await authService.refreshToken(refreshToken);
      return res.status(200).json({
        message: 'Token refreshed successfully',
        accessToken: result.AuthenticationResult?.AccessToken,
        idToken: result.AuthenticationResult?.IdToken,
      });
    } catch (error: unknown) {
      const authError = error as AuthError;
      res.status(authError.statusCode || 401).json({
        message: authError.message || 'Unable to refresh the token',
      });
    }
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
      message: 'Refresh token required',
    });
  }
  try {
    const result = await authService.refreshToken(refreshToken);
    return res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: result.AuthenticationResult?.AccessToken,
      idToken: result.AuthenticationResult?.IdToken,
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Unable to refresh the token',
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
      message: authError.message || 'Verification failed',
    });
  }
}

export const authController = new AuthController();

export const { signUp, verifyEmail, login, refreshToken, verifyToken } = authController;
