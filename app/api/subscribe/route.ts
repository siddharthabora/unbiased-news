import { supabase } from '@/lib/supabase'

const VALID_TOPICS = new Set([
  'Technology', 'Finance', 'Geopolitics', 'Science', 'Health & Wellness',
  'Environment', 'War & Conflict', 'Crypto & Web3', 'Stocks & Investments',
  'Business', 'World', 'Supply Chain', 'Art', 'Music', 'Culture', 'Pet Care',
])

export async function POST(request: Request) {
  const { email, topics, timezone } = await request.json()

  if (!email || !topics?.length || !timezone) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!/.+@.+\..+/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (!Array.isArray(topics) || topics.some((t: unknown) => !VALID_TOPICS.has(t as string))) {
    return Response.json({ error: 'Invalid topic selected' }, { status: 400 })
  }

  if (!(Intl as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone')?.includes(timezone)) {
    return Response.json({ error: 'Invalid timezone' }, { status: 400 })
  }

  // Check if this email has subscribed before
  const { data: existing } = await supabase
    .from('subscribers')
    .select('topics')
    .eq('email', email)
    .single()

  if (existing) {
    // Merge new topics on top of old ones, deduplicated, newest first
    const merged = [...new Set([...topics, ...existing.topics])]

    const { error } = await supabase
      .from('subscribers')
      .update({ topics: merged, timezone, updated_at: new Date().toISOString() })
      .eq('email', email)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ message: 'Preferences updated' })
  }

  // New subscriber
  const { error } = await supabase
    .from('subscribers')
    .insert({ email, topics, timezone })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ message: 'Subscribed successfully' })
}
