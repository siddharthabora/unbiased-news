import type { MetadataRoute } from 'next'

// Set by hand. This is the date the landing page's indexable content
// (headline, subtitle copy, page title, meta description) last changed.
// Do NOT wire this to carousel or news_cache freshness. That content is
// decorative, client-fetched and aria-hidden, so a crawler cannot verify
// the change, and Google will learn to distrust an inaccurate lastmod.
// Bump this only when you ship a real copy change.
const LANDING_LAST_MODIFIED = '2026-08-08'

// Date the legal pages were created. Bump per page only on a real edit.
const LEGAL_LAST_MODIFIED = '2026-08-08'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.unbiasedtoday.com',
      lastModified: LANDING_LAST_MODIFIED,
    },
    {
      url: 'https://www.unbiasedtoday.com/disclaimer',
      lastModified: LEGAL_LAST_MODIFIED,
    },
    {
      url: 'https://www.unbiasedtoday.com/privacy',
      lastModified: LEGAL_LAST_MODIFIED,
    },
    {
      url: 'https://www.unbiasedtoday.com/terms',
      lastModified: LEGAL_LAST_MODIFIED,
    },
  ]
}
