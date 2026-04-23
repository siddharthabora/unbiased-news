import { fetchAllNews } from '@/lib/fetchNews'
import { selectAndSummarize } from '@/lib/processNews'
import { sendDigestEmail } from '@/lib/sendEmail'

const TEST_SUBSCRIBERS = [
  { email: 'siddhartha.agspert@gmail.com', topics: ['Geopolitics'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['World'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['War & Conflict'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Technology'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Finance'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Stocks & Investments'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Crypto & Web3'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Supply Chain'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Music'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Art'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Culture'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Entertainment'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Health & Wellness'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Science'] },
  { email: 'siddhartha.agspert@gmail.com', topics: ['Environment'] },
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
