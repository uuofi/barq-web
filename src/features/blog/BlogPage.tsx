import { useTranslation } from 'react-i18next';
import Seo from '@/components/seo/Seo';
import { PageHero, Section, ImageSlot, Button } from '@/components/ui';
import { paths } from '@/app/router/paths';
import { FEATURED_POST, POSTS, type BlogPost } from './blog.content';
import styles from './BlogPage.module.css';

/**
 * Blog index.
 *
 * The cards are NOT links. There is no article route and no CMS behind this
 * page yet, so every card would resolve to a 404 — and a grid of dead links is
 * a worse outcome than a grid that plainly does not claim to be clickable. The
 * note under the grid says as much rather than leaving a visitor to discover
 * it by clicking. Wiring these up later means adding a `/blog/:slug` route and
 * wrapping the card in a `<Link>`; nothing else here changes.
 */
export const BlogPage = () => {
  const { t } = useTranslation();

  const meta = (post: BlogPost) => (
    <p className={styles.meta}>
      <span className={styles.category}>{t(post.categoryKey)}</span>
      <span>{t(post.dateKey)}</span>
      <span className={styles.dot} aria-hidden="true">
        •
      </span>
      <span>{t('blog.readingTime', { count: post.readingMinutes })}</span>
    </p>
  );

  return (
    <>
      <Seo title={t('nav.blog')} description={t('seo.blog.description')} />

      <PageHero title={t('blog.hero.title')} subtitle={t('blog.hero.subtitle')} align="center" />

      <Section canvas="ink" glow data-section="blog">
        <article className={styles.featured}>
          <ImageSlot
            src={FEATURED_POST.image ?? undefined}
            alt={t(FEATURED_POST.titleKey)}
            width={1200}
            height={675}
            onDark
          />

          <div className={styles.featuredBody}>
            <p className={styles.meta}>
              <span className={styles.category}>{t('blog.featured')}</span>
              <span>{t(FEATURED_POST.dateKey)}</span>
            </p>
            <h2 className={styles.featuredTitle}>{t(FEATURED_POST.titleKey)}</h2>
            <p className={styles.featuredExcerpt}>{t(FEATURED_POST.excerptKey)}</p>
          </div>
        </article>

        <div className={styles.grid}>
          {POSTS.map((post) => (
            <article key={post.id} className={styles.card} data-post={post.id}>
              <ImageSlot
                src={post.image ?? undefined}
                alt={t(post.titleKey)}
                width={800}
                height={500}
                onDark
              />
              <h2 className={styles.cardTitle}>{t(post.titleKey)}</h2>
              <p className={styles.cardExcerpt}>{t(post.excerptKey)}</p>
              {meta(post)}
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <Button to={paths.contact} variant="outline">
            {t('nav.contact')}
          </Button>
        </div>
        <p className={styles.note}>{t('common.comingSoon')}</p>
      </Section>
    </>
  );
};

export default BlogPage;
