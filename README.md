# Werth Design

A portfolio + sales site for **Werth Design** — web design, AI implementation, and legacy /
memorial archive websites. Static, dependency-free, and built to host on **GitHub Pages for $0/mo**.

The full go-to-market strategy (audience, channels, SEO, brand voice, funnel, pricing) lives in
[`GROWTH-PLAN.md`](GROWTH-PLAN.md).

---

## What's here

```
werth-design/
├── index.html            # the whole site (one page, anchored sections)
├── assets/
│   ├── styles.css        # heirloom-editorial design system
│   ├── main.js           # reveals, count-ups, mobile nav, form handling
│   ├── chatbot.css       # styles for Wren, the demo AI assistant
│   ├── chatbot.js        # Wren — scripted assistant + Formspree lead capture
│   ├── favicon.svg       # W seal favicon
│   ├── og-image.svg/.png # social share card (1200×630)
│   └── screenshots/      # real screenshots of the six live sites (work cards)
├── robots.txt
├── sitemap.xml
├── .nojekyll             # tells GitHub Pages to serve files as-is
├── GROWTH-PLAN.md        # the sales/marketing strategy
└── TARGETS.md            # prospect hit-list of real local businesses + outreach templates
```

**Wren, the AI chat demo:** a scripted, on-device assistant (no API key, safe for static
hosting) that answers from the site's real content and captures leads to the same Formspree
endpoint. It's honestly presented as a *demo* of the kind of assistant built for clients. Edit its
answers in `assets/chatbot.js` (the `KB` array); the Formspree endpoint also lives there. To
re-capture the portfolio screenshots: headless Chrome `--screenshot` at 1280×860 @2×, then
`sips -Z 1300 -s format jpeg` into `assets/screenshots/`.

No build step. No framework. Just open `index.html`.

---

## Deploy to GitHub Pages (5 minutes)

1. **Create a repo** (e.g. `werth-design`) under your `werth-code` account and push these files:
   ```bash
   cd werth-design
   git init
   git add .
   git commit -m "Werth Design site"
   git branch -M main
   git remote add origin https://github.com/werth-code/werth-design.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**, pick
   `main` / `/ (root)`, save.
3. Live in ~1 minute at **`https://werth-code.github.io/werth-design/`**.

### Custom domain (recommended — better SEO & trust)
1. Buy a domain (e.g. `werthdesign.com` or `werth.design`).
2. Add a file named `CNAME` (no extension) to the repo root containing just your domain:
   ```
   werthdesign.com
   ```
3. At your registrar, point DNS at GitHub Pages:
   - 4 × `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` for `www` → `werth-code.github.io`
4. GitHub → Settings → Pages → enter the domain, check **Enforce HTTPS**.
5. After switching domains, update the absolute URLs in `index.html` (`canonical`, `og:url`,
   `og:image`), `robots.txt`, and `sitemap.xml` from `werth-code.github.io/werth-design/` to your
   domain. (Search `werth-code.github.io/werth-design` and replace.)

---

## Make the contact form actually deliver leads (free)

GitHub Pages can't process forms (no server), so the form uses **Formspree**:

1. Sign up free at <https://formspree.io>, create a form, copy its endpoint ID.
2. In `index.html`, find `action="https://formspree.io/f/REPLACE_WITH_YOUR_ID"` and paste your ID.
3. Done — submissions arrive in your email, no reload, with a thank-you message.

**Until you do this**, the form gracefully falls back to opening the visitor's email app
pre-addressed to `matthewwerth@gmail.com`. (Swap that address anywhere it appears if you set up a
branded one like `hello@werthdesign.com`.)

Want booking instead of a form? Add your **Calendly** link to the "Start a project" buttons.

---

## Editing cheat-sheet

| Want to change… | Where |
|---|---|
| Prices / package contents | `index.html` → `#pricing` section (and the JSON-LD `makesOffer` block in `<head>`) |
| Projects shown | `index.html` → `#work` → `.card` list items |
| Services copy | `index.html` → `#services` |
| Colors / fonts / spacing | `assets/styles.css` → `:root` variables at the top |
| Email address | search `matthewwerth@gmail.com` across `index.html` |
| FAQ (also feeds Google rich results) | `index.html` → `#faq` **and** the `FAQPage` JSON-LD in `<head>` — keep them in sync |

### Before sharing the link
- [ ] Wire the Formspree endpoint (or Calendly).
- [ ] Connect a custom domain and update the absolute URLs (see above).
- [ ] Submit `sitemap.xml` to Google Search Console.
- [ ] Claim the Google Business Profile and request reviews from past clients.
- [ ] (Optional) Export `assets/og-image.svg` to a 1200×630 **PNG** named `og-image.png` and point
      the `og:image`/`twitter:image` tags at it — a few platforms don't render SVG share cards.

---

## Design notes

- **Aesthetic:** heirloom-editorial — warm paper, deep ink, oxblood + brass, on **Fraunces**
  (display) / **Newsreader** (text) / **Spline Sans Mono** (labels). Chosen to read as *crafted and
  human* — the deliberate opposite of generic AI-startup design.
- **Performance & a11y:** static, deferred JS, `prefers-reduced-motion` respected, semantic
  landmarks, skip link, visible focus states, keyboard-friendly.
- **No tracking** by default. Add privacy-friendly analytics (e.g. Plausible/Umami) if you want
  traffic data.
