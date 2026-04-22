import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth-callback'
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return new Response('Missing auth code', { status: 400 })
  }

  const { tokens } = await oauth2Client.getToken(code)

  return new Response(
    `<html><body style="font-family:monospace;background:#0f0f0f;color:#fff;padding:40px">
      <h2>✅ Gmail authorised</h2>
      <p>Copy the refresh token below and add it to your <code>.env.local</code> as:</p>
      <pre style="background:#1a1a1a;padding:16px;border-radius:8px;word-break:break-all">GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p style="color:#888">You can close this tab after copying.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
