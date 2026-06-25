export const maxDuration = 60

import { supabase } from '@/lib/supabase'
import { fetchAllNews } from '@/lib/fetchNews'
import { readNewsCache } from '@/lib/newsCache'
import { selectAndSummarize } from '@/lib/processNews'
import { sendDigestEmail } from '@/lib/sendEmail'

function isNineAmInTimezone(timezone: string): boolean {
  try {
    const now = new Date()
    const hour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      }).format(now)
    )
    const minute = parseInt(
      new Intl.DateTimeFormat('en-US', {
        minute: 'numeric',
        timeZone: timezone,
      }).format(now)
    )
    return hour === 9 && minute < 30
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  // Verify this is called by Vercel cron, not a random visitor
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Find subscribers whose local time is currently 9am
  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('email, topics, timezone')

  if (error) {
    console.error('Supabase error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const eligible = (subscribers ?? []).filter((s) =>
    isNineAmInTimezone(s.timezone)
  )

  if (eligible.length === 0) {
    return Response.json({ ok: true, sent: 0, message: 'No subscribers at 9am right now' })
  }

  const start = Date.now()
  // Fetch news once for all eligible subscribers
  let allNews = await readNewsCache()
  if (!allNews) {
    console.log('[CACHE] miss or stale — falling back to live fetch')
    allNews = await fetchAllNews()
  }
  console.log(`[TIMING] prod RSS_FETCH_MS=${Date.now() - start}`)

  // Send personalized digests in parallel
  const results = await Promise.allSettled(
    eligible.map(async (subscriber) => {
      const topics: string[] = subscriber.topics ?? []
      const digest = await selectAndSummarize(allNews, topics, subscriber.timezone)
      if (digest.length === 0) return { email: subscriber.email, articles: 0, status: 'skipped' }
      await sendDigestEmail(subscriber.email, topics, digest)
      return { email: subscriber.email, articles: digest.length }
    })
  )

  console.log(`[TIMING] prod SUBSCRIBER_LOOP_MS=${Date.now() - start}`)

  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? { email: eligible[i].email, status: 'sent', articles: r.value.articles }
      : { email: eligible[i].email, status: 'failed', error: String(r.reason) }
  )

  console.log('Cron digest run:', JSON.stringify(summary))
  console.log(`[TIMING] prod TOTAL_MS=${Date.now() - start}`)
  console.log(`[TIMING] prod SUBSCRIBER_COUNT=${eligible.length}`)
  return Response.json({
    ok: true,
    sent: summary.filter(s => s.status === 'sent').length,
    failed: summary.filter(s => s.status === 'failed').length,
  })
}
