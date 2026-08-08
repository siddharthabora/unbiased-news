export default function TransparencySection() {
  return (
    <section id="what" className="scroll-mt-24 border-t border-[#1f1f1f]">
      <div className="w-full max-w-3xl mx-auto py-16 px-6">
        <p className="text-xs tracking-[0.16em] uppercase text-[#ff5757] font-semibold mb-3.5">Transparency</p>
        <h2 className="text-[#fafafa] text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-4">
          What we actually do.
        </h2>
        <p className="text-[#a1a1aa] text-base leading-relaxed mb-12">
          Unbiased Today is a daily news email built on one idea: you should be able to see how trustworthy a story is before you decide what to make of it. We do not tell you what to think, we show you what a story is made of and leave the judgment to you. Every story is checked automatically before it reaches you, and here is what that looks like.
        </p>

        <div className="flex flex-col">

          {/* Step 1 */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center flex-none w-12">
              <div className="w-12 h-12 flex-none rounded-2xl border border-[#262626] bg-[#141414] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5" cy="6" r="1.6" stroke="#c8c8cd" />
                  <circle cx="5" cy="12" r="1.6" stroke="#c8c8cd" />
                  <circle cx="5" cy="18" r="1.6" stroke="#c8c8cd" />
                  <path d="M6.6 6.4 15 11.4M6.6 12H15M6.6 17.6 15 12.6" stroke="#c8c8cd" opacity="0.55" />
                  <circle cx="17" cy="12" r="2" stroke="#ff5757" />
                </svg>
              </div>
              <div className="w-px flex-1 bg-[#2a2a2a] my-2.5" />
            </div>
            <div className="flex-1 min-w-0 pb-10 pt-0.5">
              <h3 className="text-[#fafafa] text-lg font-bold mb-2 tracking-tight">Many sources, not one</h3>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                Every day&apos;s news is pulled from a wide range of outlets rather than a single feed, so no one publication decides what you see. Reading across many sources is the first step toward news that is not shaped by a single newsroom&apos;s angle.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center flex-none w-12">
              <div className="w-12 h-12 flex-none rounded-2xl border border-[#262626] bg-[#141414] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4.5" width="16" height="15" rx="2.5" stroke="#c8c8cd" />
                  <line x1="6" y1="9.5" x2="14" y2="9.5" stroke="#ff5757" />
                  <line x1="6" y1="13.5" x2="11" y2="13.5" stroke="#c8c8cd" opacity="0.65" />
                  <path d="M20 12v6" stroke="#c8c8cd" opacity="0.9" />
                  <path d="M20 11.6l3 1.1-3 1.1z" fill="#ff5757" />
                </svg>
              </div>
              <div className="w-px flex-1 bg-[#2a2a2a] my-2.5" />
            </div>
            <div className="flex-1 min-w-0 pb-10 pt-0.5">
              <h3 className="text-[#fafafa] text-lg font-bold mb-2 tracking-tight">Checked and scored, automatically</h3>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                Before anything reaches you, each story is checked automatically and given a few plain readings. An authenticity score for how well-sourced and verifiable it is, a neutrality score for how balanced the framing is and flags for loaded wording and missing context. These are signals to weigh, not verdicts, so you can see at a glance how much to trust a piece instead of guessing.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center flex-none w-12">
              <div className="w-12 h-12 flex-none rounded-2xl border border-[#262626] bg-[#141414] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16l-6 7v5l-4 2v-7z" stroke="#c8c8cd" />
                  <circle cx="12" cy="9" r="1.3" stroke="#ff5757" />
                </svg>
              </div>
              <div className="w-px flex-1 bg-[#2a2a2a] my-2.5" />
            </div>
            <div className="flex-1 min-w-0 pb-10 pt-0.5">
              <h3 className="text-[#fafafa] text-lg font-bold mb-2 tracking-tight">Matched to your topics and your region</h3>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                You choose the topics you care about and your briefing keeps only those. Stories from your part of the world are given priority, because the news closest to you usually matters most. One email covers the day, so you are not opening ten different sites and apps to piece it together yourself.
              </p>
            </div>
          </div>

          {/* Step 4 — no connector line */}
          <div className="flex gap-5">
            <div className="flex flex-col items-center flex-none w-12">
              <div className="w-12 h-12 flex-none rounded-2xl border border-[#262626] bg-[#141414] flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6" width="14" height="11" rx="2" stroke="#c8c8cd" />
                  <path d="M3.5 7 10 11.6 16.5 7" stroke="#c8c8cd" />
                  <circle cx="18" cy="17" r="4.2" fill="#0f0f0f" stroke="#ff5757" />
                  <path d="M18 15.2v1.9l1.3.8" stroke="#ff5757" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-[#fafafa] text-lg font-bold mb-2 tracking-tight">Delivered at 9 AM, your time</h3>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed">
                Your daily briefing lands in your inbox at 9 AM in your local timezone, already checked and scored. No account to make, no feed to scroll, no ten open tabs. Just the day&apos;s news, read for you and ready when you wake up.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
