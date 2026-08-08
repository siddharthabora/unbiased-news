import LegalShell from '../components/LegalShell'

export const metadata = {
  title: 'Disclaimer — Unbiased Today',
  description: 'The limits of the news, scores and links provided by Unbiased Today.',
}

const SECTIONS = [
  { h: 'The news we send', p: 'Unbiased Today gathers news from a range of third-party outlets and public feeds. We do not create the original reporting and we are not the source of the underlying stories. Summaries and links point to content owned and published by others, and its accuracy, opinions and availability are the responsibility of those outlets, not us.' },
  { h: 'The scores and flags', p: 'Every story carries readings such as an authenticity score, a neutrality score and flags for wording or missing context. These are automated signals meant to help you judge a story, not statements of fact and not final verdicts on truth. They can be incomplete or wrong. Use your own judgment and check the original sources before relying on any story.' },
  { h: 'Not professional advice', p: 'The news and any commentary we send are for general information only. They are not legal, financial, medical or professional advice and you should not act on them as if they were.' },
  { h: 'Third-party links', p: 'Our emails and site may link to third-party websites. We do not control those sites and are not responsible for their content, accuracy or practices.' },
  { h: 'No warranty', p: 'Unbiased Today is provided as is, without warranties of any kind. We do not guarantee that it will be accurate, complete, uninterrupted or error-free.' },
]

export default function DisclaimerPage() {
  return (
    <LegalShell title="Disclaimer" updated="August 8, 2026">
      <p className="text-[#a1a1aa] text-[15px] leading-relaxed">Unbiased Today is a free daily news email. This page explains the limits of what we provide.</p>
      {SECTIONS.map(s => (
        <div key={s.h}>
          <h2 className="text-[#fafafa] text-lg font-bold tracking-tight mb-2">{s.h}</h2>
          <p className="text-[#a1a1aa] text-[15px] leading-relaxed">{s.p}</p>
        </div>
      ))}
      <p className="text-[#a1a1aa] text-[15px] leading-relaxed">Questions about this disclaimer? Email <a href="mailto:news.unbiasedai@gmail.com" className="text-[#ff5757] hover:underline">news.unbiasedai@gmail.com</a>.</p>
    </LegalShell>
  )
}
