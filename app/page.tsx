'use client'

import { useState, useEffect } from 'react'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import StoryScoreTour from './components/StoryScoreTour'
import GetStartedSection from './components/GetStartedSection'
import TransparencySection from './components/TransparencySection'
import FaqSection from './components/FaqSection'
import GetInTouchSection from './components/GetInTouchSection'

const HEADLINE = 'THE WORLD, UNBIASED.'

export default function Home() {
  const [displayedHeadline, setDisplayedHeadline] = useState('')
  const [headlineDone, setHeadlineDone] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [typingStarted, setTypingStarted] = useState(false)

  useEffect(() => {
    // Scan line lasts 1.2s, then remove it from the DOM
    const scanTimer = setTimeout(() => setScanDone(true), 3100)

    // Start typing after scan line has swept past the headline area (~1.5s in)
    const startTimer = setTimeout(() => {
      setTypingStarted(true)
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayedHeadline(HEADLINE.slice(0, i))
        if (i >= HEADLINE.length) {
          clearInterval(interval)
          setHeadlineDone(true)
          setTimeout(() => setShowContent(true), 350)
        }
      }, 55)
      return () => clearInterval(interval)
    }, 1500)

    return () => {
      clearTimeout(scanTimer)
      clearTimeout(startTimer)
    }
  }, [])

  const centerContent = (
    <div className="w-full max-w-3xl mx-auto py-16 px-6">

      {/* Header */}
      <div className="mb-10">

        {/* LIVE badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="live-dot" />
          <span className="text-xs font-medium tracking-widest uppercase text-zinc-500">Live · Daily</span>
        </div>

        {/* Typewriter headline */}
        <h1
          aria-label={HEADLINE}
          className="relative text-5xl font-black tracking-tight leading-[1.1] mb-6"
          style={{ minHeight: '1.2em' }}
        >
          <span aria-hidden="true" className={typingStarted ? 'invisible' : undefined}>
            {HEADLINE}
          </span>

          {typingStarted && (
            <span aria-hidden="true" className="absolute inset-0">
              {displayedHeadline}
              {!headlineDone && <span className="cursor-blink">|</span>}
            </span>
          )}
        </h1>

        {/* Subtitle — fades in after headline finishes */}
        <div
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p className="text-zinc-300 text-base leading-relaxed mb-3">
            Every story traced to its origin, checked for omissions, and scored for authenticity and neutrality before it reaches you.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Choose the topics you are interested in and your local timezone. The latest news will be delivered to your email at 9:00 a.m everyday.
          </p>

          <div className="mt-8 max-w-xl">
            <StoryScoreTour />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {!scanDone && <div className="scan-line" />}
      <TopNav />
      <main id="top" className="flex-1">
        {centerContent}
        <GetStartedSection />
        <TransparencySection />
        <FaqSection />
        <GetInTouchSection />
      </main>
      <Footer />
    </div>
  )
}
