#!/bin/bash

# Build Verification Script for Mission Control
# This script verifies that the build output is valid and ready for deployment

set -e

echo "========================================"
echo "🔍 Mission Control Build Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DIST_DIR="dist"
MAX_SIZE_KB=512  # 500KB limit
WARN_SIZE_KB=400 # Warning at 400KB

# Track errors
ERRORS=0
WARNINGS=0

# Helper functions
error() {
    echo -e "${RED}❌ ERROR:${NC} $1"
    ((ERRORS++))
}

warning() {
    echo -e "${YELLOW}⚠️ WARNING:${NC} $1"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

info() {
    echo "ℹ️  $1"
}

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    error "Build directory '$DIST_DIR' not found. Run 'npm run build' first."
    exit 1
fi

echo "📁 Checking build directory structure..."
echo ""

# Required files check
REQUIRED_FILES=(
    "index.html"
    "assets"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -e "$DIST_DIR/$file" ]; then
        success "Required file/directory exists: $file"
    else
        error "Missing required file/directory: $file"
    fi
done

echo ""
echo "📊 Build size analysis..."
echo ""

# Calculate total size
TOTAL_SIZE_KB=$(du -sk "$DIST_DIR" | cut -f1)
TOTAL_SIZE_MB=$(echo "scale=2; $TOTAL_SIZE_KB / 1024" | bc 2>/dev/null || echo "0")

info "Total build size: ${TOTAL_SIZE_MB} MB (${TOTAL_SIZE_KB} KB)"

if [ $TOTAL_SIZE_KB -gt $MAX_SIZE_KB ]; then
    error "Build size (${TOTAL_SIZE_MB} MB) exceeds maximum allowed (${MAX_SIZE_KB} KB)"
    echo ""
    echo "Largest files in build:"
    find "$DIST_DIR" -type f -exec du -h {} + | sort -rh | head -20
elif [ $TOTAL_SIZE_KB -gt $WARN_SIZE_KB ]; then
    warning "Build size (${TOTAL_SIZE_MB} MB) exceeds warning threshold (${WARN_SIZE_KB} KB)"
else
    success "Build size is within acceptable range"
fi

echo ""
echo "📦 Asset analysis..."
echo ""

# Check for JS files
JS_COUNT=$(find "$DIST_DIR" -name "*.js" | wc -l)
JS_SIZE=$(find "$DIST_DIR" -name "*.js" -exec du -sk {} + | awk '{sum+=$1} END {print sum}')
info "JavaScript files: $JS_COUNT (total: ${JS_SIZE} KB)"

# Check for CSS files
CSS_COUNT=$(find "$DIST_DIR" -name "*.css" | wc -l)
CSS_SIZE=$(find "$DIST_DIR" -name "*.css" -exec du -sk {} + | awk '{sum+=$1} END {print sum}')
info "CSS files: $CSS_COUNT (total: ${CSS_SIZE} KB)"

# Check for source maps (should not exist in production)
MAP_COUNT=$(find "$DIST_DIR" -name "*.map" | wc -l)
if [ $MAP_COUNT -gt 0 ]; then
    warning "Found $MAP_COUNT source map files in production build"
else
    success "No source map files found (good for production)"
fi

echo ""
echo "🔒 Security checks..."
echo ""

# Check for source maps in production
if [ -f "$DIST_DIR/assets/index-*.js.map" ]; then
    warning "Source maps present in production build"
fi

# Check for env files (should never be in dist)
if find "$DIST_DIR" -name ".env*" -type f | grep -q .; then
    error "Environment files found in build directory!"
fi

# Check index.html for proper meta tags
if [ -f "$DIST_DIR/index.html" ]; then
    if grep -q "Content-Security-Policy" "$DIST_DIR/index.html" 2>/dev/null; then
        success "Content Security Policy meta tag found"
    else
        warning "No Content Security Policy meta tag found in index.html"
    fi
fi

echo ""
echo "🧪 Testing critical files..."
echo ""

# Check if index.html has proper structure
if [ -f "$DIST_DIR/index.html" ]; then
    if grep -q '<div id="root"></div>' "$DIST_DIR/index.html" || \
       grep -q '<div id="app"></div>' "$DIST_DIR/index.html" || \
       grep -q '<script' "$DIST_DIR/index.html"; then
        success "index.html contains expected structure"
    else
        warning "index.html may be missing expected elements"
    fi
    
    # Check for title
    if grep -q '<title>' "$DIST_DIR/index.html"; then
        success "index.html has title tag"
    else
        warning "index.html missing title tag"
    fi
fi

echo ""
echo "========================================"
echo "📋 Build Verification Summary"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    success "All checks passed! Build is ready for deployment."
    echo ""
    echo "Build statistics:"
    echo "  - Total size: ${TOTAL_SIZE_MB} MB"
    echo "  - JavaScript: ${JS_COUNT} files (${JS_SIZE} KB)"
    echo "  - CSS: ${CSS_COUNT} files (${CSS_SIZE} KB)"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    warning "Build verification completed with $WARNINGS warning(s)."
    echo "Build can be deployed, but consider addressing the warnings."
    exit 0
else
    error "Build verification failed with $ERRORS error(s) and $WARNINGS warning(s)."
    echo "Please fix the errors before deploying."
    exit 1
fi
