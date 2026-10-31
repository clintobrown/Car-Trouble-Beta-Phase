/* Car Trouble v2 (BETA) - app-v2-bug.js
"Found a bug?" button (in the yellow banner) and bug report screen. Loaded by test.html only.
The tester sees the whole report first. Nothing is sent until they press "Send bug report".
Sending posts the report to the developer's Google Form (FORM_ID / FIELD below). Google does not let the page read the reply, so a network error is the only failure we can detect.
A bug report never includes the VIN or photos. Car details and answers are included only if the tester ticks the box. */
(function (g) {
  'use strict';
  var A = g.CTApp, D = g.document;
  if (!A) return;
  var VERSION = 'v2 beta (2026-10-30)';
  var FORM_ID = '1FAIpQLSdfVzPDE_Xo5q7w3t0j5S5ZyhvNRzgkhbbB30tohwPAbHA7dw';
  var FIELD = 'entry.1303829912';
  var POST_URL = 'https://docs.google.com/forms/d/e/' + FORM_ID + '/formResponse';
  var desc = '', withAnswers = false, from = null, sending = false, sent = false;
  function esc(s) { return A.esc(s); }

 (function () { var s = D.createElement('style'); s.textContent = '.bugbtn{display:inline-block;margin:.3rem 0 0 .6rem;min-height:2.5rem;padding:.3rem .9rem;font:inherit;font-size:1rem;font-weight:700;background:#000;color:#ffd400;border:2px solid #000;border-radius:.6rem;cursor:pointer}.bugbtn:focus-visible{outline:3px solid #0b4fa8;outline-offset:2px}#bugtxt{width:100%;font:inherit;padding:.6rem;border:2px solid var(--line);border-radius:.5rem;background:var(--bg);color:var(--fg)}.bugok{padding:1rem;border:2px solid #1a7f37;border-radius:.6rem}'; D.head.appendChild(s); })();

 function status(m) { var el = D.getElementById('xstat'); if (!el) return; el.textContent = ''; setTimeout(function () { el.textContent = m; }, 60); }
  function copy(txt, okMsg) {
    function fallback() {
      var ta = D.createElement('textarea'), ok = false;
      ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px'; D.body.appendChild(ta); ta.select();
      try { ok = D.execCommand('copy'); } catch (e) { ok = false; }
      D.body.removeChild(ta);
      status(ok ? okMsg : 'Copying is not available in this browser. Select the report text above and copy it.');
    }
    if (g.navigator.clipboard && g.isSecureContext) g.navigator.clipboard.writeText(txt).then(function () { status(okMsg); }, fallback); else fallback();
  }
  function where() {
    var S = A.S, T = g.CarTroubleTrees || {}, N = T.N || {}, R = T.R || {}, c = A.catById(S.cat), sc = from ? from.screen : 'home', cur = S.cur;
    var names = { home: 'Home screen', pt: 'Car type question', vehicle: 'Car details', saved: 'Saved reports' };
    var t = 'Screen: ' + (sc === 'node' ? (N[cur] ? 'Question' : 'Result') : (names[sc] || sc)) + '\n';
    if (c && sc !== 'home') t += 'Problem area: ' + c.label + '\n';
    if (sc === 'node' && cur) t += 'Step: ' + cur + ' - ' + ((N[cur] && N[cur].q) || (R[cur] && R[cur].t) || 'unknown step') + '\n';
    t += 'Car type: ' + (S.veh.pt ? (A.PTL[S.veh.pt] || S.veh.pt) : 'Not given') + '\n';
    return t;
  }
  function bugText() {
    var S = A.S, t = 'CAR TROUBLE - BUG REPORT\nApp: ' + VERSION + '\n' + where();
    t += 'Screen size: ' + (g.innerWidth || '?') + ' x ' + (g.innerHeight || '?') + '\n';
    t += '\nWhat went wrong (in the tester\'s words):\n' + (desc.trim() || '(not filled in yet)') + '\n';
    if (withAnswers) {
      t += '\nCar: ' + (A.vehLabel() || 'Not given') + '\nAnswers so far:\n' + (S.trail.length ? S.trail.map(function (s, i) { return (i + 1) + '. ' + s.q + ' -> ' + s.a; }).join('\n') : 'None') + '\n';
    }
    return t;
  }
  function upd() { var p = D.getElementById('bugprev'); if (p) p.textContent = bugText(); }
  function needDesc() { if (desc.trim()) return false; status('Please describe the problem in the box first.'); var t = D.getElementById('bugtxt'); if (t) t.focus(); return true; }

 A.screens.bug = function () {
   if (sent) return '<div class="bugok"><h2 tabindex="-1" data-focus>Thank you! Your bug report was sent.</h2><p>The developer will look at it. You can carry on using the app.</p></div>' +
     '<nav class="nav" aria-label="Guide controls"><button type="button" class="btn" data-act="bugback">&larr; Back to where I was</button><button type="button" class="btn2" data-act="bugmore">Report another bug</button></nav>';
   return '<h2 tabindex="-1" data-focus>Found a bug? Tell us</h2><p>Thank you for testing! Describe what went wrong or what was confusing. Nothing is sent until you press Send.</p>' +
     '<div class="field"><label for="bugtxt">What happened, and what did you expect?</label><textarea id="bugtxt" rows="5" maxlength="4000" data-input="bugtxt">' + esc(desc) + '</textarea></div>' +
     '<label class="radio"><input type="checkbox" data-change="bugans"' + (withAnswers ? ' checked' : '') + '> Include my car details and my answers so far (never my VIN or photos)</label>' +
     '<div class="xrow"><button type="button" class="btn" data-act="bugsend"' + (sending ? ' disabled' : '') + '>' + (sending ? 'Sending...' : 'Send bug report') + '</button></div>' +
     '<p class="status" id="xstat" role="status" aria-live="polite"></p>' +
     '<p class="small">The report goes privately to the app developer (through Google Forms). Please do not type your name, phone number, address or VIN.</p>' +
     '<details><summary>See exactly what will be sent</summary><pre class="report" id="bugprev">' + esc(bugText()) + '</pre><button type="button" class="btn2" data-act="bugcopy">Copy it instead</button></details>' +
     '<nav class="nav" aria-label="Guide controls"><button type="button" class="btn2" data-act="bugback">&larr; Back to where I was</button></nav>';
 };
  A.inputs.bugtxt = function (el) { desc = String(el.value || '').slice(0, 4000); upd(); };
  A.changes.bugans = function (el) { withAnswers = !!el.checked; upd(); };
  A.acts.bugcopy = function () { if (needDesc()) return; copy(bugText(), 'Bug report copied. You can paste it into a text message or email.'); };
  A.acts.bugsend = function () {
    if (sending || needDesc()) return;
    if (!g.fetch) { status('Sending is not available in this browser. Open "See exactly what will be sent" and copy it instead.'); return; }
    var body = new g.URLSearchParams(); body.append(FIELD, bugText().slice(0, 6000));
    sending = true; A.render();
    var done = false, timer = setTimeout(function () { if (!done) { done = true; sending = false; A.render(); status('Sending is taking too long. Check your internet connection and try again.'); } }, 15000);
    g.fetch(POST_URL, { method: 'POST', mode: 'no-cors', body: body }).then(function () {
      if (done) return; done = true; clearTimeout(timer); sending = false; sent = true; desc = ''; A.render();
    }, function () {
      if (done) return; done = true; clearTimeout(timer); sending = false; A.render(); status('Could not send. You may be offline. Try again, or open "See exactly what will be sent" and copy it instead.');
    });
  };
  A.acts.bugmore = function () { sent = false; A.render(); };
  function goBack() { A.S.screen = from ? from.screen : 'home'; from = null; sent = false; }
  A.backs = A.backs || {};
  A.backs.bug = goBack;
  A.acts.bugback = function () { goBack(); A.render(); };
  function openBug() { if (!A.S) return; if (A.S.screen !== 'bug') from = { screen: A.S.screen }; sent = false; A.S.screen = 'bug'; A.render(); }
  var bar = D.querySelector('.testbar');
  if (bar) { var b = D.createElement('button'); b.type = 'button'; b.className = 'bugbtn'; b.textContent = 'Found a bug?'; b.addEventListener('click', openBug); bar.appendChild(b); }
  A.bug = { text: bugText, open: openBug, version: VERSION };
  (function () { var s = D.createElement('style'); s.textContent = '.bugbanner{position:relative;margin:.5rem 0 1rem;border-radius:.75rem;overflow:hidden;border:2px solid #000}.bugbanner img{display:block;width:100%;height:auto}.bugbanner p{position:absolute;left:0;right:0;bottom:0;margin:0;padding:.6rem 1rem;font-size:1.3rem;font-weight:800;line-height:1.3;color:#ffd400;text-align:center;background:linear-gradient(transparent,rgba(0,0,0,.85));text-shadow:0 2px 4px #000}'; D.head.appendChild(s); var orig = A.screens.bug; A.screens.bug = function () { var h = orig(); return sent ? h : h.replace('</h2>', '</h2><div class="bugbanner"><img src="bug-city.png?v=1" alt="Cartoon bugs crawling over a circuit-board city"><p>Fuck Bugs, where&rsquo;s this one?</p></div>'); }; })();
})(window);
