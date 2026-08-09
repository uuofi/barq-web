/**
 * Blog index content.
 *
 * These entries are STATIC placeholders that mirror the approved design's
 * article cards. There is no CMS and no `/blog/:slug` route yet, so every card
 * is deliberately non-navigable — see `BlogPage.tsx`. When a real content
 * source arrives, this array is what it replaces, and the card markup does not
 * change.
 */

export interface BlogPost {
  id: string;
  titleKey: string;
  excerptKey: string;
  categoryKey: string;
  dateKey: string;
  readingMinutes: number;
  /** Cover image. `null` renders the reserved placeholder slot. */
  image: string | null;
}

/** The lead article, shown wide with its cover beside the copy. */
export const FEATURED_POST: BlogPost = {
  id: 'tips',
  titleKey: 'blog.post.tips.title',
  excerptKey: 'blog.post.tips.excerpt',
  categoryKey: 'blog.post.tips.category',
  dateKey: 'blog.post.tips.date',
  readingMinutes: 5,
  image: null,
};

/** The three-up grid beneath the featured article. */
export const POSTS: BlogPost[] = [
  {
    id: 'packaging',
    titleKey: 'blog.post.packaging.title',
    excerptKey: 'blog.post.packaging.excerpt',
    categoryKey: 'blog.post.packaging.category',
    dateKey: 'blog.post.packaging.date',
    readingMinutes: 4,
    image: null,
  },
  {
    id: 'tech',
    titleKey: 'blog.post.tech.title',
    excerptKey: 'blog.post.tech.excerpt',
    categoryKey: 'blog.post.tech.category',
    dateKey: 'blog.post.tech.date',
    readingMinutes: 6,
    image: null,
  },
  {
    id: 'expansion',
    titleKey: 'blog.post.expansion.title',
    excerptKey: 'blog.post.expansion.excerpt',
    categoryKey: 'blog.post.expansion.category',
    dateKey: 'blog.post.expansion.date',
    readingMinutes: 3,
    image: null,
  },
];
