import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('e')

  if (!token) {
    return new Response(html('Invalid link', 'This unsubscribe link is invalid.'), { headers: { 'Content-Type': 'text/html' } })
  }

  const email = Buffer.from(token, 'base64url').toString()

  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('email', email)

  if (error) {
    return new Response(html('Something went wrong', 'Please reply to any email to unsubscribe manually.'), { headers: { 'Content-Type': 'text/html' } })
  }

  return new Response(html('You\'ve been unsubscribed', `${email} has been removed. You won't receive any more emails from Unbiased Today.`), { headers: { 'Content-Type': 'text/html' } })
}

function html(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff">
  <div style="max-width:480px;margin:80px auto;padding:0 24px;text-align:center">
    <h1 style="font-size:22px;font-weight:700;margin-bottom:12px">${title}</h1>
    <p style="color:#888;font-size:14px;line-height:1.6">${message}</p>
    <a href="https://www.unbiasedtoday.com" style="display:inline-block;margin-top:32px;font-size:12px;color:#555;text-decoration:underline">Back to Unbiased Today</a>
  </div>
</body>
</html>`
}
