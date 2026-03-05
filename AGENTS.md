# Mission Control | Agent Configuration Guide

This document contains configuration and setup information for AI agents working on the Mission Control project.

## Project Overview

- **Name**: Mission Control | NRJ Morgen
- **Type**: Vite + React + TypeScript SPA
- **Deployment**: GitHub Pages
- **Backend**: Supabase

## CI/CD Pipeline

### Workflows

The project uses GitHub Actions for continuous integration and deployment:

1. **`.github/workflows/ci.yml`** - Runs on every PR and push to main/develop
   - Lint (ESLint)
   - Type check (TypeScript)
   - Test with coverage (Vitest)
   - Upload coverage to Codecov
   - Build verification
   - Security audit (npm audit)

2. **`.github/workflows/deploy.yml`** - Deploys to GitHub Pages on push to master
   - Builds with production settings
   - Creates 404.html for SPA routing
   - Adds security headers
   - Deploys via GitHub Actions (`actions/deploy-pages`)

3. **`.github/workflows/pr-checks.yml`** - PR-specific checks
   - Lint and format checks
   - Type checking
   - Test execution
   - Build size check (warns if > 500KB)
   - Dependency vulnerability scan

4. **`.github/dependabot.yml`** - Automated dependency updates
   - Weekly schedule (Mondays 09:00 CET)
   - Groups dev dependencies
   - Ignores major updates for critical packages

### Required GitHub Secrets

Configure these secrets in GitHub Repository Settings > Secrets and variables > Actions:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_BRAVE_API_KEY` | Brave Search API key | Yes |
| `CODECOV_TOKEN` | Codecov upload token | No (optional) |
| `GITHUB_TOKEN` | Auto-provided by GitHub | Auto |

### Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Never commit `.env.local` to git.

## Build Configuration

### Vite Config

The `vite.config.ts` includes GitHub Pages base URL configuration:

```typescript
// Automatically sets base URL for GitHub Pages
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const base = isGitHubPages ? '/mission-control-live/' : '/';
```

This ensures assets load correctly when deployed to GitHub Pages subdirectory.

### Build Output

- Output directory: `dist/`
- Assets directory: `dist/assets/`
- 404.html is created from index.html for SPA routing

## Scripts

### Build Verification (`scripts/build-check.sh`)

Verifies build output before deployment:
- Checks required files exist
- Validates build size (< 500KB)
- Checks for security issues
- Verifies proper structure

Usage:
```bash
./scripts/build-check.sh
```

### PR Preview Deploy (`scripts/deploy-preview.sh`)

Deploys preview for pull requests (requires GitHub token):

```bash
PR_NUMBER=123 ./scripts/deploy-preview.sh
```

## Docker Support

### Local Development

```bash
# Development mode with hot reload
docker-compose up app-dev

# Production build
docker-compose up app-prod

# With nginx reverse proxy
docker-compose --profile proxy up

# With auto-updates
docker-compose --profile monitoring up
```

### Building Images

```bash
# Development image
docker build --target development -t mission-control:dev .

# Production image
docker build --target production -t mission-control:prod \
  --build-arg VITE_SUPABASE_URL=... \
  --build-arg VITE_SUPABASE_ANON_KEY=... \
  --build-arg VITE_BRAVE_API_KEY=... .
```

## Quality Gates

Before merging, all PRs must pass:

1. ✅ ESLint - no errors
2. ✅ TypeScript - no type errors
3. ✅ Tests - all pass
4. ✅ Build - succeeds with size < 500KB
5. ✅ Security audit - no high/critical vulnerabilities

## Deployment

### GitHub Pages Setup

1. Go to Repository Settings > Pages
2. Source: **GitHub Actions** *(not "Deploy from a branch")*
3. Custom domain: (optional)

> The deploy workflow uses `actions/deploy-pages` which requires **GitHub Actions** as the source. Using "Deploy from a branch" will prevent changes from appearing on the live site at https://baarli.github.io/mission-control-live/

### Manual Deployment

```bash
GITHUB_PAGES=true npm run build
# Upload dist/ via the GitHub Actions deploy workflow
```

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run preview          # Preview production build

# Build
npm run build            # Production build

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # Run TypeScript check
npm run format           # Format with Prettier
npm run format:check     # Check formatting
```

## Security Considerations

- Never commit `.env` files
- Use GitHub Secrets for production credentials
- Source maps are disabled in production builds
- CSP headers are configured in nginx
- Rate limiting is enabled for API endpoints

## Troubleshooting

### Build fails on CI

1. Check all secrets are configured
2. Verify `package-lock.json` is committed
3. Check for TypeScript errors: `npm run type-check`

### 404 errors after deployment

1. Verify `404.html` exists in build output
2. Check base URL configuration in vite.config.ts
3. Ensure `GITHUB_PAGES=true` is set in deploy workflow

### Large build size

1. Check bundle analyzer: `npm run build -- --analyze`
2. Review manual chunks in vite.config.ts
3. Remove unused dependencies

---

Last updated: March 2026
