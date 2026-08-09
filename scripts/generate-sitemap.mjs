/**
 * Generates public/sitemap.xml from the route registry.
 *
 * Run before `vite build` (see package.json). Generating rather than
 * hand-writing the sitemap is the point: a hand-written one is stale the
 * moment someone adds a route, and a sitemap listing a 404 actively damages
 * crawl budget.
 *
 * The registry is the source of truth (src/app/router/routes.tsx). This
 * script duplicates the *path list* rather than importing the TSX module,
 * because Node cannot execute TSX without a build step — the check at the
 * bottom fails the build if the two ever drift.
 *
 *   node scripts/generate-sitemap.mjs
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://barq-iq.site').replace(/\/+$/, '');

/**
 * Must mirror the `sitemap.include === true` entries in routes.tsx.
 *
 * The marketing pages (/about, /services, /merchants, /drivers, /coverage,
 * /pricing, /blog, /how-it-works) are each a real route with its own canonical
 * URL again — they were briefly anchored sections of `/` and are listed here
 * once more.
 *
 * Deliberately absent: /track and /track/:code (per-order pages must never be
 * indexed, and the tracking feature is flagged off), and /apply/success (a
 * confirmation page has no standalone search value).
 */
const ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/about', priority: 0.7, changefreq: 'monthly' },
  { path: '/services', priority: 0.9, changefreq: 'monthly' },
  { path: '/merchants', priority: 0.9, changefreq: 'monthly' },
  { path: '/drivers', priority: 0.9, changefreq: 'monthly' },
  { path: '/blog', priority: 0.6, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.8, changefreq: 'monthly' },
  { path: '/how-it-works', priority: 0.7, changefreq: 'monthly' },
  { path: '/coverage', priority: 0.7, changefreq: 'monthly' },
  { path: '/contact', priority: 0.5, changefreq: 'yearly' },
  { path: '/apply/driver', priority: 0.8, changefreq: 'yearly' },
  { path: '/apply/merchant', priority: 0.8, changefreq: 'yearly' },
  { path: '/download', priority: 0.8, changefreq: 'monthly' },
  { path: '/legal/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/legal/privacy', priority: 0.3, changefreq: 'yearly' },
  // Account deletion. Indexed on purpose — Google Play and the App Store
  // require this URL to be publicly reachable and discoverable without the
  // app installed, so it must appear here even though it sells nothing.
  { path: '/account/delete', priority: 0.3, changefreq: 'yearly' },
];

const LANGUAGES = ['ar', 'en'];
const today = new Date().toISOString().split('T')[0];

const urlEntry = ({ path, priority, changefreq }) => {
  const loc = `${SITE_URL}${path === '/' ? '/' : path}`;
  const alternates = LANGUAGES.map(
    (lang) =>
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${loc}?lang=${lang}" />`
  ).join('\n');

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />
  </url>`;
};

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ROUTES.map(urlEntry).join('\n')}
</urlset>
`;

/**
 * Drift guard, both directions.
 *
 * (1) Every path listed above must exist in paths.ts — catches a typo or a URL
 *     that was renamed in the app but not here.
 */
const pathsSource = readFileSync(join(projectRoot, 'src/app/router/paths.ts'), 'utf8');
const missing = ROUTES.map((route) => route.path).filter(
  (path) => path !== '/' && !pathsSource.includes(`'${path}'`)
);

if (missing.length > 0) {
  console.error(
    `sitemap: these paths are not defined in src/app/router/paths.ts:\n  ${missing.join('\n  ')}`
  );
  process.exit(1);
}

/**
 * (2) The COUNT here must match the number of `include: true` entries in the
 *     route registry — catches the opposite mistake, which the check above
 *     cannot see: a route declaring itself sitemap-worthy in routes.tsx that
 *     nobody added to the list here, so it silently never gets crawled.
 *
 *     A count rather than a parse: routes.tsx is TSX, Node cannot import it
 *     without a build step (see the file header), and a regex that tried to
 *     extract paths from JSX would be the fragile thing here. The count is
 *     enough — it fails the build and points at the file to reconcile.
 */
const routesSource = readFileSync(join(projectRoot, 'src/app/router/routes.tsx'), 'utf8');
const declaredIncluded = (routesSource.match(/include:\s*true/g) || []).length;

if (declaredIncluded !== ROUTES.length) {
  console.error(
    `sitemap: routes.tsx declares ${declaredIncluded} route(s) with sitemap.include === true, ` +
      `but this script lists ${ROUTES.length}. Reconcile ROUTES above with src/app/router/routes.tsx.`
  );
  process.exit(1);
}

const outputPath = join(projectRoot, 'public/sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf8');
console.log(`sitemap: wrote ${ROUTES.length} URLs to public/sitemap.xml (base ${SITE_URL})`);
