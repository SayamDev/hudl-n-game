# Pack studio setup

Offline mixes work immediately. Optional AI generation uses Groq through server-only middleware in `server/pack-studio.mjs`, mounted by Vite in development and preview. No API key is bundled into the browser. Static-only hosting continues to support offline mixes and manual packs; AI requires a same-origin server endpoint.

1. Create a Groq account on its **Free** plan. Do not enable a paid plan for this integration.
2. Copy `.env.example` to `.env.local`. Put your key in `GROQ_API_KEY` locally (never in chat, Git, or a `VITE_` variable).
3. Confirm the account is free, then set `GROQ_FREE_TIER_CONFIRMED=true`.
4. Restart `npm run dev` or `npm run preview -- --port 4173`.
5. Open Packs → AI theme. Generate, review, edit and save. Saved packs work offline.

Default model: `openai/gpt-oss-20b`, currently listed on Groq's free tier. Override only with a model supported by your free account and strict structured output. Availability and quota can change: https://console.groq.com/docs/rate-limits . Integration follows https://console.groq.com/docs/structured-outputs .

The app makes one request per generation, with a 25-second provider timeout, up to 2,048 completion tokens, no paid provider fallback and no automatic retries. It caps requests at 3 per network address per hour and 20 per UTC day per server process. Failed provider requests count towards those app limits. These in-memory limits reset on process restart and are not a distributed quota system. The provider's Free account is the billing boundary; an environment flag cannot verify billing status. Never enable this against a paid account while promising zero cost.

For deployment: choose hosting first, mount `createPackStudio()` behind the same origin at `/api/pack-studio` and `/api/pack-studio/status`, and set APP_ORIGIN to the exact HTTPS origin. Add durable/shared quotas and appropriate trusted-proxy IP handling before multiple instances or public scale. Vite preview is for local validation, not a production application server. No deployment was made in this task.

The provider receives a system instruction, theme and word count, never the crew or game history. Returned text is parsed, bounded, deduplicated and rendered as text. Family-friendly generation is requested, but model instructions cannot guarantee suitability: the host must review each draft. No automatic content publication or background AI requests. The manual editor and offline mixes are always available.
