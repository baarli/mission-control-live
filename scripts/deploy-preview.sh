#!/bin/bash

# PR Preview Deployment Script for Mission Control
# This script creates a preview deployment for pull requests

set -e

echo "========================================"
echo "🚀 Mission Control PR Preview Deploy"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DIST_DIR="dist"
PREVIEW_BRANCH="gh-pages-previews"

# Helper functions
error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️ WARNING:${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check prerequisites
command -v git >/dev/null 2>&1 || error "Git is not installed"
command -v npm >/dev/null 2>&1 || error "npm is not installed"

# Get PR information
PR_NUMBER="${PR_NUMBER:-$1}"
if [ -z "$PR_NUMBER" ]; then
    error "PR number not provided. Usage: ./scripts/deploy-preview.sh <pr-number>"
fi

info "Deploying preview for PR #$PR_NUMBER"

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    warning "Build directory '$DIST_DIR' not found. Building now..."
    npm ci
    npm run build
fi

# Verify build
if [ ! -f "$DIST_DIR/index.html" ]; then
    error "Build output is missing index.html"
fi

# Get repository information
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REPO_URL" ]; then
    error "Could not determine repository URL"
fi

# Extract repo name
REPO_NAME=$(basename -s .git "$REPO_URL" 2>/dev/null || echo "mission-control-live")
REPO_OWNER=$(dirname "$REPO_URL" | xargs basename 2>/dev/null || echo "baarli")

success "Repository: $REPO_OWNER/$REPO_NAME"

# Create preview directory structure
PREVIEW_DIR="preview/pr-$PR_NUMBER"
info "Creating preview at: $PREVIEW_DIR"

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    error "Not a git repository"
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
info "Current branch: $CURRENT_BRANCH"

# Create temporary directory for preview
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

info "Preparing preview deployment..."

# Copy build files to temp directory with preview path
mkdir -p "$TEMP_DIR/$PREVIEW_DIR"
cp -r "$DIST_DIR"/* "$TEMP_DIR/$PREVIEW_DIR/"

# Update base URL for preview
cd "$TEMP_DIR/$PREVIEW_DIR"

# Modify index.html for preview base path
if [ -f "index.html" ]; then
    # Update base href for subdirectory deployment
    sed -i.bak "s|href=\"/\"|href=\"/$REPO_NAME/$PREVIEW_DIR/\"|g" index.html 2>/dev/null || true
    sed -i.bak "s|src=\"/|src=\"/$REPO_NAME/$PREVIEW_DIR/|g" index.html 2>/dev/null || true
    rm -f index.html.bak
    success "Updated base paths for preview deployment"
fi

cd - > /dev/null

# Check if preview branch exists
if git show-ref --verify --quiet "refs/remotes/origin/$PREVIEW_BRANCH"; then
    info "Preview branch exists, fetching..."
    git fetch origin "$PREVIEW_BRANCH"
else
    info "Creating new preview branch..."
    git checkout --orphan "$PREVIEW_BRANCH" 2>/dev/null || true
    git rm -rf . 2>/dev/null || true
    echo "# Preview Deployments" > README.md
    git add README.md
    git commit -m "Initialize preview branch" 2>/dev/null || true
fi

# Create a worktree for the preview branch
PREVIEW_WORKTREE=$(mktemp -d)
git worktree add "$PREVIEW_WORKTREE" "$PREVIEW_BRANCH" 2>/dev/null || {
    # If worktree exists, remove it first
    git worktree remove "$PREVIEW_WORKTREE" 2>/dev/null || true
    rm -rf "$PREVIEW_WORKTREE"
    PREVIEW_WORKTREE=$(mktemp -d)
    git worktree add "$PREVIEW_WORKTREE" "$PREVIEW_BRANCH"
}

trap "rm -rf $TEMP_DIR; git worktree remove '$PREVIEW_WORKTREE' 2>/dev/null || true; rm -rf '$PREVIEW_WORKTREE'" EXIT

# Clean old preview for this PR
if [ -d "$PREVIEW_WORKTREE/$PREVIEW_DIR" ]; then
    info "Removing old preview..."
    rm -rf "$PREVIEW_WORKTREE/$PREVIEW_DIR"
fi

# Copy new preview files
mkdir -p "$PREVIEW_WORKTREE/$(dirname "$PREVIEW_DIR")"
cp -r "$TEMP_DIR/$PREVIEW_DIR" "$PREVIEW_WORKTREE/$PREVIEW_DIR"

# Create index.html for previews root if it doesn't exist
if [ ! -f "$PREVIEW_WORKTREE/index.html" ]; then
    cat > "$PREVIEW_WORKTREE/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mission Control - Preview Deployments</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #0a0a0f;
            color: #fff;
        }
        h1 { color: #4ecdc4; }
        .preview-list { margin-top: 30px; }
        .preview-item {
            background: #1a1a2e;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border: 1px solid #4ecdc4;
        }
        .preview-item a {
            color: #4ecdc4;
            text-decoration: none;
        }
        .preview-item a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>🚀 Mission Control Preview Deployments</h1>
    <p>Active pull request previews will appear here.</p>
    <div class="preview-list" id="previews"></div>
    <script>
        // Auto-discover previews
        fetch('./preview/')
            .then(r => r.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = [...doc.querySelectorAll('a')]
                    .filter(a => a.href.includes('pr-'))
                    .map(a => ({
                        pr: a.href.match(/pr-(\d+)/)?.[1],
                        href: a.href
                    }));
                
                const container = document.getElementById('previews');
                if (links.length === 0) {
                    container.innerHTML = '<p>No active previews found.</p>';
                } else {
                    container.innerHTML = links.map(l => \`
                        <div class="preview-item">
                            <strong>PR #\${l.pr}</strong> - 
                            <a href="\${l.href}">View Preview →</a>
                        </div>
                    \`).join('');
                }
            })
            .catch(() => {
                document.getElementById('previews').innerHTML = 
                    '<p>Could not load preview list.</p>';
            });
    </script>
</body>
</html>
EOF
fi

# Commit and push
cd "$PREVIEW_WORKTREE"
git add -A
if git diff --cached --quiet; then
    info "No changes to deploy"
else
    git commit -m "Deploy preview for PR #$PR_NUMBER"
    
    if [ -n "$GITHUB_TOKEN" ]; then
        # Use HTTPS with token for authentication
        git remote set-url origin "https://x-access-token:$GITHUB_TOKEN@github.com/$REPO_OWNER/$REPO_NAME.git"
    fi
    
    git push origin "$PREVIEW_BRANCH"
    success "Preview deployed successfully!"
fi

# Generate preview URL
PREVIEW_URL="https://$REPO_OWNER.github.io/$REPO_NAME/$PREVIEW_DIR/"

echo ""
echo "========================================"
echo "🎉 Preview Deployment Complete!"
echo "========================================"
echo ""
echo "Preview URL:"
echo "  $PREVIEW_URL"
echo ""
echo "To view the preview, visit the URL above."
echo "Note: It may take a few minutes for GitHub Pages to update."
