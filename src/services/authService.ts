import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AuthFlowType,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminInitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config/environment';

// Debug: Check if credentials are loaded
console.log('🔑 AWS Credentials Check:');
console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Loaded' : '❌ Missing');
console.log('Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Loaded' : '❌ Missing');
console.log('Region:', process.env.AWS_REGION || config.cognito.region);

export const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: config.cognito.userPoolId,
  tokenUse: 'access',
  clientId: config.cognito.clientId,
});

export const authService = {
  async signUp(email: string, password: string, name: string) {
    const command = new SignUpCommand({
      ClientId: config.cognito.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
    });

    try {
      const response = await cognitoClient.send(command);
      return response;
    } catch (error: unknown) {
      const err = error as any;
      throw {
        message: err.message || 'Signup failed',
        statusCode: 400,
        code: err.code,
      };
    }
  },

  async verifyEmail(email: string, code: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: config.cognito.clientId,
      Username: email,
      ConfirmationCode: code,
    });

    try {
      const response = await cognitoClient.send(command);
      return response;
    } catch (error: unknown) {
      const err = error as any;
      throw {
        message: err.message || 'Verification failed',
        statusCode: 400,
        code: err.code,
      };
    }
  },

  async login(email: string, password: string) {
    const command = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    try {
      const response = await cognitoClient.send(command);
      return response;
    } catch (error: unknown) {
      const err = error as any;
      throw {
        message: err.message || 'Login failed',
        statusCode: 401,
        code: err.code,
      };
    }
  },

  async refreshToken(refreshToken: string) {
    const command = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    try {
      const response = await cognitoClient.send(command);
      return response;
    } catch (error: unknown) {
      const err = error as any;
      throw {
        message: err.message || 'Token refresh failed',
        statusCode: 401,
        code: err.code,
      };
    }
  },

  async verifyAccessToken(token: string) {
    try {
      const payload = await jwtVerifier.verify(token);
      return payload;
    } catch (error: unknown) {
      const err = error as any;
      throw {
        message: 'Invalid or expired token',
        statusCode: 403,
        code: err.code || 'TOKEN_INVALID',
      };
    }
  },
};
