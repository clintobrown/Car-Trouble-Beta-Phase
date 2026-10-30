/* Car Trouble v2 (BETA) - app-v2-bug.js
"Found a bug?" button (in the yellow banner) and bug report screen. Loaded by test.html only.
Nothing is sent automatically. The tester sees the whole report first, then chooses to copy it or open a GitHub issue themselves.
A bug report never includes the VIN or photos. Car details and answers are included only if the tester ticks the box.
To use a form instead (for example Google Forms or Tally), put its link in FORM_URL below. */
(function (g) {
  'use strict';
  var A = g.CTApp, D = g.document;
  if (!A) return;
  var VERSION = 'v2 beta (2026-10-30)';
  var FORM_URL = '';
  var ISSUES = 'https://github.com/clintobrown/car-trouble/issues/new';
  var desc = '', withAnswers = false, from = null;
  function esc(s) { return A.esc(s); }

 (function () { var s = D.createElement('style'); s.textContent = '.bugbtn{display:inline-block;margin:.3rem 0 0 .6rem;min-height:2.5rem;padding:.3rem .9rem;font:inherit;font-size:1rem;font-weight:700;background:#000;color:#ffd400;border:2px solid #000;border-radius:.6rem;cursor:pointer}.bugbtn:focus-visible{outline:3px solid #0b4fa8;outline-offset:2px}#bugtxt{width:100%;font:inherit;padding:.6rem;border:2px solid var(--line);border-radius:.5rem;background:var(--bg);color:var(--fg)}'; D.head.appendChild(s); })();

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
    t += '\nWhat went wrong (in the tester\'s words):\n' + (desc.trim() || '(not filled in yet)') + '\n';
    if (withAnswers) {
      t += '\nCar: ' + (A.vehLabel() || 'Not given') + '\nAnswers so far:\n' + (S.trail.length ? S.trail.map(function (s, i) { return (i + 1) + '. ' + s.q + ' -> ' + s.a; }).join('\n') : 'None') + '\n';
    }
    return t;
  }
  function upd() { var p = D.getElementById('bugprev'); if (p) p.textContent = bugText(); }
  function needDesc() { if (desc.trim()) return false; status('Please describe the problem in the box first.'); var t = D.getElementById('bugtxt'); if (t) t.focus(); return true; }

 A.screens.bug = function () {
   return '<h2 tabindex="-1" data-focus>Found a bug? Tell us</h2><p>Thank you for testing! Describe what went wrong or what was confusing. Nothing is sent until you choose how to send it below.</p>' +
     '<div class="field"><label for="bugtxt">What happened, and what did you expect?</label><textarea id="bugtxt" rows="5" maxlength="4000" data-input="bugtxt">' + esc(desc) + '</textarea></div>' +
     '<label class="radio"><input type="checkbox" data-change="bugans"' + (withAnswers ? ' checked' : '') + '> Include my car details and my answers so far (never my VIN or photos)</label>' +
     '<h3>This is exactly what will be sent</h3><pre class="report" id="bugprev">' + esc(bugText()) + '</pre>' +
     '<div class="xrow"><button type="button" class="btn" data-act="bugcopy">Copy bug report</button>' + (FORM_URL ? '<button type="button" class="btn2" data-act="bugform">Open the bug report form</button>' : '') + '<button type="button" class="btn2" data-act="buggh">Report it on GitHub</button></div>' +
     '<p class="status" id="xstat" role="status" aria-live="polite"></p>' +
     '<p class="small"><strong>Copy bug report:</strong> then paste it into a text message or email to the person who shared this app with you. ' + (FORM_URL ? '<strong>Form:</strong> the report is copied for you to paste into the form. ' : '') + '<strong>GitHub:</strong> needs a free GitHub account, and reports there are public, so do not include your name, phone number, address or VIN.</p>' +
     '<nav class="nav" aria-label="Guide controls"><button type="button" class="btn2" data-act="bugback">&larr; Back to where I was</button></nav>';
 };
  A.inputs.bugtxt = function (el) { desc = String(el.value || '').slice(0, 4000); upd(); };
  A.changes.bugans = function (el) { withAnswers = !!el.checked; upd(); };
  A.acts.bugcopy = function () { if (needDesc()) return; copy(bugText(), 'Bug report copied. Paste it into a text message or email.'); };
  A.acts.bugform = function () { if (needDesc() || !FORM_URL) return; copy(bugText(), 'Bug report copied. Paste it into the form that just opened.'); g.open(FORM_URL, '_blank', 'noopener'); };
  A.acts.buggh = function () {
    if (needDesc()) return;
    var body = bugText(); if (body.length > 6000) body = body.slice(0, 6000) + '\n(cut short)';
    var title = 'Beta bug: ' + desc.trim().split('\n')[0].slice(0, 70);
    g.open(ISSUES + '?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body), '_blank', 'noopener');
    status('GitHub should open in a new tab. Check the report there, then press the green button to submit it.');
  };
  function goBack() { A.S.screen = from ? from.screen : 'home'; from = null; }
  A.backs = A.backs || {};
  A.backs.bug = goBack;
  A.acts.bugback = function () { goBack(); A.render(); };
  function openBug() { if (!A.S) return; if (A.S.screen !== 'bug') from = { screen: A.S.screen }; A.S.screen = 'bug'; A.render(); }
  var bar = D.querySelector('.testbar');
  if (bar) { var b = D.createElement('button'); b.type = 'button'; b.className = 'bugbtn'; b.textContent = 'Found a bug?'; b.addEventListener('click', openBug); bar.appendChild(b); }
  A.bug = { text: bugText, open: openBug, version: VERSION };
})(window);
