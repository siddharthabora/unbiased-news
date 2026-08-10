'use client'

import { useState } from 'react'

const LINKS = [
  { href: '#what', label: 'Transparency' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

export default function TopNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur border-b border-[#1f1f1f]">
      <div className="flex items-center justify-between px-5 h-[60px]">
        <a href="#top" aria-label="Unbiased Today home">
          <img src="/unbiased-logo.png" alt="Unbiased Today" className="h-[72px] w-auto" />
        </a>

        <div className="flex items-center gap-4 sm:gap-7">
          <div className="hidden sm:flex items-center gap-7">
            {LINKS.map(l => (
              <a key={l.href} href={l.href} className="text-[13px] text-zinc-400 hover:text-white transition-colors">{l.label}</a>
            ))}
          </div>

          <a href="#subscribe">
            <button className="bg-[#ff5757] text-white font-semibold text-[13px] px-4 py-2 rounded-full hover:brightness-110 transition">
              Subscribe
            </button>
          </a>

          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="sm:hidden flex items-center justify-center w-9 h-9 -mr-1 text-zinc-300"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {open ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden">
          <div
            className="fixed inset-x-0 top-[60px] bottom-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div id="mobile-menu" className="absolute top-[60px] inset-x-0 z-50 bg-[#0f0f0f] border-b border-[#1f1f1f] px-5 flex flex-col">
            {LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-[15px] text-zinc-300 hover:text-white border-b border-[#1a1a1a] last:border-0 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
