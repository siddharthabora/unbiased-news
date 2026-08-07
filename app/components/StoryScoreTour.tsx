'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type StepKey = 'over' | 'auth' | 'neut' | 'flags'

const STEPS: Record<StepKey, { groups: string[]; pad: number; caption: string; ring: string | null; dot: string; zMax: number }> = {
  over:  { groups: ['card'],                pad: 14, caption: 'Every story arrives already checked. Here is what that looks like.', ring: null, dot: '#3f3f46', zMax: 1.4 },
  auth:  { groups: ['auth'],                pad: 26, caption: 'Authenticity: how verifiable and well-sourced the reporting is, at a glance.', ring: '0 0 0 2px rgba(74,222,128,.9), 0 0 22px 2px rgba(74,222,128,.25)', dot: '#4ade80', zMax: 2.3 },
  neut:  { groups: ['neut', 'lean', 'frame'], pad: 22, caption: 'Neutrality: how balanced the framing is, with the political and geopolitical lean broken out.', ring: '0 0 0 2px rgba(234,179,8,.9), 0 0 22px 2px rgba(234,179,8,.22)', dot: '#eab308', zMax: 2.0 },
  flags: { groups: ['flags'],               pad: 20, caption: 'The flags: loaded wording, missing context and weak sourcing, surfaced so you do not have to dig.', ring: '0 0 0 2px rgba(248,113,113,.9), 0 0 22px 2px rgba(248,113,113,.22)', dot: '#f87171', zMax: 2.1 },
}

const PILLS: { key: StepKey; label: string; dot: string }[] = [
  { key: 'auth', label: 'Authenticity', dot: '#4ade80' },
  { key: 'neut', label: 'Neutrality', dot: '#eab308' },
  { key: 'flags', label: 'Flags', dot: '#f87171' },
]

const ORDER: StepKey[] = ['over', 'auth', 'neut', 'flags']
const DWELL: Record<StepKey, number> = { over: 1500, auth: 2700, neut: 2700, flags: 2900 }

export default function StoryScoreTour() {
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const [enhanced, setEnhanced] = useState(false)
  const [, setReady] = useState(false)
  const [step, setStep] = useState<StepKey>('over')
  const interactedRef = useRef(false)

  const bbox = useCallback((groups: string[]) => {
    const card = cardRef.current
    if (!card) return { x: 0, y: 0, w: 0, h: 0 }
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity
    for (const g of groups) {
      if (g === 'card') {
        l = Math.min(l, 0); t = Math.min(t, 0)
        r = Math.max(r, card.offsetWidth); b = Math.max(b, card.offsetHeight)
        continue
      }
      const el = card.querySelector<HTMLElement>(`[data-g="${g}"]`)
      if (!el) continue
      l = Math.min(l, el.offsetLeft); t = Math.min(t, el.offsetTop)
      r = Math.max(r, el.offsetLeft + el.offsetWidth); b = Math.max(b, el.offsetTop + el.offsetHeight)
    }
    return { x: l, y: t, w: r - l, h: b - t }
  }, [])

  const transformFor = useCallback((s: StepKey) => {
    const stage = stageRef.current, card = cardRef.current
    if (!stage || !card) return 'none'
    const Wv = stage.clientWidth, Hv = stage.clientHeight
    const Wc = card.offsetWidth, Hc = card.offsetHeight
    const box = s === 'over' ? { x: 0, y: 0, w: Wc, h: Hc } : bbox(STEPS[s].groups)
    const pad = STEPS[s].pad
    let z = Math.min(Wv / (box.w + 2 * pad), Hv / (box.h + 2 * pad))
    z = Math.min(z, STEPS[s].zMax)
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2
    let tx = Wv / 2 - z * cx, ty = Hv / 2 - z * cy
    tx = z * Wc >= Wv ? Math.max(Math.min(tx, 0), Wv - z * Wc) : (Wv - z * Wc) / 2
    ty = z * Hc >= Hv ? Math.max(Math.min(ty, 0), Hv - z * Hc) : (Hv - z * Hc) / 2
    return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${z.toFixed(3)})`
  }, [bbox])

  const apply = useCallback((s: StepKey) => {
    const card = cardRef.current
    if (card) card.style.transform = transformFor(s)
  }, [transformFor])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnhanced(true)
  }, [])

  useEffect(() => {
    if (!enhanced) return
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'none'
    apply('over')
    const id = requestAnimationFrame(() => {
      card.style.transition = 'transform .9s cubic-bezier(.65,0,.35,1)'
      setReady(true)
    })
    return () => cancelAnimationFrame(id)
  }, [enhanced, apply])

  useEffect(() => { if (enhanced) apply(step) }, [step, enhanced, apply])

  useEffect(() => {
    if (!enhanced || interactedRef.current) return
    const i = ORDER.indexOf(step)
    const next = ORDER[(i + 1) % ORDER.length]
    const id = window.setTimeout(() => setStep(next), DWELL[step])
    return () => window.clearTimeout(id)
  }, [enhanced, step])

  useEffect(() => {
    if (!enhanced) return
    const card = cardRef.current
    const onResize = () => apply(step)
    window.addEventListener('resize', onResize)
    let ro: ResizeObserver | undefined
    if ('ResizeObserver' in window && card) { ro = new ResizeObserver(() => apply(step)); ro.observe(card) }
    return () => { window.removeEventListener('resize', onResize); ro?.disconnect() }
  }, [enhanced, step, apply])

  const ringFor = (g: string): string | undefined => {
    if (!enhanced) return undefined
    const s = STEPS[step]
    return s.ring && s.groups.includes(g) ? s.ring : 'none'
  }

  const onPill = (k: StepKey) => {
    interactedRef.current = true
    setStep(prev => (prev === k ? 'over' : k))
  }

  return (
    <section>
      <div
        ref={stageRef}
        className={
          enhanced
            ? 'relative w-full h-[460px] max-[520px]:h-[400px] overflow-hidden rounded-2xl border border-[#262626]'
            : 'relative w-full rounded-2xl'
        }
        style={enhanced ? { background: 'radial-gradient(120% 90% at 50% -10%, #151515 0%, #0d0d0d 60%)' } : undefined}
      >
        <article
          ref={cardRef}
          className={
            (enhanced ? 'absolute top-0 left-0 w-[520px] ' : 'w-full max-w-[520px] ') +
            'rounded-[14px] border border-[#262626] bg-[#0f0f0f]'
          }
          style={{ transformOrigin: '0 0', padding: '26px 28px' }}
        >
          <h3 className="text-[#fafafa] text-2xl font-bold leading-tight tracking-tight">Ukraine reports missile defense interceptor shortage</h3>
          <p className="text-[#6b7280] italic text-sm mt-1.5">Original: &quot;Ukraine&apos;s Deadly Missile Defense Shortage&quot;</p>
          <p className="text-[#d4d4d8] text-[15px] leading-relaxed mt-4">Kyiv has exhausted its Patriot missile interceptors, and Western allies are hesitant to supply additional units. The shortage affects Ukraine&apos;s missile defense capabilities amid ongoing conflict with Russia. The situation highlights challenges in military aid and supply chains.</p>
          <p className="text-[15px] leading-snug mt-4"><b className="text-[#fafafa]">What to watch:</b> <span className="text-[#6699ff]">Observing future military aid decisions and potential replenishment of Ukraine&apos;s missile stockpiles.</span></p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-[18px] mt-6">
            <div data-g="auth" className="rounded-lg" style={{ boxShadow: ringFor('auth'), transition: 'box-shadow .5s ease' }}>
              <p className="text-[#8a8a8f] text-[13px] mb-2">Authenticity</p>
              <div className="flex items-center gap-3">
                <span className="flex-1 h-2 rounded-full bg-[#27272a] overflow-hidden"><i className="block h-full rounded-full" style={{ width: '80%', background: '#4ade80' }} /></span>
                <span className="text-[#e4e4e7] text-base min-w-[24px] text-right">80</span>
              </div>
            </div>
            <div data-g="neut" className="rounded-lg" style={{ boxShadow: ringFor('neut'), transition: 'box-shadow .5s ease' }}>
              <p className="text-[#8a8a8f] text-[13px] mb-2">Neutrality</p>
              <div className="flex items-center gap-3">
                <span className="flex-1 h-2 rounded-full bg-[#27272a] overflow-hidden"><i className="block h-full rounded-full" style={{ width: '65%', background: '#eab308' }} /></span>
                <span className="text-[#e4e4e7] text-base min-w-[24px] text-right">65</span>
              </div>
            </div>
            <div data-g="lean" className="rounded-lg" style={{ boxShadow: ringFor('lean'), transition: 'box-shadow .5s ease' }}>
              <p className="text-[#8a8a8f] text-[13px] mb-2">Political lean</p>
              <p className="text-[15px]"><span className="text-[#818cf8]">L 50%</span><span className="text-[#52525b] mx-1.5">/</span><span className="text-[#f87171]">R 50%</span></p>
            </div>
            <div data-g="frame" className="rounded-lg" style={{ boxShadow: ringFor('frame'), transition: 'box-shadow .5s ease' }}>
              <p className="text-[#8a8a8f] text-[13px] mb-2">Geopolitical framing</p>
              <p className="text-[15px]"><span className="text-[#eab308]">W 70%</span><span className="text-[#52525b] mx-1.5">/</span><span className="text-[#c084fc]">NW 30%</span></p>
            </div>
          </div>

          <div data-g="flags" className="mt-5" style={{ boxShadow: ringFor('flags'), transition: 'box-shadow .5s ease', borderRadius: 12 }}>
            <div className="rounded-[11px] px-4 py-3 border border-[rgba(251,146,60,0.35)] bg-[rgba(251,146,60,0.06)]">
              <h4 className="text-[#fb923c] text-sm font-bold mb-1.5">Loaded language</h4>
              <p className="text-[#cbb79c] text-sm leading-snug">&quot;Kyiv has run out of Patriot interceptors&quot; → &quot;Kyiv&apos;s Patriot missile stockpiles are depleted&quot;</p>
            </div>
            <div className="rounded-[11px] px-4 py-3 mt-3 border border-[rgba(234,179,8,0.30)] bg-[rgba(234,179,8,0.05)]">
              <h4 className="text-[#eab308] text-sm font-bold mb-1.5">Omissions detected</h4>
              <p className="text-[#cabf95] text-sm leading-snug">• Lack of detailed data on missile stock levels or official statements from Ukrainian or allied sources.</p>
            </div>
            <div className="rounded-[11px] px-4 py-3 mt-3 border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.06)]">
              <h4 className="text-[#f87171] text-sm font-bold mb-1.5">Source red flags</h4>
              <p className="text-[#d3a7a7] text-sm leading-snug">• Vague on specific sources for the Patriot missile shortage, no direct quotes or official statements cited.</p>
            </div>
          </div>

          <p className="text-[#8a8a8f] text-sm underline underline-offset-[3px] mt-5 inline-block">Read full article →</p>
        </article>
      </div>

      {enhanced ? (
        <>
          <div className="min-h-[52px] mt-5 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full mt-[7px] flex-none" style={{ background: STEPS[step].dot, transition: 'background .3s' }} />
            <p className="text-[#c7c7cc] text-[15px] leading-snug">{STEPS[step].caption}</p>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            {PILLS.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => onPill(p.key)}
                aria-pressed={step === p.key}
                className={
                  'inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] transition-colors ' +
                  (step === p.key
                    ? 'bg-[#e8e8ea] text-[#0f0f0f] border-[#e8e8ea] font-semibold'
                    : 'bg-transparent text-zinc-400 border-[#2a2a2a] hover:border-zinc-600 hover:text-zinc-200')
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ background: p.dot }} />
                {p.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[#c7c7cc] text-[15px] leading-snug mt-5">Authenticity, neutrality and the flags, checked before it reaches you.</p>
      )}
    </section>
  )
}
