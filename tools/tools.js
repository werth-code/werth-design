/* Werth Design — shared logic for the live AI tool pages.
   Each page sets data-tool="..."; this POSTs { tool, input } to the Worker. */
(function () {
  "use strict";
  var WORKER = "https://werth-chatbot.werthdesign.workers.dev";

  var root = document.querySelector("[data-tool]");
  if (!root) return;
  var tool = root.getAttribute("data-tool");
  var ta = document.getElementById("toolInput");
  var btn = document.getElementById("toolRun");
  var out = document.getElementById("toolOut");
  var outBody = document.getElementById("toolOutBody");
  var ex = document.getElementById("toolExample");
  var LABEL = btn ? btn.textContent : "Run";

  function esc(s) {
    return (s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function render(s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }
  function show(html) { outBody.innerHTML = html; out.classList.add("show"); }

  if (ex) ex.addEventListener("click", function () { ta.value = ex.getAttribute("data-fill") || ""; ta.focus(); });

  function run() {
    var input = (ta.value || "").trim();
    if (!input) { ta.focus(); return; }
    btn.disabled = true; btn.textContent = "Thinking…";
    out.classList.remove("show");
    fetch(WORKER, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool: tool, input: input })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        btn.disabled = false; btn.textContent = LABEL;
        if (res.ok && res.d && res.d.reply) show(render(res.d.reply));
        else show("<em>" + esc((res.d && res.d.error) || "Something went wrong — please try again.") + "</em>");
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = LABEL;
        show("<em>Network hiccup — please try again.</em>");
      });
  }

  if (btn) btn.addEventListener("click", run);
  if (ta) ta.addEventListener("keydown", function (e) { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); });

  // ---- Lead capture → Formspree ----
  var leadForm = document.getElementById("leadForm");
  if (leadForm) {
    var leadBtn = leadForm.querySelector("button");
    var leadLabel = leadBtn ? leadBtn.textContent : "Send";
    leadForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("leadEmail");
      var email = (input.value || "").trim();
      if (!email) { input.focus(); return; }
      leadBtn.disabled = true; leadBtn.textContent = "Sending…";
      fetch("https://formspree.io/f/xeebokgb", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, _subject: "Tool-page lead: " + tool, tool: tool, message: "Lead captured from the " + tool + " tool page." })
      }).then(function (r) {
        if (r.ok) {
          leadForm.querySelector(".lead-q").style.display = "none";
          leadForm.querySelector(".lead-row").style.display = "none";
          document.getElementById("leadOk").hidden = false;
        } else { leadBtn.disabled = false; leadBtn.textContent = leadLabel; }
      }).catch(function () { leadBtn.disabled = false; leadBtn.textContent = leadLabel; });
    });
  }
})();
