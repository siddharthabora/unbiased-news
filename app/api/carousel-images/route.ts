import { fetchAllNews } from '@/lib/fetchNews'

export const revalidate = 3600 // Next.js caches this response for 1 hour

const COLUMN_TOPICS: Record<string, string[]> = {
  left1:  ['Geopolitics', 'War & Conflict', 'World'],
  left2:  ['Technology', 'Finance', 'Crypto & Web3'],
  right1: ['Health & Wellness', 'Science', 'Environment'],
  right2: ['Entertainment', 'Music', 'Art', 'Culture', 'Supply Chain', 'Stocks & Investments'],
}

export async function GET() {
  const allNews = await fetchAllNews()
  const withImages = allNews.filter(
    (item) => item.imageUrl && item.imageUrl.startsWith('http')
  )

  const result: Record<string, string[]> = { left1: [], left2: [], right1: [], right2: [] }
  const used = new Set<string>()

  // First pass: fill each column from its own topic group
  for (const [group, topics] of Object.entries(COLUMN_TOPICS)) {
    const matches = withImages.filter(
      (item) => !used.has(item.imageUrl!) && item.feedTopics.some((t) => topics.includes(t))
    )
    for (const item of matches.slice(0, 10)) {
      result[group].push(item.imageUrl!)
      used.add(item.imageUrl!)
    }
  }

  // Second pass: fill any column still under 10 from the remaining pool
  const remaining = withImages.filter((item) => !used.has(item.imageUrl!))
  let ri = 0
  for (const group of Object.keys(result)) {
    while (result[group].length < 10 && ri < remaining.length) {
      result[group].push(remaining[ri].imageUrl!)
      used.add(remaining[ri].imageUrl!)
      ri++
    }
  }

  return Response.json(result)
}
