# Unbiased Today — Developer Documentation

**Last updated:** May 2026  
**Production URL:** https://www.unbiasedtoday.com  
**Repository:** github.com/siddharthabora/AI-newsletter  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How the Pipeline Works (End to End)](#4-how-the-pipeline-works-end-to-end)
5. [File-by-File Reference](#5-file-by-file-reference)
6. [API Routes](#6-api-routes)
7. [Environment Variables](#7-environment-variables)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Branch Strategy](#9-branch-strategy)
10. [How to Run Locally](#10-how-to-run-locally)
11. [How to Trigger a Test Email](#11-how-to-trigger-a-test-email)
12. [Where to Look When Things Break](#12-where-to-look-when-things-break)
13. [How to Make Common Changes](#13-how-to-make-common-changes)
14. [Security Reference](#14-security-reference)

---

## 1. Project Overview

**Unbiased Today** is an AI-powered daily news digest delivered by email at 9:00 AM in each subscriber's local timezone. 

Each email contains 10–14 news articles selected by GPT from ~80 RSS sources. Every article is analysed for authenticity, political bias, geopolitical framing, loaded language, and omissions before it is summarised and delivered. Articles are also prioritised by the subscriber's geographic region.

Subscribers choose their topics and timezone at sign-up. The newsletter is fully automated — no manual curation.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Hosting | Vercel (Hobby plan) |
| Database | Supabase (PostgreSQL) |
| Email delivery | Gmail API via Google OAuth2 |
| AI processing | OpenAI GPT-4.1-nano |
| RSS parsing | rss-parser (npm) |
| Styling | Tailwind CSS v4 |

**Key constraints from Vercel Hobby plan:**
- Serverless functions time out at **60 seconds** (`maxDuration = 60` is set on the cron route)
- No persistent background workers — everything runs per-request

---

## 3. Project Structure

```
AI-newsletter/
├── app/
│   ├── api/
│   │   ├── carousel-images/route.ts   — Feeds images to landing page columns
│   │   ├── cron/
│   │   │   └── send-digest/route.ts   — MAIN PIPELINE: runs daily, sends all emails
│   │   ├── subscribe/route.ts         — Handles new subscriber sign-ups
│   │   ├── unsubscribe/route.ts       — Handles unsubscribe link clicks
│   │   ├── test-email/route.ts        — Dev only: sends a test email (gitignored)
│   │   ├── test-carousel/route.ts     — Dev only: tests carousel images (gitignored)
│   │   └── test-regional/route.ts     — Dev only: tests regional filtering (gitignored)
│   ├── components/
│   │   └── ScrollingImages.tsx        — Landing page animated image columns
│   ├── globals.css                    — Global styles and animations
│   ├── layout.tsx                     — Root HTML layout + metadata/SEO tags
│   └── page.tsx                       — Landing page (subscribe form)
├── lib/
│   ├── fetchNews.ts                   — Fetches all RSS feeds, expands topics by keyword
│   ├── processNews.ts                 — GPT selection + analysis pipeline
│   ├── regionMap.ts                   — Timezone → region mapping
│   ├── sendEmail.ts                   — Builds HTML email, sends via Gmail API
│   └── supabase.ts                    — Supabase client (service role, server-side only)
├── public/                            — Static assets (favicon, OG image, robots.txt)
├── .github/
│   └── workflows/
│       └── send-digest.yml            — GitHub Action for manual digest trigger
├── .gitignore
├── vercel.json                        — Vercel config (empty — cron is via external service)
├── next.config.ts                     — Next.js config
├── package.json
└── tsconfig.json
```

**Note:** The following paths are in `.gitignore` and are never committed or deployed:
- `app/api/test-email/`, `app/api/test-carousel/`, `app/api/test-regional/` — local dev tools
- `.env.local` — all secrets
- `get-refresh-token.mjs` — one-time OAuth script

---

## 4. How the Pipeline Works (End to End)

```
[cron-job.org]
    │  HTTP GET every day at 9 AM UTC
    │  Authorization: Bearer {CRON_SECRET}
    ▼
app/api/cron/send-digest/route.ts
    │
    ├── 1. Verify CRON_SECRET (reject if missing/wrong)
    │
    ├── 2. Query Supabase → get all subscribers (email, topics, timezone)
    │
    ├── 3. Filter: keep only subscribers whose local time is currently 9 AM
    │
    ├── 4. Fetch all RSS feeds (lib/fetchNews.ts)
    │        └── ~80 sources fetched in parallel, 4 articles max per source
    │            Each article tagged with: title, summary, link, source, 
    │            publishedAt, imageUrl, feedTopics (expanded by keyword), 
    │            tier (1 or 2), regions
    │
    ├── 5. For each eligible subscriber (in parallel):
    │        │
    │        └── lib/processNews.ts → selectAndSummarize()
    │                 │
    │                 ├── a. Derive region priority list from subscriber's timezone
    │                 │        (lib/regionMap.ts → getRegionPriorityList)
    │                 │
    │                 ├── b. For each of the subscriber's topics (in parallel):
    │                 │        ├── Filter articles matching this topic
    │                 │        ├── Sort: regional Tier 1 → regional Tier 2 → global Tier 1 → global Tier 2
    │                 │        ├── Deduplicate by title similarity (Jaccard ≥ 0.45)
    │                 │        ├── GPT-4.1-nano: select best 2–3 articles
    │                 │        └── GPT-4.1-nano: deep analysis (authenticity + bias + summary)
    │                 │
    │                 └── c. Post-process: cross-topic URL dedup (keep first occurrence)
    │
    └── 6. lib/sendEmail.ts → sendDigestEmail()
             ├── Generate HMAC-SHA256 unsubscribe token
             ├── Build HTML email from template
             └── Send via Gmail API (OAuth2)
```

**DEV_MODE** (dev branch only): bypasses subscriber timezone filter, sends all topics to `DEV_EMAIL` only. Never present on main/production.

---

## 5. File-by-File Reference

### `lib/fetchNews.ts`

**Purpose:** Fetches all RSS sources and returns a flat list of articles.

**Key exports:**
- `fetchAllNews(): Promise<NewsItem[]>` — the main function called by the cron pipeline
- `NewsItem` interface — the shape of every raw article

**Key internals:**
- `RSS_FEEDS` array — every news source: name, RSS URL, topics, tier (1 or 2), regions
- `JINA_SOURCES` array — currently empty; designed for sources without RSS feeds
- `TOPIC_KEYWORD_EXPANSION` — keyword lists that expand an article's topics beyond the feed's base tags (e.g., an article mentioning "bitcoin" on a finance feed also gets tagged `Crypto & Web3`)
- `expandTopicsFromContent()` — applies keyword expansion to each article
- `stripHtml()` — cleans HTML tags from RSS summaries
- `extractFirstImage()` — extracts first image URL from content:encoded HTML
- `MAX_PER_SOURCE = 4` — max articles fetched per source per run

**Where to look if:**
- A source stops delivering articles → check its RSS URL is still valid
- An article is being misclassified into the wrong topic → check `TOPIC_KEYWORD_EXPANSION` and/or the feed's `topics` field in `RSS_FEEDS`
- You want to add a new source → add an entry to `RSS_FEEDS`

---

### `lib/processNews.ts`

**Purpose:** The intelligence layer. Selects the best articles per topic and runs three parallel GPT analyses on each.

**Key exports:**
- `selectAndSummarize(news, topics, timezone): Promise<ProcessedNewsItem[]>` — called once per subscriber
- `ProcessedNewsItem` interface — the enriched article with all scores and summaries

**Key internals:**
- `REGIONAL_RATIO = 0.6` — 60% of each topic's slots target regional sources; 40% global
- `TOPIC_DESCRIPTIONS` — richer descriptions for ambiguous topics (e.g. "Health & Wellness") passed to GPT to improve selection accuracy
- `sortByRegionalPriority()` — sorts articles: regional Tier 1 first, then regional Tier 2, then global Tier 1, then global Tier 2
- `deduplicateByTitle()` — removes near-duplicate articles using Jaccard similarity on normalised title words (threshold 0.45)
- `titleJaccard()` / `normalizeTitle()` — the similarity calculation (removes stop words, punctuation, short words)
- `selectRelevantIndices()` — cheap GPT call: picks which article indices are relevant to a topic (model: gpt-4.1-nano)
- `analyzeArticles()` — deep GPT call: runs full authenticity + bias + summary analysis on selected articles (model: gpt-4.1-nano)
- `perTopic` — number of articles per topic: `Math.min(3, Math.max(2, Math.ceil(14 / topics.length)))`

**GPT prompts live inside:**
- `selectRelevantIndices()` lines 135–169 — selection prompt
- `analyzeArticles()` lines 181–278 — analysis prompt (three sequential analyses)

**Where to look if:**
- GPT is selecting irrelevant articles → edit the selection prompt in `selectRelevantIndices()` or add/update `TOPIC_DESCRIPTIONS`
- GPT summaries are hallucinating → check the empty summary guard (line 343: articles with `summary < 20 chars` get a placeholder)
- Same story appears multiple times → check `deduplicateByTitle()` — may need to lower the 0.45 threshold
- A topic is getting zero articles → check `selectRelevantIndices()` returns and verify the pool has matching articles

---

### `lib/regionMap.ts`

**Purpose:** Maps subscriber timezones to geographic regions, which controls which RSS sources are prioritised.

**Key exports:**
- `TIMEZONE_TO_REGION` — map of IANA timezone strings to region keys
- `REGION_FALLBACKS` — for regions with no dedicated sources (e.g. `latin-america` falls back to `north-america`)
- `getRegionPriorityList(timezone): string[]` — returns `[primary, ...fallbacks]`

**Region keys used:** `north-america`, `europe`, `south-asia`, `southeast-asia`, `east-asia`, `middle-east`, `oceania`, `east-africa`, `latin-america`

**Where to look if:**
- A subscriber in a specific city isn't getting regional news → check their timezone is in `TIMEZONE_TO_REGION` and that sources for their region exist in `RSS_FEEDS`
- You want to add a new timezone → add it to `TIMEZONE_TO_REGION` with the correct region key

---

### `lib/sendEmail.ts`

**Purpose:** Builds the HTML email and sends it via the Gmail API.

**Key exports:**
- `sendDigestEmail(to, topics, digest): Promise<void>` — sends one email to one subscriber
- `generateUnsubscribeToken(email): string` — creates HMAC-SHA256 signed token for unsubscribe link

**Key internals:**
- Gmail API authentication via `google.auth.OAuth2` using `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- `buildEmailHtml()` — the full HTML email template: header, articles, scores, bias bars, footer
- `scoreColor()` — converts authenticity/neutrality score (0–100) to green/yellow/red hex colour
- `rfc2047()` — encodes email subject line for international character support
- `encodeEmail()` — encodes the full RFC-2822 message to base64url for the Gmail API
- Unsubscribe URL format: `https://www.unbiasedtoday.com/api/unsubscribe?email={encoded_email}&token={hmac_token}`

**Where to look if:**
- Emails stop sending → check Vercel logs for `invalid_grant` (means Google refresh token expired — regenerate it)
- Email HTML looks broken → edit `buildEmailHtml()` — it uses table-based HTML for email client compatibility
- Unsubscribe links break → check `generateUnsubscribeToken()` and that `UNSUBSCRIBE_SECRET` is set in Vercel

---

### `lib/supabase.ts`

**Purpose:** Creates and exports the single Supabase client used across all server-side routes.

Uses `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) — this bypasses Row Level Security and allows full read/write access. Never expose this client to the browser.

**Supabase database table: `subscribers`**

| Column | Type | Description |
|---|---|---|
| `email` | text (primary key) | Subscriber email address |
| `topics` | text[] | Array of selected topic strings |
| `timezone` | text | IANA timezone string (e.g. `Asia/Kolkata`) |
| `updated_at` | timestamptz | Last updated (set on topic/timezone changes) |

---

### `app/api/cron/send-digest/route.ts`

**Purpose:** The main pipeline entry point. Called once per minute by cron-job.org; it self-filters to only send to subscribers at 9 AM in their timezone.

**Key logic:**
- Line 42: `CRON_SECRET` bearer token verification — rejects any request without the correct header
- `DEV_MODE` flag (dev branch only): bypasses timezone filter, sends to `DEV_EMAIL` only
- `ALL_TOPICS` array (line 33): the master list of all valid topics — must stay in sync with `VALID_TOPICS` in `subscribe/route.ts` and `TOPICS` in `page.tsx`
- `isNineAmInTimezone()` — checks if the current UTC time corresponds to 9 AM in a given timezone
- Returns: `{ ok: true, sent: N, failed: N }` — no subscriber emails in response

**Where to look if:**
- Emails not sending at the right time → check `isNineAmInTimezone()` logic and cron-job.org schedule
- Pipeline is timing out → check Vercel logs; the 60s limit occasionally bites with many subscribers

---

### `app/api/subscribe/route.ts`

**Purpose:** Handles new subscriber sign-ups and topic/timezone updates for existing subscribers.

**Validations (in order):**
1. `email`, `topics`, `timezone` all present → 400 if missing
2. Email matches `/.+@.+\..+/` regex → 400 if invalid
3. All topics are in `VALID_TOPICS` set → 400 if any unknown topic
4. Timezone is in `Intl.supportedValuesOf('timeZone')` → 400 if invalid

**Behaviour for existing subscribers:** merges new topics with old ones (deduped), updates timezone.

---

### `app/api/unsubscribe/route.ts`

**Purpose:** Handles unsubscribe link clicks. Verifies the HMAC token then deletes the subscriber from Supabase.

**Token verification:**
1. Reads `?email=` and `?token=` from URL
2. Recomputes expected HMAC using `generateUnsubscribeToken(email)` (same function as sendEmail.ts)
3. Uses `timingSafeEqual()` (constant-time comparison to prevent timing attacks)
4. Rejects if token is wrong length or doesn't match

---

### `app/api/carousel-images/route.ts`

**Purpose:** Serves image URLs to the landing page's animated columns. Fetches live news images from RSS and groups them into 4 columns.

- Cached for 1 hour (`revalidate = 3600`)
- Falls back to placeholder images (picsum.photos) if fewer than 5 real images per column

---

### `app/page.tsx`

**Purpose:** The landing page — the only user-facing page. Contains the subscribe form.

- `TOPICS` array: displayed topic chips for the subscriber to select. Must match `ALL_TOPICS` in the cron route and `VALID_TOPICS` in the subscribe route.
- `TIMEZONES` array: the dropdown options. Values must be valid IANA timezone strings also present in `lib/regionMap.ts`.
- Submits to `POST /api/subscribe`

---

### `app/components/ScrollingImages.tsx`

**Purpose:** The animated scrolling image columns on the left and right of the landing page.

- Fetches image URLs from `/api/carousel-images` on mount
- Falls back to placeholder images if the API fails or returns too few images
- `LeftColumns` — two columns scrolling upward
- `RightColumns` — two columns scrolling downward

---

## 6. API Routes

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| `POST` | `/api/subscribe` | None | Add/update subscriber |
| `GET` | `/api/unsubscribe` | HMAC token in URL | Remove subscriber |
| `GET` | `/api/cron/send-digest` | `CRON_SECRET` bearer token | Run the full digest pipeline |
| `GET` | `/api/carousel-images` | None | Supply images to landing page |

**Test-only routes (gitignored, not deployed to Vercel):**

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/test-email` | Sends a single test email locally |
| `GET` | `/api/test-carousel` | Tests carousel image fetching |
| `GET` | `/api/test-regional` | Tests regional source filtering |

---

## 7. Environment Variables

All secrets live in Vercel (Production + Preview environments). Locally they live in `.env.local` (gitignored — never committed).

| Variable | Where used | What it is |
|---|---|---|
| `OPENAI_API_KEY` | `lib/processNews.ts` | GPT-4.1-nano API calls |
| `SUPABASE_URL` | `lib/supabase.ts` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase.ts` | Supabase full-access server key |
| `GOOGLE_CLIENT_ID` | `lib/sendEmail.ts` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | `lib/sendEmail.ts` | Google OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | `lib/sendEmail.ts` | Long-lived Gmail OAuth2 token |
| `GMAIL_FROM` | `lib/sendEmail.ts` | Sender email address (`news.unbiasedai@gmail.com`) |
| `CRON_SECRET` | `app/api/cron/send-digest/route.ts` | Bearer token that protects the cron endpoint |
| `UNSUBSCRIBE_SECRET` | `lib/sendEmail.ts`, `app/api/unsubscribe/route.ts` | Secret for HMAC-SHA256 unsubscribe token signing |

**None of these variables are prefixed with `NEXT_PUBLIC_`** — they are never exposed to the browser.

---

## 8. Deployment Architecture

```
GitHub (main branch)
    │
    └── Vercel (auto-deploys on push to main)
             ├── Production: https://www.unbiasedtoday.com
             └── Preview: https://newsletter-git-dev-*.vercel.app (from dev branch)

cron-job.org
    └── Calls /api/cron/send-digest every minute
        (self-filters internally to only send at 9 AM per timezone)
```

**Vercel function limits (Hobby plan):**
- Max execution time: 60 seconds (set via `export const maxDuration = 60`)
- No persistent workers or queues

**GitHub Action** (`.github/workflows/send-digest.yml`): manual-only trigger for the digest. Not used for automated delivery — that's done by cron-job.org.

---

## 9. Branch Strategy

| Branch | Purpose | Deployed to |
|---|---|---|
| `main` | Production code | Vercel Production + auto-deploys |
| `dev` | Development and testing | Vercel Preview |

**Critical rule: never merge `dev` into `main`.**  
The `dev` branch contains a `DEV_MODE` flag in `send-digest/route.ts` that bypasses the timezone filter and sends to a test email only. If merged to main, it would send to real subscribers incorrectly.

**Correct workflow for shipping to production:**
1. Make changes on `dev`
2. Push to `dev` → test on Vercel Preview
3. Cherry-pick specific commits to `main`:
   ```
   git checkout main
   git cherry-pick <commit-hash>
   git push origin main
   ```

**Branch protection on `main`:** enabled on GitHub — requires a pull request to merge. Cherry-picks via direct push by the repo owner still work.

---

## 10. How to Run Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs at `http://localhost:3000`.

`.env.local` must be populated with all environment variables listed in Section 7 for any API routes to work locally.

---

## 11. How to Trigger a Test Email

**From preview (dev branch — sends only to DEV_EMAIL, not real subscribers):**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://newsletter-git-dev-unbaisedainews-9605s-projects.vercel.app/api/cron/send-digest"
```

**From production (sends to all subscribers currently at 9 AM their timezone):**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://www.unbiasedtoday.com/api/cron/send-digest"
```

`YOUR_CRON_SECRET` is in Vercel → Settings → Environment Variables → `CRON_SECRET`.

---

## 12. Where to Look When Things Break

### No emails being delivered

1. **Check cron-job.org dashboard** — is the job running? Is it returning 200?
2. **Check Vercel Production logs** → Runtime Logs — look for errors
3. **Common error: `invalid_grant`** — the Google refresh token has expired
   - Fix: regenerate `GOOGLE_REFRESH_TOKEN` using the OAuth flow and update in Vercel
   - Google credentials live in the new Google Cloud project under `news.unbiasedai@gmail.com`
4. **Check `OPENAI_API_KEY`** — if OpenAI calls fail, no articles are processed

### Email delivered but articles are wrong / low quality

1. **Wrong topic articles** → `lib/fetchNews.ts` → `TOPIC_KEYWORD_EXPANSION` (too broad?) or `lib/processNews.ts` → `TOPIC_DESCRIPTIONS` (GPT needs clearer guidance?)
2. **Duplicate stories** → `lib/processNews.ts` → `deduplicateByTitle()` threshold (currently 0.45 — lower it to catch more dupes)
3. **GPT hallucinating summaries** → check that the empty summary guard at line 343 of `processNews.ts` is catching short summaries
4. **Wrong source tier or regional priority** → `lib/fetchNews.ts` → `RSS_FEEDS` — check the `tier` and `regions` fields

### Unsubscribe link not working

1. Check `UNSUBSCRIBE_SECRET` is set in Vercel for both Production and Preview
2. Check the link format: should be `?email=...&token=...` (32-char hex). Old links using `?e=...` (base64) will fail — expected.
3. Check Vercel logs for the unsubscribe route for any errors

### Subscribe form not working

1. Check Vercel logs for `/api/subscribe`
2. Common causes: invalid email format, topic name not matching `VALID_TOPICS`, timezone not in the allowed list

### Landing page images not loading

1. `/api/carousel-images` failing → check Vercel logs
2. If the API returns fewer than 5 images per column, it silently falls back to placeholder images (picsum.photos) — this is expected behaviour, not a bug

### Vercel deployment failing

1. Check the Build Logs in Vercel for TypeScript errors
2. Run `npm run build` locally to reproduce the error before pushing

---

## 13. How to Make Common Changes

### Add a new RSS source

Edit `lib/fetchNews.ts` → `RSS_FEEDS` array. Each entry needs:
```typescript
{ 
  name: 'Source Name',
  url: 'https://source.com/rss',
  topics: ['Topic1', 'Topic2'],   // must be from ALL_TOPICS list
  tier: 1,                         // 1 = premium, 2 = supplementary
  regions: ['south-asia']          // or [] for global sources
}
```

### Add a new topic

Four places need to be updated in sync:
1. `lib/fetchNews.ts` → `TOPIC_KEYWORD_EXPANSION` — add keywords for the topic
2. `app/api/cron/send-digest/route.ts` → `ALL_TOPICS` array
3. `app/api/subscribe/route.ts` → `VALID_TOPICS` set
4. `app/page.tsx` → `TOPICS` array (for display on the landing page)

### Add a new timezone/region

Two places:
1. `lib/regionMap.ts` → `TIMEZONE_TO_REGION` — add the IANA timezone and map it to a region key
2. `app/page.tsx` → `TIMEZONES` array — add the display label and value

If creating an entirely new region with no existing sources, also add sources in `lib/fetchNews.ts` with the new `regions` key, and add a fallback in `REGION_FALLBACKS` if needed.

### Change the email delivery time

Currently hardcoded to 9 AM. To change it, search for `isNineAmInTimezone` in `app/api/cron/send-digest/route.ts` and modify the hour check.

### Change GPT behaviour

- **Article selection logic** → `lib/processNews.ts` → `selectRelevantIndices()` → edit the system or user prompt
- **Analysis scoring** → `lib/processNews.ts` → `analyzeArticles()` → edit the system prompt (the three `## ANALYSIS` sections)
- **GPT model** → change `model: 'gpt-4.1-nano'` in either function

### Rotate credentials

| Credential | How to rotate |
|---|---|
| OpenAI API key | platform.openai.com → API Keys → revoke → create new → update Vercel + `.env.local` |
| Google refresh token | Run the OAuth script (ask the developer who has it), update `GOOGLE_REFRESH_TOKEN` in Vercel |
| CRON_SECRET | Generate new random string → update in Vercel + cron-job.org → update `.env.local` |
| UNSUBSCRIBE_SECRET | `openssl rand -hex 32` → update in Vercel + `.env.local` (old unsubscribe links will break) |
| Supabase service role key | Supabase dashboard → Settings → API → JWT Settings → rotate JWT secret → update Vercel |

---

## 14. Security Reference

### What is protected and how

| Asset | Protection mechanism |
|---|---|
| Cron endpoint | `Authorization: Bearer {CRON_SECRET}` header required |
| Unsubscribe endpoint | HMAC-SHA256 token signed with `UNSUBSCRIBE_SECRET` — unforgeable without the secret |
| Subscribe endpoint | Input validation: email regex, topics whitelist, timezone whitelist |
| All secrets | Server-side only — no `NEXT_PUBLIC_` vars, no client-side exposure |
| Database | Supabase service role key is server-side only; never sent to browser |
| Test routes | Gitignored — never deployed to Vercel |

### What is intentionally NOT protected (acceptable risk)

- **Rate limiting** on subscribe/unsubscribe — low priority at current scale; Vercel Hobby doesn't support edge middleware for rate limiting
- **Cron IP whitelisting** — cron-job.org IPs rotate; CRON_SECRET bearer auth is sufficient

### Things that would break security if changed

- Never add `NEXT_PUBLIC_` prefix to any secret environment variable
- Never commit `.env.local`
- Never merge `dev` into `main` (would expose DEV_MODE behaviour in production)
- If `UNSUBSCRIBE_SECRET` is rotated, all existing unsubscribe links in previously sent emails will stop working — subscribers would need a new email to unsubscribe

### Google OAuth notes

- Google Cloud project: `news.unbiasedai@gmail.com` (new project — the old `unbaisedai.news@gmail.com` project is deprecated)
- OAuth app status: "Testing" — approved test users must be explicitly added in Google Cloud Console → OAuth consent screen → Test users
- Refresh tokens from Testing-status apps expire after 7 days of inactivity; publishing the app removes this limit
- OAuth credentials (Client ID: `999061842577-...`) are stored in Vercel env vars only
