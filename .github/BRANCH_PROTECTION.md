# GitHub Branch Protection Setup Guide

This repository requires branch protection rules to be configured in GitHub.

## Required Branch Protection Rules

### Main Branch
- ✅ **Require pull request reviews before merging**
  - Required approvals: **1**
  - Dismiss stale pull request approvals when new commits are pushed: ✅
  - Require review from Code Owners: Optional
- ✅ **Require status checks to pass before merging**
  - Required checks: `lint-and-type-check`, `build`
  - Require branches to be up to date before merging: ✅
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings** (for administrators)
- ✅ **Restrict pushes that create matching branches** (optional, recommended)

### Dev Branch
- ✅ **Require pull request reviews before merging**
  - Required approvals: **1**
  - Dismiss stale pull request approvals when new commits are pushed: ✅
- ✅ **Require status checks to pass before merging**
  - Required checks: `lint-and-type-check`, `build`
  - Require branches to be up to date before merging: ✅
- ✅ **Require conversation resolution before merging**

### Staging Branch
- ✅ **Require pull request reviews before merging**
  - Required approvals: **1**
  - Dismiss stale pull request approvals when new commits are pushed: ✅
- ✅ **Require status checks to pass before merging**
  - Required checks: `lint-and-type-check`, `build`
  - Require branches to be up to date before merging: ✅
- ✅ **Require conversation resolution before merging**

## How to Set Up Branch Protection

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** for each branch (main, dev, staging)
4. Configure the rules as specified above
5. Save the rules

## Alternative: Using GitHub CLI

You can also set up branch protection using GitHub CLI:

```bash
# For main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint-and-type-check","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# For dev branch
gh api repos/:owner/:repo/branches/dev/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint-and-type-check","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# For staging branch
gh api repos/:owner/:repo/branches/staging/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint-and-type-check","build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

Replace `:owner` and `:repo` with your repository owner and name.

## What This Enforces

1. **No direct pushes to main**: All changes must go through PRs
2. **PR reviews required**: At least 1 approval needed for main, dev, and staging
3. **CI checks must pass**: Linting, type checking, and build must succeed
4. **Up-to-date branches**: PRs must be rebased/merged with latest main before merging

## Workflow Status

The CI workflow automatically runs on:
- Pull requests to main, dev, or staging
- Pushes to main, dev, or staging (only if somehow bypassed)

The workflow checks:
- ✅ ESLint validation
- ✅ Prettier formatting
- ✅ TypeScript type checking
- ✅ Build compilation

