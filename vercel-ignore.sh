#!/bin/bash
# Vercel Ignored Build Step
#   exit 1 -> continue with the build
#   exit 0 -> skip the build
#
# Builds only:
#   - pushes to main (production)
#   - branches with an OPEN pull request whose base branch is main

TARGET_BRANCH="main"

# 1. Always build main itself
if [ "$VERCEL_GIT_COMMIT_REF" = "$TARGET_BRANCH" ]; then
  echo "✅ Commit on $TARGET_BRANCH, building."
  exit 1
fi

# 2. Skip if this branch has no pull request
if [ -z "$VERCEL_GIT_PULL_REQUEST_ID" ]; then
  echo "🛑 No pull request for $VERCEL_GIT_COMMIT_REF, skipping."
  exit 0
fi

# 3. Look up the PR's state and base branch on GitHub
CURL_ARGS=(-fsSL -H "Accept: application/vnd.github+json")
if [ -n "$GITHUB_TOKEN" ]; then
  CURL_ARGS+=(-H "Authorization: Bearer $GITHUB_TOKEN")
fi

PR_URL="https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID"

PR_INFO=$(curl "${CURL_ARGS[@]}" "$PR_URL" 2>/dev/null | node -e '
  let d = "";
  process.stdin.on("data", c => d += c).on("end", () => {
    try { const p = JSON.parse(d); console.log(p.state + " " + p.base.ref); } catch { console.log(""); }
  });
')
PR_STATE=${PR_INFO%% *}
BASE_REF=${PR_INFO#* }

if [ -z "$PR_INFO" ]; then
  # Build when the lookup fails so a preview is never lost without notice
  echo "⚠️ Couldn't read PR #$VERCEL_GIT_PULL_REQUEST_ID from GitHub, building anyway."
  exit 1
fi

# 4. Skip merged or closed pull requests
if [ "$PR_STATE" = "closed" ]; then
  echo "🛑 PR #$VERCEL_GIT_PULL_REQUEST_ID is closed, skipping."
  exit 0
fi

# 5. Build only if the open PR targets main
if [ "$BASE_REF" = "$TARGET_BRANCH" ]; then
  echo "✅ PR #$VERCEL_GIT_PULL_REQUEST_ID targets $TARGET_BRANCH, building."
  exit 1
fi

echo "🛑 PR #$VERCEL_GIT_PULL_REQUEST_ID targets $BASE_REF, not $TARGET_BRANCH. Skipping."
exit 0