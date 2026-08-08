import LegalShell from '../components/LegalShell'

export const metadata = {
  title: 'Privacy Policy — Unbiased Today',
  description: 'What Unbiased Today collects, why, and your choices. We collect very little.',
}

const SECTIONS = [
  { h: 'What we collect', p: 'When you subscribe, we store only your email address, the topics you choose, your timezone and the dates you subscribed and last updated your preferences. We also assign a random system id to your record. That is the complete list. We do not collect your name, your location, your IP address or any browsing or device information. If you email us, we keep your message and email address so we can reply.' },
  { h: 'Cookies and tracking', p: 'We do not use advertising or tracking cookies and we do not run any third-party tracking on the site. We do not currently run website analytics of any kind.' },
  { h: 'Why we use your data', p: 'We use your email, topics and timezone for one purpose, to send you the daily briefing you signed up for, at the time you chose. From time to time we may also send occasional news about Unbiased Today itself. We do not use your data for anything else.' },
  { h: 'Who we share it with', p: 'We do not sell, rent or share your email or preferences with anyone for their own use. To run the service, your data is stored and processed by trusted providers that host our site, store our database and deliver our email on our behalf. These providers may store data on servers in the United States and other countries.' },
  { h: 'How long we keep it', p: 'We keep your data for as long as you are subscribed. When you unsubscribe, your record is removed automatically. You can also ask us to delete it at any time.' },
  { h: 'Your choices and rights', p: 'You can unsubscribe at any time using the unsubscribe link at the bottom of every briefing. You can also ask us to show you, correct or delete the data we hold about you. To do any of this, email news.unbiasedai@gmail.com. Depending on where you live, including the EU and UK, you may have additional rights over your data under local law, and you can use the same address to exercise them.' },
  { h: 'Children', p: 'Unbiased Today is not directed at children and is not intended for anyone under 16. We do not knowingly collect data from them.' },
  { h: 'Changes', p: 'If we change this policy, we will update the date at the top of this page.' },
]

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="August 8, 2026">
      <p className="text-[#a1a1aa] text-[15px] leading-relaxed">This policy explains what we collect, why, and what we do with it. We keep it deliberately small, because we collect very little.</p>
      {SECTIONS.map(s => (
        <div key={s.h}>
          <h2 className="text-[#fafafa] text-lg font-bold tracking-tight mb-2">{s.h}</h2>
          <p className="text-[#a1a1aa] text-[15px] leading-relaxed">{s.p}</p>
        </div>
      ))}
      <p className="text-[#a1a1aa] text-[15px] leading-relaxed">Questions about your privacy? Email <a href="mailto:news.unbiasedai@gmail.com" className="text-[#ff5757] hover:underline">news.unbiasedai@gmail.com</a>.</p>
    </LegalShell>
  )
}
