import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config/environment';

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.cognito.region,
});

console.log('Cognito Config:', {
  region: config.cognito.region,
  userPoolId: config.cognito.userPoolId,
  clientId: config.cognito.clientId,
});

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
      console.log('Signup successful:', response);
      return response;
    } catch (error: any) {
      console.error('Cognito signup error:', error.message);
      throw error;
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
      console.log('Verification successful:', response);
      return response;
    } catch (error: any) {
      console.error('Verification error:', error.message);
      throw error;
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
      console.log('Login successful:', response);
      return response;
    } catch (error: any) {
      console.error('Cognito login error:', error.message);
      throw error;
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
      console.log('Token refersh succesfully', response);
      return response;
    } catch (error: any) {
      console.log('cognito refersh token error', error.message);
      throw error;
    }
  },
  async verifyAccessToken(token: string) {
    try {
      const payload = await jwtVerifier.verify(token);
      console.log('Token verfied suceesfully', payload);
      return payload;
    } catch (error: any) {
      console.log('Token does not verify succesfully', error.message);
      throw error;
    }
  },
};
