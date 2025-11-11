import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'local',
  frontendUrl: process.env.FRONTEND_URL || '',
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
    region: process.env.COGNITO_REGION || 'us-east-1',
    clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
    identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || '',
  },
};
