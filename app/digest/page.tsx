import { fetchAllNews } from '@/lib/fetchNews'
import { selectAndSummarize, ProcessedNewsItem } from '@/lib/processNews'

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-neutral-400 w-8 text-right">{score}</span>
    </div>
  )
}

export default async function DigestPage({
  searchParams,
}: {
  searchParams: Promise<{ topics?: string }>
}) {
  const params = await searchParams
  const topicsParam = params.topics ?? 'Technology,Geopolitics'
  const topics = topicsParam.split(',').map((t) => t.trim())

  const allNews = await fetchAllNews()
  const digest = await selectAndSummarize(allNews, topics)

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">AI Daily Brief</p>
        <h1 className="text-3xl font-bold mb-1">Your Morning Digest</h1>
        <p className="text-neutral-400 text-sm mb-8">
          Topics: {topics.join(', ')} &nbsp;·&nbsp; {digest.length} stories from {allNews.length} articles
        </p>

        <div className="space-y-8">
          {digest.map((item: ProcessedNewsItem, i: number) => (
            <article
              key={i}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-neutral-800"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.rewrittenHeadline}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-5">
                {/* Source + date */}
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                  <span className="uppercase tracking-wide font-medium text-neutral-400">{item.source}</span>
                  <span>·</span>
                  <span>
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : ''}
                  </span>
                </div>

                {/* Rewritten neutral headline */}
                <h2 className="font-semibold text-base leading-snug mb-1">{item.rewrittenHeadline}</h2>

                {/* Original headline if different */}
                {item.title !== item.rewrittenHeadline && (
                  <p className="text-xs text-neutral-500 mb-3 italic">Original: "{item.title}"</p>
                )}

                {/* AI summary */}
                <p className="text-neutral-300 text-sm leading-relaxed mb-3">{item.aiSummary}</p>

                {/* What to watch */}
                <p className="text-xs text-blue-400 mb-4">
                  <span className="font-semibold text-blue-300">What to watch: </span>
                  {item.whatToWatch}
                </p>

                {/* Scores row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Authenticity</p>
                    <ScoreBar score={item.authenticityScore} color="bg-green-500" />
                    <p className="text-xs text-neutral-600 mt-1">Citation depth: {item.citationChainDepth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Neutrality</p>
                    <ScoreBar score={item.neutralityScore} color="bg-blue-500" />
                  </div>
                </div>

                {/* Political + geopolitical spectrum */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-neutral-500">
                  <div>
                    <p className="mb-1">Political lean</p>
                    <div className="flex text-xs gap-1 items-center">
                      <span className="text-blue-400">L {item.politicalSpectrum.left_pct}%</span>
                      <div className="flex-1 bg-neutral-800 rounded-full h-1.5 mx-1">
                        <div
                          className="h-1.5 rounded-l-full bg-blue-500"
                          style={{ width: `${item.politicalSpectrum.left_pct}%` }}
                        />
                      </div>
                      <span className="text-red-400">R {item.politicalSpectrum.right_pct}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1">Geopolitical framing</p>
                    <div className="flex text-xs gap-1 items-center">
                      <span className="text-yellow-400">W {item.geopoliticalAlignment.western_aligned_pct}%</span>
                      <div className="flex-1 bg-neutral-800 rounded-full h-1.5 mx-1">
                        <div
                          className="h-1.5 rounded-l-full bg-yellow-500"
                          style={{ width: `${item.geopoliticalAlignment.western_aligned_pct}%` }}
                        />
                      </div>
                      <span className="text-purple-400">NW {item.geopoliticalAlignment.non_western_aligned_pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Loaded language */}
                {item.loadedLanguageExamples.length > 0 && (
                  <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs font-semibold text-orange-300 mb-1">Loaded language detected</p>
                    {item.loadedLanguageExamples.map((ex, j) => (
                      <p key={j} className="text-xs text-orange-200">
                        "{ex.original}" → "{ex.neutral_alternative}"
                      </p>
                    ))}
                  </div>
                )}

                {/* Omissions */}
                {item.omissionsDetected.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs font-semibold text-yellow-300 mb-1">Omissions detected</p>
                    {item.omissionsDetected.map((o, j) => (
                      <p key={j} className="text-xs text-yellow-200">• {o}</p>
                    ))}
                  </div>
                )}

                {/* Red flags */}
                {item.redFlags.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs font-semibold text-red-300 mb-1">Source red flags</p>
                    {item.redFlags.map((f, j) => (
                      <p key={j} className="text-xs text-red-200">• {f}</p>
                    ))}
                  </div>
                )}

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Read full article →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
