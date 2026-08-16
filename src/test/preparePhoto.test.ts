import { describe, expect, it, vi, afterEach } from 'vitest';
import { preparePhoto } from '@/features/apply/preparePhoto';

/**
 * Downscaling a chosen photo before it is uploaded.
 *
 * This is what stops a 4000px, 8MB camera photo from being pushed down a
 * mobile connection and then refused by whatever proxy fronts the API. jsdom
 * implements neither image decoding nor canvas encoding, so the browser halves
 * are stubbed and what is actually asserted is the decision logic around them:
 * when to skip, when to fall back, and never to throw.
 */

const bigFile = (bytes = 4 * 1024 * 1024, type = 'image/jpeg') => {
  const file = new File(['x'], 'camera.jpg', { type });
  Object.defineProperty(file, 'size', { value: bytes });
  return file;
};

/** Makes `new Image()` resolve at the given natural dimensions. */
const stubDecode = (naturalWidth: number, naturalHeight: number) => {
  vi.stubGlobal(
    'Image',
    class {
      naturalWidth = naturalWidth;
      naturalHeight = naturalHeight;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
  );
};

/** Makes canvas encoding produce a blob of `bytes`, or fail when null. */
const stubCanvas = (bytes: number | null) => {
  const context = { drawImage: vi.fn() };
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag !== 'canvas') {
      // Fall through for anything else the tree happens to create.
      return Object.create(HTMLElement.prototype) as HTMLElement;
    }
    return {
      width: 0,
      height: 0,
      getContext: () => context,
      toBlob: (cb: (blob: Blob | null) => void) =>
        cb(bytes === null ? null : new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' })),
    } as unknown as HTMLElement;
  });
  return context;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('preparePhoto', () => {
  it('leaves an already-small photo completely alone', async () => {
    const small = bigFile(120 * 1024);
    const created = vi.spyOn(document, 'createElement');

    await expect(preparePhoto(small)).resolves.toBe(small);
    // Not merely "same size" — the same object, i.e. no work was done at all.
    expect(created).not.toHaveBeenCalledWith('canvas');
  });

  it('shrinks a large photo and hands back the smaller file', async () => {
    stubDecode(4032, 3024);
    const context = stubCanvas(180 * 1024);

    const result = await preparePhoto(bigFile(8 * 1024 * 1024));

    expect(result.size).toBe(180 * 1024);
    expect(result.type).toBe('image/jpeg');
    // Scaled to a 1280px long edge, preserving the 4:3 aspect ratio.
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1280, 960);
  });

  it('keeps the original when re-encoding would make it bigger', async () => {
    stubDecode(1000, 1000);
    stubCanvas(9 * 1024 * 1024);

    const original = bigFile(2 * 1024 * 1024);
    await expect(preparePhoto(original)).resolves.toBe(original);
  });

  it('falls back to the original when the image cannot be decoded', async () => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.());
        }
      }
    );

    const original = bigFile();
    // A corrupt or exotic file must still reach the server, which is the thing
    // that actually decides whether it is a valid image.
    await expect(preparePhoto(original)).resolves.toBe(original);
  });

  it('falls back to the original when canvas encoding is unavailable', async () => {
    stubDecode(2000, 1500);
    stubCanvas(null);

    const original = bigFile();
    await expect(preparePhoto(original)).resolves.toBe(original);
  });
});
