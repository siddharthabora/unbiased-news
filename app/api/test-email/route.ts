import { fetchAllNews } from '@/lib/fetchNews'
import { selectAndSummarize } from '@/lib/processNews'
import { sendDigestEmail } from '@/lib/sendEmail'

const TEST_SUBSCRIBERS = [
  { email: 'siddhartha.agspert@gmail.com', topics: ['Technology'] },
  { email: 'siddhartha@agspert.com',        topics: ['Culture'] },
  { email: 'siddharthasbora101@gmail.com',  topics: ['Health & Wellness'] },
]

export async function GET() {
  const allNews = await fetchAllNews()

  const results = await Promise.allSettled(
    TEST_SUBSCRIBERS.map(async ({ email, topics }) => {
      const digest = await selectAndSummarize(allNews, topics)
      await sendDigestEmail(email, topics, digest)
      return { email, topics, articles: digest.length }
    })
  )

  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? { ...r.value, status: 'sent' }
      : { email: TEST_SUBSCRIBERS[i].email, status: 'failed', error: String(r.reason) }
  )

  return Response.json({ ok: true, summary })
}
