/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BRAVE_API_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENVIRONMENT: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_DEBUG_LOGGING: string;
  readonly VITE_VOICE_ENABLED: string;
  readonly VITE_VOICE_PROVIDER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
