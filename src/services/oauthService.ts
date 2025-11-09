import { config } from '../config/environment';

export const oauthService = {
  getGoogleAuthUrl(): string {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const params = new URLSearchParams({
      client_id: config.oauth.google.clientId,
      redirect_uri: config.oauth.google.redirectUri,
      response_type: 'code',
      scope: 'email profile',
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log('🔍 Generated OAuth URL:', url);
    return url;
  },

  async exchangeCodeForTokens(code: string) {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          client_id: config.oauth.google.clientId,
          client_secret: config.oauth.google.clientSecret,
          redirect_uri: config.oauth.google.redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw {
          message: 'Failed to exchange code for tokens',
          statusCode: 401,
          code: 'TOKEN_EXCHANGE_FAILED',
        };
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw {
          message: 'Failed to fetch user info',
          statusCode: 401,
          code: 'USER_INFO_FETCH_FAILED',
        };
      }

      const userInfo = await userInfoResponse.json();

      return {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        googleId: userInfo.id,
      };
    } catch (error: any) {
      throw {
        message: error.message || 'OAuth exchange failed',
        statusCode: error.statusCode || 500,
        code: error.code || 'OAUTH_ERROR',
      };
    }
  },
};
