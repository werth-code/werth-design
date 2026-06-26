/* Raven — Werth Design's demo studio assistant.
   A scripted, on-device assistant (no API key, safe for static hosting) that
   answers from the site's real content and can capture a lead to Formspree.
   It is honestly presented as a DEMO of the kind of assistant Matthew builds.
   (Internal class/id prefix remains `wren-`; the user-facing name is Raven.) */
(function () {
  "use strict";

  var FORMSPREE = "https://formspree.io/f/xeebokgb";
  var EMAIL = "matthewwerth@gmail.com";

  var el = {
    root: document.getElementById("wren"),
    launch: document.getElementById("wren-launch"),
    panel: document.getElementById("wren-panel"),
    close: document.getElementById("wren-close"),
    log: document.getElementById("wren-log"),
    quick: document.getElementById("wren-quick"),
    form: document.getElementById("wren-form"),
    input: document.getElementById("wren-input")
  };
  if (!el.root) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var started = false;
  var lead = { active: false, step: null, name: "", email: "" };

  /* ---------- knowledge base ---------- */
  var KB = [
    { id: "pricing", k: ["how much", "how much do", "how much does", "price", "pricing", "prices", "cost", "costs", "rate", "rates", "charge", "charges", "fee", "fees", "quote", "estimate", "budget", "afford", "affordable", "expensive", "cheap", "ballpark", "package", "packages", "$"],
      a: "Plain numbers, fixed up front: <strong>Launch</strong> websites from <strong>$899</strong> · <strong>Grow</strong> (a site that sells, with an AI chat assistant included) from <strong>$2,499</strong> · <strong>Life's-work / legacy</strong> sites from <strong>$499</strong>. Already have a site? SEO + competitor analysis + AI from <strong>$299</strong>. Custom AI is quoted to the project; care plans run <strong>$39/mo</strong> (or $99 one-time).",
      chips: ["What's included?", "I already have a site", "Start a project"] },
    { id: "services", k: ["what do you", "what do u", "what kind", "what can you", "what you do", "services", "service", "offer", "do you build", "do you make", "make a website", "need a website", "build a site", "build a website", "new website", "new site"],
      a: "Three things: <strong>fast websites</strong> that get you found and booked, <strong>AI tools</strong> that do the busywork (assistants like me, automations, lead-capture), and lasting <strong>archives</strong> for a life's work. What are you after?",
      chips: ["How much?", "Do you do AI?", "See the work"] },
    { id: "existing", k: ["already have a site", "already have a website", "existing site", "existing website", "current site", "current website", "have a website", "have a site", "improve my site", "improve my website", "fix my site", "update my site", "redo my site", "redesign", "tune up", "tune-up", "seo", "search ranking", "google ranking", "rank higher", "ranking", "show up on google", "found on google", "competitor", "competitors", "competition", "competitor analysis"],
      a: "Got a site already? For <strong>$299</strong> I'll do an <strong>SEO tune-up</strong>, a <strong>competitor analysis</strong>, and <strong>add AI</strong> (like a chat assistant) — no full rebuild needed. And the first look is free: a no-obligation audit of where your site stands.",
      chips: ["Get a free audit", "How much for a new site?", "Start a project"] },
    { id: "audit", k: ["audit", "free audit", "site audit", "check my site", "review my site", "look at my site", "how's my site", "hows my site", "is my site any good", "what's wrong with my site"],
      a: "Happy to — the <strong>free site audit</strong> is a short, plain-English report: speed, mobile, Google ranking, and where your site is quietly losing customers. No charge, no obligation. Want to start one? I'll just need your name, email, and site.",
      chips: ["Yes, start the audit", "How much to fix it?", "Talk to Matthew"] },
    { id: "ai", k: ["ai", "chatbot", "chat bot", "chat assistant", "assistant", "bots", "automation", "automate", "automated", "automating", "artificial intelligence", "machine learning"],
      a: "Real AI — not slideware. The favorite is an assistant like me on your site that answers customers and <strong>books jobs 24/7</strong>, so the after-hours calls you'd miss turn into booked work. I also automate intake, scheduling, and follow-up. (Matthew's shipped a 98.8%-accurate vision model and an automated transcription pipeline.)",
      chips: ["Is this a real AI?", "How much?", "Start a project"] },
    { id: "customers", k: ["more customers", "more business", "more leads", "more sales", "more calls", "more bookings", "grow my business", "get customers", "get more", "will it work", "worth it", "roi", "pay for itself", "increase sales", "increase revenue"],
      a: "That's the whole point. A fast site that ranks on Google, plus an assistant that answers and books every lead — even after hours — means fewer missed calls and more booked jobs. I build things that pay for themselves, not just look nice.",
      chips: ["Do you do AI?", "How much?", "Start a project"] },
    { id: "meta", k: ["are you real", "is this real", "real ai", "are you a bot", "are you human", "are you ai", "chatgpt", "how do you work", "scripted", "is this a real", "are you actually"],
      a: "Fair question — I'm a <strong>scripted demo</strong>, so everything runs right here on the page and costs nothing. The real version Matthew builds connects to an AI model trained on <em>your</em> business, so it answers like your best employee and books real appointments. This is just a taste.",
      chips: ["What can the real one do?", "How much?", "Start a project"] },
    { id: "realone", k: ["real one", "real version", "what can the real", "trained on", "for my business", "like your best", "what can it do", "what could it do"],
      a: "On your site, an assistant like me can answer FAQs in your voice, qualify and <strong>book appointments</strong>, capture after-hours leads, route the serious ones to you, and hand off to a human when needed. It plugs into your booking/calendar and emails you every lead.",
      chips: ["How much?", "Start a project"] },
    { id: "work", k: ["work", "portfolio", "examples", "example", "show me", "see your", "projects", "sites you", "samples", "sample", "case study", "case studies", "proof"],
      a: "Real, live ones are right above ↑ — a <strong>641-sermon archive</strong>, a biblical-scholarship library, an art print shop, a wine-guide sales funnel, a teacher-coaching membership, and a stock-tracker app. Tap any card to open the real site.",
      chips: ["See the work", "How much?", "Start a project"], act: "work" },
    { id: "legacy", k: ["legacy", "memorial", "memorials", "archive", "sermon", "sermons", "life's work", "lifes work", "preserve", "preservation", "family history", "genealogy", "obituary", "tribute", "church", "scholarship"],
      a: "A specialty of mine. I take a lifetime of material — sermons, writing, art, family history — and turn it into a searchable, beautiful site built to outlive the next platform. Legacy sites start at <strong>$499</strong>; Pastor Jack Werth's 641 sermons are a good example.",
      chips: ["See the work", "Start a project"] },
    { id: "techy", k: ["not techy", "not technical", "im not techy", "no tech", "non-technical", "too complicated", "is it hard", "do i need to know", "i don't know computers", "dont know computers"],
      a: "Not a problem at all — you never touch code, servers, or settings. I handle every bit of it in plain English, and if you can send a text, you can run what I build you. I'm a message away whenever you need a hand.",
      chips: ["How much?", "Start a project"] },
    { id: "local", k: ["where", "location", "located", "near me", "local", "wilmington", "delaware", "newark", "hockessin", "brandywine", "philadelphia", "philly", "jersey", "area", "remote", "do you travel"],
      a: "Wilmington, Delaware. I work in person around Wilmington, the Brandywine Valley, Philadelphia, and South Jersey — and remotely with anyone, anywhere.",
      chips: ["Start a project", "What do you build?"] },
    { id: "timeline", k: ["how long", "timeline", "how fast", "when", "turnaround", "quick", "quickly", "deadline", "how soon", "ready by", "take to build"],
      a: "A Launch site is usually <strong>2–3 weeks</strong>; bigger sites with booking, a shop, or AI run <strong>4–8</strong>. I work fast and finish.",
      chips: ["How much?", "Start a project"] },
    { id: "hosting", k: ["host", "hosting", "domain", "server", "github", "cheap to run", "monthly cost", "ongoing cost", "monthly fee", "running costs"],
      a: "Cheaply — a lot of my sites run on free static hosting (<strong>$0/mo</strong>). Usually your only ongoing cost is a domain name, about $12–20 a year. Optional care plans are <strong>$39/mo</strong>.",
      chips: ["What's a care plan?", "Start a project"] },
    { id: "care", k: ["care plan", "maintain", "maintenance", "support", "updates", "update later", "after launch", "who maintains", "keep it updated", "changes later", "ongoing help"],
      a: "Up to you — continuous upkeep is <strong>$39/mo</strong> (updates, backups, hosting help, and a human who answers), or a one-time <strong>$99</strong> when you just need a few changes. Or I hand you the keys. You own everything either way.",
      chips: ["Start a project", "How much?"] },
    { id: "who", k: ["matthew", "who are you", "who is", "about you", "about matthew", "experience", "experienced", "qualified", "background", "who builds"],
      a: "Matthew Werth — a Wilmington studio of one who designs <em>and</em> engineers (a software developer at JPMorgan Chase, art-trained at Temple's Tyler School of Art). He sweats the QA most shops skip.",
      chips: ["See the work", "Start a project"] },
    { id: "greeting", k: ["hi", "hello", "hey", "yo", "good morning", "good afternoon", "good evening", "howdy", "hiya"],
      a: "Hey! 👋 I can talk pricing, what Matthew builds, AI tools, or get your project to him. What's on your mind?",
      chips: ["How much?", "Do you do AI?", "Start a project"] },
    { id: "thanks", k: ["thanks", "thank you", "thx", "appreciate", "awesome", "perfect", "great help", "very helpful"],
      a: "Anytime! Want me to pass your project along to Matthew, or is there anything else I can answer?",
      chips: ["Start a project", "How much?", "See the work"] }
  ];

  // Claude-backed brain (Cloudflare Worker). Open questions go here; the KB below
  // is the offline fallback if the Worker is unreachable or rate-limited.
  var WORKER_URL = "https://werth-chatbot.werthdesign.workers.dev";
  var convo = []; // running Claude conversation: [{role, content}, ...]

  var GREETING = "Hi! I'm <strong>Raven</strong>, the studio's assistant. I can talk pricing, what Matthew builds, AI tools, or get your project to him. What can I help with?";
  var DEFAULT_CHIPS = ["How much?", "Do you do AI?", "I already have a site", "Start a project"];
  var FALLBACK = "Good question — I'm a quick demo, so I might not have that exact one. I can talk <strong>pricing</strong>, <strong>websites &amp; AI</strong>, improving an <strong>existing site</strong>, the <strong>portfolio</strong>, or get your project to Matthew. What's most useful?";
  // STRONG starts jump straight to lead capture (checked before intent matching).
  var STRONG_START = ["start a project", "start the audit", "start my audit", "start an audit", "yes start", "lets start", "let's start", "get started", "lets do it", "let's do it", "lets go", "let's go", "sign me up", "book a call", "book a meeting", "book a time", "hire you", "ready to start"];
  // SOFT leads only fire when no info question matched.
  var SOFT_LEAD = ["interested", "reach out", "contact you", "email matthew", "call me", "im in", "i'm in", "im ready", "i'm ready", "sounds good", "work with you", "hire", "talk to matthew"];

  /* ---------- ui helpers ---------- */
  function scrollDown() { el.log.scrollTop = el.log.scrollHeight; }

  function addMsg(who, html) {
    var row = document.createElement("div");
    row.className = "wren-msg wren-" + who;
    row.innerHTML = html;
    el.log.appendChild(row);
    scrollDown();
    return row;
  }

  function typing() {
    var row = document.createElement("div");
    row.className = "wren-msg wren-bot wren-typing";
    row.innerHTML = "<span></span><span></span><span></span>";
    el.log.appendChild(row);
    scrollDown();
    return row;
  }

  function botSay(html, chips, after) {
    var delay = reduce ? 120 : 480 + Math.min(html.length * 7, 900);
    var t = typing();
    setTimeout(function () {
      t.remove();
      addMsg("bot", html);
      if (chips) setChips(chips);
      if (after) after();
    }, delay);
  }

  function setChips(list) {
    el.quick.innerHTML = "";
    (list || []).forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "wren-chip";
      b.textContent = label;
      b.addEventListener("click", function () { handleUser(label); });
      el.quick.appendChild(b);
    });
  }

  /* ---------- conversation ---------- */
  function start() {
    if (started) return;
    started = true;
    botSay(GREETING, DEFAULT_CHIPS);
  }

  function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()); }

  function beginLead(seed) {
    lead.active = true; lead.step = "name"; lead.name = ""; lead.email = "";
    botSay("Love it — let's get you on Matthew's list. What's your <strong>name</strong>?", null);
  }

  function leadFlow(text) {
    if (lead.step === "name") {
      lead.name = text.replace(/^(i'?m|my name is|it'?s)\s+/i, "").trim() || text.trim();
      lead.step = "email";
      botSay("Thanks, " + escapeHtml(firstName(lead.name)) + "! What's the best <strong>email</strong> for Matthew to reach you?", null);
      return;
    }
    if (lead.step === "email") {
      if (!isEmail(text)) { botSay("Hmm, that doesn't look like an email — mind trying again? (e.g. jane@example.com)", null); return; }
      lead.email = text.trim();
      lead.step = "detail";
      botSay("Perfect. In a sentence or two — <strong>what are you trying to build?</strong>", null);
      return;
    }
    if (lead.step === "detail") {
      submitLead(text.trim());
      return;
    }
  }

  function submitLead(detail) {
    var t = typing();
    var data = new FormData();
    data.append("name", lead.name);
    data.append("email", lead.email);
    data.append("message", "[Raven chatbot lead] " + detail);
    data.append("source", "Website chatbot (Raven)");
    data.append("_subject", "New chatbot lead — " + lead.name);
    fetch(FORMSPREE, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        t.remove();
        if (res.ok) {
          addMsg("bot", "Sent ✦ Thanks, " + escapeHtml(firstName(lead.name)) + " — Matthew reads every message himself and usually replies within a day. Anything else I can answer?");
        } else {
          addMsg("bot", "I couldn't send that just now — please email Matthew directly at <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a> and he'll jump on it.");
        }
        setChips(["How much?", "See the work", "Do you do AI?"]);
      })
      .catch(function () {
        t.remove();
        addMsg("bot", "Network hiccup — please email Matthew at <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a> and he'll take care of you.");
        setChips(["How much?", "See the work"]);
      });
    lead.active = false; lead.step = null;
  }

  function firstName(n) { return (n || "").split(/\s+/)[0] || n; }
  function escapeHtml(s) { return (s || "").replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  // normalize: lowercase, strip punctuation to spaces, pad with spaces so words have clean boundaries
  function norm(s) {
    return " " + String(s).toLowerCase().replace(/[^a-z0-9$'\s]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  }
  // phrases match as substrings; single words match whole-word (so "ai" never matches inside "email")
  function hasAny(t, list) {
    return list.some(function (p) {
      return p.indexOf(" ") !== -1 ? t.indexOf(p) !== -1 : t.indexOf(" " + p + " ") !== -1;
    });
  }

  function matchIntent(text) {
    var t = norm(text);
    var best = null, bestScore = 0;
    KB.forEach(function (intent) {
      var score = 0;
      intent.k.forEach(function (kw) {
        var k = kw.toLowerCase(), hit, weight;
        if (k.indexOf(" ") !== -1) { hit = t.indexOf(k) !== -1; weight = 3; }                      // phrase
        else if (/^[a-z0-9]+$/.test(k)) { hit = t.indexOf(" " + k + " ") !== -1; weight = k.length >= 5 ? 2 : 1; } // whole word
        else { hit = t.indexOf(k) !== -1; weight = 1; }                                             // symbol e.g. "$"
        if (hit) score += weight;
      });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    return bestScore > 0 ? best : null;
  }

  // Ask the Claude-backed Worker; gracefully fall back to the scripted KB on any error.
  function askClaude(text) {
    convo.push({ role: "user", content: text });
    if (convo.length > 24) convo = convo.slice(-24);
    var t = typing(), done = false;
    var timer = setTimeout(function () { if (!done) { done = true; t.remove(); fallbackAnswer(text); } }, 15000);
    fetch(WORKER_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: convo })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (done) return; done = true; clearTimeout(timer); t.remove();
        var reply = res.ok && res.d && res.d.reply ? String(res.d.reply) : "";
        if (reply) {
          addMsg("bot", escapeHtml(reply).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"));
          convo.push({ role: "assistant", content: reply });
          setChips(DEFAULT_CHIPS);
        } else {
          fallbackAnswer(text, res.d && res.d.error);
        }
      })
      .catch(function () { if (!done) { done = true; clearTimeout(timer); t.remove(); fallbackAnswer(text); } });
  }

  // Offline fallback: scripted KB match, else a friendly catch-all.
  function fallbackAnswer(text, errMsg) {
    if (convo.length && convo[convo.length - 1].role === "user") convo.pop(); // keep history clean
    var intent = matchIntent(text);
    if (intent) { addMsg("bot", intent.a); setChips(intent.chips || DEFAULT_CHIPS); if (intent.act === "work") flashWork(); return; }
    if (errMsg && /limit/i.test(errMsg)) { addMsg("bot", escapeHtml(errMsg)); setChips(DEFAULT_CHIPS); return; }
    addMsg("bot", FALLBACK); setChips(DEFAULT_CHIPS);
  }

  function handleUser(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("user", escapeHtml(text));
    el.quick.innerHTML = "";

    if (lead.active) { leadFlow(text); return; }

    var t = norm(text);
    if (hasAny(t, STRONG_START)) { beginLead(); return; }          // 1) explicit "let's start" → capture now
    if (hasAny(t, SOFT_LEAD)) { beginLead(); return; }             // 2) "I'm interested" → capture now
    askClaude(text);                                               // 3) everything else → Claude (scripted KB fallback on error)
  }

  function flashWork() {
    var work = document.getElementById("work");
    if (work) work.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  /* ---------- open / close ---------- */
  function open() {
    el.panel.hidden = false;
    el.root.classList.add("wren-open");
    el.launch.setAttribute("aria-expanded", "true");
    start();
    setTimeout(function () { el.input.focus(); }, reduce ? 0 : 220);
  }
  function close() {
    el.root.classList.remove("wren-open");
    el.launch.setAttribute("aria-expanded", "false");
    setTimeout(function () { el.panel.hidden = true; }, reduce ? 0 : 200);
    el.launch.focus();
  }
  function toggle() { el.root.classList.contains("wren-open") ? close() : open(); }

  el.launch.addEventListener("click", toggle);
  el.close.addEventListener("click", close);
  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = el.input.value;
    el.input.value = "";
    handleUser(v);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && el.root.classList.contains("wren-open")) close();
  });

  // let other parts of the page open the chat (e.g. the AI service card button)
  document.querySelectorAll("[data-open-chat]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });
  window.RavenChat = window.WrenChat = { open: open, close: close };
})();
