import Parser from 'rss-parser'

type CustomItem = {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  'media:content'?: { $: { url: string } }
  enclosure?: { url: string }
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [['media:content', 'media:content']],
  },
})

const RSS_FEEDS = [
  // Geopolitics / World
  { name: 'Al Jazeera',        url: 'https://www.aljazeera.com/xml/rss/all.xml',                          topics: ['Geopolitics', 'World'] },
  { name: 'The Diplomat',      url: 'https://thediplomat.com/feed/',                                      topics: ['Geopolitics', 'World'] },
  { name: 'The Guardian World',url: 'https://www.theguardian.com/world/rss',                              topics: ['Geopolitics', 'World'] },
  { name: 'NPR',               url: 'https://feeds.npr.org/1001/rss.xml',                                 topics: ['Geopolitics', 'World'] },

  // Finance / Business
  { name: 'The Guardian Business', url: 'https://www.theguardian.com/uk/business/rss',                   topics: ['Finance', 'Business'] },
  { name: 'BBC Business',      url: 'https://feeds.bbci.co.uk/news/business/rss.xml',                    topics: ['Finance', 'Business'] },

  // Technology
  { name: 'TechCrunch',        url: 'https://techcrunch.com/feed/',                                      topics: ['Technology'] },
  { name: 'TechCrunch AI',     url: 'https://techcrunch.com/category/artificial-intelligence/feed/',     topics: ['Technology'] },
  { name: 'Ars Technica',      url: 'https://feeds.arstechnica.com/arstechnica/index',                   topics: ['Technology'] },
  { name: 'Wired',             url: 'https://www.wired.com/feed/rss',                                    topics: ['Technology'] },
  { name: 'BBC Technology',    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',                  topics: ['Technology'] },
  { name: 'The Guardian Tech', url: 'https://www.theguardian.com/uk/technology/rss',                     topics: ['Technology'] },

  // Health & Wellness
  { name: 'BBC Health',        url: 'https://feeds.bbci.co.uk/news/health/rss.xml',                      topics: ['Health & Wellness'] },
  { name: 'The Guardian Health', url: 'https://www.theguardian.com/society/health/rss',                  topics: ['Health & Wellness'] },
  { name: 'Science Daily Health', url: 'https://www.sciencedaily.com/rss/top/health.xml',               topics: ['Health & Wellness'] },
  { name: 'Healthline',        url: 'https://www.healthline.com/rss/health-news',                        topics: ['Health & Wellness'] },

  // Music / Culture / Entertainment
  { name: 'Rolling Stone',        url: 'https://www.rollingstone.com/music/feed/',                       topics: ['Music', 'Culture', 'Entertainment'] },
  { name: 'NME',                  url: 'https://www.nme.com/news/music/feed',                            topics: ['Music', 'Culture'] },
  { name: 'Pitchfork',            url: 'https://pitchfork.com/feed/feed-news/rss',                       topics: ['Music', 'Culture'] },
  { name: 'Consequence Sound',    url: 'https://consequence.net/category/music/feed',                    topics: ['Music', 'Culture'] },
  { name: 'Variety',              url: 'https://variety.com/feed/',                                      topics: ['Culture', 'Entertainment'] },
  { name: 'IndieWire',            url: 'https://www.indiewire.com/feed/',                                topics: ['Culture', 'Entertainment'] },
  { name: 'BBC Entertainment',    url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',  topics: ['Music', 'Culture', 'Entertainment'] },
  { name: 'The Guardian Culture', url: 'https://www.theguardian.com/culture/rss',                       topics: ['Culture', 'Entertainment'] },

  // Science / Environment
  { name: 'BBC Science',       url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',    topics: ['Science', 'Environment'] },
]

const MAX_PER_SOURCE = 4  // hard cap so no single outlet dominates

export interface NewsItem {
  title: string
  summary: string
  link: string
  source: string
  publishedAt: string
  imageUrl?: string
  feedTopics: string[]
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const rawResults: NewsItem[] = []

  await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url)
      for (const item of parsed.items.slice(0, MAX_PER_SOURCE)) {
        if (!item.title || !item.link) continue
        rawResults.push({
          title: item.title,
          summary: item.contentSnippet ?? '',
          link: item.link,
          source: feed.name,
          publishedAt: item.pubDate ?? '',
          imageUrl: item['media:content']?.$.url ?? item.enclosure?.url,
          feedTopics: feed.topics,
        })
      }
    })
  )

  // Secondary cap: max MAX_PER_SOURCE articles per source name across all feeds
  const countBySource: Record<string, number> = {}
  const results: NewsItem[] = []
  for (const item of rawResults) {
    countBySource[item.source] = (countBySource[item.source] ?? 0) + 1
    if (countBySource[item.source] <= MAX_PER_SOURCE) results.push(item)
  }

  return results
}
