import { logger } from '@/lib/logger';

/**
 * Shrinks a chosen photo before it is uploaded.
 *
 * Why this exists: a photo straight off a phone camera is 3–10MB and 4000px
 * wide. All of that is pure waste here — the image is only ever shown as a
 * ~40px avatar in the admin approvals queue and, at most, full-screen on a
 * reviewer's monitor. Sending the original means a long upload on mobile data
 * and a body large enough to be refused by whatever proxy sits in front of the
 * API (nginx's default `client_max_body_size` is 1MB, well under the 5MB the
 * backend itself accepts) — which surfaces to the applicant as an upload that
 * churns and then fails for no visible reason.
 *
 * The mobile app avoids the same problem by letting expo-image-picker compress
 * on the way out; this is the browser's equivalent.
 *
 * Everything here degrades to "just upload the original": a photo that cannot
 * be decoded, a browser without canvas encoding, an image already small enough
 * — in each case the caller gets a `File` it can send, never an error.
 */

/** Long edge, in pixels. Comfortably sharp for a full-screen review. */
const MAX_DIMENSION = 1280;

/** JPEG quality. 0.85 is the usual point where artefacts stop being visible. */
const QUALITY = 0.85;

/** Below this, re-encoding buys nothing and can even grow the file. */
const SKIP_BELOW_BYTES = 400 * 1024;

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('image could not be decoded'));
    };
    // Browsers apply EXIF orientation to <img> by default (CSS
    // `image-orientation: from-image`), so `naturalWidth/Height` and the
    // canvas draw below are already upright — a photo taken in portrait does
    // not come out on its side.
    image.src = objectUrl;
  });

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise((resolve) => {
    // Always JPEG: a PNG screenshot of a face re-encodes to a fraction of the
    // size with no visible loss, and the backend accepts JPEG for every case.
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', QUALITY);
  });

/**
 * Returns a upload-ready `File` — the shrunken one when that is smaller, the
 * original otherwise. Never throws.
 */
export const preparePhoto = async (file: File): Promise<File> => {
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const image = await loadImage(file);

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);

    // A zero dimension means the decode gave us nothing usable; canvas would
    // happily produce a blank image rather than fail, so bail out explicitly.
    if (!width || !height) return file;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const blob = await toBlob(canvas);
    // Re-encoding an already-optimised image can come out BIGGER; in that case
    // the original is simply the better file to send.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], 'photo.jpg', { type: 'image/jpeg', lastModified: Date.now() });
  } catch (error) {
    // Not worth failing the application over — the original is still a valid
    // upload, and the server enforces the real limits either way.
    logger.error('Photo downscale failed; uploading the original', error);
    return file;
  }
};

export default preparePhoto;
