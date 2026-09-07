# Werth Design project instructions

## Purpose and repository
Maintain the public Werth Design marketing website in werth-code/werth-design.
This is a static HTML/CSS/vanilla JavaScript site with no package manager or build step.
The default branch is main. GitHub Pages publishes the website; treat changes to main as production releases.

## Current scope
Work locally on a dedicated branch. Prepare reviewable changes and evidence.
Do not push to main, merge, deploy, alter DNS, change Pages settings, or modify Cloudflare services without an explicit user request authorizing that action.
Do not send outreach, submit live forms, or invoke production AI endpoints during checks without explicit authorization.
No credentials, private prospect records, client data, or internal strategy belong in this public repository.
Keep operational records outside the website checkout. Preserve the existing private/ ignore rule; never force-add ignored files.

## Source map
- index.html: homepage, offers, contact form, metadata and structured data.
- assets/styles.css and assets/main.js: shared presentation and interactions.
- assets/chatbot.js and assets/chatbot.css: Raven assistant, Worker requests and local fallback.
- for/home-services/, for/hvac/, for/plumbers/: trade landing pages.
- tools/: headline and review response interfaces with shared CSS/JavaScript.
- CNAME, .nojekyll, robots.txt, sitemap.xml: domain, hosting and indexing assets.
The frontend uses Formspree, Google Fonts, Cloudflare Web Analytics and a separate Cloudflare Worker.
The Worker implementation and deployment configuration are not in this repository.
README.md includes stale setup notes; check source before relying on it.

## Editing and verification
Preserve the existing dependency-free architecture and design conventions.
Keep offers, FAQs, chatbot fallback answers and structured data consistent when editing them.
Use a local static server for previews. Mock external POST requests so checks cannot send leads or incur AI usage.
For frontend changes, check relevant pages at narrow and wide widths, keyboard navigation, console errors, relative links and asset loading.
For instructions/configuration-only changes, inspect the diff and parse TOML; do not add a frontend test framework.
Report exactly what changed, what was checked, and what remains unverified.

## Operating roles
The primary conversation acts as chief of staff and owns scope and the final review.
Custom agents are available for lead research, site auditing, sales drafts, delivery, QA/security and content drafts.
Use delegation when the user requests parallel work; keep assignments bounded and file ownership explicit.
Research, audits and writing roles return findings or drafts. They must not publish, contact people or mutate external systems.
Delivery may edit an isolated local branch within authorized scope; QA reviews independently.

## Explicit role loading
Some clients expose generic collaboration tools without automatically exposing the named TOML roles.
Before delegating to a named role, read its matching `.codex/agents/<role>.toml` and pass its developer_instructions and the task scope explicitly to the subagent.
Available role filenames are chief_of_staff, lead_scout, site_auditor, sales_writer, delivery_engineer, qa_security and content_writer.
Treat sandbox_mode as a requested restriction, not proof that a client applied it. Check the actual runtime permissions and keep assignments within the user's authorization.
Report explicit role-file loading separately from verified automatic role discovery; never claim parsing alone installs or enforces a role.
