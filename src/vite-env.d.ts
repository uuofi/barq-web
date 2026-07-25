/// <reference types="vite/client" />

/**
 * Typed contract for the variables Vite inlines at build time.
 *
 * This only makes `import.meta.env` type-safe — it does NOT validate values.
 * Validation (and the rule that nothing else may read import.meta.env) lives
 * in src/config/env.ts.
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SITE_URL: string;

  readonly VITE_APP_STORE_URL: string;
  readonly VITE_PLAY_STORE_URL: string;
  readonly VITE_APK_DOWNLOAD_URL: string;

  readonly VITE_CONTACT_PHONE: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_WHATSAPP_NUMBER: string;

  readonly VITE_ANALYTICS_ID: string;

  readonly VITE_FEATURE_ORDER_TRACKING: string;
  readonly VITE_FEATURE_LEAD_FORMS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
