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

- Node.js 18+
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

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BRAVE_API_KEY=your-brave-api-key
```

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
