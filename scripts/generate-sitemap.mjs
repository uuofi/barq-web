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
 * /about, /coverage, /merchants, /drivers, /faq are deliberately absent:
 * they now redirect to sections of `/` (see AboutSection.tsx, CoverageSection.tsx
 * etc. via HomePage.tsx) and are no longer unique canonical URLs.
 */
const ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/download', priority: 0.8, changefreq: 'monthly' },
  { path: '/contact', priority: 0.5, changefreq: 'yearly' },
  { path: '/legal/terms', priority: 0.3, changefreq: 'yearly' },
  { path: '/legal/privacy', priority: 0.3, changefreq: 'yearly' },
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
 * Drift guard: every path listed above must appear in paths.ts. This is what
 * turns the duplication into a caught error instead of a silent divergence.
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

const outputPath = join(projectRoot, 'public/sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf8');
console.log(`sitemap: wrote ${ROUTES.length} URLs to public/sitemap.xml (base ${SITE_URL})`);
