/* UniEasy live connector: loads everything from the backend and wires the forms. */
(function () {
  var API = (window.UNIEASY_API || "").replace(/\/$/, "");
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var safeUrl = function (u) { u = String(u || "").trim(); return /^(https?:\/\/|\/|images\/)/i.test(u) ? u : "#"; };
  var asset = function (u) { u = String(u || ""); return u.indexOf("/media/") === 0 ? API + u : u; };
  var fmt = function (iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ""); return m ? (+m[3]) + " " + MON[+m[2] - 1] + " " + m[1] : ""; };
  var todayIso = function () { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };
  var D, S, names = {}, closes = {}, opens = {}, fee = 5;
  var money = function (n) { return "R" + (Math.round(n * 100) / 100); };

  function pick(code, field) {
    var t = todayIso(), r = D.deadlines.filter(function (x) { return x.code === code && x[field]; }).map(function (x) { return x[field]; }).sort();
    if (!r.length) return null;
    var up = r.filter(function (x) { return x >= t; });
    return up.length ? up[0] : r[r.length - 1];
  }

  /* ---------- settings ---------- */
  function applySettings() {
    var put = function (sel, k) { var el = $(sel); if (el && S[k] && S[k].trim()) el.textContent = S[k].trim(); };
    put(".hero-subtitle", "hero_subtitle"); put(".hero-description", "hero_description"); put(".footer-brand p", "footer_tagline");
    var em = $('.contact-information a[href^="mailto:"]');
    if (em && S.contact_email && S.contact_email.trim()) { em.href = "mailto:" + S.contact_email.trim(); em.textContent = S.contact_email.trim(); }
    var ph = $('.contact-information a[href^="tel:"]');
    if (ph && S.contact_phone && S.contact_phone.trim()) {
      var dg = S.contact_phone.replace(/[^\d+]/g, ""); ph.href = "tel:" + (dg.charAt(0) === "0" ? "+27" + dg.slice(1) : dg); ph.textContent = S.contact_phone.trim();
    }
    var map = {"Beneficiary:": "bank_beneficiary", "Account Name:": "bank_account_name", "Account Number:": "bank_account_number"};
    $$(".bank-details-box p").forEach(function (p) {
      var st = p.querySelector("strong"), k = st && map[st.textContent.trim()];
      if (k && S[k] && S[k].trim()) { if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = " " + S[k].trim(); else p.appendChild(document.createTextNode(" " + S[k].trim())); }
    });
    if (S.announcement && S.announcement.trim()) {
      var b = document.createElement("div"); b.setAttribute("role", "status");
      b.style.cssText = "background:#FFD400;color:#1c1917;padding:10px 16px;text-align:center;font-weight:600;position:relative;z-index:1000";
      b.textContent = S.announcement.trim(); document.body.insertBefore(b, document.body.firstChild);
    }
    var f = parseFloat(S.fee_per_university); fee = f > 0 ? f : 5;
    var row = $$(".payment-summary-row").filter(function (r) { return /Fee per university/.test(r.textContent); })[0];
    if (row) row.querySelector("strong").textContent = money(fee);
    var help = $$(".form-help-text").filter(function (p) { return /costs R\d/.test(p.textContent); })[0];
    if (help) help.textContent = help.textContent.replace(/R\d+(?:\.\d+)?/, money(fee));
    var box = $(".application-price-box");
    if (box && box.children[1]) box.children[1].innerHTML =
      "<h3>UniEasy Apply For Me Service</h3><p>Our service costs <strong>" + money(fee) + " per university application</strong>.</p>" +
      "<p>For example, if you choose 2 universities, the service fee will be " + money(fee * 2) + ". If you choose 3 universities, the service fee will be " + money(fee * 3) + ".</p>" +
      "<p>The " + money(fee) + " fee is charged <strong>per university</strong>, not per form.</p>";
  }
  function updateSummary() {
    var v = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; };
    var n = (v("universityChoice1") ? 1 : 0) + (v("universityChoice2") ? 1 : 0) +
      v("additionalUniversities").split(/[\n,;]+/).filter(function (x) { return x.trim(); }).length;
    var c = document.getElementById("selectedUniversityCount"), t = document.getElementById("selectedUniversityTotal");
    if (c) c.textContent = n; if (t) t.textContent = money(n * fee);
  }

  /* ---------- universities ---------- */
  function cardHtml(u) {
    var open = u.apply_status === "Open", od = u.auto ? fmt(u.open_date) : fmt(pick(u.code, "opens")), cd = u.auto ? fmt(u.close_date) : "";
    var img = encodeURI(asset(u.image || "")).replace(/'/g, "%27");
    var vid = u.video ? "<video class='ue-vid ue-auto' muted loop playsinline preload='metadata' src='" + esc(mediaUrl(u.video)) + "'></video><div class='ue-vid-ov'></div>" : "";
    return '<article class="university-card" data-name="' + esc(u.name + " " + u.code) + '" data-province="' + esc(u.province) + '" data-type="' + esc(u.type) +
      '" style="--university-image: url(\'' + esc(img) + '\');">' + vid + '<div class="university-card-content"><span class="university-code">' + esc(u.code) +
      "</span><h3>" + esc(u.name) + "</h3><p>" + esc(u.province) + '</p><div class="university-buttons">' +
      '<a href="' + esc(safeUrl(u.website)) + '" target="_blank" rel="noopener noreferrer" class="university-button">Official Website</a>' +
      '<a href="' + esc(safeUrl(u.apply_url)) + '" target="_blank" rel="noopener noreferrer" class="university-button apply">' + (open ? "Open: Apply now here" : "Applications Closed") + "</a>" +
      (open ? (cd ? '<a class="university-button">CLOSES: ' + esc(cd) + "</a>" : "") : '<a class="university-button">OPEN DATE: ' + esc(od || "Not Confirmed Yet") + "</a>") + "</div></div></article>";
  }
  function renderUnis() {
    var q = ($("#universitySearch") ? $("#universitySearch").value : "").trim().toLowerCase();
    var pv = $("#provinceFilter") ? $("#provinceFilter").value : "all", ty = $("#typeFilter") ? $("#typeFilter").value : "all";
    var list = D.universities.filter(function (u) {
      return (u.name + " " + u.code).toLowerCase().indexOf(q) > -1 && (pv === "all" || u.province === pv) && (ty === "all" || u.type === ty);
    });
    var g = $("#universityGrid"); if (g) { $$("#universityGrid video").forEach(function (v) { if (vio) vio.unobserve(v); }); g.innerHTML = list.map(cardHtml).join(""); watchVideos(g); }
    var cards = $$(".university-card");
    cards.forEach(function (c) {
      c.addEventListener("mouseenter", function () { cards.forEach(function (o) { if (o !== c) o.style.opacity = "0.72"; }); });
      c.addEventListener("mouseleave", function () { cards.forEach(function (o) { o.style.opacity = "1"; }); });
    });
    var rc = $("#resultCount"); if (rc) rc.textContent = list.length;
    var nr = $("#noResults"); if (nr) nr.hidden = list.length > 0;
  }
  function fillSelects() {
    ["deadlineUniversitySelect", "universityChoice1", "universityChoice2"].forEach(function (id) {
      var s = document.getElementById(id); if (!s) return; var cur = s.value, first = s.options[0] ? s.options[0].outerHTML : "";
      s.innerHTML = first + D.universities.map(function (u) { return '<option value="' + esc(u.code) + '">' + esc(u.name) + "</option>"; }).join("");
      s.value = cur;
    });
  }

  /* ---------- deadlines (same wording as the original) ---------- */
  function showDeadline() {
    var sel = $("#deadlineUniversitySelect"), out = $("#deadlineCountdownResult"); if (!sel || !out) return;
    var code = sel.value; if (!code) { out.textContent = "Select a university to view its confirmed deadline."; return; }
    var dl = closes[code], nm = esc(names[code] || code);
    if (!dl) { out.innerHTML = "<strong>" + nm + "</strong><br>Deadline not confirmed yet. UniEasy will show the countdown once a confirmed official date is entered."; return; }
    var days = Math.ceil((new Date(dl + "T23:59:59") - new Date()) / 86400000);
    if (days < 0) out.innerHTML = "<strong>" + nm + "</strong><br><span class='deadline-days'>Applications have closed.</span>";
    else if (days === 0) out.innerHTML = "<strong>" + nm + "</strong><br><span class='deadline-days'>Deadline is today.</span>";
    else out.innerHTML = "<strong>" + nm + "</strong><br><span class='deadline-days'>" + days + " days remaining</span><br>Deadline: " + fmt(dl);
  }
  function renderCalendar() {
    var c = $("#applicationsCalendar"); if (!c) return;
    var e = Object.keys(closes).filter(function (k) { return closes[k]; });
    c.innerHTML = e.length ? e.map(function (k) { return "<div class='calendar-day has-date'>" + esc(k) + "<small>" + fmt(closes[k]) + "</small></div>"; }).join("")
      : "<div class='calendar-item' style='grid-column:1/-1;'>No confirmed deadline dates have been added yet. This calendar is ready for official dates to be added.</div>";
  }
  function renderClosing() {
    var l = $("#closingSoonList"); if (!l) return; var now = new Date();
    var up = Object.keys(closes).filter(function (k) { return closes[k]; }).map(function (k) {
      var d = new Date(closes[k] + "T23:59:59"); return {code: k, date: closes[k], days: Math.ceil((d - now) / 86400000)};
    }).filter(function (x) { return x.days >= 0 && x.days <= 45; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    l.innerHTML = up.length ? up.map(function (x) {
      return "<div class='deadline-item'><strong>" + esc(names[x.code] || x.code) + "</strong><div class='deadline-days'>" + x.days + " days left</div><small>Deadline: " + fmt(x.date) + "</small></div>";
    }).join("") : "No confirmed university deadlines are currently listed within the next 45 days.";
  }

  /* ---------- courses / news / faqs ---------- */
  function searchCourses() {
    var i = $("#courseFinderInput"), out = $("#courseFinderResults"); if (!i || !out) return;
    var q = i.value.trim().toLowerCase(); if (!q) { out.textContent = "Type a course name to search."; return; }
    var r = D.courses.filter(function (c) { return c.name.toLowerCase().indexOf(q) > -1 || (names[c.code] || c.code).toLowerCase().indexOf(q) > -1; });
    out.innerHTML = r.length ? r.map(function (c) {
      var extra = [c.level, c.duration].filter(Boolean).join(" · ");
      return "<div class='course-result'><strong>" + esc(c.name) + "</strong><br>" + esc(names[c.code] || c.code) +
        (extra ? "<br><small>" + esc(extra) + "</small>" : "") + (c.requirements ? "<br><small>" + esc(c.requirements) + "</small>" : "") + "</div>";
    }).join("") : "No course matches found in the course directory.";
  }
  function renderNewsFaq() {
    var art = cardByTitle(/Student News/i);
    var panel = art && art.querySelector(".student-tool-panel");
    if (panel) panel.innerHTML = hubNewsHtml();
    var fq = $(".faq-container");
    if (fq && D.faqs.length) fq.innerHTML = D.faqs.map(function (f) { return '<details class="faq-item"><summary>' + esc(f.question) + "</summary><p>" + esc(f.answer) + "</p></details>"; }).join("");
  }

  /* ---------- forms ---------- */
  function submitApply(f) {
    var msg = $("#applicationFormMessage"), btn = f.querySelector('button[type="submit"]');
    var say = function (t, ok) { if (msg) { msg.className = "form-message " + (ok ? "success" : "error"); msg.textContent = t; } };
    var inputs = f.querySelectorAll("input[type=file]");
    for (var i = 0; i < inputs.length; i++) for (var j = 0; j < inputs[i].files.length; j++)
      if (inputs[i].files[j].size > 5 * 1024 * 1024) { say(inputs[i].files[j].name + " is larger than 5 MB.", false); return; }
    btn.disabled = true; say("Submitting, please wait...", true);
    fetch(API + "/api/public/apply-for-me", {method: "POST", body: new FormData(f)}).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { say(j.error || "Could not submit. Please check your details and try again.", false); btn.disabled = false; return; }
        var ok = document.getElementById("applicationSuccessMessage"); if (!ok) return;
        ok.hidden = false; f.style.display = "none";
        $$(".application-notice,.application-price-box,.close-application-container").forEach(function (x) { x.style.display = "none"; });
        ueTrack("form_submit", "apply_for_me");
        var ref = ok.querySelector(".ue-ref");
        if (!ref) { ref = document.createElement("p"); ref.className = "ue-ref"; var p = ok.querySelector("p"); p.parentNode.insertBefore(ref, p.nextSibling); }
        ref.innerHTML = "<strong>Your reference:</strong> " + esc(j.reference) + "<br><small>Keep this reference. Use it with your email under \u201cTrack Application\u201d to check your status.</small>" + (j.email_queued ? "<br><small>A confirmation email is on its way to " + esc(f.elements.email ? f.elements.email.value : "") + ".</small>" : ""); window.scrollTo({top: 0, behavior: "smooth"});
      });
    }).catch(function () { say("Connection problem. Sending through our backup route...", true); f.submit(); });
  }
  function submitContact(f) {
    var m = f.querySelector(".ue-contact-msg"), btn = f.querySelector('button[type="submit"]');
    if (!m) { m = document.createElement("p"); m.className = "ue-contact-msg"; m.setAttribute("role", "status"); btn.parentNode.insertBefore(m, btn.nextSibling); }
    var say = function (t, ok) { m.textContent = t; m.style.color = ok ? "#1e9e5a" : "#d23b3b"; };
    btn.disabled = true; say("Sending...", true);
    fetch(API + "/api/public/contact", {method: "POST", body: new FormData(f)}).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok) { say("Thank you! Your message has been sent. We will get back to you soon.", true); f.reset(); ueTrack("form_submit", "contact"); } else say(j.error || "Could not send your message.", false);
        btn.disabled = false;
      });
    }).catch(function () { say("Connection problem. Please email us directly.", false); btn.disabled = false; });
  }

  function wire() {
    var blocked = {universitySearch: 1, provinceFilter: 1, typeFilter: 1, deadlineUniversitySelect: 1, courseFinderInput: 1};
    ["input", "change", "keyup", "search"].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        var id = e.target && e.target.id; if (!blocked[id]) return; e.stopPropagation();
        if (ev === "keyup") return;
        if (id === "deadlineUniversitySelect") showDeadline(); else if (id === "courseFinderInput") searchCourses(); else renderUnis();
      }, true);
      document.addEventListener(ev, function (e) {
        if (/^(universityChoice1|universityChoice2|additionalUniversities)$/.test(e.target && e.target.id)) updateSummary();
      }, false);
    });
    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (f.id === "applyForMeForm") { e.preventDefault(); e.stopPropagation(); submitApply(f); }
      else if (f.id === "contactForm") { e.preventDefault(); e.stopPropagation(); submitContact(f); }
    }, true);
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t) return;
      if (t.closest("#openApplyForMe") && S.apply_for_me_enabled === "0") {
        e.preventDefault(); e.stopPropagation(); alert(S.apply_for_me_closed_message || "Apply For Me is temporarily unavailable."); return;
      }
      if (t.closest("#openApplyByMyself")) setTimeout(function () { renderCalendar(); renderClosing(); }, 0);
      if (t.closest("#openApplyForMe")) setTimeout(updateSummary, 0);
      if (t.closest("#successBackToSiteButton")) {
        var f = document.getElementById("applyForMeForm"), ok = document.getElementById("applicationSuccessMessage");
        if (ok) ok.hidden = true; if (f) { f.style.display = ""; f.reset(); var b = f.querySelector('button[type="submit"]'); if (b) b.disabled = false; }
        var m = $("#applicationFormMessage"); if (m) { m.textContent = ""; m.className = "form-message"; }
        $$(".application-notice,.application-price-box,.close-application-container").forEach(function (x) { x.style.display = ""; });
        updateSummary(); var cl = document.getElementById("closeApplyForMe"); if (cl) cl.click();
      }
    }, true);
  }

  var linkify = function (t) { return esc(t).replace(/https?:\/\/(?:[^\s<&]|&amp;)*(?:[^\s<&.,;:!?)]|&amp;)/g, function (u) { return "<a href='" + u + "' target='_blank' rel='noopener noreferrer' style='color:#c8102e;text-decoration:underline'>" + u + "</a>"; }); };

  /* ---------- Dedicated "inside" pages (same idea as Apply By Myself) ---------- */
  var VIEWS = {}, curView = null, calY = null, calM = 0, lastTrack = null, heroTimer = null;
  var MONL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var sget = function (k, d) { return S && S[k] && S[k].trim() ? esc(S[k].trim()) : d; };
  var colsOf = function (v, d) { var n = parseInt(v, 10); return n >= 1 && n <= 3 ? n : d; };

  var headTimer = null, vio = null, fontsLoaded = {};
  var FONTS = {"Arial": "Arial, Helvetica, sans-serif", "Verdana": "Verdana, Geneva, sans-serif", "Trebuchet": "'Trebuchet MS', Helvetica, sans-serif",
    "Georgia": "Georgia, 'Times New Roman', serif", "Times New Roman": "'Times New Roman', Times, serif", "Courier": "'Courier New', Courier, monospace",
    "Poppins": "'Poppins', Arial, sans-serif", "Montserrat": "'Montserrat', Arial, sans-serif", "Roboto": "'Roboto', Arial, sans-serif",
    "Oswald": "'Oswald', 'Arial Narrow', sans-serif", "Playfair Display": "'Playfair Display', Georgia, serif", "Lobster": "'Lobster', cursive", "Pacifico": "'Pacifico', cursive"};
  var GFONT = {"Poppins": "Poppins:wght@400;700", "Montserrat": "Montserrat:wght@400;700", "Roboto": "Roboto:wght@400;700", "Oswald": "Oswald:wght@400;700",
    "Playfair Display": "Playfair+Display:wght@400;700", "Lobster": "Lobster", "Pacifico": "Pacifico"};
  var SIZES = {"Small": ".9rem", "Normal": "1rem", "Large": "1.35rem", "Extra large": "1.8rem"};
  var okColor = function (v) { v = String(v || "").trim(); return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : ""; };
  var mediaUrl = function (v) { return encodeURI(asset(v)).replace(/'/g, "%27"); };
  var num = function (v, d, lo, hi) { var x = parseFloat(v); if (isNaN(x)) x = d; return Math.min(hi, Math.max(lo, x)); };
  function useFont(name) {
    if (typeof document === "undefined" || !GFONT[name] || fontsLoaded[name]) return; fontsLoaded[name] = 1;
    var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=" + GFONT[name] + "&display=swap"; document.head.appendChild(l);
  }
  function fontCss(name) { var f = FONTS[name]; if (!f) return ""; useFont(name); return f; }
  function postStyle(n, compact) {
    var bg = okColor(n.bg_color), tc = okColor(n.text_color), ff = fontCss(n.font), s = "";
    if (bg) s += "background:" + bg + ";"; if (tc) s += "color:" + tc + ";"; if (ff) s += "font-family:" + ff + ";";
    if (compact && bg) s += "padding:12px;border-radius:12px;"; return s;
  }
  function watchVideos(root) {   /* autoplay (muted) only while visible */
    var vs = Array.prototype.slice.call(root.querySelectorAll("video.ue-auto")); if (!vs.length) return;
    var go = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    vs.forEach(function (v) { v.muted = true; v.defaultMuted = true; });
    if (!("IntersectionObserver" in window)) { vs.forEach(go); return; }
    if (!vio) vio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) go(e.target); else e.target.pause(); }); }, {threshold: 0.25});
    vs.forEach(function (v) { vio.observe(v); });
  }
  function headSlideHtml(x) {   /* top bar slide: the whole picture/video is shown (no cropping) unless "Fill" or "Stretch" is chosen */
    var fit = x.fit === "Fill (may crop)" ? "cover" : x.fit === "Stretch" ? "stretch" : "", cls = "ue-head-fit" + (fit ? " " + fit : "");
    var blur = !fit && x.image ? '<div class="ue-head-blur" style="background-image:url(\'' + esc(mediaUrl(x.image)) + '\')"></div>' : "";
    var media = x.video ? '<video class="' + cls + '" muted loop playsinline preload="auto" src="' + esc(mediaUrl(x.video)) + '"' + (x.image ? ' poster="' + esc(mediaUrl(x.image)) + '"' : "") + "></video>"
      : '<img class="' + cls + '" src="' + esc(mediaUrl(x.image)) + '" alt="">';
    return '<div class="ue-head-slide">' + blur + media + "</div>";
  }
  function buildSlideshow(host, slides, sec, ov, p) {
    var bg = document.createElement("div"); bg.className = p + "-bg"; bg.setAttribute("aria-hidden", "true");
    bg.style.setProperty("--ue-sec", sec + "s"); bg.style.setProperty("--ue-ov", ov);
    bg.innerHTML = slides.map(function (x) {
      if (p === "ue-head") return headSlideHtml(x);
      return x.video ? '<video class="' + p + '-slide" muted loop playsinline preload="auto" src="' + esc(mediaUrl(x.video)) + '"' + (x.image ? ' poster="' + esc(mediaUrl(x.image)) + '"' : "") + "></video>"
        : '<div class="' + p + '-slide" style="background-image:url(\'' + esc(mediaUrl(x.image)) + '\')"></div>';
    }).join("") + '<div class="' + p + '-ov"></div>';
    host.insertBefore(bg, host.firstChild);
    var els = bg.querySelectorAll("." + p + "-slide"), i = 0, vid = function (el) { return el.tagName === "VIDEO" ? el : el.querySelector("video"); };
    Array.prototype.forEach.call(els, function (el) { var v = vid(el); if (v) { v.muted = true; v.defaultMuted = true; } });
    var on = function (el) { el.classList.add("on"); var v = vid(el); if (v) { try { v.currentTime = 0; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} } };
    var off = function (el) { el.classList.remove("on"); var v = vid(el); if (v) { try { v.pause(); } catch (e) {} } };
    on(els[0]);
    return els.length > 1 ? setInterval(function () { off(els[i]); i = (i + 1) % els.length; on(els[i]); }, sec * 1000) : null;
  }
  function applyHeader() {   /* top bar (logo, menu, dark/light button) background: images and/or video */
    var hd = $(".site-header"); if (!hd) return;
    if (headTimer) { clearInterval(headTimer); headTimer = null; }
    var old = hd.querySelector(".ue-head-bg"); if (old) old.parentNode.removeChild(old);
    hd.classList.remove("ue-header-custom");
    var slides = (D.header_slides || []).filter(function (x) { return x.image || x.video; });
    if (S.header_bg_enabled === "0" || !slides.length) return;
    headTimer = buildSlideshow(hd, slides, num(S.header_bg_seconds, 6, 2, 30), num(S.header_bg_overlay, 40, 0, 85) / 100, "ue-head"); hd.classList.add("ue-header-custom");
  }
  function hubBlockHtml(b) {
    var col = okColor(b.text_color), ff = fontCss(b.font), sz = SIZES[b.font_size] || "1rem";
    var media = b.video ? "<video class='ue-auto' muted loop playsinline preload='metadata' src='" + esc(mediaUrl(b.video)) + "'" + (b.image ? " poster='" + esc(mediaUrl(b.image)) + "'" : "") + " style='width:100%;border-radius:12px;display:block;margin-bottom:10px;background:#000'></video>"
      : b.image ? "<img src='" + esc(mediaUrl(b.image)) + "' alt='' loading='lazy' style='width:100%;border-radius:12px;display:block;margin-bottom:10px'>" : "";
    var text = b.content ? "<div style='white-space:pre-line;line-height:1.55;font-size:" + sz + (ff ? ";font-family:" + ff : "") + (col ? ";color:" + col : "") + "'>" + (col ? linkify(b.content).replace(/color:#c8102e;/g, "color:inherit;") : linkify(b.content)) + "</div>" : "";
    return media + text;
  }
  function hubBlocks() {   /* images / video / text shown on the OUTSIDE of the Calendar and Course Finder cards */
    [[/Applications Calendar/i, "Applications Calendar"], [/Course Finder/i, "Course Finder"]].forEach(function (p) {
      var card = cardByTitle(p[0]); if (!card || card.querySelector(".ue-hubblock")) return;
      var items = (D.hub_cards || []).filter(function (b) { return b.target === p[1] && (b.content || b.image || b.video); });
      if (!items.length) return;
      var box = document.createElement("div"); box.className = "ue-hubblock";
      box.innerHTML = items.map(function (b) { return "<div style='margin-bottom:12px'>" + hubBlockHtml(b) + "</div>"; }).join("");
      card.insertBefore(box, card.querySelector(".ue-btn-wrap") || null); watchVideos(box);
    });
  }
  function fixThemeIcon() {   /* dark/light button: Font Awesome icons instead of emoji */
    var b = document.getElementById("darkModeButton"); if (!b) return;
    var want = document.body.classList.contains("dark-mode") ? "fa-sun" : "fa-moon", cur = b.querySelector("i.fa-solid");
    if (cur && cur.classList.contains(want) && b.children.length === 1 && !b.textContent.trim()) return;
    b.innerHTML = '<i class="fa-solid ' + want + '" aria-hidden="true"></i>';
  }
  function initThemeIcon() {
    var b = document.getElementById("darkModeButton"); if (!b) return;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixThemeIcon); else fixThemeIcon();
    if ("MutationObserver" in window) {
      var mo = new MutationObserver(function () { fixThemeIcon(); });
      mo.observe(b, {childList: true, characterData: true, subtree: true}); mo.observe(document.body, {attributes: true, attributeFilter: ["class"]});
    }
  }

  var LIVE_VERSION = "2026-11-03 build 11", histMode = "", navigating = false;
  window.UNIEASY_LIVE_VERSION = LIVE_VERSION; if (window.console && console.info) console.info("UniEasy live connector " + LIVE_VERSION);

  /* ---------- phone / browser Back button works for every inside page ---------- */
  function modeNow() {
    var b = document.body.classList;
    if (b.contains("ue-view-mode")) return "view:" + curView;
    if (b.contains("apply-by-myself-mode")) return "apply-by-myself";
    if (b.contains("apply-for-me-mode")) return "apply-for-me";
    return "";
  }
  function syncHistory() {   /* called whenever a page opens or closes: keeps the browser history in step */
    if (navigating) return;
    var m = modeNow(); if (m === histMode) return;
    histMode = m;
    if (m) { history.pushState({ue: m}, ""); ueTrack("view", m.replace("view:", "")); }
    else if (history.state && history.state.ue) history.back();
  }
  function resetApplyForm() {   /* leaving Apply For Me after a successful submit: next visit starts with a clean form */
    var f = document.getElementById("applyForMeForm"), ok = document.getElementById("applicationSuccessMessage");
    if (ok) ok.hidden = true;
    if (f) { f.hidden = false; f.style.display = ""; f.reset(); var b = f.querySelector('button[type="submit"]'); if (b) b.disabled = false; }
    var m = $("#applicationFormMessage"); if (m) { m.textContent = ""; m.className = "form-message"; }
    $$(".application-notice,.application-price-box,.close-application-container").forEach(function (x) { x.style.display = ""; });
    updateSummary();
  }
  function applyMode(m) {   /* show the page that belongs to a history entry (no new entry is added) */
    var b = document.body.classList, sec = document.getElementById("applyForMeSection");
    b.remove("ue-view-mode", "apply-by-myself-mode", "apply-for-me-mode");
    $$(".ue-view").forEach(function (v) { v.classList.remove("ue-open"); });
    if (sec) sec.hidden = true; curView = null;
    if (m.indexOf("view:") === 0) {
      var name = m.slice(5), v = document.getElementById("ue-view-" + name);
      if (v) { v.classList.add("ue-open"); b.add("ue-view-mode"); curView = name; if (VIEWS[name]) VIEWS[name](); }
    } else if (m === "apply-by-myself") { b.add("apply-by-myself-mode"); renderCalendar(); renderClosing(); }
    else if (m === "apply-for-me") { if (sec) sec.hidden = false; b.add("apply-for-me-mode"); updateSummary(); }
  }
  function initHistory() {
    if (!window.history || !history.pushState) return;
    try { history.scrollRestoration = "manual"; history.replaceState(null, ""); } catch (e) {}
    window.addEventListener("popstate", function (e) {
      var m = e.state && e.state.ue ? e.state.ue : "", prev = histMode;
      navigating = true;
      if (!m) { var ok = document.getElementById("applicationSuccessMessage"); if (ok && !ok.hidden) resetApplyForm(); }
      applyMode(m); histMode = m; navigating = false;
      if (m) window.scrollTo(0, 0);
      else if (prev) { var hub = /^view:(news|calendar|courses|nsfas)$/.test(prev) ? document.getElementById("studentToolsSection") : null; if (hub) hub.scrollIntoView(); else window.scrollTo(0, 0); }
    });
    if ("MutationObserver" in window) new MutationObserver(syncHistory).observe(document.body, {attributes: true, attributeFilter: ["class"]});
  }

  var uaOn = false, uaSid = "", uaVid = "", uaDev = "";
  var CARD_RX = {"Deadline Countdown": /Deadline Countdown/i, "Applications Calendar": /Applications Calendar/i, "Course Finder": /Course Finder/i, "NSFAS Hub": /NSFAS Hub/i, "Closing Soon": /Closing Soon/i, "Student News": /Student News/i};
  var SIZE_PX = {"Small": "260px", "Medium": "340px", "Large": "460px", "Extra large": "600px"};
  var SEC_SEL = {"Student Hub": "#studentToolsSection", "About UniEasy": "#about", "Questions (FAQ)": "#faq", "Get In Touch": "#contact", "Apply For Me page": "#applyForMeSection", "Apply By Myself page": "#universities"};

  /* ---------- editable cards (Apply By Myself, Apply For Me and the six Student Hub cards) ---------- */
  function tagCards() {   /* remember each hub card's ORIGINAL title so it can still be found after the title is edited */
    $$(".student-tool-card").forEach(function (a) { var h = a.querySelector("h3"); if (h && !a.getAttribute("data-ue-title")) a.setAttribute("data-ue-title", h.textContent.trim()); });
  }
  function cardEl(name) {
    if (name === "Apply By Myself" || name === "Apply For Me") { var b = document.getElementById(name === "Apply For Me" ? "openApplyForMe" : "openApplyByMyself"); return b ? b.closest(".apply-choice") : null; }
    return CARD_RX[name] ? cardByTitle(CARD_RX[name]) : null;
  }
  function cardPlan(c) {   /* a dashboard row -> what to do on the page */
    var n = parseInt(c.display_order, 10);
    return {off: c.visible === "0", title: (c.title || "").trim(), desc: (c.description || "").trim(), btn: (c.button_text || "").trim(), image: c.image || "", video: c.video || "",
      overlay: num(c.overlay, 45, 0, 85) / 100, color: okColor(c.text_color), height: SIZE_PX[c.height] || "", width: c.width === "Wide" || c.width === "Full width" ? c.width : "", order: isNaN(n) ? "" : String(n)};
  }
  function applyCards() {
    (D.cards || []).forEach(function (c) {
      var el = cardEl(c.card); if (!el) return;
      var p = cardPlan(c), hub = el.classList.contains("student-tool-card");
      el.classList.toggle("ue-card-off", p.off); if (p.off) return;
      var h = el.querySelector(hub ? "h3" : "h2"), d = Array.prototype.filter.call(el.children, function (x) { return x.tagName === "P"; })[0], b = hub ? el.querySelector(".ue-open-btn") : el.querySelector(".apply-btn");
      if (h && p.title) h.textContent = p.title; if (d && p.desc) d.textContent = p.desc; if (b && p.btn) b.textContent = p.btn;
      Array.prototype.slice.call(el.children).forEach(function (x) { if (x.classList.contains("ue-cardmedia") || x.classList.contains("ue-cardov")) el.removeChild(x); });
      el.classList.remove("ue-card-media", "ue-card-ctext");
      if (p.video || p.image) {
        var m = document.createElement(p.video ? "video" : "div"), ov = document.createElement("div"); m.className = "ue-cardmedia" + (p.video ? " ue-auto" : ""); ov.className = "ue-cardov"; ov.style.setProperty("--ue-cov", p.overlay);
        if (p.video) { m.muted = true; m.loop = true; m.setAttribute("playsinline", ""); m.preload = "metadata"; m.src = mediaUrl(p.video); if (p.image) m.poster = mediaUrl(p.image); } else m.style.backgroundImage = "url('" + mediaUrl(p.image) + "')";
        el.insertBefore(ov, el.firstChild); el.insertBefore(m, el.firstChild); el.classList.add("ue-card-media"); watchVideos(el);
      }
      if (p.color) { el.style.setProperty("--ue-ctext", p.color); el.classList.add("ue-card-ctext"); } else el.style.removeProperty("--ue-ctext");
      el.style.minHeight = p.height; el.style.order = p.order;
      if (p.width) el.setAttribute("data-ue-w", p.width); else el.removeAttribute("data-ue-w");
    });
  }

  /* ---------- section backgrounds: Default / Glassy / Image or Video ---------- */
  function hexRgb(h) { h = okColor(h); if (!h) return ""; if (h.length === 4) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return parseInt(h.slice(1, 3), 16) + "," + parseInt(h.slice(3, 5), 16) + "," + parseInt(h.slice(5, 7), 16); }
  function secPlan(r) {
    var mode = r.mode === "Glassy" ? "glass" : (r.mode === "Image / Video" && (r.image || r.video)) ? "media" : "default";
    return {mode: mode, tint: hexRgb(r.tint) || "200,16,46", blur: num(r.blur, 14, 0, 40), overlay: num(r.overlay, 45, 0, 85) / 100, image: r.image || "", video: r.video || ""};
  }
  function applySectionBgs() {
    (D.section_bgs || []).forEach(function (r) {
      var el = $(SEC_SEL[r.section] || "#ue-none"); if (!el) return; var p = secPlan(r);
      Array.prototype.slice.call(el.children).forEach(function (x) { if (x.classList.contains("ue-secbg")) el.removeChild(x); });
      el.classList.remove("ue-sec", "ue-glass", "ue-sec-media"); el.style.removeProperty("--ue-t"); el.style.removeProperty("--ue-blur");
      if (p.mode === "glass") { el.classList.add("ue-sec", "ue-glass"); el.style.setProperty("--ue-t", p.tint); el.style.setProperty("--ue-blur", p.blur + "px"); }
      else if (p.mode === "media") {
        var bg = document.createElement("div"); bg.className = "ue-secbg"; bg.setAttribute("aria-hidden", "true"); bg.style.setProperty("--ue-ov", p.overlay);
        bg.innerHTML = (p.video ? '<video class="ue-secmedia ue-auto" muted loop playsinline preload="metadata" src="' + esc(mediaUrl(p.video)) + '"' + (p.image ? ' poster="' + esc(mediaUrl(p.image)) + '"' : "") + "></video>"
          : '<div class="ue-secmedia" style="background-image:url(\'' + esc(mediaUrl(p.image)) + '\')"></div>') + '<div class="ue-secov"></div>';
        el.insertBefore(bg, el.firstChild); el.classList.add("ue-sec", "ue-sec-media"); watchVideos(bg);
      }
    });
  }

  /* ---------- anonymous usage analytics (what visitors use) ---------- */
  function ueTrack(name, label) {
    if (!uaOn) return;
    try {
      var body = JSON.stringify({n: name, l: String(label || "").slice(0, 80), s: uaSid, v: uaVid, d: uaDev});
      if (navigator.sendBeacon) navigator.sendBeacon(API + "/api/public/event", new Blob([body], {type: "text/plain"}));
      else fetch(API + "/api/public/event", {method: "POST", body: body, keepalive: true, headers: {"Content-Type": "text/plain"}});
    } catch (e) {}
  }
  function clickLabel(el) {   /* "Menu: About", "Student Hub: OPEN CALENDAR" ... */
    var txt = String(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50); if (!txt) return "";
    var z = el.closest("#mainNavigation") ? "Menu" : el.closest(".site-footer") ? "Footer" : el.closest("#contact") ? "Contact" : el.closest("#studentToolsSection") ? "Student Hub" : el.closest("#universities") ? "Universities"
      : el.closest("#applyForMeSection") ? "Apply For Me form" : el.closest(".ue-view") ? "Inside page" : el.closest("#home") ? "Home" : "Page";
    return z + ": " + txt;
  }
  function initAnalytics() {
    if (uaOn || navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    var rnd = function () { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); };
    try { uaSid = sessionStorage.getItem("ue_sid"); if (!uaSid) { uaSid = rnd(); sessionStorage.setItem("ue_sid", uaSid); } } catch (e) { uaSid = rnd(); }
    try { if (localStorage.getItem("unieasy_cookie_choice") === "accepted") { uaVid = localStorage.getItem("ue_vid"); if (!uaVid) { uaVid = rnd(); localStorage.setItem("ue_vid", uaVid); } } } catch (e) {}   /* returning-visitor id only if cookies were accepted */
    var w = window.innerWidth; uaDev = w <= 600 ? "mobile" : w <= 1024 ? "tablet" : "desktop"; uaOn = true; ueTrack("pageview", "home");
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t || t.closest("#ueAsst")) return;
      var u = t.closest(".university-button");
      if (u) { var card = u.closest(".university-card"), code = card && card.querySelector(".university-code"), kind = u.classList.contains("apply") ? "apply" : /website/i.test(u.textContent) ? "website" : ""; if (code && kind) ueTrack("university", code.textContent.trim() + ": " + kind); return; }
      if (t.closest("[data-view],.ue-open-btn,#openApplyByMyself,#openApplyForMe")) return;     /* these are counted as page views */
      if (t.closest("#darkModeButton")) { setTimeout(function () { ueTrack("theme", document.body.classList.contains("dark-mode") ? "dark" : "light"); }, 60); return; }
      var sm = t.closest("summary"); if (sm && sm.closest(".faq-item")) { ueTrack("faq", sm.textContent.replace(/\s+/g, " ").trim()); return; }
      var el = t.closest("a,button"); if (el) { var l = clickLabel(el); if (l) ueTrack("click", l); }
    }, true);
    var started = false, timers = {}, SCOPE = {courseFinderInput: "courses", ueCourseInput: "courses", universitySearch: "universities"};
    document.addEventListener("input", function (e) {
      var tg = e.target; if (!tg) return;
      if (!started && tg.closest && tg.closest("#applyForMeForm")) { started = true; ueTrack("form_start", "apply_for_me"); }
      if (SCOPE[tg.id]) { clearTimeout(timers[tg.id]); timers[tg.id] = setTimeout(function () { var v = tg.value.trim().toLowerCase(); if (v.length >= 3) ueTrack("search", SCOPE[tg.id] + ": " + v.slice(0, 40)); }, 1200); }
    }, true);
    document.addEventListener("change", function (e) { var tg = e.target; if ((tg.id === "provinceFilter" || tg.id === "typeFilter") && tg.value !== "all") ueTrack("filter", (tg.id === "provinceFilter" ? "province: " : "type: ") + tg.value); }, true);
    if ("IntersectionObserver" in window) {
      var names = {"#home": "Home", "#studentToolsSection": "Student Hub", "#how-it-works": "How it works", "#about": "About", "#faq": "FAQ", "#contact": "Contact"};
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { ueTrack("section", names["#" + en.target.id]); io.unobserve(en.target); } }); }, {threshold: 0.4});
      Object.keys(names).forEach(function (s) { var el = $(s); if (el) io.observe(el); });
    }
  }

  /* ---------- UniEasy Assistant (chat) ---------- */
  function initAssistant() {
    var A = D.assistant; if (!A || !A.enabled || document.getElementById("ueAsst")) return;
    var hist = [], busy = false, welcomed = false, root = document.createElement("div"); root.id = "ueAsst";
    root.innerHTML = '<button type="button" class="ue-asst-fab" aria-label="Open ' + esc(A.name) + '" aria-expanded="false"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i></button>' +
      '<div class="ue-asst-panel" role="dialog" aria-label="' + esc(A.name) + '" hidden><div class="ue-asst-head"><i class="fa-solid fa-robot" aria-hidden="true"></i><div><strong>' + esc(A.name) + "</strong><small>" + (A.ai ? "AI assistant" : "Here to help") + '</small></div>' +
      '<button type="button" class="ue-asst-x" aria-label="Close"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><div class="ue-asst-msgs" aria-live="polite"></div><div class="ue-asst-chips"></div>' +
      '<form class="ue-asst-form"><input type="text" maxlength="600" placeholder="Type your question..." aria-label="Your question" autocomplete="off"><button type="submit" aria-label="Send"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></form></div>';
    document.body.appendChild(root);
    var fab = root.querySelector(".ue-asst-fab"), panel = root.querySelector(".ue-asst-panel"), msgs = root.querySelector(".ue-asst-msgs"), chips = root.querySelector(".ue-asst-chips"), form = root.querySelector(".ue-asst-form"), input = form.querySelector("input");
    function add(role, text) { var d = document.createElement("div"); d.className = "ue-msg " + (role === "user" ? "me" : "bot"); if (role === "user") d.textContent = text; else d.innerHTML = linkify(text); msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
    function setOpen(o) {
      panel.hidden = !o; fab.setAttribute("aria-expanded", o ? "true" : "false"); fab.innerHTML = '<i class="fa-solid ' + (o ? "fa-xmark" : "fa-comment-dots") + '" aria-hidden="true"></i>';
      if (!o) return;
      if (!welcomed) {
        welcomed = true; if (A.welcome) add("bot", A.welcome); ueTrack("assistant", "open");
        (A.suggestions || []).forEach(function (s) { var b = document.createElement("button"); b.type = "button"; b.textContent = s; b.addEventListener("click", function () { ask(s); }); chips.appendChild(b); });
      }
      input.focus();
    }
    function ask(text) {
      text = (text || "").trim(); if (!text || busy) return; busy = true; chips.style.display = "none"; add("user", text); hist.push({role: "user", content: text}); input.value = "";
      var typing = add("bot", "..."); typing.classList.add("typing");
      fetch(API + "/api/public/assistant", {method: "POST", headers: {"Content-Type": "text/plain"}, body: JSON.stringify({messages: hist.slice(-10), sid: uaSid})})
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return {ok: r.ok, j: j}; }); })
        .then(function (x) {
          typing.parentNode.removeChild(typing);
          if (x.ok && x.j.reply) { add("bot", x.j.reply); hist.push({role: "assistant", content: x.j.reply}); } else { hist.pop(); add("bot", x.j.error || "Sorry, I couldn't answer that right now. Please try again."); }
        })
        .catch(function () { typing.parentNode.removeChild(typing); hist.pop(); add("bot", "Sorry, I couldn't connect right now. Please try again in a moment."); })
        .then(function () { busy = false; });
    }
    fab.addEventListener("click", function () { setOpen(panel.hidden); });
    root.querySelector(".ue-asst-x").addEventListener("click", function () { setOpen(false); fab.focus(); });
    root.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { setOpen(false); fab.focus(); } });
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
  }

  function injectCss() {
    var G = [".student-tool-card",".feature-card",".faq-item",".contact-information",".contact-form",".form-section",".application-notice",".search-box input",".filter-box select"], GL = G.map(function (x) { return ".ue-glass " + x; }).join(","), GLD = G.map(function (x) { return ".dark-mode .ue-glass " + x; }).join(",");
    var st = document.createElement("style"); st.id = "ue-style";
    st.textContent = [
      ".back-to-site-button{background:#c8102e!important;color:#fff!important}",
      ".back-to-site-button:hover{background:#a80d25!important;opacity:1!important}",
      "body:not(.ue-show-back) .back-to-site-button,body:not(.ue-show-back) .close-application-container,body:not(.ue-show-back) .success-back-button{display:none!important}",
      ".dark-mode-button{color:#44403c}",
      ".dark-mode .dark-mode-button{color:#FFD400}",
      ".ue-view{display:none;padding:40px 0 90px;min-height:100vh;background:#fff}",
      ".dark-mode .ue-view{background:#141110}",
      "body.ue-view-mode .ue-view.ue-open{display:block}",
      "body.ue-view-mode .site-header,body.ue-view-mode #home,body.ue-view-mode #studentToolsSection,body.ue-view-mode #applyForMeSection,body.ue-view-mode #universities,body.ue-view-mode #how-it-works,body.ue-view-mode #about,body.ue-view-mode #faq,body.ue-view-mode #contact,body.ue-view-mode .site-footer,body.ue-view-mode #cookieBanner,body.ue-view-mode #backToTop{display:none!important}",
      "body.apply-for-me-mode #studentToolsSection{display:none!important}",
      ".ue-hub-hidden{display:none!important}",
      ".ue-hubblock{margin-top:14px}",
      ".ue-card{padding:20px;margin-bottom:16px;border:1px solid var(--border,#e7e2de);border-radius:16px;background:#fff;box-shadow:0 5px 20px rgba(28,25,23,.07)}",
      ".dark-mode .ue-card{background:#1c1917;border-color:#3a332f}",
      ".ue-cal-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap}",
      ".ue-cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}",
      ".ue-cal-dow{font-size:.75rem;font-weight:800;text-align:center;opacity:.7}",
      ".ue-cal-day{min-height:78px;padding:6px;border-radius:10px;background:rgba(0,0,0,.035);font-size:.8rem;overflow:hidden}",
      ".dark-mode .ue-cal-day{background:rgba(255,255,255,.06)}",
      ".ue-cal-day.today{outline:2px solid #c8102e}",
      ".ue-ev{margin-top:3px;padding:2px 5px;border-radius:5px;color:#fff;font-size:.65rem;font-weight:700;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".ue-ev.o{background:#1e9e5a}.ue-ev.c{background:#c8102e}",
      "@media(max-width:600px){.ue-cal-day{min-height:58px;padding:3px;font-size:.7rem}.ue-ev{font-size:.55rem;padding:1px 3px}}",
      ".ue-posts{display:grid;grid-template-columns:repeat(var(--ue-cols,2),minmax(0,1fr));gap:22px}",
      ".ue-post{display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:#fff;border:1px solid var(--border,#e7e2de);box-shadow:0 10px 30px rgba(28,25,23,.08);transition:transform .25s ease,box-shadow .25s ease}",
      ".ue-post:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(28,25,23,.14)}",
      ".dark-mode .ue-post{background:#1c1917;border-color:#3a332f}",
      ".ue-post .ue-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#000}",
      ".ue-post-body{display:flex;flex-direction:column;gap:8px;padding:20px;flex:1}",
      ".ue-tag{display:inline-block;align-self:flex-start;padding:4px 10px;border-radius:999px;background:#c8102e;color:#fff;font-size:.7rem;font-weight:800;letter-spacing:.8px}",
      ".ue-post h3{margin:0;font-size:1.2rem;line-height:1.3}",
      ".ue-date{font-size:.8rem;opacity:.65}",
      ".ue-post p{margin:0;line-height:1.65;white-space:pre-line}",
      ".ue-wide{grid-column:1/-1}",
      ".ue-row{flex-direction:row}.ue-row.rev{flex-direction:row-reverse}",
      ".ue-row .ue-imgwrap{flex:0 0 42%;min-height:240px}.ue-row .ue-imgwrap .ue-img{height:100%;aspect-ratio:auto}",
      ".ue-banner{position:relative;min-height:320px;justify-content:flex-end;color:#fff;background-size:cover;background-position:center}",
      ".ue-banner::before{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(20,16,14,.92),rgba(20,16,14,.35),rgba(20,16,14,.1))}",
      ".ue-banner .ue-post-body{position:relative;z-index:1;flex:none;padding:26px}",
      ".ue-banner h3{font-size:1.6rem}",
      "@media(max-width:800px){.ue-posts{grid-template-columns:1fr}.ue-row,.ue-row.rev{flex-direction:column}.ue-row .ue-imgwrap{flex:none;min-height:0}.ue-row .ue-imgwrap .ue-img{height:auto;aspect-ratio:16/9}}",
      ".ue-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}",
      ".ue-vid-ov{position:absolute;inset:0;z-index:1;background:linear-gradient(to top,rgba(20,16,14,.96),rgba(20,16,14,.55),rgba(20,16,14,.05))}",
      ".ue-hero-bg,.ue-head-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}",
      ".ue-hero-bg{z-index:0}.ue-head-bg{z-index:-1}",
      ".ue-hero-slide,.ue-head-slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.4s ease-in-out;animation:ueZoom calc(var(--ue-sec,6s) * 2.2) ease-in-out infinite alternate}",
      "video.ue-hero-slide,video.ue-head-slide{width:100%;height:100%;object-fit:cover}",
      ".ue-hero-slide.on,.ue-head-slide.on{opacity:1}",
      ".ue-hero-ov,.ue-head-ov{position:absolute;inset:0;background:rgba(0,0,0,var(--ue-ov,.45))}",
      "@keyframes ueZoom{from{transform:scale(1.02)}to{transform:scale(1.14)}}",
      "@media(prefers-reduced-motion:reduce){.ue-hero-slide,.ue-head-slide{animation:none}}",
      ".hero-section.ue-hero-custom .hero-content h1{color:#fff}",
      ".hero-section.ue-hero-custom .hero-subtitle{color:#fff}",
      ".hero-section.ue-hero-custom .hero-description{color:#e7e5e4}",
      ".site-header.ue-header-custom .logo-text{color:#fff}",
      "@media(min-width:801px){.site-header.ue-header-custom .main-navigation>a{color:#fff}.site-header.ue-header-custom .main-navigation>a:hover{color:#FFD400}}",
      ".ue-card-off{display:none!important}",
      ".ue-cardmedia{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background-size:cover;background-position:center;z-index:0}",
      ".ue-cardov{position:absolute;inset:0;z-index:1;background:rgba(10,8,8,var(--ue-cov,.45))}",
      ".ue-card-media>*:not(.ue-cardmedia):not(.ue-cardov){position:relative;z-index:2}",
      ".ue-card-media::before{z-index:3}",
      ".ue-card-media h2,.ue-card-media h3,.ue-card-media>p{color:#fff!important}",
      ".ue-card-ctext h2,.ue-card-ctext h3,.ue-card-ctext>p{color:var(--ue-ctext)!important}",
      "@media(min-width:601px){.apply-myself-tools>[data-ue-w='Wide']{grid-column:span 2}}",
      ".apply-myself-tools>[data-ue-w='Full width']{grid-column:1/-1}",
      "@media(min-width:801px){.apply-options>[data-ue-w='Wide'],.apply-options>[data-ue-w='Full width']{grid-column:1/-1}}",
      ".ue-sec{position:relative}",
      ".ue-sec>.container{position:relative;z-index:2}",
      ".ue-secbg{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}",
      ".ue-secmedia{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background-size:cover;background-position:center}",
      ".ue-secov{position:absolute;inset:0;background:rgba(0,0,0,var(--ue-ov,.45))}",
      ".ue-sec-media .section-heading h2,.ue-sec-media .application-header h2{color:#fff!important}",
      ".ue-sec-media .section-heading p,.ue-sec-media .application-header p,.ue-sec-media .search-box label,.ue-sec-media .filter-box label,.ue-sec-media .results-information,.ue-sec-media .results-information p,.ue-sec-media .no-results h3,.ue-sec-media .no-results p{color:#f5f5f4!important}",
      ".ue-sec-media .section-label{color:#FFD400!important}",
      ".ue-glass{background:radial-gradient(circle at 12% 18%,rgba(var(--ue-t),.30),transparent 42%),radial-gradient(circle at 88% 82%,rgba(212,160,23,.28),transparent 40%),linear-gradient(135deg,rgba(var(--ue-t),.10),rgba(255,255,255,.6))!important}",
      ".dark-mode .ue-glass{background:radial-gradient(circle at 12% 18%,rgba(var(--ue-t),.38),transparent 42%),radial-gradient(circle at 88% 82%,rgba(212,160,23,.18),transparent 40%),linear-gradient(135deg,rgba(var(--ue-t),.2),rgba(20,17,16,.92))!important}",
      GL + "{background:rgba(255,255,255,.38)!important;border:1px solid rgba(255,255,255,.6)!important;-webkit-backdrop-filter:blur(var(--ue-blur,14px)) saturate(160%);backdrop-filter:blur(var(--ue-blur,14px)) saturate(160%);box-shadow:0 8px 32px rgba(31,38,135,.15)!important}",
      GLD + "{background:rgba(28,25,23,.5)!important;border-color:rgba(255,255,255,.14)!important}",
      ".ue-head-slide{animation:none;background:#000}",
      ".ue-head-blur{position:absolute;inset:-14px;background-size:cover;background-position:center;filter:blur(16px) brightness(.85)}",
      ".ue-head-fit{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}",
      ".ue-head-fit.cover{object-fit:cover}.ue-head-fit.stretch{object-fit:fill}",
      "#ueAsst{position:fixed;right:22px;bottom:80px;z-index:3500}",
      ".ue-asst-fab{width:56px;height:56px;border-radius:50%;border:0;background:#c8102e;color:#fff;font-size:1.4rem;box-shadow:0 10px 25px rgba(200,16,46,.35);cursor:pointer;display:grid;place-items:center}",
      ".ue-asst-panel{position:absolute;right:0;bottom:70px;width:360px;max-width:calc(100vw - 30px);height:min(540px,calc(100vh - 170px));background:#fff;color:#292524;border-radius:18px;box-shadow:0 25px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;border:1px solid #e7e2de}",
      ".ue-asst-panel[hidden]{display:none}",
      ".ue-asst-head{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#c8102e;color:#fff}.ue-asst-head div{flex:1;line-height:1.2}.ue-asst-head small{display:block;opacity:.85;font-size:.72rem}",
      ".ue-asst-x{background:transparent;border:0;color:#fff;font-size:1.1rem;cursor:pointer}",
      ".ue-asst-msgs{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#faf8f6}",
      ".ue-msg{max-width:86%;padding:9px 12px;border-radius:14px;font-size:.9rem;line-height:1.5;white-space:pre-line;word-wrap:break-word}",
      ".ue-msg.bot{background:#fff;border:1px solid #e7e2de;align-self:flex-start;color:#292524}.ue-msg.me{background:#c8102e;color:#fff;align-self:flex-end}.ue-msg.typing{opacity:.6}",
      ".ue-asst-chips{display:flex;gap:6px;flex-wrap:wrap;padding:0 14px 10px;background:#faf8f6}.ue-asst-chips button{border:1px solid #c8102e;background:#fff;color:#c8102e;border-radius:999px;padding:5px 10px;font-size:.75rem;cursor:pointer}",
      ".ue-asst-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e7e2de;background:#fff}",
      ".ue-asst-form input{flex:1;width:auto;border:1px solid #d6d3d1;border-radius:999px;padding:10px 14px;outline:none;background:#fff;color:#292524}",
      ".ue-asst-form button{width:42px;height:42px;flex:none;border-radius:50%;border:0;background:#c8102e;color:#fff;cursor:pointer}",
      ".dark-mode .ue-asst-panel{background:#1c1917;color:#f5f5f4;border-color:#3a332f}.dark-mode .ue-asst-msgs,.dark-mode .ue-asst-chips{background:#141110}",
      ".dark-mode .ue-msg.bot{background:#1c1917;border-color:#3a332f;color:#f5f5f4}.dark-mode .ue-asst-chips button{background:#1c1917}.dark-mode .ue-asst-form{background:#1c1917;border-color:#3a332f}.dark-mode .ue-asst-form input{background:#141110;color:#f5f5f4;border-color:#44403c}",
      "@media(max-width:600px){#ueAsst{right:15px;bottom:70px}.ue-asst-panel{position:fixed;right:10px;left:10px;bottom:84px;width:auto;max-width:none}}"
    ].join("\n");
    document.head.appendChild(st);
  }
  function mkView(name, label, title, intro, body, extraTop) {
    var s = document.createElement("section"); s.id = "ue-view-" + name; s.className = "ue-view";
    s.innerHTML = '<div class="container"><button type="button" class="back-to-site-button ue-back"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to Home</button>' + (extraTop || "") +
      '<div class="section-heading"><span class="section-label">' + label + "</span><h2>" + title + "</h2><p>" + intro + "</p></div>" + body + "</div>";
    (document.getElementById("mainContent") || document.body).appendChild(s); return s;
  }
  function openView(name) {
    var sec = document.getElementById("ue-view-" + name); if (!sec) return;
    $$(".ue-view").forEach(function (v) { v.classList.remove("ue-open"); }); sec.classList.add("ue-open");
    document.body.classList.remove("apply-by-myself-mode", "apply-for-me-mode"); document.body.classList.add("ue-view-mode");
    curView = name; if (VIEWS[name]) VIEWS[name](); window.scrollTo({top: 0, behavior: "smooth"}); syncHistory();
  }
  function closeViews() {
    document.body.classList.remove("ue-view-mode"); $$(".ue-view").forEach(function (v) { v.classList.remove("ue-open"); });
    var t = document.getElementById(curView === "track" || curView === "trackresult" ? "home" : "studentToolsSection"); curView = null;
    if (t) t.scrollIntoView({behavior: "smooth", block: "start"}); syncHistory();
  }
  function cardByTitle(re) {
    return $$(".student-tool-card").filter(function (a) { var h = a.querySelector("h3"); return re.test(a.getAttribute("data-ue-title") || (h ? h.textContent : "")); })[0];
  }
  function hubButton(re, view, text) {
    var card = cardByTitle(re); if (!card || card.querySelector(".ue-open-btn")) return;
    var w = document.createElement("div"); w.className = "ue-btn-wrap"; w.style.cssText = "margin-top:auto;padding-top:18px";
    w.innerHTML = '<button type="button" class="tool-button ue-open-btn" data-view="' + view + '">' + text + "</button>"; card.appendChild(w);
  }
  function hubInside(re) {   /* keep icon, title, description and the button; the details live on the inside page */
    var card = cardByTitle(re); if (!card) return;
    Array.prototype.slice.call(card.children).forEach(function (el) {
      if (!el.matches(".student-tool-icon, h3, p, .ue-btn-wrap")) el.classList.add("ue-hub-hidden");
    });
  }

  /* ---------- hero background slideshow ---------- */
  function applyHero() {
    var hero = $(".hero-section"); if (!hero) return;
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
    var old = hero.querySelector(".ue-hero-bg"); if (old) old.parentNode.removeChild(old);
    hero.classList.remove("ue-hero-custom");
    var slides = (D.hero_slides || []).filter(function (x) { return x.image || x.video; });
    if (S.hero_bg_enabled === "0" || !slides.length) return;
    heroTimer = buildSlideshow(hero, slides, num(S.hero_bg_seconds, 6, 2, 30), num(S.hero_bg_overlay, 45, 0, 85) / 100, "ue-hero"); hero.classList.add("ue-hero-custom");
  }
  function nsfasUrl() { var u = ((S && S.nsfas_official_url) || "").trim(); return /^https?:\/\//i.test(u) ? u : "https://www.nsfas.org.za/"; }

  /* ---------- Student News: only the latest outside, everything inside ---------- */
  function latestNews() {
    var best = null; D.news.forEach(function (n) { if (!best || String(n.created_at || "") > String(best.created_at || "")) best = n; }); return best;
  }
  function hubNewsHtml() {
    var n = latestNews(); if (!n) return "No news at the moment. Check back soon.";
    var m = n.video ? "<video controls playsinline preload='metadata' src='" + esc(mediaUrl(n.video)) + "'" + (n.image ? " poster='" + esc(mediaUrl(n.image)) + "'" : "") + " style='width:100%;max-height:170px;border-radius:10px;margin:8px 0;background:#000'></video>"
      : n.image ? "<img src='" + esc(mediaUrl(n.image)) + "' alt='" + esc(n.title) + "' loading='lazy' style='width:100%;max-height:150px;object-fit:cover;border-radius:10px;margin:8px 0'>" : "";
    var ex = String(n.body || ""); if (ex.length > 140) ex = ex.slice(0, 140).replace(/\s+\S*$/, "") + "...";
    var inh = okColor(n.text_color) ? " style='color:inherit'" : "";
    return "<div class='news-item' style='" + postStyle(n, true) + "'>" + (n.tag ? "<span class='ue-tag'>" + esc(n.tag) + "</span>" : "") + "<strong" + inh + ">" + esc(n.title) + "</strong>" + m + "<p" + inh + ">" + esc(ex) + "</p></div>" +
      "<small style='opacity:.7'>Latest update. Open Student News to see the rest.</small>";
  }
  function postCard(n) {
    var lay = n.layout || "Card", sty = postStyle(n, false), bgImg = n.image ? mediaUrl(n.image) : "";
    var tag = n.tag ? "<span class='ue-tag'>" + esc(n.tag) + "</span>" : "";
    var date = n.created_at ? "<span class='ue-date'>" + esc(fmt(n.created_at)) + "</span>" : "";
    var lk = n.link && /^https?:\/\//i.test(n.link) ? "<a class='tool-button' href='" + esc(n.link) + "' target='_blank' rel='noopener noreferrer' style='text-decoration:none;align-self:flex-start;margin-top:6px'>" + esc(n.link_text || "Read more") + "</a>" : "";
    var body = "<div class='ue-post-body'>" + tag + "<h3>" + esc(n.title) + "</h3>" + date + "<p>" + (okColor(n.text_color) ? linkify(n.body || "").replace(/color:#c8102e;/g, "color:inherit;") : linkify(n.body || "")) + "</p>" + lk + "</div>";
    var media = n.video ? "<div class='ue-imgwrap'><video class='ue-img' controls playsinline preload='metadata' src='" + esc(mediaUrl(n.video)) + "'" + (n.image ? " poster='" + esc(bgImg) + "'" : "") + "></video></div>"
      : bgImg ? "<div class='ue-imgwrap'><img class='ue-img' src='" + esc(bgImg) + "' alt='" + esc(n.title) + "' loading='lazy'></div>" : "";
    if (lay === "Banner") {
      var vid = n.video ? "<video class='ue-vid ue-auto' muted loop playsinline preload='metadata' src='" + esc(mediaUrl(n.video)) + "'></video><div class='ue-vid-ov'></div>" : "";
      var bst = sty + (n.video ? "" : bgImg ? "background-image:url('" + esc(bgImg) + "');" : (okColor(n.bg_color) ? "" : "background:linear-gradient(135deg,#c8102e,#7a0a1c);"));
      return "<article class='ue-post ue-banner ue-wide' style=\"" + bst + "\">" + vid + body + "</article>";
    }
    if ((lay === "Image left" || lay === "Image right") && media) return "<article class='ue-post ue-row ue-wide" + (lay === "Image right" ? " rev" : "") + "' style=\"" + sty + "\">" + media + body + "</article>";
    if (lay === "Text only") return "<article class='ue-post' style=\"" + sty + "\">" + body + "</article>";
    return "<article class='ue-post' style=\"" + sty + "\">" + media + body + "</article>";
  }
  function postsHtml(list, cols, empty) {
    return list.length ? "<div class='ue-posts' style='--ue-cols:" + cols + "'>" + list.map(postCard).join("") + "</div>" : "<p style='text-align:center;opacity:.7'>" + empty + "</p>";
  }

  /* ---------- Track My Application: form page, then the result on its own page ---------- */
  function addTracker() {
    if (document.getElementById("ue-view-track")) return;
    mkView("track", "TRACK YOUR APPLICATION", "Check Your Application Status",
      "Enter the email address you applied with and your reference number (it starts with UE-).",
      `<form id="trackForm" class="contact-form" style="max-width:560px;margin:0 auto">
         <div class="form-group"><label for="trackEmail">Email address</label><input type="email" id="trackEmail" name="email" placeholder="The email you applied with" required></div>
         <div class="form-group"><label for="trackRef">Reference number</label><input type="text" id="trackRef" name="reference" placeholder="e.g. UE-7K3M9XQ2" required></div>
         <button type="submit" class="submit-contact-button">Check Status</button></form>
       <div id="trackFormMsg" role="status" aria-live="polite" style="max-width:560px;margin:16px auto 0"></div>`);
    mkView("trackresult", "YOUR APPLICATION", "Application Status", "Here is the latest on your application.",
      '<div id="trackResult" role="status" aria-live="polite" style="max-width:640px;margin:0 auto"></div>',
      '<button type="button" class="back-to-site-button" data-view="track" style="margin-left:10px"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Check another application</button>');
    var nav = document.getElementById("mainNavigation");
    if (nav) {
      var a = document.createElement("a"); a.href = "#"; a.setAttribute("data-view", "track"); a.textContent = "Track Application";
      var dm = document.getElementById("darkModeButton"); nav.insertBefore(a, dm && dm.parentNode === nav ? dm : null);
      a.addEventListener("click", function () {
        nav.classList.remove("open"); var mb = document.getElementById("mobileMenuButton");
        if (mb) { mb.setAttribute("aria-expanded", "false"); mb.textContent = "\u2630"; }
      });
    }
    $$(".footer-links").forEach(function (fl) {
      var h = fl.querySelector("h3");
      if (h && /Quick Links/i.test(h.textContent)) { var l = document.createElement("a"); l.href = "#"; l.setAttribute("data-view", "track"); l.textContent = "Track Application"; fl.appendChild(l); }
    });
    var ao = $(".apply-options");
    if (ao && ao.parentNode) {
      var w = document.createElement("div"); w.style.cssText = "margin-top:22px";
      w.innerHTML = '<button type="button" class="apply-btn" data-view="track" style="background:transparent;border:2px solid #c8102e;color:#c8102e">TRACK MY APPLICATION</button>';
      ao.parentNode.insertBefore(w, ao.nextSibling);
    }
    var COL = {"Pending": "#a87c00", "Under Review": "#2563eb", "Submitted": "#1e9e5a", "Rejected": "#b91c1c"};
    var TXT = {"Pending": "We have received your application and it is waiting to be reviewed.", "Under Review": "The UniEasy team is working on your application.",
      "Submitted": "Your application has been submitted.", "Rejected": "Your application could not go ahead. Please read the message below or contact us."};
    var PAY = {"Pending": "We are waiting to verify your proof of payment.", "Verified": "Your payment has been verified.", "Rejected": "Your payment could not be verified. Please contact us."};
    function renderTrack(d) {
      var subs = (d.submissions || []).map(function (s) {
        return "<div style='padding:8px 0;border-top:1px solid rgba(0,0,0,.1)'><b>" + esc(fmt(s.date)) + "</b>" + (s.files ? " (" + s.files + " file" + (s.files > 1 ? "s" : "") + ")" : "") +
          (s.message ? "<div style='white-space:pre-line;opacity:.85'>" + esc(s.message) + "</div>" : "") + "</div>";
      }).join("");
      return "<div class='student-tool-panel'>" +
        "<div style='font-size:.8rem;opacity:.7'>Reference</div><div style='font-weight:800;font-size:1.15rem'>" + esc(d.reference) + "</div>" +
        "<div style='margin-top:14px'><span style='display:inline-block;padding:5px 14px;border-radius:999px;color:#fff;font-weight:800;background:" + (COL[d.status] || "#57534e") + "'>" + esc(d.status) + "</span>" +
        "<span style='font-weight:800;margin-left:10px'>" + (d.done ? "Done" : "In progress") + "</span></div>" +
        "<p style='margin-top:10px'>" + esc(TXT[d.status] || "") + "</p>" +
        (d.submitted ? "<p style='margin-top:8px'>Received: " + esc(fmt(d.submitted)) + "</p>" : "") +
        (d.universities && d.universities.length ? "<p style='margin-top:8px'>Universities:</p><ul>" + d.universities.map(function (u) { return "<li>" + esc(u) + "</li>"; }).join("") + "</ul>" : "") +
        (d.payment ? "<p style='margin-top:8px'>Payment: <span style='font-weight:800'>" + esc(d.payment) + "</span>. " + esc(PAY[d.payment] || "") + "</p>" : "") +
        (d.message ? "<div style='margin-top:12px;padding:12px;border-left:4px solid #c8102e;border-radius:8px;background:rgba(200,16,46,.06)'><div style='font-weight:800'>Message from UniEasy</div><div style='white-space:pre-line'>" + esc(d.message) + "</div></div>" : "") +
        "</div>" +
        (d.info_needed ? "<div class='student-tool-panel' style='margin-top:16px'>" +
          "<div style='background:#FFD400;color:#1c1917;padding:10px 14px;border-radius:10px;font-weight:700;margin-bottom:12px'>UniEasy needs more information from you. Please use the form below to send it.</div>" +
          "<div style='font-weight:800;font-size:1rem'>Send additional information or documents</div>" +
          "<form id='trackExtraForm' style='display:grid;gap:12px;margin-top:10px'>" +
          "<textarea name='message' rows='4' placeholder='Type the information UniEasy asked for...'></textarea>" +
          "<input type='file' name='files' multiple accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'>" +
          "<small>PDF, JPG, PNG or DOC. Maximum 5 MB each and up to 5 files at a time.</small>" +
          "<button type='submit' class='submit-contact-button'>Send to UniEasy</button><div id='trackExtraMsg' role='status'></div></form></div>" : "") +
        (subs ? "<div class='student-tool-panel' style='margin-top:16px'><div style='font-weight:800'>What you have already sent</div>" + subs + "</div>" : "");
    }
    function runTrack(email, ref, flash) {
      var msg = document.getElementById("trackFormMsg"), out = document.getElementById("trackResult"), btn = document.querySelector("#trackForm button[type=submit]");
      var fd = new FormData(); fd.append("email", email); fd.append("reference", ref);
      var showErr = function (t) { var h = "<div class='form-message error'>" + esc(t) + "</div>"; if (curView === "trackresult") out.innerHTML = h; else msg.innerHTML = h; };
      if (btn) btn.disabled = true; if (!flash) msg.innerHTML = "<div class='form-message'>Checking...</div>";
      fetch(API + "/api/public/track", {method: "POST", body: fd}).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (btn) btn.disabled = false;
          if (!r.ok) { lastTrack = null; showErr(d.error || "Something went wrong. Please try again."); return; }
          lastTrack = {email: email, reference: d.reference}; msg.innerHTML = ""; if (!flash) ueTrack("form_submit", "track_status");
          out.innerHTML = (flash ? "<div class='form-message success' style='margin-bottom:12px'>" + esc(flash) + "</div>" : "") + renderTrack(d);
          if (curView !== "trackresult") openView("trackresult"); else window.scrollTo({top: 0, behavior: "smooth"});
        });
      }).catch(function () { if (btn) btn.disabled = false; showErr("Connection problem. Please try again."); });
    }
    document.addEventListener("submit", function (e) {
      var f = e.target; if (!f) return;
      if (f.id === "trackForm") {
        e.preventDefault(); e.stopPropagation(); runTrack(f.elements.email.value.trim(), f.elements.reference.value.trim());
      } else if (f.id === "trackExtraForm") {
        e.preventDefault(); e.stopPropagation(); if (!lastTrack) return;
        var msg = document.getElementById("trackExtraMsg"), btn = f.querySelector("button[type=submit]"), files = f.elements.files.files;
        var say = function (t, ok) { msg.className = "form-message " + (ok ? "success" : "error"); msg.textContent = t; };
        if (files.length > 5) { say("Please send at most 5 files at a time.", false); return; }
        for (var i = 0; i < files.length; i++) if (files[i].size > 5 * 1024 * 1024) { say(files[i].name + " is larger than 5 MB.", false); return; }
        if (!f.elements.message.value.trim() && !files.length) { say("Please type a message or attach a file.", false); return; }
        var fd = new FormData(f); fd.append("email", lastTrack.email); fd.append("reference", lastTrack.reference);
        btn.disabled = true; say("Sending...", true);
        fetch(API + "/api/public/track/submit", {method: "POST", body: fd}).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            if (r.ok) { ueTrack("form_submit", "extra_info"); runTrack(lastTrack.email, lastTrack.reference, "Thank you! UniEasy has received your additional information."); }
            else { btn.disabled = false; say(d.error || "Could not send. Please try again.", false); }
          });
        }).catch(function () { btn.disabled = false; say("Connection problem. Please try again.", false); });
      }
    }, true);
  }

  /* ---------- Applications Calendar and Course Finder pages ---------- */
  function calView() {
    var ev = [], today = todayIso();
    D.deadlines.forEach(function (x) {
      if (x.opens) ev.push({date: x.opens, code: x.code, t: "o", program: x.program});
      if (x.closes) ev.push({date: x.closes, code: x.code, t: "c", program: x.program});
    });
    ev.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    if (calY === null) {
      var nx = ev.filter(function (x) { return x.date >= today; })[0] || ev[ev.length - 1], ref = nx ? nx.date : today;
      calY = +ref.slice(0, 4); calM = +ref.slice(5, 7) - 1;
    }
    document.getElementById("ueCalTitle").textContent = MONL[calM] + " " + calY;
    var off = (new Date(calY, calM, 1).getDay() + 6) % 7, dim = new Date(calY, calM + 1, 0).getDate(), by = {};
    ev.forEach(function (x) { if (+x.date.slice(0, 4) === calY && +x.date.slice(5, 7) - 1 === calM) { var dd = +x.date.slice(8, 10); (by[dd] = by[dd] || []).push(x); } });
    var h = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (w) { return "<div class='ue-cal-dow'>" + w + "</div>"; }).join("");
    for (var i = 0; i < off; i++) h += "<div></div>";
    for (var day = 1; day <= dim; day++) {
      var iso = calY + "-" + ("0" + (calM + 1)).slice(-2) + "-" + ("0" + day).slice(-2), list = by[day] || [];
      h += "<div class='ue-cal-day" + (iso === today ? " today" : "") + "'><b>" + day + "</b>" +
        list.slice(0, 3).map(function (x) { var lab = esc(x.code) + (x.t === "o" ? " opens" : " closes"); return "<div class='ue-ev " + x.t + "' title='" + esc((names[x.code] || x.code) + (x.t === "o" ? " opens" : " closes")) + "'>" + lab + "</div>"; }).join("") +
        (list.length > 3 ? "<div style='font-size:.65rem;opacity:.7'>+" + (list.length - 3) + " more</div>" : "") + "</div>";
    }
    document.getElementById("ueCalGrid").innerHTML = h;
    document.getElementById("ueCalList").innerHTML = ev.length ? ev.map(function (x) {
      return "<div class='ue-card' style='padding:12px 16px;margin-bottom:8px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;" + (x.date < today ? "opacity:.6" : "") + "'>" +
        "<span style='font-weight:800;min-width:120px'>" + esc(fmt(x.date)) + "</span><span style='font-weight:800;min-width:70px;color:" + (x.t === "o" ? "#1e9e5a" : "#c8102e") + "'>" + (x.t === "o" ? "Opens" : "Closes") + "</span>" +
        "<span>" + esc(names[x.code] || x.code) + (x.program ? " - " + esc(x.program) : "") + "</span></div>";
    }).join("") : "<p style='opacity:.7'>No application dates have been added yet. Check back soon.</p>";
  }
  function courseView() {
    var q = (document.getElementById("ueCourseInput").value || "").trim().toLowerCase(), u = document.getElementById("ueCourseUni").value;
    var list = D.courses.filter(function (c) {
      return (!u || c.code === u) && (!q || c.name.toLowerCase().indexOf(q) > -1 || (names[c.code] || c.code).toLowerCase().indexOf(q) > -1);
    }), g = {};
    list.forEach(function (c) { (g[c.name] = g[c.name] || []).push(c); });
    var keys = Object.keys(g).sort();
    document.getElementById("ueCourseCount").textContent = keys.length + " course" + (keys.length === 1 ? "" : "s") + " found";
    document.getElementById("ueCourseResults").innerHTML = keys.length ? keys.map(function (k) {
      return "<div class='ue-card'><h3 style='margin-bottom:8px'>" + esc(k) + "</h3>" + g[k].map(function (c) {
        var extra = [c.level, c.duration].filter(Boolean).join(" \u00b7 ");
        return "<div style='padding:8px 0;border-top:1px solid rgba(0,0,0,.1)'><strong>" + esc(names[c.code] || c.code) + "</strong>" +
          (extra ? "<br><small>" + esc(extra) + "</small>" : "") + (c.requirements ? "<br><small>" + esc(c.requirements) + "</small>" : "") + "</div>";
      }).join("") + "</div>";
    }).join("") : "<p style='opacity:.7'>No courses match your search. Try another course or university.</p>";
  }
  function addViews() {
    if (document.getElementById("ue-view-news")) return;
    mkView("news", "STUDENT NEWS", sget("news_page_title", "Latest Student News"), sget("news_page_intro", "Important updates about applications, registrations and funding."), '<div id="ueNewsList"></div>');
    VIEWS.news = function () { document.getElementById("ueNewsList").innerHTML = postsHtml(D.news, colsOf(S.news_columns, 2), "No news at the moment. Check back soon."); };
    mkView("nsfas", "NSFAS HUB", sget("nsfas_page_title", "NSFAS Hub"), sget("nsfas_page_intro", "Funding information, updates and useful links."),
      '<div style="margin-bottom:20px"><a class="tool-button" href="' + esc(nsfasUrl()) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:none">OPEN OFFICIAL NSFAS WEBSITE</a></div><div id="ueNsfasList"></div>');
    VIEWS.nsfas = function () { document.getElementById("ueNsfasList").innerHTML = postsHtml(D.nsfas || [], colsOf(S.nsfas_columns, 2), "No NSFAS updates have been added yet. Check back soon."); };
    mkView("calendar", "APPLICATIONS CALENDAR", "Application Dates", "See when applications open and close at each university.",
      '<div class="ue-card"><div class="ue-cal-head"><button type="button" class="tool-button" id="ueCalPrev">&larr; Previous</button><strong id="ueCalTitle" style="font-size:1.15rem"></strong>' +
      '<button type="button" class="tool-button" id="ueCalNext">Next &rarr;</button></div><div id="ueCalGrid" class="ue-cal-grid"></div>' +
      '<p style="margin-top:12px;font-size:.85rem"><span style="color:#1e9e5a;font-weight:800">&#9632;</span> Applications open &nbsp; <span style="color:#c8102e;font-weight:800">&#9632;</span> Applications close</p></div>' +
      '<h3 style="margin:24px 0 10px">All application dates</h3><div id="ueCalList"></div>');
    VIEWS.calendar = function () { calY = null; calView(); };
    document.getElementById("ueCalPrev").addEventListener("click", function () { calM--; if (calM < 0) { calM = 11; calY--; } calView(); });
    document.getElementById("ueCalNext").addEventListener("click", function () { calM++; if (calM > 11) { calM = 0; calY++; } calView(); });
    mkView("courses", "COURSE FINDER", "Find Your Course", "Search by course name or university to see where you can study it.",
      '<div class="ue-card"><input type="search" id="ueCourseInput" class="tool-search" placeholder="Search by course or university, e.g. Computer Science">' +
      '<select id="ueCourseUni" class="tool-select"><option value="">All universities</option>' +
      D.universities.map(function (u) { return '<option value="' + esc(u.code) + '">' + esc(u.name) + "</option>"; }).join("") + '</select></div>' +
      '<div id="ueCourseCount" style="margin:8px 4px;opacity:.7"></div><div id="ueCourseResults"></div>');
    VIEWS.courses = courseView;
    document.getElementById("ueCourseInput").addEventListener("input", courseView);
    document.getElementById("ueCourseUni").addEventListener("change", courseView);
    hubButton(/Student News/i, "news", "OPEN STUDENT NEWS");
    hubButton(/Applications Calendar/i, "calendar", "OPEN CALENDAR");
    hubButton(/Course Finder/i, "courses", "OPEN COURSE FINDER");
    hubButton(/NSFAS Hub/i, "nsfas", "NSFAS UPDATES &amp; INFO");
    hubInside(/Applications Calendar/i); hubInside(/Course Finder/i);
    hubBlocks();
    var nl = $('.student-tool-card a.tool-button[href*="nsfas"]'); if (nl) nl.href = nsfasUrl();
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target : null; if (!t) return;
      var b = t.closest("[data-view]"); if (b) { e.preventDefault(); openView(b.getAttribute("data-view")); return; }
      if (t.closest(".ue-back")) closeViews();
    });
  }

  function start() {
    fetch(API + "/api/public/bootstrap").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      D = d; S = d.settings || {}; tagCards();
      D.universities.forEach(function (u) { names[u.code] = u.name; });
      D.courses.forEach(function (c) { if (!names[c.code]) names[c.code] = c.code; });
      Object.keys(names).forEach(function (k) { closes[k] = pick(k, "closes"); opens[k] = pick(k, "opens"); });
      applySettings(); applyHero(); applyHeader(); document.body.classList.toggle("ue-show-back", S.show_back_buttons === "1"); fillSelects(); renderUnis(); renderCalendar(); renderClosing(); renderNewsFaq(); searchCourses(); showDeadline(); updateSummary();
      wire(); addTracker(); addViews(); applyCards(); applySectionBgs(); initAssistant(); initAnalytics();
    }).catch(function () { /* backend unreachable: the page keeps its built-in content and the original form route */ });
  }
  injectCss(); initThemeIcon(); initHistory();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
