# GitHub Workflows and Branch Protection

This repository uses GitHub Actions workflows and branch protection rules to ensure code quality and prevent unauthorized changes.

## 🚀 Quick Setup

### Option 1: Using GitHub Web UI (Recommended)
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Follow the instructions in [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md)

### Option 2: Using GitHub CLI Script
```bash
cd .github/scripts
./setup-branch-protection-ruleset.sh
```

## 📋 Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)
Runs on every PR and push to `main`, `dev`, or `staging`:
- ✅ ESLint validation
- ✅ Prettier formatting check
- ✅ TypeScript type checking
- ✅ Build compilation

### 2. PR Check Workflow (`.github/workflows/pr-check.yml`)
Validates that PRs targeting protected branches follow the correct process.

### 3. Direct Push Prevention (`.github/workflows/prevent-direct-push.yml`)
Monitors and logs warnings for direct pushes to protected branches.

## 🔒 Protected Branches

- **main**: Requires 1 approval + admin restrictions
- **dev**: Requires 1 approval
- **staging**: Requires 1 approval

## ✅ Requirements

All PRs to protected branches must:
1. Pass CI checks (lint, type-check, build)
2. Have at least 1 approval
3. Have all conversations resolved
4. Be up-to-date with the target branch

## 📝 Code Owners

See [CODEOWNERS](./CODEOWNERS) file to configure automatic reviewer assignment.

---

# 🔐 Authentication Repository - Current State & Next Tasks

## Repository Purpose

This repository **exclusively handles authentication** functionality. All authentication-related features, services, and controllers are centralized here.

## ✅ Current Implementation

### AWS Cognito Authentication

**Status**: ✅ Implemented

**Current Features**:
- ✅ User Sign Up (`POST /api/auth/signup`)
- ✅ Email Verification (`POST /api/auth/verify-email`)
- ✅ User Login (`POST /api/auth/login`)
- ✅ JWT Verifier Setup (basic implementation)

**Current Files**:
- `src/services/authService.ts` - Cognito service methods
- `src/controllers/authController.ts` - Cognito controller handlers
- `src/routes/authRoutes.ts` - Cognito route definitions

**Current Cognito Methods**:
1. `signUp(email, password, name)` - Register new user
2. `verifyEmail(email, code)` - Verify email with confirmation code
3. `login(email, password)` - Authenticate user and get tokens

**JWT Setup**:
- JWT verifier initialized using `aws-jwt-verify`
- Configuration: `userPoolId`, `clientId`, `tokenUse: 'access'`
- ⚠️ **Missing**: Proper controller/service methods for JWT verification

---

## 🚧 Next Tasks - Implementation Required

### 1. OAuth Implementation

**Providers to Implement**:
- 🔴 **GitHub OAuth** - Not implemented
- 🔴 **Google OAuth** - Not implemented
- 🔴 **LinkedIn OAuth** - Not implemented

**Required Implementation**:

#### OAuth Service Methods (`src/services/authService.ts` or new `oauthService.ts`)
```typescript
// OAuth flow methods needed:
- initiateOAuth(provider: 'github' | 'google' | 'linkedin')
- handleOAuthCallback(provider, code, state)
- exchangeCodeForTokens(provider, code)
- getUserInfoFromProvider(provider, accessToken)
- createOrUpdateUserFromOAuth(provider, userInfo)
```

#### OAuth Controller Methods (`src/controllers/authController.ts` or new `oauthController.ts`)
```typescript
// OAuth endpoints needed:
- GET /api/auth/oauth/:provider/initiate  - Start OAuth flow
- GET /api/auth/oauth/:provider/callback  - Handle OAuth callback
- POST /api/auth/oauth/:provider/token    - Exchange code for tokens
```

#### OAuth Routes (`src/routes/oauthRoutes.ts` - new file)
```typescript
// Route structure:
- /api/auth/oauth/github/*
- /api/auth/oauth/google/*
- /api/auth/oauth/linkedin/*
```

#### Environment Configuration (`src/config/environment.ts`)
```typescript
// Add OAuth configs:
oauth: {
  github: {
    clientId: string
    clientSecret: string
    redirectUri: string
  },
  google: {
    clientId: string
    clientSecret: string
    redirectUri: string
  },
  linkedin: {
    clientId: string
    clientSecret: string
    redirectUri: string
  }
}
```

---

### 2. JWT Verification Methods

**Status**: ⚠️ Basic setup exists, but proper methods needed

**Required Implementation**:

#### JWT Service Methods (`src/services/authService.ts` or `jwtService.ts`)
```typescript
// JWT verification methods needed:
- verifyAccessToken(token: string) - Verify access token
- verifyIdToken(token: string) - Verify ID token
- decodeToken(token: string) - Decode JWT without verification
- getTokenPayload(token: string) - Extract payload from token
- refreshToken(refreshToken: string) - Refresh expired tokens
- validateTokenExpiry(token: string) - Check token expiration
```

#### JWT Controller Methods (`src/controllers/authController.ts` or `jwtController.ts`)
```typescript
// JWT endpoints needed:
- POST /api/auth/verify-token     - Verify token validity
- POST /api/auth/decode-token     - Decode token payload
- POST /api/auth/refresh-token    - Refresh access token
- GET /api/auth/validate          - Validate current token
```

#### JWT Middleware (`src/middleware/jwtAuth.ts` - new file)
```typescript
// Middleware needed:
- authenticateToken - Verify JWT in request headers
- optionalAuth - Optional JWT verification
- requireRole(role: string) - Role-based access control
```

---

### 3. Time Decorators

**Status**: 🔴 Not implemented

**Required Implementation**:

#### Time Decorator Functions (`src/decorators/timeDecorators.ts` - new file)
```typescript
// Time-based decorators needed:
- @RateLimit(maxRequests, windowMs) - Rate limiting decorator
- @Throttle(maxRequests, windowMs) - Throttling decorator
- @Timeout(ms) - Request timeout decorator
- @CacheTTL(seconds) - Cache time-to-live decorator
- @Retry(maxAttempts, delayMs) - Retry logic decorator
- @Timing() - Request timing decorator
```

#### Usage Examples:
```typescript
// Rate limiting example
@RateLimit(10, 60000) // 10 requests per minute
@Post('/login')
async login(req: Request, res: Response) { ... }

// Timeout example
@Timeout(5000) // 5 second timeout
@Post('/oauth/callback')
async handleCallback(req: Request, res: Response) { ... }

// Timing example
@Timing()
@Get('/verify-token')
async verifyToken(req: Request, res: Response) { ... }
```

#### Time Utility Functions (`src/utils/timeUtils.ts` - new file)
```typescript
// Utility functions needed:
- getExpirationTime(seconds: number) - Calculate expiration timestamp
- isTokenExpired(exp: number) - Check if token is expired
- getRemainingTime(exp: number) - Get remaining time until expiration
- formatDuration(ms: number) - Format duration for logging
```

---

## 📁 File Structure Plan

```
src/
├── services/
│   ├── authService.ts          ✅ (Cognito methods)
│   ├── oauthService.ts         🔴 (NEW - OAuth methods)
│   └── jwtService.ts           🔴 (NEW - JWT verification methods)
│
├── controllers/
│   ├── authController.ts       ✅ (Cognito controllers)
│   ├── oauthController.ts      🔴 (NEW - OAuth controllers)
│   └── jwtController.ts        🔴 (NEW - JWT controllers)
│
├── routes/
│   ├── authRoutes.ts           ✅ (Cognito routes)
│   ├── oauthRoutes.ts          🔴 (NEW - OAuth routes)
│   └── jwtRoutes.ts            🔴 (NEW - JWT routes)
│
├── middleware/
│   ├── jwtAuth.ts              🔴 (NEW - JWT authentication middleware)
│   └── errorHandler.ts         ✅ (Existing)
│
├── decorators/
│   └── timeDecorators.ts       🔴 (NEW - Time-based decorators)
│
├── utils/
│   ├── timeUtils.ts            🔴 (NEW - Time utility functions)
│   └── asyncHandler.ts         ✅ (Existing)
│
└── config/
    └── environment.ts          ✅ (Update with OAuth configs)
```

---

## 📋 Implementation Checklist

### OAuth Implementation
- [ ] Set up GitHub OAuth app and get credentials
- [ ] Set up Google OAuth app and get credentials
- [ ] Set up LinkedIn OAuth app and get credentials
- [ ] Add OAuth configs to environment.ts
- [ ] Create oauthService.ts with provider methods
- [ ] Create oauthController.ts with route handlers
- [ ] Create oauthRoutes.ts with route definitions
- [ ] Implement OAuth flow for GitHub
- [ ] Implement OAuth flow for Google
- [ ] Implement OAuth flow for LinkedIn
- [ ] Add OAuth error handling
- [ ] Add OAuth tests

### JWT Verification Methods
- [ ] Create jwtService.ts with verification methods
- [ ] Create jwtController.ts with verification endpoints
- [ ] Create jwtAuth.ts middleware for token authentication
- [ ] Implement access token verification
- [ ] Implement ID token verification
- [ ] Implement token refresh functionality
- [ ] Add token expiration validation
- [ ] Add role-based access control middleware
- [ ] Add JWT error handling
- [ ] Add JWT tests

### Time Decorators
- [ ] Create timeDecorators.ts decorator file
- [ ] Create timeUtils.ts utility functions
- [ ] Implement @RateLimit decorator
- [ ] Implement @Throttle decorator
- [ ] Implement @Timeout decorator
- [ ] Implement @CacheTTL decorator
- [ ] Implement @Retry decorator
- [ ] Implement @Timing decorator
- [ ] Add decorator tests
- [ ] Apply decorators to appropriate endpoints

---

## 🔧 Troubleshooting

If workflows fail:
1. Check the Actions tab for detailed error messages
2. Run `npm run lint` and `npm run type-check` locally
3. Ensure all dependencies are installed (`npm ci`)
4. Verify Node.js version matches (requires Node 20+)

## 📚 Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
