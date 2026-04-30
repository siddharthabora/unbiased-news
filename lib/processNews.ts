import OpenAI from 'openai'
import { NewsItem } from './fetchNews'
import { getRegionPriorityList } from './regionMap'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// 60% of each topic's slots target regional sources; remainder filled from global.
const REGIONAL_RATIO = 0.6

export interface BiasAxis {
  left_pct: number
  right_pct: number
  reasoning: string
}

export interface GeopoliticalAlignment {
  western_aligned_pct: number
  non_western_aligned_pct: number
  reasoning: string
}

export interface ProcessedNewsItem {
  // Original metadata
  title: string
  link: string
  source: string
  publishedAt: string
  imageUrl?: string

  // Newsletter content (from Analysis 3)
  rewrittenHeadline: string
  aiSummary: string
  whatToWatch: string

  // Authenticity (from Analysis 1)
  authenticityScore: number       // 0-100
  authenticityReasoning: string
  citationChainDepth: number      // 0 = primary reporter, higher = more aggregation
  redFlags: string[]

  // Bias (from Analysis 2)
  neutralityScore: number         // 0-100, higher = more neutral
  politicalSpectrum: BiasAxis
  geopoliticalAlignment: GeopoliticalAlignment
  loadedLanguageExamples: { original: string; neutral_alternative: string }[]
  omissionsDetected: string[]
  headlineAccuracy: string
}

// Returns true if the article's source has any region overlapping the subscriber's priority list.
// Sources with empty regions [] are global — never count as regional.
function isRegionalSource(item: NewsItem, regionPriorityList: string[]): boolean {
  if (item.regions.length === 0 || regionPriorityList.length === 0) return false
  return item.regions.some(r => regionPriorityList.includes(r))
}

// Returns the best (lowest) priority index of an item's regions within the subscriber's list.
// Lower index = closer match to the subscriber's primary region.
function regionPriorityScore(item: NewsItem, regionPriorityList: string[]): number {
  return item.regions.reduce((best, r) => {
    const idx = regionPriorityList.indexOf(r)
    return idx !== -1 && idx < best ? idx : best
  }, Infinity)
}

// Sorts a pool so regional articles come first, with Tier 1 prioritised over Tier 2 within each group.
// Within the same tier, sources whose region appears earlier in regionPriorityList rank higher.
// Order: regional Tier 1 (primary region first) → regional Tier 2 (primary region first) → global Tier 1 → global Tier 2
function sortByRegionalPriority(pool: NewsItem[], regionPriorityList: string[]): NewsItem[] {
  return [...pool].sort((a, b) => {
    const aReg = isRegionalSource(a, regionPriorityList)
    const bReg = isRegionalSource(b, regionPriorityList)
    if (aReg !== bReg) return aReg ? -1 : 1
    if (a.tier !== b.tier) return a.tier - b.tier
    return regionPriorityScore(a, regionPriorityList) - regionPriorityScore(b, regionPriorityList)
  })
}

// Step 1: cheap GPT call — select the best articles for a single topic.
// Articles are labelled [R] (regional) or [G] (global) in the prompt so the model
// can respect the 60:40 target while still prioritising relevance.
async function selectRelevantIndices(
  news: NewsItem[],
  topic: string,
  maxCount: number,
  regionPriorityList: string[]
): Promise<number[]> {
  const regionalTarget = Math.round(maxCount * REGIONAL_RATIO)
  const globalTarget = maxCount - regionalTarget

  const articlesText = news
    .map((item, i) => {
      const label = isRegionalSource(item, regionPriorityList) ? 'R' : 'G'
      return `[${i}] [${label}] [${item.source}] ${item.title}`
    })
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    temperature: 0.1,
    messages: [
      {
        role: 'system',
        content: 'You are a strict news relevance filter. Return only a JSON array of integers.',
      },
      {
        role: 'user',
        content: `Select up to ${maxCount} articles that DIRECTLY cover the topic: "${topic}".

Articles are labelled [R] (regional — from the subscriber's geographic area) or [G] (global).
Target mix: ~${regionalTarget} from [R] sources and ~${globalTarget} from [G] sources.
If fewer than ${regionalTarget} relevant [R] articles exist, fill remaining slots from [G] — never leave slots empty to preserve the ratio.

SELECTION RULES:
1. Only include an article if it directly and specifically covers "${topic}". A clear, traceable connection is required — not vague thematic overlap.
2. If two or more articles cover the same underlying event, include only the single most substantive one. Never pick the same story twice even from different outlets.
3. Do not pick more than 1 article from the same source.
4. If fewer than ${maxCount} truly relevant articles exist, return fewer — never pad with loosely related content.
5. If zero articles are relevant, return an empty array [].

Articles:
${articlesText}

Respond ONLY with a JSON array of integers (article indices), e.g. [3, 7] or []`,
      },
    ],
  })

  const raw = response.choices[0].message.content ?? '[]'
  const match = raw.match(/\[[\s\S]*?\]/)
  const indices: number[] = JSON.parse(match?.[0] ?? '[]')
  return indices.slice(0, maxCount)
}

// Step 2: deep analysis call — full authenticity + bias + newsletter summary for selected articles.
async function analyzeArticles(articles: NewsItem[]): Promise<ProcessedNewsItem[]> {
  const articlesInput = articles
    .map(
      (item, i) =>
        `Article ${i}:\nSource: ${item.source}\nURL: ${item.link}\nDate: ${item.publishedAt}\nHeadline: ${item.title}\nText: ${item.summary ?? ''}`
    )
    .join('\n\n---\n\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `You are an independent, non-partisan international news analyst. Your job is to evaluate news articles for authenticity, source transparency, and political/ideological bias before they are published in a daily newsletter.

For each article, perform THREE sequential analyses:

## ANALYSIS 1: SOURCE BACKTRACKING & TRANSPARENCY SCORE
- Identify whether a primary source is cited (official statement, document, eyewitness, dataset)
- Estimate citation chain depth: 0 = outlet is the primary reporter, 1 = citing one outlet who was there, 2+ = aggregation of aggregation
- Note any red flags: anonymous-only sources, circular sourcing, vague attribution ("sources say", "experts believe"), no verifiable data
- Output: authenticity_confidence_score (0-100) and reasoning

## ANALYSIS 2: BIAS & INCLINATION MEASUREMENT
- Language analysis: loaded words, adjective density, passive voice to obscure agency, headline vs body alignment
- Framing analysis: whose voice is centered vs absent, what context is omitted, selection bias, false balance
- Geopolitical alignment: what power bloc's narrative does the framing favor (Western-aligned vs Non-Western-aligned, expressed as percentages)
- Political spectrum: left-leaning vs right-leaning (expressed as percentages, 50/50 = centrist)
- Overall neutrality score (0-100, higher = more neutral)
- Output: scores with reasoning for each axis, loaded language examples, detected omissions

## ANALYSIS 3: NEWSLETTER-READY SUMMARY
- Rewrite the headline to be neutral and factual (no sensationalism — if it could be clickbait, rewrite again)
- Write a 3-sentence summary covering only: who, what, when, where, and verifiable consequences. No opinion, no editorializing adjectives. Third-person, past tense.
- One sentence on what to watch (forward-looking context, clearly not a prediction)

## CRITICAL RULES
- You are a measurement instrument, not an opinion-maker. Report what you find, do not advocate.
- Every score must have reasoning. A number without explanation is useless.
- Bias is not a disqualifier. A well-sourced article with political lean is more valuable than a poorly-sourced neutral one.
- Do not fabricate corroboration. If you cannot verify whether other sources corroborate the article, say so.
- Cultural context matters: note the baseline you are measuring against.
- Rewritten headlines must be boring. Strip all framing from summaries.`,
      },
      {
        role: 'user',
        content: `Analyze the following ${articles.length} news articles. Return a JSON array with one object per article in this exact structure:

[
  {
    "article_index": 0,
    "authenticity": {
      "confidence_score": 85,
      "citation_chain_depth": 1,
      "red_flags": [],
      "reasoning": "..."
    },
    "bias": {
      "overall_neutrality_score": 70,
      "political_spectrum": { "left_pct": 45, "right_pct": 55, "reasoning": "..." },
      "geopolitical_alignment": { "western_aligned_pct": 65, "non_western_aligned_pct": 35, "reasoning": "..." },
      "loaded_language_examples": [{ "original": "...", "neutral_alternative": "..." }],
      "omissions_detected": ["..."],
      "headline_accuracy": "..."
    },
    "newsletter_content": {
      "rewritten_headline": "...",
      "summary": "...",
      "what_to_watch": "..."
    }
  }
]

Respond ONLY with the JSON array — no extra text.

Articles:
${articlesInput}`,
      },
    ],
  })

  const raw = response.choices[0].message.content ?? '[]'
  const match = raw.match(/\[[\s\S]*\]/)
  const results: {
    article_index: number
    authenticity: {
      confidence_score: number
      citation_chain_depth: number
      red_flags: string[]
      reasoning: string
    }
    bias: {
      overall_neutrality_score: number
      political_spectrum: { left_pct: number; right_pct: number; reasoning: string }
      geopolitical_alignment: { western_aligned_pct: number; non_western_aligned_pct: number; reasoning: string }
      loaded_language_examples: { original: string; neutral_alternative: string }[]
      omissions_detected: string[]
      headline_accuracy: string
    }
    newsletter_content: {
      rewritten_headline: string
      summary: string
      what_to_watch: string
    }
  }[] = JSON.parse(match?.[0] ?? '[]')

  return results.map((r) => {
    const original = articles[r.article_index]
    return {
      title: original.title,
      link: original.link,
      source: original.source,
      publishedAt: original.publishedAt,
      imageUrl: original.imageUrl,
      rewrittenHeadline: r.newsletter_content.rewritten_headline,
      aiSummary: r.newsletter_content.summary,
      whatToWatch: r.newsletter_content.what_to_watch,
      authenticityScore: r.authenticity.confidence_score,
      authenticityReasoning: r.authenticity.reasoning,
      citationChainDepth: r.authenticity.citation_chain_depth,
      redFlags: r.authenticity.red_flags ?? [],
      neutralityScore: r.bias.overall_neutrality_score,
      politicalSpectrum: r.bias.political_spectrum,
      geopoliticalAlignment: r.bias.geopolitical_alignment,
      loadedLanguageExamples: r.bias.loaded_language_examples ?? [],
      omissionsDetected: r.bias.omissions_detected ?? [],
      headlineAccuracy: r.bias.headline_accuracy,
    }
  })
}

export async function selectAndSummarize(
  news: NewsItem[],
  topics: string[],
  timezone?: string
): Promise<ProcessedNewsItem[]> {
  // Derive the subscriber's region priority list from their saved timezone.
  // Empty list = unknown timezone → all sources treated as global pool.
  const regionPriorityList = getRegionPriorityList(timezone ?? '')

  const usedUrls = new Set<string>()

  // Distribute 14 slots evenly across topics, minimum 2 per topic
  const perTopic = Math.max(2, Math.ceil(14 / topics.length))

  // Each topic selects then immediately analyzes its articles in parallel with other topics.
  // This replaces one massive 14-article GPT call with several small parallel calls (~2-3 articles each).
  const topicResults = await Promise.allSettled(
    topics.map(async (topic) => {
      const pool = news.filter(
        item => !usedUrls.has(item.link) && item.feedTopics.includes(topic)
      )
      if (pool.length === 0) return []

      const sorted = sortByRegionalPriority(pool, regionPriorityList)
      const indices = await selectRelevantIndices(sorted, topic, perTopic, regionPriorityList)

      const selected: NewsItem[] = []
      for (const i of indices) {
        const item = sorted[i]
        if (item && !usedUrls.has(item.link)) {
          usedUrls.add(item.link)
          selected.push(item)
        }
      }
      if (selected.length === 0) return []
      return analyzeArticles(selected)
    })
  )

  const allProcessed: ProcessedNewsItem[] = []
  for (const result of topicResults) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      allProcessed.push(...result.value)
    }
  }
  if (allProcessed.length === 0) return []
  return allProcessed
}
