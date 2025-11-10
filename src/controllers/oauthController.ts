import { Request, Response } from 'express';
import { oauthService } from '../services/oauthService';
import { AuthError } from '../types/errors';
import { authService } from '../services/authService';

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
      return res.status(400).json({
        message: 'Authorization code is missing or invalid.',
      });
    }

    const userInfo = await oauthService.exchangeCodeForTokens(code as string);

    const cognitoTokens = await authService.createOrFindOAuthUser(
      userInfo.email,
      userInfo.name,
      'google'
    );

    res.json({
      message: 'Google OAuth successful!',
      accessToken: cognitoTokens.AccessToken,
      idToken: cognitoTokens.IdToken,
      refreshToken: cognitoTokens.RefreshToken,
      provider: 'google',
      user: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Google OAuth callback failed',
    });
  }
};

export const initiateGitHubAuth = async (req: Request, res: Response) => {
  try {
    const authurl = oauthService.getGitHubAuthUrl();
    res.redirect(authurl);
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'Unable to initate github auth',
    });
  }
};

export const handleGitHubCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || Array.isArray(code)) {
      return res.status(400).json({
        message: 'Authorization code is missing or invalid.',
      });
    }

    const userInfo = await oauthService.exchangeGitHubCode(code as string);

    const cognitoTokens = await authService.createOrFindOAuthUser(
      userInfo.email,
      userInfo.name,
      'github'
    );

    res.json({
      message: 'GitHub OAuth successful!',
      accessToken: cognitoTokens.AccessToken,
      idToken: cognitoTokens.IdToken,
      refreshToken: cognitoTokens.RefreshToken,
      provider: 'github',
      user: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    });
  } catch (error: unknown) {
    const authError = error as AuthError;
    res.status(authError.statusCode || 400).json({
      message: authError.message || 'GitHub OAuth callback failed',
    });
  }
};
