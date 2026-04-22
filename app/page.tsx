'use client'

import { useState } from 'react'
import { LeftColumns, RightColumns } from './components/ScrollingImages'

const TOPICS = [
  'Geopolitics',
  'World',
  'War & Conflict',
  'Technology',
  'Finance',
  'Stocks & Investments',
  'Crypto & Web3',
  'Supply Chain',
  'Music',
  'Art',
  'Culture',
  'Entertainment',
  'Health & Wellness',
  'Science',
  'Environment',
]

const TIMEZONES = [
  { label: 'New York (EST/EDT)', value: 'America/New_York' },
  { label: 'Los Angeles (PST/PDT)', value: 'America/Los_Angeles' },
  { label: 'Chicago (CST/CDT)', value: 'America/Chicago' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris / Berlin (CET/CEST)', value: 'Europe/Paris' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
  { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo' },
  { label: 'Nairobi (EAT)', value: 'Africa/Nairobi' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [timezone, setTimezone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleTopic(topic: string) {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, topics: selectedTopics, timezone }),
    })
    setLoading(false)
    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong. Please try again.')
    }
  }

  const centerContent = submitted ? (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-6 text-white">✓</div>
        <h2 className="text-2xl font-semibold text-white mb-3">You're in.</h2>
        <p className="text-zinc-400 text-base">
          Your first briefing arrives tomorrow at 9:00 AM.
        </p>
      </div>
    </div>
  ) : (
    <div className="w-full max-w-xl mx-auto py-16 px-6">

      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-medium tracking-widest uppercase text-zinc-500 mb-4">
          AI Newsletter
        </p>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          The world, briefed.
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          10 unbiased, AI-curated stories delivered to your inbox every morning.
          Sourced from Al Jazeera, BBC, CoinDesk, Supply Chain Dive, and more — bias-checked before sending.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">
            Your email
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Topic Picker */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-zinc-300">
            Topics you care about{' '}
            <span className="text-zinc-600 font-normal">— pick as many as you want</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTopics.includes(topic)
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-300">
            Your timezone{' '}
            <span className="text-zinc-600 font-normal">— for 9:00 AM delivery</span>
          </label>
          <select
            required
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Select your timezone...</option>
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={selectedTopics.length === 0 || loading}
          className="w-full bg-white text-black font-medium py-3 rounded-lg text-sm hover:bg-zinc-200 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          {loading ? 'Subscribing…' : "Subscribe — it's free"}
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center -mt-4">{error}</p>
        )}

        <p className="text-zinc-600 text-xs text-center -mt-4">
          No account needed. Unsubscribe anytime by replying to any email.
        </p>

      </form>
    </div>
  )

  return (
    <div className="h-screen bg-[#0f0f0f] text-white flex overflow-hidden">
      <LeftColumns />
      <main className="flex-1 overflow-y-auto">
        {centerContent}
      </main>
      <RightColumns />
    </div>
  )
}
