export const maxDuration = 60

import { fetchAllNews } from '@/lib/fetchNews'
import { writeNewsCache } from '@/lib/newsCache'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  let articles
  try {
    articles = await fetchAllNews()
  } catch (err) {
    console.error('[CACHE] fetchAllNews threw:', err)
    return Response.json({ ok: false, error: String(err) }, { status: 500 })
  }

  const { written, count } = await writeNewsCache(articles)
  console.log(`[CACHE] fetched=${count} written=${written}`)

  return Response.json({ ok: true, fetched: count, written })
}
