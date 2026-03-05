# Mission Control | NRJ Morgen

A professional real-time analytics dashboard for NRJ Morgen mission control.

## 🚀 Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/) - Fast, modern frontend tooling
- **Framework**: [React](https://react.dev/) 18 with TypeScript
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) - Server state management
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL + Auth
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + [MSW](https://mswjs.io/)

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Shared UI components
│   ├── layout/         # Layout components
│   └── dashboard/      # Dashboard-specific
├── features/           # Feature modules (feature-flagged)
│   └── voice/          # Voice chat plumbing (VITE_VOICE_ENABLED)
├── services/           # API layer
│   ├── api/           # REST API functions
│   ├── supabase.ts    # Supabase client
│   └── braveApi.ts    # Brave Search API
├── stores/             # Zustand state stores
├── hooks/              # Custom React hooks
├── utils/              # Helper utilities
├── types/              # TypeScript definitions
├── styles/             # Global CSS
└── __tests__/          # Test files
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd mission-control-live
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual API keys
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🐳 Docker

### Development (hot-reload on port 3000)

```bash
# Copy and fill in your env vars first
cp .env.example .env.local

docker compose up app-dev
```

The Vite dev server will be available at <http://localhost:3000> with full hot-module replacement via the bind-mounted source tree.

### Production (Nginx on port 8080)

```bash
# Build args are passed at build time so VITE_* vars are baked into the bundle
VITE_SUPABASE_URL=... \
VITE_SUPABASE_ANON_KEY=... \
VITE_BRAVE_API_KEY=... \
docker compose up app-prod
```

The production image serves the pre-built `dist/` directory via Nginx on <http://localhost:8080>.

### Optional profiles

```bash
# Nginx reverse proxy (port 80/443)
docker compose --profile proxy up

# Watchtower auto-update
docker compose --profile monitoring up
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_BRAVE_API_KEY` | Yes | Brave Search API key |
| `VITE_APP_ENVIRONMENT` | No | `development` or `production` |
| `VITE_ENABLE_ANALYTICS` | No | Enable analytics (`false`) |
| `VITE_ENABLE_DEBUG_LOGGING` | No | Enable debug logs (`false`) |
| `VITE_VOICE_ENABLED` | No | Enable voice chat feature (`false`) |
| `VITE_VOICE_PROVIDER_URL` | No | Voice provider endpoint (future) |

> **Never** commit `.env.local` or any file containing real credentials.

## 🎙️ Voice Chat (Feature Flag)

Voice chat plumbing lives in `src/features/voice/`. It is **disabled by default** and has no runtime effect unless `VITE_VOICE_ENABLED=true` is set.

```tsx
import { VoiceProvider } from '@/features/voice';

// Wrap your app (no-op when VITE_VOICE_ENABLED != "true")
<VoiceProvider>
  <App />
</VoiceProvider>
```

```tsx
import { useVoice } from '@/features/voice';

function MyComponent() {
  const { isEnabled, isListening, startListening, stopListening } = useVoice();
  if (!isEnabled) return null;
  // ...
}
```

## 🚀 Deployment (GitHub Pages)

The project deploys automatically to GitHub Pages on every push to `master`.

### Required GitHub Secrets

Configure these in **Repository Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_BRAVE_API_KEY` | Brave Search API key |
| `CODECOV_TOKEN` | Codecov upload token (optional) |

### Pages Setup

1. Go to **Repository Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `root`

### Manual Deployment

```bash
GITHUB_PAGES=true npm run build
# Deploy dist/ to gh-pages branch
```

The `GITHUB_PAGES=true` flag sets the Vite `base` to `/mission-control-live/` so assets resolve correctly on the GitHub Pages subdomain.

## 🧪 Testing

Tests use Vitest with Testing Library and MSW for API mocking:

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## 📝 Architecture Decisions

- **Vite**: Chosen for fast HMR and modern ESM support
- **Zustand**: Minimal boilerplate, excellent TypeScript support
- **TanStack Query**: Handles caching, synchronization, and background updates
- **Path Aliases**: Configured for clean imports (`@components`, `@services`, etc.)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Make your changes
3. Run tests and linting (`npm run lint && npm test`)
4. Commit using conventional commits
5. Push and create a Pull Request

Pre-commit hooks will automatically run linting and formatting.

## 📄 License

MIT
