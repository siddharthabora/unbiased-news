'use client'

import { useEffect, useState } from 'react'

// Picsum fallback seeds — shown while real images are loading or if fetch fails
const FALLBACK: Record<string, number[]> = {
  left1:  [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  left2:  [15, 25, 35, 45, 55, 65, 75, 85, 95, 105],
  right1: [12, 22, 32, 42, 52, 62, 72, 82, 92, 102],
  right2: [17, 27, 37, 47, 57, 67, 77, 87, 97, 107],
}

function fallbackUrls(group: string): string[] {
  return (FALLBACK[group] ?? []).map((s) => `https://picsum.photos/seed/${s}/200/300`)
}

type CarouselState =
  | { status: 'loading' }
  | { status: 'ready'; images: Record<string, string[]> }
  | { status: 'failed' }

function useCarouselImages(): CarouselState {
  const [state, setState] = useState<CarouselState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/carousel-images')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        // Only use real images if each column has at least 5
        const valid = Object.values(data as Record<string, string[]>).every((urls) => urls.length >= 5)
        setState(valid ? { status: 'ready', images: data } : { status: 'failed' })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'failed' })
      })
    return () => { cancelled = true }
  }, [])

  return state
}

function urlsFor(state: CarouselState, group: string): string[] {
  if (state.status === 'ready') {
    const urls = state.images[group]
    return urls?.length ? urls : []
  }
  if (state.status === 'failed') return fallbackUrls(group)
  return []
}

interface ColumnProps {
  urls: string[]
  direction: 'up' | 'down'
  duration: number
  delay: number
}

function ImageColumn({ urls, direction, duration, delay }: ColumnProps) {
  const doubled = [...urls, ...urls]

  return (
    <div className="relative flex-1 overflow-hidden h-full">
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{ height: '120px', background: 'linear-gradient(to bottom, #0f0f0f 0%, transparent 100%)' }}
      />
      <div
        style={{
          animation: `${direction === 'up' ? 'scroll-up' : 'scroll-down'} ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      >
        {doubled.map((url, i) => (
          <div
            key={i}
            className="w-full mb-3.5"
            style={{
              animation: `float ${2.8 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.35) % 2.5}s`,
            }}
          >
            <img
              src={url}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full rounded-md object-cover"
              style={{
                aspectRatio: '2 / 3',
                display: 'block',
                boxShadow: '0 8px 24px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.4)',
                opacity: 0.88,
              }}
            />
          </div>
        ))}
      </div>
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: '120px', background: 'linear-gradient(to top, #0f0f0f 0%, transparent 100%)' }}
      />
    </div>
  )
}

export function LeftColumns() {
  const state = useCarouselImages()
  const left1 = urlsFor(state, 'left1')
  const left2 = urlsFor(state, 'left2')

  return (
    <div aria-hidden="true" className="hidden lg:flex gap-5 w-64 xl:w-72 shrink-0 h-full px-2">
      <ImageColumn urls={left1} direction="up" duration={42} delay={0} />
      <ImageColumn urls={left2} direction="up" duration={55} delay={-18} />
    </div>
  )
}

export function RightColumns() {
  const state = useCarouselImages()
  const right1 = urlsFor(state, 'right1')
  const right2 = urlsFor(state, 'right2')

  return (
    <div aria-hidden="true" className="hidden lg:flex gap-5 w-64 xl:w-72 shrink-0 h-full px-2">
      <ImageColumn urls={right1} direction="down" duration={48} delay={-12} />
      <ImageColumn urls={right2} direction="down" duration={38} delay={0} />
    </div>
  )
}
