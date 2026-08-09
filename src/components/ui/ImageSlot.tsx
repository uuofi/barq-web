import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { BoxIcon } from '@/components/icons';
import { cn } from '@/lib/utils/cn';
import styles from './ImageSlot.module.css';

interface ImageSlotProps {
  /** Asset URL. When omitted, the placeholder renders in its place. */
  src?: string;
  /**
   * Description of the image. Required even for the placeholder state: it is
   * what the placeholder announces, and it is the spec for the asset that
   * will eventually replace it.
   */
  alt: string;
  /** Intrinsic pixel size. Drives the reserved aspect ratio. */
  width: number;
  height: number;
  /** Restyles the placeholder for the ink canvas. */
  onDark?: boolean;
  /** Wraps the image in the dark device/browser frame. */
  framed?: boolean;
  /**
   * Above-the-fold images opt out of lazy loading. Default is lazy, which is
   * correct for everything below the first screen.
   */
  priority?: boolean;
  className?: string;
}

/**
 * An image with a reserved box and a graceful missing state.
 *
 * The site's photography and product screenshots are supplied separately from
 * the build. Rather than shipping `<img src="">` (a broken-image icon, a
 * console error, and a layout that jumps when the file finally lands), a slot
 * with no `src` draws a labelled placeholder at the exact final dimensions.
 *
 * Supplying the asset later is a one-line change and moves nothing on the
 * page.
 */
export const ImageSlot = ({
  src,
  alt,
  width,
  height,
  onDark = false,
  framed = false,
  priority = false,
  className,
}: ImageSlotProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(styles.slot, onDark && styles.onDark, framed && styles.framed, className)}
      style={{ '--slot-ratio': `${width} / ${height}` } as CSSProperties}
    >
      {src ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
        />
      ) : (
        /*
         * `role="img"` + `aria-label` rather than a bare div: to a screen
         * reader this is still the image the layout promised, described by
         * the same alt text the real asset will carry. The inner text is
         * hidden from the accessibility tree so the description is not read
         * twice.
         */
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <div aria-hidden="true">
            <BoxIcon className={styles.placeholderIcon} />
          </div>
          <span className={styles.placeholderLabel} aria-hidden="true">
            {t('common.imagePending')}
          </span>
          <span className={styles.placeholderHint} aria-hidden="true">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageSlot;
