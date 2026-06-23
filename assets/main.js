/* Werth Design — interactions
   Vanilla JS, no dependencies. Progressive enhancement only:
   nothing here is required for the site to read or convert. */
(function () {
  "use strict";

  /* ---- current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      mobileNav.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        mobileNav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- animated count-up for proof numbers ---- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll(".proof-num[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---- contact form: Formspree if configured, else mailto fallback ---- */
  var form = document.querySelector(".contact-form");
  if (form) {
    var note = form.querySelector(".form-note");
    var configured = form.getAttribute("action").indexOf("REPLACE_WITH_YOUR_ID") === -1;

    form.addEventListener("submit", function (ev) {
      // basic required-field check
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");
      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        return; // let native validation handle it
      }

      if (!configured) {
        // Fallback: no Formspree endpoint yet — compose an email instead.
        ev.preventDefault();
        var type = form.querySelector("#type").value;
        var budget = form.querySelector("#budget").value;
        var subject = "Project inquiry — " + type;
        var body =
          "Name: " + name.value + "\n" +
          "Email: " + email.value + "\n" +
          "Project: " + type + "\n" +
          "Budget: " + budget + "\n\n" +
          message.value;
        window.location.href =
          "mailto:matthewwerth@gmail.com?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        if (note) { note.textContent = "Opening your email app…"; note.className = "form-note ok"; }
        return;
      }

      // Configured: submit to Formspree via fetch for a no-reload experience.
      ev.preventDefault();
      var btn = form.querySelector(".form-submit");
      var original = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          if (note) { note.textContent = "Thank you — I'll be in touch within a day."; note.className = "form-note ok"; }
        } else {
          if (note) { note.textContent = "Something went wrong. Email matthewwerth@gmail.com instead."; note.className = "form-note err"; }
        }
      }).catch(function () {
        if (note) { note.textContent = "Network error. Email matthewwerth@gmail.com instead."; note.className = "form-note err"; }
      }).finally(function () {
        btn.textContent = original;
        btn.disabled = false;
      });
    });
  }
})();
