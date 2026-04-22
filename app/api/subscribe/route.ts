import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, topics, timezone } = await request.json()

  if (!email || !topics?.length || !timezone) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
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
