/**
 * Fails a production build when a required VITE_* variable is missing.
 *
 * This exists because of a real outage: `VITE_API_BASE_URL` was never set as a
 * GitHub Actions Variable, so the build silently fell back to the DEV value
 * ("/api/v1", which only works behind the Vite dev proxy). The deployed site
 * then sent every API request to its own static host, nginx answered
 * "405 Not Allowed", and the result was a site that looked completely healthy —
 * pages rendered, navigation worked — while every form on it was broken. The
 * driver application could not upload a photo and no application could be
 * submitted at all.
 *
 * A missing deploy variable must break the DEPLOY, loudly and immediately, not
 * degrade into a half-working site. Checking here (before vite build) rather
 * than at runtime is deliberate: a runtime throw produces a blank white page
 * for real visitors, whereas this stops the pipeline while the bad bundle is
 * still just a build step.
 *
 *   node scripts/check-env.mjs
 */

/**
 * Only variables whose absence produces a BROKEN site, not a degraded one.
 * Anything optional (store links, analytics id, contact details) belongs in
 * .env.example, not here — this list is a gate, so a soft requirement on it
 * would train people to bypass the gate.
 */
const REQUIRED = [
  {
    name: 'VITE_API_BASE_URL',
    why:
      'Every API call — the driver/merchant application forms, the photo upload, order tracking, ' +
      'account deletion — is sent to this origin.',
    example: 'https://api.barq-iq.site/api/v1',
    consequence:
      'Without it the bundle falls back to "/api/v1", which is the dev-proxy path. In production ' +
      'that resolves to the static site host, which answers 405 to every POST — the site renders ' +
      'perfectly and every form fails.',
  },
  {
    name: 'VITE_SITE_URL',
    why: 'Canonical, Open Graph and sitemap URLs are built from it.',
    example: 'https://barq-iq.site',
    consequence:
      'src/config/env.ts throws on boot without it in a production build, so the site renders as ' +
      'a blank white page.',
  },
];

const missing = REQUIRED.filter(({ name }) => !(process.env[name] ?? '').trim());

if (missing.length > 0) {
  const lines = missing.map(
    ({ name, why, example, consequence }) =>
      `\n  ${name}\n` +
      `    what it is:  ${why}\n` +
      `    set it to:   ${example}\n` +
      `    if missing:  ${consequence}`
  );

  console.error(
    `\n[check-env] Production build blocked — ${missing.length} required variable(s) missing:` +
      `${lines.join('\n')}\n\n` +
      '  In CI these are GitHub Actions *Variables* (Settings → Secrets and variables → Actions →\n' +
      '  Variables), not Secrets — they are inlined into the public bundle, so there is nothing\n' +
      '  secret about them. Locally, put them in .env (see .env.example).\n'
  );
  process.exit(1);
}

console.log('[check-env] required build variables present');
