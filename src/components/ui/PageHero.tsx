import type { ComponentType, CSSProperties, SVGProps } from 'react';
import Container from '@/components/layout/Container';
import { cn } from '@/lib/utils/cn';
import Button from './Button';
import styles from './PageHero.module.css';
import type { CtaAction } from './CtaBand';

interface HeroImage {
  src: string;
  /** Low-resolution or narrow-viewport source, offered via srcSet. */
  srcSmall?: string;
  /**
   * Decorative background photographs take an empty alt: the hero's meaning
   * is fully carried by the heading beside it, and "a delivery rider at
   * night" adds nothing a screen-reader user needs.
   */
  alt: string;
  /** `object-position` focal point, e.g. '75% 50%'. */
  focus?: string;
  /** Intrinsic size — reserves the box and keeps CLS at zero. */
  width: number;
  height: number;
}

interface PageHeroProps {
  title: string;
  /** Large line under the title. */
  subtitle?: string;
  /** Smaller paragraph under the subtitle. */
  lead?: string;
  eyebrow?: string;
  /** Icon rendered beside the title — the bolt on the Home hero. */
  titleIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  image?: HeroImage;
  actions?: readonly CtaAction[];
  /** Centres the copy. Default for pages without a photograph. */
  align?: 'start' | 'center';
  className?: string;
}

/**
 * The top banner of a page, and the only place an `<h1>` is rendered.
 *
 * The hero photograph is a real `<img>` inside the banner rather than a CSS
 * `background-image`. Backgrounds cannot be given `width`/`height`, are not
 * eligible for `fetchPriority`, and cannot serve a narrow-viewport source —
 * all three of which matter for the largest element on the page, which is
 * also the Largest Contentful Paint candidate on every route that has one.
 */
export const PageHero = ({
  title,
  subtitle,
  lead,
  eyebrow,
  titleIcon: TitleIcon,
  image,
  actions,
  align,
  className,
}: PageHeroProps) => {
  const centered = (align ?? (image ? 'start' : 'center')) === 'center';

  return (
    <section
      className={cn(styles.hero, image ? styles.withImage : styles.wash, className)}
      data-section="hero"
    >
      {image ? (
        <>
          <div className={styles.media} style={{ '--hero-focus': image.focus } as CSSProperties}>
            <img
              src={image.src}
              srcSet={image.srcSmall ? `${image.srcSmall} 900w, ${image.src} 1800w` : undefined}
              sizes={image.srcSmall ? '100vw' : undefined}
              alt={image.alt}
              width={image.width}
              height={image.height}
              // The hero image is above the fold on every page that has one:
              // it must not be lazy-loaded, and it should outrank the rest of
              // the page's requests.
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className={styles.scrim} aria-hidden="true" />
        </>
      ) : null}

      <Container>
        <div
          className={cn(
            styles.inner,
            centered && styles.centered,
            // A photo hero that is not centred keeps its copy clear of the
            // rider — see `.copyLeft`.
            !centered && image && styles.copyLeft
          )}
        >
          {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}

          <h1 className={styles.title}>
            {TitleIcon ? <TitleIcon className={styles.titleIcon} /> : null}
            {title}
          </h1>

          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {lead ? <p className={styles.lead}>{lead}</p> : null}

          {actions?.length ? (
            <div className={styles.actions}>
              {actions.map((action, index) => {
                const variant = action.variant ?? (index === 0 ? 'primary' : 'outline');
                return action.to ? (
                  <Button key={action.label} to={action.to} variant={variant} size="lg">
                    {action.label}
                  </Button>
                ) : (
                  <Button key={action.label} href={action.href ?? '#'} variant={variant} size="lg">
                    {action.label}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
};

export default PageHero;
