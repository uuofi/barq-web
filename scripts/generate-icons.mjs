/**
 * Generates every brand image the site serves, from ONE source file:
 * src/assets/brand/app-icon.png — the same icon the driver/merchant apps ship.
 *
 * Why generate rather than commit a folder of PNGs: the sizes below are not a
 * design decision, they are what browsers, app stores, and social/search
 * crawlers each demand. Deriving them means the site, the apps, and a Google
 * result can never drift to different logos, and swapping the brand mark is a
 * one-file change plus a rebuild.
 *
 * What each output is actually for:
 *
 *   favicon.ico          Browser tabs, bookmarks, history. Still the file some
 *                        crawlers and older browsers fetch from the site root
 *                        by convention, whatever the <link> tags say.
 *   favicon-{16,32}.png  Modern tab icons at the two sizes that matter.
 *   apple-touch-icon     iOS home screen. iOS composites onto an opaque
 *                        background, so this one is flattened.
 *   icons/icon-*.png     PWA manifest (site.webmanifest).
 *   icon-maskable-512    Android adaptive icons, which CROP to a circle. The
 *                        art is inset 20% so the bolt survives the crop.
 *   logo.png             schema.org Organization.logo — this is the file that
 *                        decides whether a Google result shows the brand mark.
 *   og/default.png       Open Graph / Twitter card, 1200x630. Social platforms
 *                        crop toward landscape, so the square mark is centred
 *                        on the brand background rather than stretched.
 *
 *   npm run icons
 *
 * Deliberately NOT wired into `npm run build`, unlike the sitemap. Its outputs
 * are committed and only ever change when the brand mark does, whereas the
 * sitemap goes stale the moment someone adds a route. Keeping it out means the
 * deploy path does not depend on sharp's native binary resolving on the CI
 * runner — a build must not be able to fail over an image that did not change.
 * Re-run it by hand after replacing src/assets/brand/app-icon.png.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const SOURCE = join(projectRoot, 'src/assets/brand/app-icon.png');
const PUBLIC = join(projectRoot, 'public');

/**
 * The icon's own background (#131033), sampled from the source art rather than
 * guessed. Used wherever a transparent or letterboxed area has to be filled —
 * the OG card padded to 1200x630, the maskable icon's safe-zone inset — so
 * those never show a white or black band around the mark.
 */
const BRAND_BG = { r: 19, g: 16, b: 51, alpha: 1 };

const out = (...parts) => join(PUBLIC, ...parts);

/** Square PNG at `size`, as a buffer. */
const square = (size) =>
  sharp(SOURCE).resize(size, size, { fit: 'cover' }).png({ quality: 90 }).toBuffer();

/**
 * Packs PNGs into a real .ico container.
 *
 * sharp cannot write ICO, and naming a PNG "favicon.ico" — the usual shortcut —
 * ships a file whose contents contradict its extension. Browsers sniff it and
 * cope; some crawlers and Windows itself do not. The format is simple enough
 * that doing it properly costs a few lines: a 6-byte directory header, one
 * 16-byte entry per size, then the image payloads. PNG payloads (rather than
 * BMP) are valid in ICO and understood by every browser in use.
 */
const buildIco = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    // 0 means 256 in this field; every size here is smaller, but encode it
    // correctly anyway so a future 256px entry does not silently become 0x0.
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size — 0 for true colour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
};

async function main() {
  mkdirSync(out('icons'), { recursive: true });
  mkdirSync(out('og'), { recursive: true });

  // --- Tab icons -------------------------------------------------------
  for (const size of [16, 32]) {
    writeFileSync(out(`favicon-${size}x${size}.png`), await square(size));
  }

  const icoSizes = [16, 32, 48];
  writeFileSync(
    out('favicon.ico'),
    buildIco(await Promise.all(icoSizes.map(async (size) => ({ size, data: await square(size) }))))
  );

  // --- iOS home screen --------------------------------------------------
  // Flattened: iOS ignores the alpha channel and would composite onto white,
  // ringing the dark art in a white square.
  writeFileSync(
    out('apple-touch-icon.png'),
    await sharp(SOURCE)
      .resize(180, 180, { fit: 'cover' })
      .flatten({ background: BRAND_BG })
      .png()
      .toBuffer()
  );

  // --- PWA manifest icons ----------------------------------------------
  for (const size of [192, 512]) {
    writeFileSync(out('icons', `icon-${size}.png`), await square(size));
  }

  // Android crops maskable icons to a circle/squircle, keeping roughly the
  // middle 80%. Scaling the art to 80% and padding with the brand colour is
  // what stops the bolt's points being sliced off.
  const inner = Math.round(512 * 0.8);
  writeFileSync(
    out('icons', 'icon-maskable-512.png'),
    await sharp({ create: { width: 512, height: 512, channels: 4, background: BRAND_BG } })
      .composite([
        { input: await sharp(SOURCE).resize(inner, inner).toBuffer(), gravity: 'centre' },
      ])
      .png()
      .toBuffer()
  );

  // --- schema.org Organization.logo ------------------------------------
  // The file Google reads for a rich result's brand mark. Comfortably above
  // its 112x112 minimum, and the source carries its own background so it
  // renders on a light result page without a transparent hole.
  writeFileSync(out('logo.png'), await square(512));

  // --- Open Graph / Twitter card ---------------------------------------
  // The square mark cannot simply be pasted onto a flat rectangle. The source
  // art carries a soft vignette, so its outer pixels are lighter than its own
  // centre — and lighter than any single fill colour — which makes the join
  // show up as a visible square outline. (Blurring the art into a backdrop
  // does not help either: the blur averages in that same bright vignette.)
  //
  // So the mark's edges are FEATHERED instead. Its centre is already exactly
  // BRAND_BG, the same colour as the canvas, so fading the outer band to
  // transparent leaves the bolt sitting on an unbroken background with no
  // border anywhere. Cutting the bolt out of its background is not an option
  // here: its shadows and the vignette occupy the same tonal range, so no
  // threshold separates them cleanly.
  const OG_MARK = 560;
  const feather = await sharp(
    Buffer.from(
      `<svg width="${OG_MARK}" height="${OG_MARK}">` +
        `<rect x="26" y="26" width="${OG_MARK - 52}" height="${OG_MARK - 52}" rx="120" fill="#fff"/>` +
        `</svg>`
    )
  )
    .blur(22)
    .toBuffer();

  const mark = await sharp(await square(OG_MARK))
    // `dest-in` keeps the mark only where the mask is opaque, turning the
    // mask's blurred edge into a soft fade.
    .composite([{ input: feather, blend: 'dest-in' }])
    .png()
    .toBuffer();

  writeFileSync(
    out('og', 'default.png'),
    await sharp({ create: { width: 1200, height: 630, channels: 4, background: BRAND_BG } })
      .composite([{ input: mark, gravity: 'centre' }])
      .png()
      .toBuffer()
  );

  console.log('[icons] generated from src/assets/brand/app-icon.png');
}

main().catch((error) => {
  console.error('[icons] generation failed:', error.message);
  process.exit(1);
});
