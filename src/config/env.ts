import { z } from 'zod';

/**
 * Runtime configuration, parsed and validated ONCE at module load.
 *
 * Why validate at all when Vite already inlines `import.meta.env`? Because an
 * unset variable is `undefined`, not an error — without this file a typo in a
 * deploy pipeline ships a site whose canonical URLs are the string
 * "undefined" and whose API calls silently hit the wrong origin. Failing at
 * boot is strictly better than failing in a crawler's index.
 *
 * RULE: nothing outside this file may read `import.meta.env`. Everything else
 * imports `env` — that keeps the full surface of external configuration
 * visible in one place and typed.
 */

/** '' | 'true' | 'false' → boolean. Anything else is a config error. */
const booleanFlag = z
  .enum(['true', 'false', ''])
  .default('false')
  .transform((v) => v === 'true');

/** An optional URL: empty string is allowed and normalises to undefined. */
const optionalUrl = z
  .string()
  .default('')
  .transform((v) => v.trim())
  .refine((v) => v === '' || /^https?:\/\//.test(v), {
    message: 'must be an absolute http(s) URL or empty',
  })
  .transform((v) => (v === '' ? undefined : v));

/** An optional free-text value; empty string normalises to undefined. */
const optionalText = z
  .string()
  .default('')
  .transform((v) => v.trim())
  .transform((v) => (v === '' ? undefined : v));

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default(''),
  VITE_SITE_URL: z.string().default(''),

  VITE_APP_STORE_URL: optionalUrl,
  VITE_PLAY_STORE_URL: optionalUrl,
  VITE_APK_DOWNLOAD_URL: optionalUrl,

  VITE_CONTACT_PHONE: optionalText,
  VITE_CONTACT_EMAIL: optionalText,
  VITE_WHATSAPP_NUMBER: optionalText,

  VITE_ANALYTICS_ID: optionalText,

  VITE_FEATURE_ORDER_TRACKING: booleanFlag,
  VITE_FEATURE_LEAD_FORMS: booleanFlag,
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  // Thrown, not logged: a misconfigured site must not boot half-working.
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const raw = parsed.data;

const isProd = import.meta.env.PROD;

/**
 * The public origin of this site, without a trailing slash. In dev we fall
 * back to the browser's own origin so canonical/OG tags stay coherent while
 * developing; in production an explicit VITE_SITE_URL is mandatory.
 */
const resolveSiteUrl = (): string => {
  const explicit = raw.VITE_SITE_URL.trim().replace(/\/+$/, '');
  if (explicit) return explicit;
  if (isProd) {
    throw new Error('VITE_SITE_URL is required in a production build (used for canonical/OG URLs).');
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';
};

export const env = {
  /** Backend API base. Empty in dev → the Vite proxy handles /api/v1. */
  apiBaseUrl: raw.VITE_API_BASE_URL.trim() || '/api/v1',
  siteUrl: resolveSiteUrl(),

  isProd,
  isDev: import.meta.env.DEV,

  links: {
    appStore: raw.VITE_APP_STORE_URL,
    playStore: raw.VITE_PLAY_STORE_URL,
    apkDownload: raw.VITE_APK_DOWNLOAD_URL,
  },

  contact: {
    phone: raw.VITE_CONTACT_PHONE,
    email: raw.VITE_CONTACT_EMAIL,
    whatsapp: raw.VITE_WHATSAPP_NUMBER,
  },

  analyticsId: raw.VITE_ANALYTICS_ID,

  /**
   * Feature flags. A page whose backend endpoint does not exist yet stays
   * behind a flag: the route still resolves (no 404, no dead link in the
   * sitemap) but renders its unavailable state. See src/app/router/routes.ts.
   */
  features: {
    orderTracking: raw.VITE_FEATURE_ORDER_TRACKING,
    leadForms: raw.VITE_FEATURE_LEAD_FORMS,
  },
} as const;

export type Env = typeof env;

export default env;
