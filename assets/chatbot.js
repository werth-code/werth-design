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
    { id: "services", k: ["what do you", "what do u", "services", "offer", "build", "do you make", "what can you"],
      a: "I build three things: <strong>fast websites</strong> that get you found, <strong>AI tools</strong> that do the busywork (assistants like me, automations, lead-capture), and lasting <strong>archives</strong> for a life's work. Which sounds like you?",
      chips: ["How much?", "Do you do AI?", "See the work"] },
    { id: "pricing", k: ["how much", "price", "pricing", "cost", "rate", "charge", "budget", "afford", "expensive", "$"],
      a: "Plain numbers: <strong>Launch</strong> sites from $1,800 · <strong>Grow</strong> (a site that sells, with AI built in) from $4,500 · <strong>Bespoke/legacy</strong> from $2,500. Adding AI to an existing site starts at $1,500, and care plans run $75/mo. Every project gets a fixed quote first — no surprises.",
      chips: ["Start a project", "Do you do AI?", "How long does it take?"] },
    { id: "ai", k: ["ai", "a.i", "chatbot", "chat bot", "bot", "automation", "automate", "artificial"],
      a: "Real AI — not slideware. The most popular is an assistant like me on your site that answers customers and captures leads <strong>24/7</strong>. I also automate intake, scheduling, and follow-up, plus an honest audit of where AI actually pays off. (Matthew's shipped a 98.8%-accurate vision model and an automated transcription pipeline.)",
      chips: ["Is this a real AI?", "How much?", "Start a project"] },
    { id: "meta", k: ["are you real", "is this real", "real ai", "are you a bot", "are you human", "chatgpt", "how do you work", "scripted", "is this a real"],
      a: "Fair question — I'm a <strong>scripted demo</strong>, so everything runs right here on a static page and costs nothing. The real version Matthew builds connects to an AI model trained on <em>your</em> business, so it answers like your best employee and books real appointments. This is just a taste of the idea.",
      chips: ["What can the real one do?", "How much?", "Start a project"] },
    { id: "realone", k: ["real one", "real version", "what can the real", "trained on", "my business", "like your best"],
      a: "On a client site, an assistant like me can: answer FAQs in your voice, qualify and book appointments, capture after-hours leads, route the serious ones to you, and hand off to a human when needed. It plugs into your booking/calendar and emails you every lead.",
      chips: ["How much?", "Start a project"] },
    { id: "work", k: ["work", "portfolio", "examples", "example", "show me", "see your", "projects", "sites you", "samples"],
      a: "Six live ones are right above ↑ — a <strong>641-sermon archive</strong>, a biblical-scholarship library, an art print shop, a wine-guide sales funnel, a teacher-coaching membership, and a stock-tracker app. Tap any card to open the real site.",
      chips: ["See the work", "How much?", "Start a project"], act: "work" },
    { id: "legacy", k: ["legacy", "memorial", "archive", "sermon", "life's work", "lifes work", "preserve", "family history", "obituary", "tribute"],
      a: "That's my favorite work. I take a lifetime of material — sermons, writing, art, family history — and turn it into a searchable, beautiful site built to outlive the next platform. Pastor Jack Werth's 641 sermons are a good example.",
      chips: ["See the work", "Start a project"] },
    { id: "local", k: ["where", "location", "located", "near me", "local", "wilmington", "delaware", "philadelphia", "philly", "jersey", "area", "remote"],
      a: "Wilmington, Delaware. I meet in person around Wilmington, the Brandywine Valley, Philadelphia, and South Jersey — and work remotely with anyone, anywhere.",
      chips: ["Start a project", "What do you build?"] },
    { id: "timeline", k: ["how long", "timeline", "fast", "when", "turnaround", "quick", "deadline", "time"],
      a: "A Launch site is usually <strong>2–3 weeks</strong>; bigger sites with a shop, membership, or AI run <strong>4–8</strong>. I work fast and finish.",
      chips: ["How much?", "Start a project"] },
    { id: "hosting", k: ["host", "hosting", "domain", "server", "maintenance", "github", "cheap", "monthly", "ongoing"],
      a: "Cheaply — a lot of my sites run on free static hosting (<strong>$0/mo</strong>). Usually your only ongoing cost is a domain name, about $12–20 a year. Care plans are optional at $75/mo.",
      chips: ["What's a care plan?", "Start a project"] },
    { id: "care", k: ["care plan", "maintain", "support", "updates", "after launch", "who maintains"],
      a: "If you want me to — care plans are $75/mo (hosting, updates, backups, and a human who answers). Or I hand you the keys and a short guide. You own everything either way.",
      chips: ["Start a project", "How much?"] },
    { id: "who", k: ["matthew", "who are you", "who is", "about you", "experience", "qualified"],
      a: "Matthew Werth — a one-person studio in Wilmington who designs <em>and</em> builds, and sweats the QA most shops skip. He's built for a pastor, a scholar, an artist, a teacher-coaching company, and a wine writer.",
      chips: ["See the work", "Start a project"] }
  ];

  var GREETING = "Hi! I'm <strong>Raven</strong>, the studio's assistant. I can talk pricing, what Matthew builds, AI tools, or get your project to him. What can I help with?";
  var DEFAULT_CHIPS = ["What do you build?", "How much?", "Do you do AI?", "See the work", "Start a project"];
  var LEAD_TRIGGERS = ["start a project", "start", "quote", "book", "hire", "interested", "get started", "work with", "reach out", "contact", "email me", "call me", "sign me up", "let's go", "lets go", "i want", "i need", "yes please"];

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
    data.append("message", "[Wren chatbot lead] " + detail);
    data.append("source", "Website chatbot (Wren)");
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

  function matchIntent(text) {
    var t = text.toLowerCase();
    var best = null, bestScore = 0;
    KB.forEach(function (intent) {
      var score = 0;
      intent.k.forEach(function (kw) { if (t.indexOf(kw) !== -1) score += kw.length > 4 ? 2 : 1; });
      if (score > bestScore) { bestScore = score; best = intent; }
    });
    return bestScore > 0 ? best : null;
  }

  function wantsLead(text) {
    var t = text.toLowerCase();
    return LEAD_TRIGGERS.some(function (kw) { return t.indexOf(kw) !== -1; });
  }

  function handleUser(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg("user", escapeHtml(text));
    el.quick.innerHTML = "";

    if (lead.active) { leadFlow(text); return; }

    // lead intent takes priority (but not if it's clearly a pricing/info question)
    if (wantsLead(text) && !/(how much|price|cost|long|where|host)/i.test(text)) { beginLead(); return; }

    var intent = matchIntent(text);
    if (intent) {
      botSay(intent.a, intent.chips || DEFAULT_CHIPS, intent.act === "work" ? flashWork : null);
    } else {
      botSay("Good question — I'm a quick demo, so I might not have that one. I can talk <strong>pricing</strong>, <strong>what Matthew builds</strong>, <strong>AI tools</strong>, the <strong>portfolio</strong>, or get your project to him. What's most useful?", DEFAULT_CHIPS);
    }
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
