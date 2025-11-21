import { z } from 'zod';

export const SignupRequest = z.object({
  email: z.email(), // REQUIRED
  username: z.string(), // REQUIRED
  password: z.string().min(6),
  givenName: z.string().min(1),
  phone: z.string().min(7),
  name: z.string().optional(),
});

export const MessageResponse = z.object({
  message: z.string(),
});

export const ErrorResponse = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export const VerifyEmailRequest = z
  .object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    code: z.string().min(1),
  })
  .refine(d => d.email || d.username, {
    message: 'Email or username is required',
    path: ['email'],
  });

// EITHER username OR email + password
export const LoginRequest = z
  .object({
    username: z.string().optional(),
    email: z.email().optional(),
    password: z.string().min(6),
  })
  .refine(data => data.username || data.email, {
    message: 'Either username or email must be provided',
    path: ['username'],
  });

export const LoginResponse = z.object({
  message: z.string(),
  accessToken: z.string().optional(),
  idToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenType: z.string().optional(),
  expiresIn: z.number().optional(),
});

export const RefreshTokenRequest = z.object({
  refreshToken: z.string(),
  email: z.email(), // canonical username
});

export const RefreshTokenResponse = z.object({
  message: z.string(),
  accessToken: z.string().optional(),
  idToken: z.string().optional(),
  tokenType: z.string().optional(),
  expiresIn: z.number().optional(),
});

export const VerifyTokenRequest = z.object({
  token: z.string(),
});

export const VerifyTokenResponse = z.object({
  message: z.string(),
  valid: z.boolean(),
  userId: z.string().optional(),
  userName: z.string().optional(),
  expiresAt: z.number().optional(),
  expiresAtFormatted: z.string().optional(),
  isExpired: z.boolean().optional(),
  remainingSeconds: z.number().optional(),
});

export type TSignupRequest = z.infer<typeof SignupRequest>;
export type TLoginRequest = z.infer<typeof LoginRequest>;
export type TOAuthTokenResponse = z.infer<typeof OAuthTokenResponse>;
