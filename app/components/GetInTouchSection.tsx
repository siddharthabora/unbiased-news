'use client'

import { useState } from 'react'

const CONTACT_EMAIL = 'news.unbiasedai@gmail.com'

export default function GetInTouchSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [query, setQuery] = useState('')

  function handleSend() {
    const subject = `Query from ${name || 'a visitor'}`
    const body = `${query}\n\nFrom: ${name}${email ? ` (${email})` : ''}`
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="contact" className="scroll-mt-24 border-t border-[#1f1f1f]">
      <div className="w-full max-w-3xl mx-auto py-16 px-6">
        <p className="text-xs tracking-[0.16em] uppercase text-[#ff5757] font-semibold mb-3.5">Get in touch</p>
        <h2 className="text-[#fafafa] text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-4">
          Questions or feedback?
        </h2>
        <p className="text-[#a1a1aa] text-base leading-relaxed mb-10 max-w-[60ch]">
          Send us a note and it lands straight in our inbox. We read everything.
        </p>

        <div className="flex flex-col gap-6 max-w-xl">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Your email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300">Your query</label>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={5}
              placeholder="What's on your mind?"
              className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-600 transition-colors resize-y"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!name.trim() || !query.trim()}
            className="self-start border border-zinc-600 text-white font-semibold px-9 py-3.5 rounded-xl text-[15px] transition-colors enabled:hover:bg-white enabled:hover:text-black enabled:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  )
}
