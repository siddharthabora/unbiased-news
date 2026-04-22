import { fetchAllNews } from '@/lib/fetchNews'
import { selectAndSummarize } from '@/lib/processNews'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const topicsParam = searchParams.get('topics') ?? 'Technology,Geopolitics'
  const topics = topicsParam.split(',').map((t) => t.trim())

  const allNews = await fetchAllNews()
  const digest = await selectAndSummarize(allNews, topics)

  return Response.json({ topics, rawCount: allNews.length, digest })
}
