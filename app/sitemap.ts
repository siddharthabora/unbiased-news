import type { MetadataRoute } from 'next'

// Set by hand. This is the date the landing page's indexable content
// (headline, subtitle copy, page title, meta description) last changed.
// Do NOT wire this to carousel or news_cache freshness. That content is
// decorative, client-fetched and aria-hidden, so a crawler cannot verify
// the change, and Google will learn to distrust an inaccurate lastmod.
// Bump this only when you ship a real copy change, for example when the
// title/meta rewrite lands.
const LANDING_LAST_MODIFIED = '2026-08-03'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.unbiasedtoday.com',
      lastModified: LANDING_LAST_MODIFIED,
    },
  ]
}
