#!/bin/bash

# GitHub Branch Protection Ruleset Setup Script
# This script uses GitHub CLI to set up branch protection rules

set -e

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "📦 Installing GitHub CLI..."
    echo ""
    echo "For macOS (using Homebrew):"
    echo "  brew install gh"
    echo ""
    echo "For macOS (using MacPorts):"
    echo "  sudo port install gh"
    echo ""
    echo "For Linux:"
    echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "  echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "  sudo apt update && sudo apt install gh"
    echo ""
    echo "After installation, run:"
    echo "  gh auth login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated."
    echo ""
    echo "Please run: gh auth login"
    echo ""
    exit 1
fi

REPO_OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)

echo "🔒 Setting up branch protection rules for: $REPO_OWNER/$REPO_NAME"
echo ""

# Function to set up branch protection with full ruleset
setup_branch_protection() {
  local BRANCH=$1
  local REQUIRE_ADMIN=$2
  
  echo "📋 Configuring protection for branch: $BRANCH"
  
  # Create temporary JSON file for the API request
  local TEMP_FILE=$(mktemp)
  cat > "$TEMP_FILE" <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["lint-and-type-check", "build"]
  },
  "enforce_admins": $REQUIRE_ADMIN,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "allow_squash_merge": true,
  "allow_merge_commit": true,
  "allow_rebase_merge": true,
  "required_conversation_resolution": true
}
EOF
  
  # Set branch protection via API using JSON file
  gh api repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection \
    --method PUT \
    --input "$TEMP_FILE" > /dev/null
  
  # Clean up temp file
  rm -f "$TEMP_FILE"
  
  echo "✅ Branch protection configured for $BRANCH"
  echo ""
}

# Check if branches exist
check_branch_exists() {
  local BRANCH=$1
  if gh api repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH --jq .name > /dev/null 2>&1; then
    return 0
  else
    echo "⚠️  Branch '$BRANCH' does not exist. Creating it..."
    # Create branch from main if it doesn't exist
    if [ "$BRANCH" != "main" ]; then
      gh api repos/$REPO_OWNER/$REPO_NAME/git/refs \
        --method POST \
        --field ref="refs/heads/$BRANCH" \
        --field sha=$(gh api repos/$REPO_OWNER/$REPO_NAME/git/ref/heads/main --jq .object.sha) \
        > /dev/null 2>&1 || echo "Could not create branch. Please create it manually."
    fi
  fi
}

# Setup main branch (with admin restrictions)
echo "🔐 Setting up MAIN branch protection..."
check_branch_exists "main"
setup_branch_protection "main" "true"

# Setup dev branch
echo "🔐 Setting up DEV branch protection..."
check_branch_exists "dev"
setup_branch_protection "dev" "false"

# Setup staging branch
echo "🔐 Setting up STAGING branch protection..."
check_branch_exists "staging"
setup_branch_protection "staging" "false"

echo "🎉 Branch protection setup complete!"
echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  MAIN Branch:"
echo "    ✅ Requires 1 PR approval"
echo "    ✅ Requires CI checks (lint-and-type-check, build)"
echo "    ✅ Admin restrictions enforced"
echo "    ✅ No force pushes allowed"
echo "    ✅ No deletions allowed"
echo ""
echo "  DEV Branch:"
echo "    ✅ Requires 1 PR approval"
echo "    ✅ Requires CI checks (lint-and-type-check, build)"
echo "    ✅ No force pushes allowed"
echo "    ✅ No deletions allowed"
echo ""
echo "  STAGING Branch:"
echo "    ✅ Requires 1 PR approval"
echo "    ✅ Requires CI checks (lint-and-type-check, build)"
echo "    ✅ No force pushes allowed"
echo "    ✅ No deletions allowed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ All branches are now protected!"
echo "📝 Note: Make sure your CI workflows are set up correctly"
echo "   for the status checks to appear."
