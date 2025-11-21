import { z } from 'zod';

export const SignupRequest = z.object({
  email: z.string().email(),
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

export const VerifyEmailRequest = z.object({
  email: z.string().email(),
  code: z.string().min(1),
});

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
  email: z.string().email(),
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

export const OAuthTokenResponse = z.object({
  message: z.string(),
  accessToken: z.string(),
  idToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
  expiresIn: z.number(),
  user: z
    .object({
      sub: z.string(),
      email: z.string().email(),
      emailVerified: z.boolean(),
      givenName: z.string().optional(),
    })
    .optional(),
});

export type TSignupRequest = z.infer<typeof SignupRequest>;
export type TLoginRequest = z.infer<typeof LoginRequest>;
export type TOAuthTokenResponse = z.infer<typeof OAuthTokenResponse>;
