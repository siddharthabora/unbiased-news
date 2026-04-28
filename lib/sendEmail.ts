import { google } from 'googleapis'
import { ProcessedNewsItem } from './processNews'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

function scoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

function buildEmailHtml(digest: ProcessedNewsItem[], topics: string[], articleCount: number, unsubscribeToken: string): string {
  const articles = digest
    .map(
      (item) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a">
      ${
        item.imageUrl
          ? `<tr><td><img src="${item.imageUrl}" width="100%" style="display:block;max-height:220px;object-fit:cover" alt="${item.rewrittenHeadline}"/></td></tr>`
          : ''
      }
      <tr><td style="padding:20px 24px 24px">

        <!-- Source + date -->
        <p style="margin:0 0 6px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.08em">
          ${item.source} &nbsp;·&nbsp; ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
        </p>

        <!-- Headline -->
        <h2 style="margin:0 0 4px;font-size:17px;font-weight:700;color:#ffffff;line-height:1.35">${item.rewrittenHeadline}</h2>

        ${item.title !== item.rewrittenHeadline ? `<p style="margin:0 0 12px;font-size:11px;color:#555;font-style:italic">Original: "${item.title}"</p>` : '<div style="margin-bottom:12px"></div>'}

        <!-- Summary -->
        <p style="margin:0 0 12px;font-size:14px;color:#cccccc;line-height:1.6">${item.aiSummary}</p>

        <!-- What to watch -->
        ${item.whatToWatch ? `<p style="margin:0 0 16px;font-size:13px;color:#60a5fa;line-height:1.5">
          <strong style="color:#93c5fd">What to watch:</strong> ${item.whatToWatch}
        </p>` : ''}

        <!-- Scores -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
          <tr>
            <td width="48%" style="padding-right:8px">
              <p style="margin:0 0 4px;font-size:11px;color:#555">Authenticity</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="background:#2a2a2a;border-radius:4px;height:6px">
                  <div style="background:${scoreColor(item.authenticityScore)};width:${item.authenticityScore}%;height:6px;border-radius:4px"></div>
                </td>
                <td width="28" style="text-align:right;font-size:11px;color:#666;padding-left:6px">${item.authenticityScore}</td>
              </tr></table>
            </td>
            <td width="4%"></td>
            <td width="48%" style="padding-left:8px">
              <p style="margin:0 0 4px;font-size:11px;color:#555">Neutrality</p>
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="background:#2a2a2a;border-radius:4px;height:6px">
                  <div style="background:${scoreColor(item.neutralityScore)};width:${item.neutralityScore}%;height:6px;border-radius:4px"></div>
                </td>
                <td width="28" style="text-align:right;font-size:11px;color:#666;padding-left:6px">${item.neutralityScore}</td>
              </tr></table>
            </td>
          </tr>
        </table>

        <!-- Political + Geopolitical lean -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
          <tr>
            <td width="48%" style="padding-right:8px">
              <p style="margin:0 0 4px;font-size:11px;color:#555">Political lean</p>
              <p style="margin:0;font-size:11px;color:#888">
                <span style="color:#60a5fa">L ${item.politicalSpectrum.left_pct}%</span>
                &nbsp;/&nbsp;
                <span style="color:#f87171">R ${item.politicalSpectrum.right_pct}%</span>
              </p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="padding-left:8px">
              <p style="margin:0 0 4px;font-size:11px;color:#555">Geopolitical framing</p>
              <p style="margin:0;font-size:11px;color:#888">
                <span style="color:#facc15">W ${item.geopoliticalAlignment.western_aligned_pct}%</span>
                &nbsp;/&nbsp;
                <span style="color:#c084fc">NW ${item.geopoliticalAlignment.non_western_aligned_pct}%</span>
              </p>
            </td>
          </tr>
        </table>

        ${
          item.loadedLanguageExamples.length > 0
            ? `<div style="background:#431407;border:1px solid #7c2d12;border-radius:8px;padding:10px 14px;margin-bottom:10px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#fb923c">Loaded language</p>
                ${item.loadedLanguageExamples.map((ex) => `<p style="margin:0;font-size:12px;color:#fdba74">"${ex.original}" → "${ex.neutral_alternative}"</p>`).join('')}
               </div>`
            : ''
        }

        ${
          item.omissionsDetected.length > 0
            ? `<div style="background:#422006;border:1px solid #78350f;border-radius:8px;padding:10px 14px;margin-bottom:10px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#fbbf24">Omissions detected</p>
                ${item.omissionsDetected.map((o) => `<p style="margin:0;font-size:12px;color:#fde68a">• ${o}</p>`).join('')}
               </div>`
            : ''
        }

        ${
          item.redFlags.length > 0
            ? `<div style="background:#450a0a;border:1px solid #7f1d1d;border-radius:8px;padding:10px 14px;margin-bottom:10px">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#f87171">Source red flags</p>
                ${item.redFlags.map((f) => `<p style="margin:0;font-size:12px;color:#fca5a5">• ${f}</p>`).join('')}
               </div>`
            : ''
        }

        <!-- Read more -->
        <a href="${item.link}" style="font-size:12px;color:#555;text-decoration:underline">Read full article →</a>

      </td></tr>
    </table>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;border-bottom:1px solid #2a2a2a;margin-bottom:32px">
          <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff">Unbiased Today</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#555">
            ${articleCount} unbiased stories · Topics: ${topics.join(', ')}
          </p>
        </td></tr>

        <!-- Articles -->
        <tr><td style="padding-top:32px">${articles}</td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:16px;border-top:1px solid #1a1a1a;text-align:center">
          <p style="font-size:11px;color:#333;margin:0 0 8px">
            You're receiving this because you subscribed at Unbiased Today.<br>
            Sent by <a href="mailto:${process.env.GMAIL_FROM}" style="color:#444">${process.env.GMAIL_FROM}</a>
          </p>
          <a href="https://www.unbiasedtoday.com/api/unsubscribe?e=${unsubscribeToken}" style="font-size:11px;color:#444;text-decoration:underline">Unsubscribe</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function rfc2047(subject: string): string {
  return `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`
}

function encodeEmail(to: string, subject: string, html: string): string {
  const message = [
    `From: Unbiased Today <${process.env.GMAIL_FROM}>`,
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${rfc2047(subject)}`,
    '',
    html,
  ].join('\n')
  return Buffer.from(message).toString('base64url')
}

export async function sendDigestEmail(
  to: string,
  topics: string[],
  digest: ProcessedNewsItem[]
): Promise<void> {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  const subject = `Unbiased News Today - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  const unsubscribeToken = Buffer.from(to).toString('base64url')
  const html = buildEmailHtml(digest, topics, digest.length, unsubscribeToken)
  const raw = encodeEmail(to, subject, html)

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
