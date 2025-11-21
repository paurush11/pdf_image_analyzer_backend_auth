import { Router, Request, Response } from 'express';
import * as ctrl from '../controllers/authController';
import {
  SignupRequest,
  MessageResponse,
  ErrorResponse,
  VerifyEmailRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  VerifyTokenRequest,
  VerifyTokenResponse,
  OAuthTokenResponse,
} from '../schemas/auth';
import { addRoute } from '../openapi/route';
import { authenticateToken } from '../middleware/jwtAuth';

type AuthedLocals = { user?: { sub: string; username: string; exp: number } };

const router = Router();

/**
 * Protected route example
 * Express path:    /protected
 * OpenAPI path:    /auth/protected
 */
addRoute(router, {
  method: 'get',
  path: '/protected',
  openapiPath: '/auth/protected',
  tags: ['Auth'],
  summary: 'Protected route (requires Bearer token)',
  responses: {
    200: MessageResponse,
    401: ErrorResponse,
    403: ErrorResponse,
  },
  handler: [
    authenticateToken,
    (req: Request, res: Response<any, AuthedLocals>) => {
      const user = res.locals.user;
      res.json({ message: "You're authenticated!", userId: user?.sub });
    },
  ],
});

/**
 * Sign up
 * Requires: email, username, password, givenName, phone
 */
addRoute(router, {
  method: 'post',
  path: '/signup',
  openapiPath: '/auth/signup',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: SignupRequest },
  responses: {
    200: MessageResponse,
    400: ErrorResponse,
    409: ErrorResponse,
  },
  handler: ctrl.signUp,
});

/**
 * Verify email with code
 */
addRoute(router, {
  method: 'post',
  path: '/verify',
  openapiPath: '/auth/verify',
  tags: ['Auth'],
  summary: 'Confirm email with verification code',
  request: { body: VerifyEmailRequest },
  responses: {
    200: MessageResponse,
    400: ErrorResponse,
  },
  handler: ctrl.verifyEmail,
});

/**
 * Login
 * Accepts: either username OR email + password
 */
addRoute(router, {
  method: 'post',
  path: '/login',
  openapiPath: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with username or email and password',
  request: { body: LoginRequest },
  responses: {
    200: LoginResponse,
    400: ErrorResponse,
    401: ErrorResponse,
  },
  handler: ctrl.login,
});

/**
 * Refresh access token
 * Requires: refreshToken + email (the Cognito username you used)
 */
addRoute(router, {
  method: 'post',
  path: '/refresh',
  openapiPath: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token using refresh token',
  request: { body: RefreshTokenRequest },
  responses: {
    200: RefreshTokenResponse,
    400: ErrorResponse,
    401: ErrorResponse,
  },
  handler: ctrl.refreshToken,
});

/**
 * Verify an access token
 */
addRoute(router, {
  method: 'post',
  path: '/verify-token',
  openapiPath: '/auth/verify-token',
  tags: ['Auth'],
  summary: 'Verify an access token',
  request: { body: VerifyTokenRequest },
  responses: {
    200: VerifyTokenResponse,
    400: ErrorResponse,
    403: ErrorResponse,
  },
  handler: ctrl.verifyToken,
});

addRoute(router, {
  method: 'get',
  path: '/google',
  openapiPath: '/auth/google',
  tags: ['OAuth'],
  summary: 'Initiate Google OAuth login',
  responses: { 500: ErrorResponse },
  handler: ctrl.googleAuth,
});

addRoute(router, {
  method: 'get',
  path: '/google/callback',
  openapiPath: '/auth/google/callback',
  tags: ['OAuth'],
  summary: 'Google OAuth callback',
  responses: { 200: OAuthTokenResponse, 400: ErrorResponse, 500: ErrorResponse },
  handler: ctrl.googleCallback,
});

export default router;
