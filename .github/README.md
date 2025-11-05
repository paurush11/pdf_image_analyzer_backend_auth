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
./setup-branch-protection.sh
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

## 🔧 Troubleshooting

If workflows fail:
1. Check the Actions tab for detailed error messages
2. Run `npm run lint` and `npm run type-check` locally
3. Ensure all dependencies are installed (`npm ci`)
4. Verify Node.js version matches (requires Node 20+)

