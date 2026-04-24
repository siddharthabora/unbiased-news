import OpenAI from 'openai'
import { NewsItem } from './fetchNews'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

// Step 1: cheap call — select which article indices are most relevant to the user's topics
async function selectRelevantIndices(news: NewsItem[], topics: string[]): Promise<number[]> {
  const articlesText = news
    .map((item, i) => `[${i}] [${item.source}] ${item.title}`)
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
        content: `Select up to 10 articles most relevant to the subscriber's topic(s): ${topics.join(', ')}.

SELECTION RULES:
1. Include an article if it directly covers the topic OR if its content is a direct operational consequence of the topic — for example: fuel costs rising because of armed conflict → relevant to War & Conflict; a manufacturer's green energy adoption → relevant to both Supply Chain and Environment; defense procurement → relevant to both War & Conflict and Supply Chain.
2. Do NOT include articles with only vague thematic overlap. A story must have a clear, traceable connection to the topic to qualify.
3. If two or more articles cover the same underlying event or announcement, include only the single most substantive or primary-source one. Never pick the same story twice from different outlets.
4. Do not pick more than 3 articles from the same source.
5. If fewer than 10 relevant articles exist, return fewer — do not pad with loosely related content.

Articles:
${articlesText}

Respond ONLY with a JSON array of integers (article indices), e.g. [3, 7, 12, ...]`,
      },
    ],
  })

  const raw = response.choices[0].message.content ?? '[]'
  const match = raw.match(/\[[\s\S]*?\]/)
  const indices: number[] = JSON.parse(match?.[0] ?? '[]')
  return indices.slice(0, 10)
}

// Step 2: deep analysis call — full authenticity + bias + newsletter summary for the selected 10
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
  topics: string[]
): Promise<ProcessedNewsItem[]> {
  // Pre-filter by feedTopics before passing to the AI — eliminates cross-topic contamination
  const relevant = news.filter(item => item.feedTopics.some(t => topics.includes(t)))
  const pool = relevant.length >= 8 ? relevant : news
  const indices = await selectRelevantIndices(pool, topics)
  const selected = indices.map((i) => pool[i])
  return analyzeArticles(selected)
}
