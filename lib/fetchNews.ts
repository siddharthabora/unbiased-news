import Parser from 'rss-parser'

type CustomItem = {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  'media:content'?: { $: { url: string } }
  'media:thumbnail'?: { $: { url: string } }
  enclosure?: { url: string }
  'content:encoded'?: string
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

function extractFirstImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  const url = match?.[1]
  return url?.startsWith('http') ? url : undefined
}

// Keywords that, if found in an article's title or summary, expand its feedTopics
// beyond its source feed's base tags — enabling cross-topic relevance.
const TOPIC_KEYWORD_EXPANSION: Record<string, string[]> = {
  'Environment': [
    'climate', 'emission', 'emissions', 'renewable', 'fossil fuel', 'carbon',
    'sustainability', 'green energy', 'biodiversity', 'deforestation', 'pollution',
    'pfas', 'net zero', 'global warming', 'wildlife', 'clean energy',
    'greenhouse', 'decarboniz', 'solar power', 'wind power', 'environmental',
    'ecology', 'ecosystem', 'conservation', 'plastic waste', 'forever chemical',
  ],
  'War & Conflict': [
    'ceasefire', 'airstrike', 'air strike', 'invasion', 'blockade',
    'missile', 'drone strike', 'combat', 'battlefield', 'armed forces',
    'casualties', 'siege', 'occupation', 'insurgency', 'militia',
    'warzone', 'war zone', 'military operation', 'shelling', 'bombing',
    'offensive', 'counteroffensive', 'troops deployed',
  ],
  'Supply Chain': [
    'supply chain', 'logistics', 'freight', 'procurement',
    'warehouse', 'import tariff', 'export ban', 'production halt',
    'distribution network', 'inventory', 'manufacturing capacity',
    'reshoring', 'nearshoring', 'port congestion', 'shipping lane', 'cargo',
  ],
  'Crypto & Web3': [
    'bitcoin', 'cryptocurrency', 'crypto', 'blockchain', 'ethereum', 'defi',
    'nft', 'web3', 'polymarket', 'stablecoin', 'altcoin', 'dao',
    'smart contract', 'digital asset', 'digital currency', 'crypto exchange',
  ],
  'Geopolitics': [
    'diplomatic', 'geopolitical', 'treaty', 'sovereignty', 'territorial',
    'foreign policy', 'bilateral', 'multilateral', 'un security council',
    'nato summit', 'g7', 'g20', 'sanctions regime', 'state visit',
  ],
  'Technology': [
    'artificial intelligence', 'machine learning', 'semiconductor', 'quantum computing',
    'cybersecurity', 'data breach', 'neural network', 'silicon valley',
    'big tech', 'cloud computing', 'autonomous vehicle', 'robotics', 'generative ai',
  ],
  'Finance': [
    'interest rate', 'inflation', 'recession', 'federal reserve',
    'central bank', 'bond yield', 'ipo', 'monetary policy',
    'fiscal policy', 'sovereign debt', 'credit rating',
  ],
  'Health & Wellness': [
    'pandemic', 'vaccine', 'clinical trial', 'fda approval', 'mental health',
    'public health', 'disease outbreak', 'pharmaceutical', 'drug approval',
    'nhs', 'mortality rate', 'pathogen', 'healthcare system',
  ],
  'Stocks & Investments': [
    'stock market', 'equity market', 'dividend', 'earnings report',
    'market cap', 'bull market', 'bear market', 'wall street', 'nasdaq',
    's&p 500', 'hedge fund', 'venture capital', 'private equity',
  ],
  'Art': [
    'artwork', 'exhibition', 'gallery', 'auction', 'curator', 'sculpture',
    'painting', 'art market', 'museum collection', 'retrospective',
    'contemporary art', 'installation art',
  ],
  'Pet Care': [
    'pet', 'pets', 'dog', 'dogs', 'cat', 'cats', 'puppy', 'puppies', 'kitten',
    'veterinary', 'vet ', 'animal welfare', 'animal health', 'animal rescue',
    'shelter animal', 'breed', 'canine', 'feline', 'livestock', 'exotic animal',
    'wildlife rescue', 'rehoming', 'pet adoption', 'stray', 'spay', 'neuter',
    'zoonotic', 'rabies', 'parvovirus', 'animal cruelty', 'pet food',
  ],
}

function expandTopicsFromContent(title: string, summary: string, baseTopics: string[]): string[] {
  const content = (title + ' ' + summary).toLowerCase()
  const expanded = new Set(baseTopics)
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORD_EXPANSION)) {
    if (!expanded.has(topic) && keywords.some(kw => content.includes(kw))) {
      expanded.add(topic)
    }
  }
  return Array.from(expanded)
}

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
  { name: 'BBC Science',              url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',    topics: ['Science', 'Environment'] },
  { name: 'The Guardian Environment', url: 'https://www.theguardian.com/environment/rss',                     topics: ['Environment', 'Science'] },
  { name: 'Inside Climate News',      url: 'https://insideclimatenews.org/feed/',                             topics: ['Environment'] },
  { name: 'Carbon Brief',            url: 'https://www.carbonbrief.org/feed/',                               topics: ['Environment', 'Science'] },
  { name: 'Yale Environment 360',    url: 'https://e360.yale.edu/feed',                                      topics: ['Environment', 'Science'] },

  // Crypto & Web3
  { name: 'CoinDesk',          url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',                  topics: ['Crypto & Web3'] },
  { name: 'CoinTelegraph',     url: 'https://cointelegraph.com/rss',                                    topics: ['Crypto & Web3'] },
  { name: 'Decrypt',           url: 'https://decrypt.co/feed',                                          topics: ['Crypto & Web3'] },

  // Stocks & Investments
  { name: 'Investing.com',     url: 'https://www.investing.com/rss/news.rss',                           topics: ['Stocks & Investments'] },
  { name: 'CNBC Markets',      url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',             topics: ['Stocks & Investments', 'Finance'] },
  { name: 'Economic Times',    url: 'https://economictimes.indiatimes.com/markets/rss.cms',             topics: ['Stocks & Investments', 'Finance'] },

  // Supply Chain
  { name: 'Supply Chain Dive', url: 'https://www.supplychaindive.com/feeds/news/',                      topics: ['Supply Chain'] },
  { name: 'Manufacturing Dive',url: 'https://www.manufacturingdive.com/feeds/news/',                    topics: ['Supply Chain'] },
  { name: 'FreightWaves',      url: 'https://www.freightwaves.com/news/feed',                           topics: ['Supply Chain'] },

  // War & Conflict
  { name: 'War on the Rocks',  url: 'https://warontherocks.com/feed/',                                  topics: ['War & Conflict', 'Geopolitics'] },
  { name: 'Defense One',       url: 'https://www.defenseone.com/rss/all/',                              topics: ['War & Conflict'] },
  { name: 'Breaking Defense',  url: 'https://breakingdefense.com/feed/',                                topics: ['War & Conflict'] },

  // Art
  { name: 'Artnet News',       url: 'https://news.artnet.com/feed',                                     topics: ['Art', 'Culture'] },
  { name: 'Hyperallergic',     url: 'https://hyperallergic.com/feed/',                                  topics: ['Art', 'Culture'] },
  { name: 'The Art Newspaper', url: 'https://www.theartnewspaper.com/rss',                              topics: ['Art'] },

  // Pet Care
  { name: 'AKC',               url: 'https://www.akc.org/feed/',                                        topics: ['Pet Care'] },
  { name: 'PetMD',             url: 'https://www.petmd.com/feed',                                       topics: ['Pet Care'] },
  { name: 'VOSD',              url: 'https://www.vosd.in/blog/feed/',                                   topics: ['Pet Care'] },
  { name: 'Wild Welfare',      url: 'https://wildwelfare.org/feed/',                                    topics: ['Pet Care'] },
]

// Sources without RSS — fetched via Jina AI Reader (free web-to-text service)
const JINA_SOURCES: { name: string; url: string; topics: string[] }[] = []

const MAX_PER_SOURCE = 4

export interface NewsItem {
  title: string
  summary: string
  link: string
  source: string
  publishedAt: string
  imageUrl?: string
  feedTopics: string[]
}

async function scrapeWithJina(source: { name: string; url: string; topics: string[] }): Promise<NewsItem[]> {
  try {
    const res = await fetch(`https://r.jina.ai/${source.url}`, {
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return []
    const text = await res.text()

    // Extract markdown links: [Article Title](https://...)
    const linkPattern = /\[([^\]]{25,200})\]\((https?:\/\/[^)]+)\)/g
    const articles: NewsItem[] = []
    const seen = new Set<string>()
    let match

    while ((match = linkPattern.exec(text)) !== null && articles.length < MAX_PER_SOURCE) {
      const [, title, link] = match
      if (seen.has(link) || link === source.url) continue
      if (link.includes('#') || /\/(tag|category|author|page)\//i.test(link)) continue
      seen.add(link)
      articles.push({
        title: title.trim(),
        summary: '',
        link,
        source: source.name,
        publishedAt: new Date().toISOString(),
        feedTopics: source.topics,
      })
    }

    return articles
  } catch {
    return []
  }
}

export async function fetchAllNews(): Promise<NewsItem[]> {
  const rawResults: NewsItem[] = []

  await Promise.allSettled([
    // RSS feeds
    ...RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url)
      for (const item of parsed.items.slice(0, MAX_PER_SOURCE)) {
        if (!item.title || !item.link) continue
        rawResults.push({
          title: item.title,
          summary: item.contentSnippet ?? '',
          link: item.link,
          source: feed.name,
          publishedAt: item.pubDate ?? '',
          imageUrl: item['media:content']?.$.url ?? item['media:thumbnail']?.$.url ?? item.enclosure?.url ?? (item['content:encoded'] ? extractFirstImage(item['content:encoded']) : undefined),
          feedTopics: expandTopicsFromContent(item.title, item.contentSnippet ?? '', feed.topics),
        })
      }
    }),
    // Jina-scraped sources
    ...JINA_SOURCES.map(async (source) => {
      const articles = await scrapeWithJina(source)
      rawResults.push(...articles)
    }),
  ])

  // Deduplicate by URL — same story from two feeds should only appear once
  const seenUrls = new Set<string>()
  const deduped = rawResults.filter(item => {
    if (seenUrls.has(item.link)) return false
    seenUrls.add(item.link)
    return true
  })

  // Secondary cap: max MAX_PER_SOURCE articles per source name
  const countBySource: Record<string, number> = {}
  const results: NewsItem[] = []
  for (const item of deduped) {
    countBySource[item.source] = (countBySource[item.source] ?? 0) + 1
    if (countBySource[item.source] <= MAX_PER_SOURCE) results.push(item)
  }

  return results
}
