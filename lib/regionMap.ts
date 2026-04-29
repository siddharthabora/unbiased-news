// Maps each subscriber timezone (as stored in Supabase) to a named region.
// Region strings must match the `regions` field on feed entries in fetchNews.ts.

export const TIMEZONE_TO_REGION: Record<string, string> = {
  'America/New_York':    'north-america',
  'America/Los_Angeles': 'north-america',
  'America/Chicago':     'north-america',
  'Europe/London':       'europe',
  'Europe/Paris':        'europe',
  'Asia/Dubai':          'middle-east',
  'Asia/Kolkata':        'south-asia',
  'Asia/Singapore':      'southeast-asia',
  'Asia/Tokyo':          'east-asia',
  'Australia/Sydney':    'oceania',
  'America/Sao_Paulo':   'latin-america',
  'Africa/Nairobi':      'east-africa',
}

// For regions with no dedicated sources yet, list fallback regions in priority order.
// The pipeline tries each fallback in sequence until the regional quota is filled.
export const REGION_FALLBACKS: Record<string, string[]> = {
  'latin-america': ['north-america'],
  'east-africa':   ['middle-east', 'europe'],
}

// Returns the region string for a given IANA timezone.
// Returns empty string for unknown timezones — pipeline treats these as global-only.
export function getSubscriberRegion(timezone: string): string {
  return TIMEZONE_TO_REGION[timezone] ?? ''
}

// Returns the full region priority list for a subscriber:
// [primary region, ...fallbacks].
// Used by the pipeline to progressively widen the regional pool if needed.
export function getRegionPriorityList(timezone: string): string[] {
  const primary = getSubscriberRegion(timezone)
  if (!primary) return []
  const fallbacks = REGION_FALLBACKS[primary] ?? []
  return [primary, ...fallbacks]
}
