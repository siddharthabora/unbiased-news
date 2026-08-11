import TopNav from './TopNav'
import Footer from './Footer'

export default function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <TopNav />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold tracking-tight text-[#fafafa] mb-2">{title}</h1>
          <p className="text-zinc-500 text-sm mb-12">Last updated: {updated}</p>
          <div className="flex flex-col gap-7">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
