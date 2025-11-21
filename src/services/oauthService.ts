import { config } from '../config/environment';

const OAUTH_ENDPOINTS = {
  authorize: '/oauth2/authorize',
  token: '/oauth2/token',
  userInfo: '/oauth2/userInfo',
} as const;

export const buildGoogleAuthUrl = (): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.cognito.clientId,
    redirect_uri: config.google.redirectUri,
    identity_provider: 'Google',
    scope: 'openid email',
  });

  return `${config.cognito.domain}${OAUTH_ENDPOINTS.authorize}?${params.toString()}`;
};

export const exchangeCodeForTokens = async (code: string, redirectUri: string) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.cognito.clientId,
    code,
    redirect_uri: redirectUri,
  });

  const credentials = Buffer.from(
    `${config.cognito.clientId}:${config.cognito.clientSecret}`
  ).toString('base64');

  const response = await fetch(`${config.cognito.domain}${OAUTH_ENDPOINTS.token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${errorText}`);
  }

  return response.json();
};

export const getUserInfo = async (accessToken: string) => {
  const response = await fetch(`${config.cognito.domain}${OAUTH_ENDPOINTS.userInfo}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user info: ${errorText}`);
  }

  return response.json();
};
