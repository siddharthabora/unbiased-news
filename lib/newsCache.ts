import { supabase } from './supabase'
import { NewsItem } from './fetchNews'

const MAX_CACHE_AGE_MS = 2 * 60 * 60 * 1000

export async function readNewsCache(): Promise<NewsItem[] | null> {
  const { data, error } = await supabase
    .from('news_cache')
    .select('articles, fetched_at')
    .eq('id', 'latest')
    .single()

  if (error || !data) return null

  const age = Date.now() - new Date(data.fetched_at).getTime()
  if (age > MAX_CACHE_AGE_MS) return null

  return data.articles as NewsItem[]
}

export async function writeNewsCache(articles: NewsItem[]): Promise<{ written: boolean; count: number }> {
  const MIN_ARTICLES = Number(process.env.NEWS_CACHE_MIN_ARTICLES ?? 30)

  if (articles.length < MIN_ARTICLES) {
    return { written: false, count: articles.length }
  }

  const { error } = await supabase
    .from('news_cache')
    .upsert(
      { id: 'latest', articles, article_count: articles.length, fetched_at: new Date().toISOString() },
      { onConflict: 'id' }
    )

  if (error) return { written: false, count: articles.length }

  return { written: true, count: articles.length }
}
