# Free-first AI direction

Date: 2026-10-09
Status: Implemented locally; see implementation update below.

The user wants offline play plus optional AI creation without charges. Keep the complete game, local recency and saved custom packs independent of any model service. Generate content only in a pack studio, review/edit it, then save it through existing pack validation.

Recommended initial hosted candidate: Groq Free. Official limits currently list gpt-oss-20b among free text models; do not assume Llama availability from older examples. Select a currently free supported model at integration time. Groq and xAI Grok are different providers. Grok's documented token pricing does not establish an ongoing free API entitlement. Gemini also offers a limited free tier with data-use conditions.

No paid fallback, automatic account upgrade, or mandatory online play. Bound generation and enforce quotas server-side. When offline or over quota, offer saved/built-in packs without calling them newly AI-generated. A hosted endpoint and server-held API credential are prerequisites; never put a key in Vite client variables or request it in chat. No provider account was created or AI request made.

WebLLM can run browser-local models without per-call API fees but requires WebGPU, model downloads and target-phone performance testing. Keep it optional. External free quotas and hosting allowances do not guarantee unlimited free scale.

Sources checked:
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/billing-faqs
- https://ai.google.dev/gemini-api/docs/pricing
- https://docs.x.ai/developers/pricing
- https://webllm.mlc.ai/docs/user/get_started.html

## Implementation update — 9 October 2026

User authorized the hybrid studio and provided a key via clipboard for local configuration. Implemented curated offline mixing plus a Groq server adapter, draft review/edit/save, free-mode opt-in, bounded requests and no paid fallback. Real Space Party and Rainy Day draft generation succeeded; the latter was reviewed and saved through an isolated browser verification context. No deployment made. Original proposal above records the prior state; setup and limitations are current in docs/pack-studio-setup.md.
