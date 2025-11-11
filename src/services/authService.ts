// services/authService.ts
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import crypto from 'crypto';
import { config } from '../config/environment';

/**
 * Your pool is configured for: username + email alias
 * -> You must NOT use an email-looking Username at SignUp.
 * We derive a deterministic, safe username from the email.
 */
function usernameFromEmail(email: string): string {
  const slug = crypto
    .createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 24);
  return `u_${slug}`; // not email-shaped
}

/** Compute SECRET_HASH for whatever Username/USERNAME you send in the request */
function secretHash(usernameOrAlias: string): string {
  const h = crypto.createHmac('sha256', config.cognito.clientSecret); // keep server-side only
  h.update(usernameOrAlias + config.cognito.clientId);
  return h.digest('base64');
}

/** Very light E.164 normalizer. Make sure FE provides good data where possible. */
function toE164(raw: string): string {
  let s = (raw || '').trim();
  // keep a single leading +, strip all non-digits otherwise
  s = s.replace(/[^\d+]/g, '');
  if (!s.startsWith('+')) {
    // naive fallback: assume US country code +1 if none provided; adjust to your needs
    if (/^\d+$/.test(s)) s = `+${s}`;
  }
  return s;
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: config.cognito.region,
});

export const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: config.cognito.userPoolId,
  tokenUse: 'access', // keep 'access' if you’re guarding APIs by scopes; use 'id' if you prefer identity claims
  clientId: config.cognito.clientId,
});

export const authService = {
  /**
   * SIGN UP
   * Pool requires: given_name, phone_number (E.164)
   * Username MUST NOT look like an email due to alias config.
   */
  async signUp(params: {
    email: string;
    password: string;
    givenName: string;
    phone: string;
    name?: string; // optional display name
  }) {
    const { email, password, givenName, phone, name } = params;

    const username = usernameFromEmail(email);
    const cmd = new SignUpCommand({
      ClientId: config.cognito.clientId,
      Username: username,
      Password: password,
      SecretHash: secretHash(username),
      UserAttributes: [
        { Name: 'email', Value: email },
        // 'name' is optional unless your pool requires it; keep for convenience
        ...(name ? [{ Name: 'name', Value: name }] : []),
        { Name: 'given_name', Value: givenName },
        { Name: 'phone_number', Value: toE164(phone) },
        // If your pool also requires family_name, add it here
        // { Name: 'family_name', Value: familyName },
      ],
    });

    try {
      return await cognitoClient.send(cmd);
    } catch (error: any) {
      throw {
        message: error.message || 'Signup failed',
        statusCode: 400,
        code: error.code,
      };
    }
  },

  /**
   * CONFIRM SIGN UP
   * Must use the SAME Username used during SignUp (not the email).
   */
  async verifyEmail(email: string, code: string) {
    const username = usernameFromEmail(email);
    const cmd = new ConfirmSignUpCommand({
      ClientId: config.cognito.clientId,
      Username: username,
      ConfirmationCode: code,
      SecretHash: secretHash(username),
    });
    try {
      return await cognitoClient.send(cmd);
    } catch (error: any) {
      throw {
        message: error.message || 'Verification failed',
        statusCode: 400,
        code: error.code,
      };
    }
  },

  /**
   * LOGIN
   * You can pass the email as USERNAME because email is an alias.
   * SECRET_HASH must be generated from exactly what you pass as USERNAME.
   */
  async login(email: string, password: string) {
    const cmd = new InitiateAuthCommand({
      ClientId: config.cognito.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email, // email-as-alias
        PASSWORD: password,
        SECRET_HASH: secretHash(email), // hash computed for USERNAME
      },
    });
    try {
      return await cognitoClient.send(cmd);
    } catch (error: any) {
      throw {
        message: error.message || 'Login failed',
        statusCode: 401,
        code: error.code,
      };
    }
  },

  /**
   * REFRESH
   * With client secret, include SECRET_HASH (and the same USERNAME you used at login: the email).
   */
  async refreshToken(refreshToken: string, email: string) {
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
    } catch (error: any) {
      throw {
        message: error.message || 'Token refresh failed',
        statusCode: 401,
        code: error.code,
      };
    }
  },

  /** VERIFY ACCESS TOKEN (or change tokenUse to 'id' above if you prefer) */
  async verifyAccessToken(token: string) {
    try {
      return await jwtVerifier.verify(token);
    } catch (error: any) {
      throw {
        message: 'Invalid or expired token',
        statusCode: 403,
        code: error.code || 'TOKEN_INVALID',
      };
    }
  },

  async confirmSignup(username: string, code: string) {
    const cmd = new ConfirmSignUpCommand({
      ClientId: config.cognito.clientId,
      Username: username, // u_8a1b8d4d63055ea8ac9f207b
      ConfirmationCode: code,
      SecretHash: secretHash(username),
    });
    return cognitoClient.send(cmd);
  },
};
