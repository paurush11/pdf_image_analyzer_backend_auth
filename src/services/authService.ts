import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AuthFlowType,
  type InitiateAuthCommandOutput,
  type SignUpCommandOutput,
  type ConfirmSignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { JwtPayload } from 'aws-jwt-verify/jwt-model';
import crypto from 'crypto';
import { config } from '../config/environment';

type ServiceError = { message?: string; statusCode?: number; code?: string };

function secretHash(usernameOrAlias: string): string {
  if (!config.cognito.clientSecret) {
    throw new Error('COGNITO_CLIENT_SECRET must be set to compute SECRET_HASH');
  }
  const h = crypto.createHmac('sha256', config.cognito.clientSecret);
  h.update(usernameOrAlias + config.cognito.clientId);
  return h.digest('base64');
}

function toE164(raw: string): string {
  let s = (raw || '').trim();
  s = s.replace(/[^\d+]/g, '');
  if (!s.startsWith('+') && /^\d+$/.test(s)) s = `+${s}`;
  return s;
}

const isEmailLike = (value: string | undefined | null): boolean =>
  !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.cognito.region,
});

export const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: config.cognito.userPoolId,
  tokenUse: 'access',
  clientId: config.cognito.clientId,
});

export const authService = {
  async signUp(params: {
    email: string;
    password: string;
    givenName: string;
    username: string;
    phone: string;
    name?: string;
  }): Promise<SignUpCommandOutput> {
    const { email, password, givenName, username, phone, name } = params;

    // ✅ HARD VALIDATION: username must exist and must NOT look like an email
    if (!username || !username.trim()) {
      throw {
        message: 'Username is required',
        statusCode: 400,
        code: 'USERNAME_REQUIRED',
      };
    }

    if (isEmailLike(username)) {
      throw {
        message:
          'Username cannot be of email format, since user pool is configured for email alias.',
        statusCode: 400,
        code: 'USERNAME_EMAIL_FORMAT_NOT_ALLOWED',
      };
    }

    const cognitoUsername = username.trim(); // safe to use directly

    const cmd = new SignUpCommand({
      ClientId: config.cognito.clientId,
      Username: cognitoUsername, // 👈 NEVER an email
      Password: password,
      SecretHash: secretHash(cognitoUsername),
      UserAttributes: [
        { Name: 'email', Value: email },
        ...(name ? [{ Name: 'name', Value: name }] : []),
        { Name: 'given_name', Value: givenName },
        { Name: 'phone_number', Value: toE164(phone) },
        { Name: 'preferred_username', Value: username }, // user’s handle (same as Username here)
      ],
    });

    try {
      return await cognitoClient.send(cmd);
    } catch (e) {
      const err = e as ServiceError;
      throw {
        message: err.message || 'Signup failed',
        statusCode: 400,
        code: err.code,
      };
    }
  },

  async login(identifier: string, password: string): Promise<InitiateAuthCommandOutput> {
    const cmd = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: identifier, // username OR email (alias)
        PASSWORD: password,
        SECRET_HASH: secretHash(identifier),
      },
    });
    try {
      return await cognitoClient.send(cmd);
    } catch (e) {
      const err = e as ServiceError;
      throw {
        message: err.message || 'Login failed',
        statusCode: 401,
        code: err.code,
      };
    }
  },

  async refreshToken(refreshToken: string, email: string): Promise<InitiateAuthCommandOutput> {
    const username = email; // using email alias to refresh
    const cmd = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        USERNAME: username,
        SECRET_HASH: secretHash(username),
      },
    });
    try {
      return await cognitoClient.send(cmd);
    } catch (e) {
      const err = e as ServiceError;
      throw {
        message: err.message || 'Token refresh failed',
        statusCode: 401,
        code: err.code,
      };
    }
  },

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await jwtVerifier.verify(token);
    } catch (e) {
      const err = e as ServiceError;
      throw {
        message: 'Invalid or expired token',
        statusCode: 403,
        code: err.code || 'TOKEN_INVALID',
      };
    }
  },

  async verifyEmail(params: {
    email?: string;
    username?: string;
    code: string;
  }): Promise<ConfirmSignUpCommandOutput> {
    const { email, username, code } = params;

    const identifier = (username ?? email)?.trim();
    if (!identifier) {
      throw {
        message: 'Email or username is required',
        statusCode: 400,
        code: 'MISSING_IDENTIFIER',
      };
    }

    const cmd = new ConfirmSignUpCommand({
      ClientId: config.cognito.clientId,
      Username: identifier, // 👈 now matches what you used at signup
      ConfirmationCode: code,
      SecretHash: secretHash(identifier),
    });

    try {
      return await cognitoClient.send(cmd);
    } catch (e) {
      const err = e as ServiceError;
      throw {
        message: err.message || 'Verification failed',
        statusCode: 400,
        code: err.code,
      };
    }
  },
};
