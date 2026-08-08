import LegalShell from '../components/LegalShell'

export const metadata = {
  title: 'Terms of Use — Unbiased Today',
  description: 'The terms that cover your use of Unbiased Today.',
}

const SECTIONS = [
  { h: 'What Unbiased Today is', p: 'Unbiased Today is a free daily news email that gathers stories from third-party outlets, adds automated readings such as authenticity and neutrality scores and delivers a briefing to your inbox. It is run as an independent, one-person project.' },
  { h: 'Free and provided as is', p: 'The service is offered free of charge and as is, without warranties of any kind. We may change, pause or stop the service, or any part of it, at any time and without notice.' },
  { h: 'Your responsibilities', p: 'Use a valid email address that you control when you subscribe. Do not misuse the service, attempt to disrupt it or use it to break the law.' },
  { h: 'The content is not ours and not advice', p: 'The news we send is created and owned by third parties. Scores and flags are automated signals to help you judge a story, not statements of fact and not professional advice. See our Disclaimer for detail.' },
  { h: 'Intellectual property', p: 'The Unbiased Today name, the site design and our own text belong to us. The underlying news content belongs to the outlets that published it.' },
  { h: 'Limitation of liability', p: 'To the fullest extent allowed by law, Unbiased Today is not liable for any loss or damage arising from your use of, or reliance on, the service or the news and signals in it.' },
  { h: 'Changes to these terms', p: 'We may update these terms from time to time. Continued use after a change means you accept the updated terms. The date at the top shows when they last changed.' },
]

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="August 8, 2026">
      <p className="text-[#a1a1aa] text-[15px] leading-relaxed">These terms cover your use of Unbiased Today. By subscribing or using the site, you agree to them.</p>
      {SECTIONS.map(s => (
        <div key={s.h}>
          <h2 className="text-[#fafafa] text-lg font-bold tracking-tight mb-2">{s.h}</h2>
          <p className="text-[#a1a1aa] text-[15px] leading-relaxed">{s.p}</p>
        </div>
      ))}
      <p className="text-[#a1a1aa] text-[15px] leading-relaxed">Questions about these terms? Email <a href="mailto:news.unbiasedai@gmail.com" className="text-[#ff5757] hover:underline">news.unbiasedai@gmail.com</a>.</p>
    </LegalShell>
  )
}
