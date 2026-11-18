# 🤝 Oregon Accommodation Request Builder

A free, private web tool that helps **Oregon state employees** ask for a workplace accommodation — and get it right the first time.

**Live at [oregon-accommodation-request.vercel.app](https://oregon-accommodation-request.vercel.app)**

## The problem it solves

Requesting an accommodation at work usually starts a slow relay: you email your manager, your manager forwards to HR / Employee Services, HR writes back for a missing detail, and everyone waits. The fix is simple — put *everything the whole chain needs* into the very first message.

This tool is like a good intake form at a clinic: it asks you the plain-language questions up front, then assembles your answers into a clean, complete request. Your manager gets a matching summary they can forward without a single check-back.

## What you get (no account, no sign-up, nothing saved)

- About ten questions in five short steps
- A finished request to copy into an email or document for your manager
- A second, matching summary your manager can forward to HR / Employee Services — with fill-in brackets only for the dates a manager knows, like the day they received your request
- Questions that mirror Oregon's own paperwork: the DAS sample Reasonable Accommodation Request form and the interactive process in Statewide Policy 50.020.10

## Privacy is the feature

Nothing you type is stored or sent anywhere. There is no server, no account, no save button, no analytics — the site is a handful of static files, and your answers live only in the open tab. Close the tab and they are gone. Copy or download your text before you leave.

The tool also never asks for a diagnosis. Oregon law works on **"known limitations"**: you describe what is difficult and what would help. If your agency later needs functional information from your health care provider, that is part of the interactive process — the tool lets you say how you would like to handle that (provide it, obtain it, ask questions, or talk first).

## Four doors, one tool

- **Disability or health condition** — ADA · ORS 659A.112 · Statewide Policy 50.020.10
- **Pregnancy, childbirth, or a related condition** — ORS 659A.146–.147
- **Expressing milk at work** — ORS 653.077 · Statewide Policy 60.000.30
- **Religious observance or practice** — ORS 659A.033

Each door asks only the questions that track actually needs.

## Grounded, not guessed

Every question, deadline mention, and generated line traces back to Oregon's own documents — DAS statewide policies, the Oregon Revised Statutes, the BOLI administrative rule, and the DAS sample form. The full research trail with citations lives in [`docs/RESEARCH.md`](docs/RESEARCH.md).

A few things worth knowing (the tool folds these into the text it builds for you):

- Agencies acknowledge **written requests within seven calendar days** (Statewide Policy 50.020.10)
- Completing a form is **not required** — verbal requests are equally valid
- Retaliation for asking about, requesting, or using an accommodation is prohibited
- Medical and accommodation information is kept confidential and separate from personnel files

## Run it locally

The page needs to be served (it uses absolute asset paths), so a plain double-click will look bare:

```bash
git clone https://github.com/drwjkirkpatrick-web/oregon-accommodation-request-builder.git
cd oregon-accommodation-request-builder
python3 -m http.server 8080
# open http://localhost:8080
```

Run the tests for the text-generation core:

```bash
node --test test/generate.test.mjs
```

## For technical readers

- Static site: one HTML page, vanilla JavaScript, no framework, no dependencies, no build step
- `js/accommodation.js` holds all data and text generation as a UMD module — pure functions, runnable in Node, covered by `node:test`
- `js/app.js` is the only DOM code; styles are hand-rolled in `css/styles.css`
- The page ships a Content-Security-Policy of `default-src 'none'` — the browser itself enforces that the page cannot request anything from anywhere
- Deploy: any static host; this repo ships with a Vercel config for security headers

## Not a replacement for your agency's process

Unofficial community tool. Not affiliated with the State of Oregon, not legal advice, and not a substitute for your agency's own procedures or your collective bargaining agreement — those always govern. If you need legal advice, consult an attorney. BOLI also answers worker questions and takes complaints: 971-245-3844.

MIT license — see [LICENSE](LICENSE).
