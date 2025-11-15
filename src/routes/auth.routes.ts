// src/routes/auth.routes.ts
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
} from '../schemas/auth';
import { addRoute } from '../openapi/route';
import { authenticateToken } from '../middleware/jwtAuth';

type AuthedLocals = { user?: { sub: string; username: string; exp: number } };
const router = Router();

// Express: '/protected' | OpenAPI: '/auth/protected'
addRoute(router, {
  method: 'get',
  path: '/protected',
  openapiPath: '/auth/protected',
  tags: ['Auth'],
  summary: 'Protected route (requires Bearer token)',
  responses: { 200: MessageResponse, 403: ErrorResponse },
  handler: [
    authenticateToken,
    (req: Request, res: Response<any, AuthedLocals>) => {
      const user = res.locals.user;
      res.json({ message: "You're authenticated!", userId: user?.sub });
    },
  ],
});

addRoute(router, {
  method: 'post',
  path: '/signup',
  openapiPath: '/auth/signup',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: SignupRequest },
  responses: { 200: MessageResponse, 400: ErrorResponse, 409: ErrorResponse },
  handler: ctrl.signUp,
});

addRoute(router, {
  method: 'post',
  path: '/verify',
  openapiPath: '/auth/verify',
  tags: ['Auth'],
  summary: 'Confirm email with code',
  request: { body: VerifyEmailRequest },
  responses: { 200: MessageResponse, 400: ErrorResponse },
  handler: ctrl.verifyEmail,
});

addRoute(router, {
  method: 'post',
  path: '/login',
  openapiPath: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email & password',
  request: { body: LoginRequest },
  responses: { 200: LoginResponse, 401: ErrorResponse, 400: ErrorResponse },
  handler: ctrl.login,
});

addRoute(router, {
  method: 'post',
  path: '/refresh',
  openapiPath: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: { body: RefreshTokenRequest },
  responses: { 200: RefreshTokenResponse, 401: ErrorResponse, 400: ErrorResponse },
  handler: ctrl.refreshToken,
});

addRoute(router, {
  method: 'post',
  path: '/verify-token',
  openapiPath: '/auth/verify-token',
  tags: ['Auth'],
  summary: 'Verify an access token',
  request: { body: VerifyTokenRequest },
  responses: { 200: VerifyTokenResponse, 403: ErrorResponse, 400: ErrorResponse },
  handler: ctrl.verifyToken,
});

export default router;
