# CLAUDE.md: Sorted Sites

Marketing site for **Sorted Sites**, a website-subscription business for Australian small
businesses. This repo is the business's own single-page landing site.

## The business (source of truth for all copy)

- **Offer:** no upfront cost, one flat monthly fee (**$129/month incl. GST**, fixed, no add-on tiers), **12-month minimum**, then month to month with 30 days' notice.
- **Promise:** professional site **live within 7 days**; changes by **email or text**, done **within one business day**. **No logins, ever.**
- **Ownership:** client always owns their domain (registered in *their* business name) and content, and takes both on exit. **Website IP transfer is optional and only after the first 12 months.** Never promise the site itself before then. No exit fees after the minimum term. Leaving inside 12 months means the remaining months are payable.
- **Included:** design and copywriting, hosting, SSL, domain registration/renewal, unlimited small changes, mobile-first build, basic local SEO, booking/quote form, click-to-call/map, Google Business Profile upkeep, review requests, backups.
- **No add-ons.** Former add-ons are baked into the $129. Large new features (online shop, members area, etc.) may cost extra and are always quoted first.
- **"Small change"** = edits to existing content (text, prices, hours, photos, staff, services list, notices). **Bigger jobs** (new section, shop, redesign) are quoted up front.
- **Business details:** ABN 46 873 536 821. Based in Adelaide SA 5098, serving Australia-wide. **No public phone number.** Don't add one to the page or JSON-LD.
- **Audience:** busy owners of trades, clinics, cafés, salons and service businesses. Non-technical, time-poor, burnt by agencies before.

If any of these facts change, update **every** place they appear: hero, steps, checklist, quote docket, ownership section, FAQ, JSON-LD `makesOffer`, meta description, `og.png`, privacy note.

## Voice

Write like a trustworthy local tradie, not a SaaS startup.

- Plain, friendly, confident, Australian (en-AU spelling: "organise", "colour"). Light colloquialisms are fine ("sorted", "no worries", "legend"); don't overdo them.
- Banned: jargon (CMS, SEO-optimised, solutions, leverage, synergy, seamless, empower, cutting-edge), hype, exclamation marks, fake urgency, fake testimonials or stats.
- Say exactly what happens. CTA wording is consistent: **"Book a free chat"** everywhere (nav, hero, pricing, form submit). The success message confirms the same action.
- Be upfront about the 12-month minimum. Never bury terms.
- Errors tell the user what to fix and offer the email fallback. No apologising.

## Stack and constraints

- **Pure static:** `index.html`, `styles.css`, `script.js`. No build step, no framework, no npm, no backend, no database. Keep it that way unless explicitly asked.
- **Form:** FormSubmit (no account). Native `action="https://formsubmit.co/<address>"`; JS posts JSON to `data-ajax-action="https://formsubmit.co/ajax/<address>"` and treats `success === "true"` (a string) as sent. Hidden fields: `_subject`, `_template=table`, honeypot `_honey`. It currently delivers to `bwhitely@live.com` (temporary). The first-ever submission triggers a one-time activation email. After activating, swap the address in both attributes for FormSubmit's random alias so the inbox isn't exposed in page source. FormSubmit returns HTTP 200 even on failure, and the reason is in `data.message`, which `script.js` logs to the console. Known reasons: "This form needs Activation" (activation link not yet clicked) and "open this page through a web server" (page opened via `file://`).
- **Hosting target:** Cloudflare Pages (free, Australian edge locations). Netlify also works. Both read `_headers`.
- **Fonts:** Archivo variable (`wdth` 100–125, `wght` 400–800), **self-hosted** latin subset at `fonts/archivo-latin-var.woff2` (SIL OFL, `fonts/OFL.txt`), preloaded in `<head>`. Don't go back to the Google Fonts CDN: the CSS→woff2 chain caused 0.08 CLS and ~400ms mobile TBT. Headings use `font-stretch: 125%`.
- **Third-party origins** are limited to `formsubmit.co`. Adding any other origin requires updating the CSP in `_headers` *and* the privacy note in the footer.
- **No analytics or tracking cookies.** The privacy note says so. If analytics is added, use a cookieless tool and update the note.
- **No inline `<script>` (except JSON-LD) or `style=""` attributes:** the CSP blocks them.

## Design system

Tokens live on `:root` in `styles.css`. Don't introduce new colours ad hoc.

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F1F4EF` | page background |
| `--paper-tint` | `#E3EAE3` | alternate sections, "them" text bubbles |
| `--ink` | `#10302B` | text, dark sections, "us" bubbles |
| `--ink-soft` | `#3D5A54` | secondary text (passes AA on paper and tint) |
| `--leaf` | `#2F6B5A` | links, step labels |
| `--signal` | `#F2B705` | primary buttons and checkmarks only, never text on light backgrounds |
| `--line` | `#C9D3CB` | hairlines, dashed docket rules |

Principles:
- **One bold element:** the hero text-message thread. Its one-time CSS entrance is the only non-interactive motion on the page. Don't add scroll-reveal or other decorative animation.
- Structure encodes meaning: the steps are a timeline (Day 1 / Day 7 / Any day after), pricing is a quote docket with line items. Don't convert these into generic cards.
- Left-aligned text, line lengths under 80 characters, sentence case. No all-caps eyebrow labels, no "→" on buttons.

## Accessibility (WCAG 2.1 AA, non-negotiable)

- Skip link, semantic landmarks, one `h1`, logical heading order.
- Visible `:focus-visible` outline on everything (yellow on dark sections).
- All motion is gated behind `prefers-reduced-motion: no-preference`.
- Form: real `<label>`s, `autocomplete` attributes, inline errors linked via `aria-describedby` and `aria-invalid`, status region with `role="status"`. Inputs ≥16px to prevent iOS zoom.
- FAQ uses native `<details>/<summary>`. Don't replace it with a JS accordion.
- Check contrast for any new colour pairing before using it.

## SEO

- `<head>` holds the title, description, canonical, Open Graph and Twitter card tags. Absolute URLs use `https://sortedsites.com.au/`, so update them all if the domain changes (also `robots.txt` and `sitemap.xml`).
- JSON-LD `ProfessionalService` (a `LocalBusiness` subtype). Keep the address, phone, hours and price in sync with visible content. Validate with Google's Rich Results Test after edits.
- `og.png` (1200×630) and `apple-touch-icon.png` (180×180) are rendered from HTML with headless Chrome. Re-render if the headline or brand changes.

## Local preview and checks

```sh
python3 -m http.server 8000      # then open http://localhost:8000
```

Root-relative paths (`/styles.css`) mean opening `index.html` via `file://` won't load CSS. Use a server.

Headless Chrome screenshot gotchas (learned the hard way):
- `--window-size` height includes ~87px of browser chrome. Render taller, then crop.
- `--headless=new` enforces a **500px minimum viewport**. For true phone widths, load the page in a 390px-wide `<iframe>`.

Before shipping changes: check at 390px and 1440px widths, tab through the whole page with the keyboard, run Lighthouse and axe-core (WCAG 2.1 AA tags), and submit a test enquiry.

Baseline (2026-10-26, local server): Lighthouse mobile 99/100/100/100, desktop 100/100/100/100, CLS 0. axe-core 4.14: 0 violations across default, FAQ expanded, form error/success and 390px reduced-motion states. Don't regress these.

## Deploy (Cloudflare Pages)

1. Push the repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Framework preset: **None**. Build command: *(empty)*. Output directory: `/`.
4. Add the custom domain `sortedsites.com.au` under the project's Custom domains tab.

## Open placeholders

- Public contact email `hello@sortedsites.com.au` (JSON-LD, enquiry intro, footer, privacy note, `script.js` error messages) must be set up before launch, or fallback emails bounce.
- The `sortedsites.com.au` domain does not exist yet.
- Form recipient `bwhitely@live.com` is temporary. Move to the domain inbox once it exists.
- JSON-LD `addressLocality` is "Adelaide". Replace with the actual 5098 suburb for better local matching.
- JSON-LD opening hours (Mon–Fri 8–5) are a placeholder.
