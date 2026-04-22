'use client'

// Placeholder seeds — each number gives a different photo from picsum.photos
// These will be replaced with real news thumbnail URLs fetched weekly
const SEEDS_LEFT_A  = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const SEEDS_LEFT_B  = [15, 25, 35, 45, 55, 65, 75, 85, 95, 105]
const SEEDS_RIGHT_A = [12, 22, 32, 42, 52, 62, 72, 82, 92, 102]
const SEEDS_RIGHT_B = [17, 27, 37, 47, 57, 67, 77, 87, 97, 107]

function imageUrl(seed: number) {
  return `https://picsum.photos/seed/${seed}/200/300`
}

interface ColumnProps {
  seeds: number[]
  direction: 'up' | 'down'
  duration: number
  delay: number
}

function ImageColumn({ seeds, direction, duration, delay }: ColumnProps) {
  const doubled = [...seeds, ...seeds]

  return (
    // relative + overflow-hidden clips the scroll; z-0 keeps it behind the fade overlays
    <div className="relative flex-1 overflow-hidden h-full">

      {/* Top fade — blends images into the dark background */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: '120px',
          background: 'linear-gradient(to bottom, #0f0f0f 0%, transparent 100%)',
        }}
      />

      {/* Scrolling track */}
      <div
        style={{
          animation: `${direction === 'up' ? 'scroll-up' : 'scroll-down'} ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      >
        {doubled.map((seed, i) => (
          // Wrapper handles the float animation so it doesn't conflict with the scroll transform above
          <div
            key={i}
            className="w-full mb-3.5"
            style={{
              animation: `float ${2.8 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.35) % 2.5}s`,
            }}
          >
            <img
              src={imageUrl(seed)}
              alt=""
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

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{
          height: '120px',
          background: 'linear-gradient(to top, #0f0f0f 0%, transparent 100%)',
        }}
      />
    </div>
  )
}

export function LeftColumns() {
  return (
    <div className="hidden lg:flex gap-5 w-64 xl:w-72 shrink-0 h-full px-2">
      <ImageColumn seeds={SEEDS_LEFT_A} direction="up" duration={42} delay={0} />
      <ImageColumn seeds={SEEDS_LEFT_B} direction="up" duration={55} delay={-18} />
    </div>
  )
}

export function RightColumns() {
  return (
    <div className="hidden lg:flex gap-5 w-64 xl:w-72 shrink-0 h-full px-2">
      <ImageColumn seeds={SEEDS_RIGHT_A} direction="down" duration={48} delay={-12} />
      <ImageColumn seeds={SEEDS_RIGHT_B} direction="down" duration={38} delay={0} />
    </div>
  )
}
