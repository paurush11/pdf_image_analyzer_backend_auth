#!/bin/bash

# GitHub Branch Protection Setup Script
# This script sets up branch protection rules using GitHub CLI
# Prerequisites: GitHub CLI (gh) must be installed and authenticated

set -e

REPO_OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)

echo "Setting up branch protection for repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to set up branch protection
setup_branch_protection() {
  local BRANCH=$1
  local REQUIRE_ADMIN=$2
  
  echo "Setting up protection for branch: $BRANCH"
  
  # Set required status checks
  gh api repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection \
    --method PUT \
    --field required_status_checks='{"strict":true,"contexts":["lint-and-type-check","build"]}' \
    --field enforce_admins=$REQUIRE_ADMIN \
    --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
    --field restrictions=null \
    --field allow_force_pushes=false \
    --field allow_deletions=false
  
  echo "✅ Branch protection configured for $BRANCH"
  echo ""
}

# Setup main branch (requires admin approval too)
setup_branch_protection "main" "true"

# Setup dev branch
setup_branch_protection "dev" "false"

# Setup staging branch
setup_branch_protection "staging" "false"

echo "🎉 Branch protection setup complete!"
echo ""
echo "Summary:"
echo "  - main: Requires 1 approval, admin restrictions enforced"
echo "  - dev: Requires 1 approval"
echo "  - staging: Requires 1 approval"
echo ""
echo "All branches require CI checks to pass before merging."

