# ObjectWeave RV India — Rules explorer (phone)

Live: https://objectweave-rv-rules.mangale-arihant.workers.dev (Cloudflare Worker `objectweave-rv-rules`, free workers.dev)

- `template.html` — the page source (vanilla JS, no build). `__SEED__` is replaced with the seed.
- `regulatory.json` — copy of `packages/core/src/seed/regulatory.json` from github.com/37ma1178-chin/Bouncy-baby_RV1 (main @ 3db6a39, seed 2026-10-08).
- `index.html` — built file: `python3 -c "import json;s=json.dumps(json.load(open('regulatory.json')),ensure_ascii=False).replace('</','<\\/');open('index.html','w').write(open('template.html').read().replace('__SEED__',s))"`

Tabs: Quick check (maps answers onto the seed's 6 scenarios + state overlay), Rules (27 records, search + status/source filters), States, Size & weight, Open questions.
No legal content is authored here; everything is rendered from the seed. Statuses are never promoted.
