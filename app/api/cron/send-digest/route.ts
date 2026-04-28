import { supabase } from '@/lib/supabase'
import { fetchAllNews } from '@/lib/fetchNews'
import { selectAndSummarize } from '@/lib/processNews'
import { sendDigestEmail } from '@/lib/sendEmail'

function isNineAmInTimezone(timezone: string): boolean {
  try {
    const hour = parseInt(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      }).format(new Date())
    )
    return hour === 9
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

  // Fetch news once for all eligible subscribers
  const allNews = await fetchAllNews()

  // Send personalized digests in parallel
  const results = await Promise.allSettled(
    eligible.map(async (subscriber) => {
      const topics: string[] = subscriber.topics ?? []
      const digest = await selectAndSummarize(allNews, topics)
      if (digest.length === 0) return { email: subscriber.email, articles: 0, status: 'skipped' }
      await sendDigestEmail(subscriber.email, topics, digest)
      return { email: subscriber.email, articles: digest.length }
    })
  )

  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? { email: eligible[i].email, status: 'sent', articles: r.value.articles }
      : { email: eligible[i].email, status: 'failed', error: String(r.reason) }
  )

  console.log('Cron digest run:', JSON.stringify(summary))
  return Response.json({ ok: true, sent: eligible.length, summary })
}
