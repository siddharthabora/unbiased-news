import Link from 'next/link'

const FOOT_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

export default function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <header className="border-b border-[#1f1f1f]">
        <div className="max-w-2xl mx-auto px-6 h-[60px] flex items-center">
          <Link href="/" aria-label="Unbiased Today home"><img src="/unbiased-logo.png" alt="Unbiased Today" className="h-[24px] w-auto" /></Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold tracking-tight text-[#fafafa] mb-2">{title}</h1>
          <p className="text-zinc-500 text-sm mb-12">Last updated: {updated}</p>
          <div className="flex flex-col gap-7">{children}</div>
        </div>
      </main>
      <footer className="border-t border-[#1f1f1f] py-10">
        <div className="max-w-2xl mx-auto px-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13.5px]">
          {FOOT_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-zinc-400 hover:text-[#ff5757] transition-colors">{l.label}</Link>
          ))}
          <span className="text-zinc-600 ml-auto">© 2026 Unbiased Today</span>
        </div>
      </footer>
    </div>
  )
}
