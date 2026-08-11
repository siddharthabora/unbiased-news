import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[#1f1f1f] mt-10 py-11">
      <div className="max-w-3xl mx-auto px-6 flex flex-col gap-6">
        <div className="flex justify-between items-start gap-5 flex-wrap">
          <div>
            <Link href="/" aria-label="Unbiased Today home"><img src="/unbiased-logo.png" alt="Unbiased Today" className="h-[42px] w-auto opacity-90" /></Link>
            <p className="text-zinc-500 text-[13px] mt-3 max-w-[34ch] leading-relaxed">
              The world, unbiased. One checked briefing every morning, not ten open tabs.
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 sm:text-right">
            <Link href="/#what" className="text-zinc-400 hover:text-[#ff5757] text-[13.5px] transition-colors">Transparency</Link>
            <Link href="/#faq" className="text-zinc-400 hover:text-[#ff5757] text-[13.5px] transition-colors">FAQ</Link>
            <Link href="/#contact" className="text-zinc-400 hover:text-[#ff5757] text-[13.5px] transition-colors">Contact</Link>
            <Link href="/disclaimer" className="text-zinc-400 hover:text-[#ff5757] text-[13.5px] transition-colors">Disclaimer</Link>
            <Link href="/terms" className="text-zinc-400 hover:text-[#ff5757] text-[13.5px] transition-colors">Terms</Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-[#ff5757] text-[13.5px] transition-colors">Privacy</Link>
          </nav>
        </div>
        <div className="flex justify-between items-center border-t border-[#1f1f1f] pt-5 gap-4 flex-wrap">
          <span className="text-zinc-600 text-xs">© 2026 Unbiased Today</span>
          <div className="flex gap-4">
            <a href="https://x.com/unbiased_today" className="text-zinc-400 hover:text-[#ff5757] text-[13px]">X</a>
            <a href="https://youtube.com/@unbiasedtoday" className="text-zinc-400 hover:text-[#ff5757] text-[13px]">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
