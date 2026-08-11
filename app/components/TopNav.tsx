'use client'

import { useState } from 'react'
import Link from 'next/link'

const LINKS = [
  { hash: 'what', label: 'Transparency' },
  { hash: 'faq', label: 'FAQ' },
  { hash: 'contact', label: 'Contact' },
]

const DESKTOP_CLS = "relative inline-block text-[13px] text-zinc-400 hover:text-white transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1.5px] after:w-full after:bg-[#ff5757] after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
const MOBILE_CLS = "py-3.5 text-[15px] text-zinc-300 hover:text-white border-b border-[#1a1a1a] last:border-0 transition-colors"
const SUBSCRIBE_BTN = "bg-[#ff5757] text-white font-semibold text-[13px] px-4 py-2 rounded-full hover:brightness-110 transition"

export default function TopNav() {
  const [open, setOpen] = useState(false)

  // On the current page, smooth-scroll to the section and skip navigation.
  // If the section is not here (a legal page), let the Link navigate to /#hash.
  const scrollToHash = (e: React.MouseEvent, hash: string) => {
    const el = document.getElementById(hash)
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth' })
      window.history.replaceState(null, '', `#${hash}`)
    }
    setOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur border-b border-[#1f1f1f]">
      <div className="flex items-center justify-between px-5 h-[60px]">
        <Link href="/" aria-label="Unbiased Today home">
          <img src="/unbiased-logo.png" alt="Unbiased Today" className="h-[60px] w-auto" />
        </Link>

        <div className="flex items-center gap-4 sm:gap-7">
          <div className="hidden sm:flex items-center gap-7">
            {LINKS.map(l => (
              <Link key={l.hash} href={`/#${l.hash}`} onClick={e => scrollToHash(e, l.hash)} className={DESKTOP_CLS}>{l.label}</Link>
            ))}
          </div>

          <Link href="/#subscribe" onClick={e => scrollToHash(e, 'subscribe')}>
            <button className={SUBSCRIBE_BTN}>Subscribe</button>
          </Link>

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
          <div className="fixed inset-x-0 top-[60px] bottom-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div id="mobile-menu" className="absolute top-[60px] inset-x-0 z-50 bg-[#0f0f0f] border-b border-[#1f1f1f] px-5 flex flex-col">
            {LINKS.map(l => (
              <Link key={l.hash} href={`/#${l.hash}`} onClick={e => scrollToHash(e, l.hash)} className={MOBILE_CLS}>{l.label}</Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
