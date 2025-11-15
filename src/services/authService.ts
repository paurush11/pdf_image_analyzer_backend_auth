// services/authService.ts
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
import { usernameFromEmail } from '../utils/usernameUtils';

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
    phone: string;
    name?: string;
  }): Promise<SignUpCommandOutput> {
    const { email, password, givenName, phone, name } = params;

    const username = usernameFromEmail(email);
    const cmd = new SignUpCommand({
      ClientId: config.cognito.clientId,
      Username: username,
      Password: password,
      SecretHash: secretHash(username),
      UserAttributes: [
        { Name: 'email', Value: email },
        ...(name ? [{ Name: 'name', Value: name }] : []),
        { Name: 'given_name', Value: givenName },
        { Name: 'phone_number', Value: toE164(phone) },
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

  async verifyEmail(email: string, code: string): Promise<ConfirmSignUpCommandOutput> {
    const username = usernameFromEmail(email);
    const cmd = new ConfirmSignUpCommand({
      ClientId: config.cognito.clientId,
      Username: username,
      ConfirmationCode: code,
      SecretHash: secretHash(username),
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

  async login(email: string, password: string): Promise<InitiateAuthCommandOutput> {
    const cmd = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash(email),
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
    const cmd = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        USERNAME: email,
        SECRET_HASH: secretHash(email),
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

  async confirmSignup(username: string, code: string): Promise<ConfirmSignUpCommandOutput> {
    const cmd = new ConfirmSignUpCommand({
      ClientId: config.cognito.clientId,
      Username: username,
      ConfirmationCode: code,
      SecretHash: secretHash(username),
    });
    return cognitoClient.send(cmd);
  },
};
