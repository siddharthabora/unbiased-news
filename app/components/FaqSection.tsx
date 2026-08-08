const FAQS = [
  {
    q: "Is Unbiased Today free?",
    a: "Yes. You give an email, pick your topics and your timezone, and the briefing arrives every morning. There is no account to create and no card to enter, and you can unsubscribe anytime using the link at the bottom of every email.",
  },
  {
    q: "How do you know if a news story is trustworthy?",
    a: "You do not have to take the outlet's word or ours. Every story carries an authenticity score for how well-sourced it is and a neutrality score for how balanced the framing is, plus flags for loaded wording and missing context, so you can judge a piece at a glance instead of guessing.",
  },
  {
    q: "Where can I get unbiased news every day?",
    a: "Right here. Unbiased Today is a daily email that pulls from many outlets rather than one feed, checks and scores each story automatically and sends you a single briefing every morning, made for people who want the news without absorbing one newsroom's slant.",
  },
  {
    q: "How do I read the news without opening ten different sites?",
    a: "That is the whole point. Instead of checking five or ten sites and apps to piece the day together, you get one email with the stories that matter on the topics you chose, already checked and scored.",
  },
  {
    q: "What time does the briefing arrive?",
    a: "At 9 AM in your local timezone, every day. You set your timezone when you subscribe, so it is timed to your morning wherever you are.",
  },
  {
    q: "Can I choose which topics I get?",
    a: "Yes. You pick from topics like world, technology, finance and science, and your briefing keeps only the ones you chose.",
  },
  {
    q: "How do I add topics or update my timezone later?",
    a: "Fill out the form again with the same email and choose the topics you want. New topics are merged with the ones you already have and any duplicates are removed automatically, so resubmitting never doubles anything up. Whatever timezone you pick on that latest submission becomes your new delivery time.",
  },
  {
    q: "Do you sell or share my email?",
    a: "No, we do not sell or share your email with anyone. We use it to send your daily briefing, and now and then we may send news about Unbiased Today itself. You can unsubscribe from all of it anytime using the link at the bottom of every email.",
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-[#1f1f1f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />
      <div className="w-full max-w-3xl mx-auto py-16 px-6">
        <p className="text-xs tracking-[0.16em] uppercase text-[#ff5757] font-semibold mb-3.5">FAQ</p>
        <h2 className="text-[#fafafa] text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-8">
          Frequently asked questions
        </h2>
        <div className="border-t border-[#1f1f1f]">
          {FAQS.map(item => (
            <details key={item.q} className="group border-b border-[#1f1f1f]">
              <summary className="flex items-center justify-between gap-4 cursor-pointer py-5 list-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-[#fafafa] text-[17px] font-semibold tracking-tight">{item.q}</h3>
                <svg
                  className="w-5 h-5 flex-none text-[#8a8a8f] transition-transform duration-200 group-open:rotate-180"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="text-[#a1a1aa] text-[15px] leading-relaxed max-w-[64ch] pb-5 -mt-1">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
