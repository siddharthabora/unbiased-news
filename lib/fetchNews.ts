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

type FeedEntry = {
  name: string
  url: string
  topics: string[]
  tier: 1 | 2
  regions: string[]  // IANA region keys; empty array = global (no regional preference)
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

const RSS_FEEDS: FeedEntry[] = [

  // ─── TIER 1 ────────────────────────────────────────────────────────────────

  // Geopolitics / World
  { name: 'Al Jazeera',             url: 'https://www.aljazeera.com/xml/rss/all.xml',                                                             topics: ['Geopolitics', 'World'],                                        tier: 1, regions: ['middle-east'] },
  { name: 'The Diplomat',           url: 'https://thediplomat.com/feed/',                                                                         topics: ['Geopolitics', 'World'],                                        tier: 1, regions: ['east-asia', 'southeast-asia'] },
  { name: 'The Guardian World',     url: 'https://www.theguardian.com/world/rss',                                                                  topics: ['Geopolitics', 'World'],                                        tier: 1, regions: ['europe'] },
  { name: 'NPR',                    url: 'https://feeds.npr.org/1001/rss.xml',                                                                     topics: ['Geopolitics', 'World'],                                        tier: 1, regions: ['north-america'] },

  // Finance / Business
  { name: 'The Guardian Business',  url: 'https://www.theguardian.com/uk/business/rss',                                                           topics: ['Finance', 'Business'],                                         tier: 1, regions: ['europe'] },
  { name: 'BBC Business',           url: 'https://feeds.bbci.co.uk/news/business/rss.xml',                                                        topics: ['Finance', 'Business'],                                         tier: 1, regions: ['europe'] },

  // Technology
  { name: 'TechCrunch',             url: 'https://techcrunch.com/feed/',                                                                          topics: ['Technology'],                                                  tier: 1, regions: ['north-america'] },
  { name: 'TechCrunch AI',          url: 'https://techcrunch.com/category/artificial-intelligence/feed/',                                         topics: ['Technology'],                                                  tier: 1, regions: ['north-america'] },
  { name: 'Ars Technica',           url: 'https://feeds.arstechnica.com/arstechnica/index',                                                       topics: ['Technology'],                                                  tier: 1, regions: ['north-america'] },
  { name: 'Wired',                  url: 'https://www.wired.com/feed/rss',                                                                        topics: ['Technology'],                                                  tier: 1, regions: ['north-america'] },
  { name: 'BBC Technology',         url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',                                                      topics: ['Technology'],                                                  tier: 1, regions: ['europe'] },
  { name: 'The Guardian Tech',      url: 'https://www.theguardian.com/uk/technology/rss',                                                         topics: ['Technology'],                                                  tier: 1, regions: ['europe'] },

  // Health & Wellness
  { name: 'BBC Health',             url: 'https://feeds.bbci.co.uk/news/health/rss.xml',                                                          topics: ['Health & Wellness'],                                           tier: 1, regions: ['europe'] },
  { name: 'The Guardian Health',    url: 'https://www.theguardian.com/society/health/rss',                                                        topics: ['Health & Wellness'],                                           tier: 1, regions: ['europe'] },
  { name: 'Science Daily Health',   url: 'https://www.sciencedaily.com/rss/top/health.xml',                                                       topics: ['Health & Wellness'],                                           tier: 1, regions: ['north-america'] },
  { name: 'Healthline',             url: 'https://www.healthline.com/rss/health-news',                                                            topics: ['Health & Wellness'],                                           tier: 1, regions: ['north-america'] },

  // Music / Culture / Entertainment
  { name: 'Rolling Stone',          url: 'https://www.rollingstone.com/music/feed/',                                                              topics: ['Music', 'Culture', 'Entertainment'],                           tier: 1, regions: ['north-america'] },
  { name: 'NME',                    url: 'https://www.nme.com/news/music/feed',                                                                   topics: ['Music', 'Culture'],                                            tier: 1, regions: ['europe'] },
  { name: 'Pitchfork',              url: 'https://pitchfork.com/feed/feed-news/rss',                                                              topics: ['Music', 'Culture'],                                            tier: 1, regions: ['north-america'] },
  { name: 'Consequence Sound',      url: 'https://consequence.net/category/music/feed',                                                           topics: ['Music', 'Culture'],                                            tier: 1, regions: ['north-america'] },
  { name: 'Variety',                url: 'https://variety.com/feed/',                                                                             topics: ['Culture', 'Entertainment'],                                    tier: 1, regions: ['north-america'] },
  { name: 'IndieWire',              url: 'https://www.indiewire.com/feed/',                                                                       topics: ['Culture', 'Entertainment'],                                    tier: 1, regions: ['north-america'] },
  { name: 'BBC Entertainment',      url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',                                          topics: ['Music', 'Culture', 'Entertainment'],                           tier: 1, regions: ['europe'] },
  { name: 'The Guardian Culture',   url: 'https://www.theguardian.com/culture/rss',                                                               topics: ['Culture', 'Entertainment'],                                    tier: 1, regions: ['europe'] },

  // Science / Environment
  { name: 'BBC Science',            url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',                                         topics: ['Science', 'Environment'],                                      tier: 1, regions: ['europe'] },
  { name: 'The Guardian Env',       url: 'https://www.theguardian.com/environment/rss',                                                           topics: ['Environment', 'Science'],                                      tier: 1, regions: ['europe'] },
  { name: 'Inside Climate News',    url: 'https://insideclimatenews.org/feed/',                                                                   topics: ['Environment'],                                                 tier: 1, regions: ['north-america'] },
  { name: 'Carbon Brief',           url: 'https://www.carbonbrief.org/feed/',                                                                     topics: ['Environment', 'Science'],                                      tier: 1, regions: ['europe'] },
  { name: 'Yale Environment 360',   url: 'https://e360.yale.edu/feed.xml',                                                                        topics: ['Environment', 'Science'],                                      tier: 1, regions: ['north-america'] },

  // Crypto & Web3
  { name: 'CoinDesk',               url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',                                                       topics: ['Crypto & Web3'],                                               tier: 1, regions: [] },
  { name: 'CoinTelegraph',          url: 'https://cointelegraph.com/rss',                                                                         topics: ['Crypto & Web3'],                                               tier: 1, regions: [] },
  { name: 'Decrypt',                url: 'https://decrypt.co/feed',                                                                               topics: ['Crypto & Web3'],                                               tier: 1, regions: [] },

  // Stocks & Investments / Finance
  { name: 'Investing.com',          url: 'https://www.investing.com/rss/news.rss',                                                                topics: ['Stocks & Investments'],                                        tier: 1, regions: [] },
  { name: 'CNBC Markets',           url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664',                   topics: ['Stocks & Investments', 'Finance'],                             tier: 1, regions: ['north-america'] },
  { name: 'Economic Times',         url: 'https://economictimes.indiatimes.com/markets/rss.cms',                                                  topics: ['Stocks & Investments', 'Finance'],                             tier: 1, regions: ['south-asia'] },

  // Supply Chain
  { name: 'Supply Chain Dive',      url: 'https://www.supplychaindive.com/feeds/news/',                                                           topics: ['Supply Chain'],                                                tier: 1, regions: ['north-america'] },
  { name: 'Manufacturing Dive',     url: 'https://www.manufacturingdive.com/feeds/news/',                                                         topics: ['Supply Chain'],                                                tier: 1, regions: ['north-america'] },
  { name: 'FreightWaves',           url: 'https://www.freightwaves.com/news/feed',                                                                topics: ['Supply Chain'],                                                tier: 1, regions: ['north-america'] },

  // War & Conflict
  { name: 'War on the Rocks',       url: 'https://warontherocks.com/feed/',                                                                       topics: ['War & Conflict', 'Geopolitics'],                               tier: 1, regions: ['north-america'] },
  { name: 'Defense One',            url: 'https://www.defenseone.com/rss/all/',                                                                   topics: ['War & Conflict'],                                              tier: 1, regions: ['north-america'] },
  { name: 'Breaking Defense',       url: 'https://breakingdefense.com/feed/',                                                                     topics: ['War & Conflict'],                                              tier: 1, regions: ['north-america'] },

  // Art
  { name: 'Artnet News',            url: 'https://news.artnet.com/feed',                                                                          topics: ['Art', 'Culture'],                                              tier: 1, regions: ['north-america'] },
  { name: 'Hyperallergic',          url: 'https://hyperallergic.com/feed/',                                                                       topics: ['Art', 'Culture'],                                              tier: 1, regions: ['north-america'] },

  // Pet Care
  { name: 'AKC',                    url: 'https://www.akc.org/feed/',                                                                             topics: ['Pet Care'],                                                    tier: 1, regions: ['north-america'] },
  { name: 'PetMD',                  url: 'https://www.petmd.com/feed',                                                                            topics: ['Pet Care'],                                                    tier: 1, regions: ['north-america'] },
  { name: 'VOSD',                   url: 'https://www.vosd.in/blog/feed/',                                                                        topics: ['Pet Care'],                                                    tier: 1, regions: ['south-asia'] },
  { name: 'Wild Welfare',           url: 'https://wildwelfare.org/feed/',                                                                          topics: ['Pet Care'],                                                    tier: 1, regions: [] },

  // ─── TIER 2 ────────────────────────────────────────────────────────────────

  // Geopolitics / World — regional & international press
  { name: 'Deutsche Welle',         url: 'https://rss.dw.com/rdf/rss-en-all',                                                                    topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['europe'] },
  { name: 'France 24',              url: 'https://www.france24.com/en/rss',                                                                       topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['europe', 'middle-east'] },
  { name: 'Foreign Policy',         url: 'https://foreignpolicy.com/feed/',                                                                       topics: ['Geopolitics', 'World'],                                        tier: 2, regions: [] },
  { name: 'Channel NewsAsia',       url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml',                                  topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['southeast-asia'] },
  { name: 'CNA Business',           url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6936',                    topics: ['Finance', 'Stocks & Investments'],                             tier: 2, regions: ['southeast-asia'] },
  { name: 'Straits Times',          url: 'https://www.straitstimes.com/news/world/rss.xml',                                                       topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['southeast-asia'] },
  { name: 'Business Times SG Tech', url: 'https://www.businesstimes.com.sg/rss/technology',                                                       topics: ['Technology'],                                                  tier: 2, regions: ['southeast-asia'] },
  { name: 'Business Times SG Finance', url: 'https://www.businesstimes.com.sg/rss/banking-finance',                                               topics: ['Finance', 'Stocks & Investments'],                             tier: 2, regions: ['southeast-asia'] },
  { name: 'Rest of World',          url: 'https://restofworld.org/feed/latest/',                                                                   topics: ['Technology'],                                                  tier: 2, regions: [] },
  { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/4/feed',                                                                    topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['east-asia'] },
  { name: 'The Hindu',              url: 'https://www.thehindu.com/news/international/feeder/default.rss',                                        topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['south-asia'] },
  { name: 'ABC Australia',          url: 'https://www.abc.net.au/news/feed/51120/rss.xml',                                                        topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['oceania'] },
  { name: 'Arab News',              url: 'https://www.arabnews.com/rss.xml',                                                                      topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['middle-east'] },

  // War & Conflict
  { name: 'Bellingcat',             url: 'https://www.bellingcat.com/feed/',                                                                      topics: ['War & Conflict', 'Geopolitics'],                               tier: 2, regions: [] },
  { name: 'ISW',                    url: 'https://www.understandingwar.org/feeds/all',                                                            topics: ['War & Conflict', 'Geopolitics'],                               tier: 2, regions: [] },
  { name: 'Military Times',         url: 'https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml',                                   topics: ['War & Conflict'],                                              tier: 2, regions: ['north-america'] },
  { name: 'Task & Purpose',         url: 'https://taskandpurpose.com/feed/',                                                                      topics: ['War & Conflict'],                                              tier: 2, regions: ['north-america'] },

  // Technology
  { name: 'Tech.eu',                url: 'https://tech.eu/feed/',                                                                                 topics: ['Technology'],                                                  tier: 2, regions: ['europe'] },
  { name: 'Sifted',                 url: 'https://sifted.eu/feed',                                                                                topics: ['Technology'],                                                  tier: 2, regions: ['europe'] },
  { name: 'MIT Technology Review',  url: 'https://www.technologyreview.com/feed/',                                                                topics: ['Technology'],                                                  tier: 2, regions: ['north-america'] },
  { name: 'The Verge',              url: 'https://www.theverge.com/rss/index.xml',                                                                topics: ['Technology'],                                                  tier: 2, regions: ['north-america'] },
  { name: 'IEEE Spectrum',          url: 'https://spectrum.ieee.org/feeds/feed.rss',                                                              topics: ['Technology', 'Science'],                                       tier: 2, regions: [] },
  { name: 'VentureBeat',            url: 'https://venturebeat.com/feed/',                                                                         topics: ['Technology'],                                                  tier: 2, regions: ['north-america'] },
  { name: 'The Hindu Tech',         url: 'https://www.thehindu.com/sci-tech/technology/feeder/default.rss',                                       topics: ['Technology'],                                                  tier: 2, regions: ['south-asia'] },
  { name: 'ET Tech',                url: 'https://economictimes.indiatimes.com/tech/rss.cms',                                                     topics: ['Technology'],                                                  tier: 2, regions: ['south-asia'] },
  { name: 'Inc42',                  url: 'https://inc42.com/feed/',                                                                               topics: ['Finance', 'Stocks & Investments'],                             tier: 2, regions: ['south-asia'] },
  { name: 'YourStory',              url: 'https://yourstory.com/feed',                                                                            topics: ['Technology'],                                                  tier: 2, regions: ['south-asia'] },
  { name: 'Financial Express Tech', url: 'https://www.financialexpress.com/industry/technology/feed/',                                             topics: ['Technology'],                                                  tier: 2, regions: ['south-asia'] },

  // Finance / Stocks & Investments
  { name: 'MarketWatch',            url: 'https://feeds.marketwatch.com/marketwatch/topstories/',                                                 topics: ['Finance', 'Stocks & Investments'],                             tier: 2, regions: ['north-america'] },
  { name: 'Business Insider',       url: 'https://feeds.businessinsider.com/custom/all',                                                          topics: ['Finance', 'Stocks & Investments'],                             tier: 2, regions: ['north-america'] },
  { name: 'Sydney Morning Herald',  url: 'https://www.smh.com.au/rss/world.xml',                                                                  topics: ['Geopolitics', 'World'],                                        tier: 2, regions: ['oceania'] },
  { name: 'Australian Financial Review', url: 'https://www.afr.com/rss/world.xml',                                                               topics: ['Finance', 'Stocks & Investments'],                             tier: 2, regions: ['oceania'] },
  { name: 'iTnews',                    url: 'https://www.itnews.com.au/rss/rss.ashx',                                                               topics: ['Technology'],                                                  tier: 2, regions: ['oceania'] },
  { name: 'Motley Fool',            url: 'https://www.fool.com/feeds/index.aspx',                                                                 topics: ['Stocks & Investments'],                                        tier: 2, regions: ['north-america'] },

  // Crypto & Web3
  { name: 'The Block',              url: 'https://www.theblockcrypto.com/rss.xml',                                                                topics: ['Crypto & Web3'],                                               tier: 2, regions: [] },
  { name: 'Blockworks',             url: 'https://blockworks.co/feed',                                                                            topics: ['Crypto & Web3'],                                               tier: 2, regions: [] },
  { name: 'Bitcoin Magazine',       url: 'https://bitcoinmagazine.com/.rss/full/',                                                                topics: ['Crypto & Web3'],                                               tier: 2, regions: [] },

  // Supply Chain
  { name: 'Trucking Dive',          url: 'https://www.truckingdive.com/feeds/news/',                                                              topics: ['Supply Chain'],                                                tier: 2, regions: ['north-america'] },
  { name: 'Logistics Management',   url: 'https://www.logisticsmgmt.com/rss',                                                                     topics: ['Supply Chain'],                                                tier: 2, regions: ['north-america'] },

  // Health & Wellness
  { name: 'STAT News',              url: 'https://www.statnews.com/feed/',                                                                        topics: ['Health & Wellness'],                                           tier: 2, regions: ['north-america'] },
  { name: 'KFF Health News',        url: 'https://kffhealthnews.org/feed/',                                                                       topics: ['Health & Wellness'],                                           tier: 2, regions: ['north-america'] },
  { name: 'MedPage Today',          url: 'https://www.medpagetoday.com/rss/headlines.xml',                                                        topics: ['Health & Wellness'],                                           tier: 2, regions: ['north-america'] },
  { name: 'The Hindu Health',       url: 'https://www.thehindu.com/sci-tech/health/feeder/default.rss',                                           topics: ['Health & Wellness'],                                           tier: 2, regions: ['south-asia'] },

  // Entertainment / Music / Culture
  { name: 'Deadline',               url: 'https://deadline.com/feed/',                                                                            topics: ['Entertainment', 'Culture'],                                    tier: 2, regions: ['north-america'] },
  { name: 'Billboard',              url: 'https://www.billboard.com/feed/',                                                                       topics: ['Music', 'Entertainment'],                                      tier: 2, regions: ['north-america'] },
  { name: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com/feed/',                                                               topics: ['Entertainment', 'Culture'],                                    tier: 2, regions: ['north-america'] },
  { name: 'Stereogum',              url: 'https://www.stereogum.com/feed/',                                                                       topics: ['Music', 'Culture'],                                            tier: 2, regions: ['north-america'] },

  // Science / Environment
  { name: 'New Scientist',          url: 'https://www.newscientist.com/feed/home/',                                                               topics: ['Science', 'Environment'],                                      tier: 2, regions: ['europe'] },
  { name: 'Scientific American',    url: 'https://www.scientificamerican.com/platform/syndication/rss/',                                          topics: ['Science', 'Environment'],                                      tier: 2, regions: ['north-america'] },
  { name: 'Science News',           url: 'https://www.sciencenews.org/feed',                                                                      topics: ['Science'],                                                     tier: 2, regions: [] },
  { name: 'Quanta Magazine',        url: 'https://www.quantamagazine.org/feed/',                                                                  topics: ['Science'],                                                     tier: 2, regions: [] },
  { name: 'Grist',                  url: 'https://grist.org/feed/',                                                                               topics: ['Environment'],                                                 tier: 2, regions: ['north-america'] },
  { name: 'Mongabay',               url: 'https://news.mongabay.com/feed/',                                                                       topics: ['Environment', 'Science'],                                      tier: 2, regions: [] },

  // Art
  { name: 'Dezeen',                 url: 'https://feeds.feedburner.com/Dezeen',                                                                   topics: ['Art', 'Culture'],                                              tier: 2, regions: ['europe'] },
  { name: 'Colossal',               url: 'https://www.thisiscolossal.com/feed/',                                                                  topics: ['Art', 'Culture'],                                              tier: 2, regions: ['north-america'] },

  // Pet Care
  { name: 'Whole Dog Journal',      url: 'https://www.whole-dog-journal.com/feed/',                                                               topics: ['Pet Care'],                                                    tier: 2, regions: ['north-america'] },
  { name: 'Dogster',                url: 'https://www.dogster.com/feed',                                                                          topics: ['Pet Care'],                                                    tier: 2, regions: ['north-america'] },
]

// Sources without RSS — fetched via Jina AI Reader (free web-to-text service)
const JINA_SOURCES: FeedEntry[] = []

const MAX_PER_SOURCE = 4

export interface NewsItem {
  title: string
  summary: string
  link: string
  source: string
  publishedAt: string
  imageUrl?: string
  feedTopics: string[]
  tier: 1 | 2
  regions: string[]
}

async function scrapeWithJina(source: FeedEntry): Promise<NewsItem[]> {
  try {
    const res = await fetch(`https://r.jina.ai/${source.url}`, {
      headers: { Accept: 'text/plain' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return []
    const text = await res.text()

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
        tier: source.tier,
        regions: source.regions,
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
          imageUrl:
            item['media:content']?.$.url ??
            item['media:thumbnail']?.$.url ??
            item.enclosure?.url ??
            (item['content:encoded'] ? extractFirstImage(item['content:encoded']) : undefined),
          feedTopics: expandTopicsFromContent(item.title, item.contentSnippet ?? '', feed.topics),
          tier: feed.tier,
          regions: feed.regions,
        })
      }
    }),
    // Jina-scraped sources
    ...JINA_SOURCES.map(async (source) => {
      const articles = await scrapeWithJina(source)
      rawResults.push(...articles)
    }),
  ])

  // Deduplicate by URL
  const seenUrls = new Set<string>()
  const deduped = rawResults.filter(item => {
    if (seenUrls.has(item.link)) return false
    seenUrls.add(item.link)
    return true
  })

  // Cap at MAX_PER_SOURCE articles per source name
  const countBySource: Record<string, number> = {}
  const results: NewsItem[] = []
  for (const item of deduped) {
    countBySource[item.source] = (countBySource[item.source] ?? 0) + 1
    if (countBySource[item.source] <= MAX_PER_SOURCE) results.push(item)
  }

  return results
}
