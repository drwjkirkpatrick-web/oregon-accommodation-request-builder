# Project State: Oregon Accommodation Request Builder

> **Last updated:** 2026-11-18
> **Current phase:** build → publish (finishing loop in progress)
> **Overall health:** green

---

## 1. Goal (1–2 sentences)

A privacy-first static web tool that walks an Oregon state employee through the
questions their manager and HR / Employee Services actually need, then generates
a complete, copy-paste accommodation request — plus a matching manager summary.
No storage of any kind; answers live only in the open browser tab.

## 2. Current Status

### Done
- [x] Research: 14-source citation ledger (.hermes/citations/ledger.json) — DAS Statewide Policies 50.020.10 & 60.000.30, ORS 659A.112/.033/.146/.147, 653.077, OAR 839-006-0206, BOLI pages, DAS sample form, OMD agency procedure
- [x] docs/RESEARCH.md — grounded write-up, all 14 sources cited, verified with sources.py
- [x] js/accommodation.js — 4-track data model + pure text generation (UMD: browser + node)
- [x] js/app.js + css/styles.css + index.html — wizard UI, strict CSP (`default-src 'none'`)
- [x] test/generate.test.mjs — 12 tests, all green (`node --test test/generate.test.mjs`)
- [x] Browser walkthrough — 11 employee + 6 manager content checks pass, 0 page errors, 0px mobile overflow; detached-textarea bug found and fixed

### In Progress
- [ ] Finish loop: commit → GitHub repo → push to main → Vercel deploy → live verification

### Not Started
- [ ] (future, optional) Spanish translation; agency-customizable contact block

## 3. Architecture & Key Decisions

| Decision | Rationale | Date |
|---|---|---|
| No backend, no storage, no analytics | Hard privacy requirement — medical-adjacent content must never be stored or transmitted | 2026-11-18 |
| Four tracks (disability / pregnancy / lactation / religious) | Four distinct legal channels with different triggers and questions | 2026-11-18 |
| Questions mirror the DAS sample request form + Policy 50.020.10 interactive process | Employee output must be instantly recognizable to state HR | 2026-11-18 |
| UMD core module (`js/accommodation.js`) | Same pure functions run in browser and under `node:test` — generation logic tested without a DOM | 2026-11-18 |
| Two generated outputs (employee request + manager summary with [fill-in] brackets) | The timesaver: manager forwards to HR / Employee Services without a check-back | 2026-11-18 |
| Law citations as a toggleable footer line, not demands | Complete and routable, not adversarial | 2026-11-18 |

## 4. Blockers & Risks

- **Risk:** Policy/statute drift (e.g., statewide policy renumbers, lactation age window changes) → re-check the 14 sources quarterly; all claims cite them in docs/RESEARCH.md.
- **Risk:** Content read as legal advice → disclaimers in header chip, footer, README, and RESEARCH.md; no diagnosis questions anywhere.

## 5. Next Step (only ONE)

> **Next:** Commit, create `drwjkirkpatrick-web/oregon-accommodation-request-builder`, push to `main`, deploy to Vercel, verify the live URL with curl.

## 6. Environment & Tooling Notes

- Node v22.22.2 — `node --test` needs the explicit file path (`test/generate.test.mjs`); a bare `test/` dir argument fails with MODULE_NOT_FOUND on this version
- Local preview: `/usr/bin/python3.10 -m http.server 8090 --bind 127.0.0.1` from repo root (page uses absolute asset paths — file:// looks bare)
- Vercel CLI logged in as drwjkirkpatrick-3155; gh auth green with repo scope
- Citation ledger: `.hermes/citations/ledger.json` (local only, gitignored via .vercel-style exclusions — sources are committed in docs/RESEARCH.md)
- Hermes skill used: web-design-artifacts, grounded-citations, software-development-workflows, project-state-management

## 7. Recent Session Log

- 2026-11-18: Researched 14 Oregon sources; built the full static site; 12 node tests green; in-browser walkthrough caught and fixed a detached-textarea population bug; geometry + content checks green desktop and 360px mobile.

## 8. References

- Research: `docs/RESEARCH.md` (all claims cited to the ledger)
- Ledger: `.hermes/citations/ledger.json` (local)
- Plan: none (single-session build)
