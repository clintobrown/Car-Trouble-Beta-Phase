/* Car Trouble v2 (STAGING) - app-v2-extras.js
Report (copy, print, download), summary for a mechanic, optional photos and optional saved reports.
Loaded by test.html after app-v2-core.js and app-v2-vehicle.js. Production index.html does not load this file.
Privacy: photos stay in this browser tab only. They are never uploaded, stored or analyzed.
Saved reports are plain text in this browser's localStorage, with no VIN and no photos. */
(function (g) {
  'use strict';
  var A = g.CTApp, D = g.document;
  if (!A) return;
  var T = g.CarTroubleTrees || {}, R = T.R || {};
  var KEY = 'carTroubleV2Saved', MAXSAVED = 30, MAXMB = 20, errs = {}, pending = null;
  function esc(s) { return A.esc(s); }

 /* Styles for this file, plus the fix for car-type choices showing in bold. */
 (function () { var s = D.createElement('style'); s.textContent = '.field .radio,.field .radio label,.field label.radio{font-weight:400}.phpick{margin:1.2rem 0;padding:.8rem;border:2px dashed #999;border-radius:10px}.phpick label{display:block;font-weight:700;margin:.4rem 0}.phpick input[type=file]{font-size:1.05rem;padding:.5rem 0;max-width:100%}.phprev img{display:block;max-width:100%;max-height:300px;border-radius:8px;margin:.5rem 0}.xrow{display:flex;flex-wrap:wrap;gap:.6rem;margin:.8rem 0}.saved li{margin:.6rem 0}'; D.head.appendChild(s); })();

 /* ---------- storage ---------- */
 var STORE = (function () { try { var k = '__ct_t'; g.localStorage.setItem(k, '1'); g.localStorage.removeItem(k); return true; } catch (e) { return false; } })();
  function loadSaved() { if (!STORE) return []; try { var a = JSON.parse(g.localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return x && typeof x.text === 'string' && x.id; }) : []; } catch (e) { return []; } }
  function writeSaved(a) { try { if (a.length) g.localStorage.setItem(KEY, JSON.stringify(a)); else g.localStorage.removeItem(KEY); return true; } catch (e) { return false; } }
  A.savedCount = function () { return loadSaved().length; };

 /* ---------- report text ---------- */
 function now() { var d = new Date(); try { return d.toLocaleString(); } catch (e) { return d.toString(); } }
  function stamp() { var d = new Date(); function p(n) { return (n < 10 ? '0' : '') + n; } return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()); }
  function line(label, v) { return v ? label + ': ' + v + '\n' : ''; }
  function curR() { return R[A.S.cur] || A.MISSING; }
  function photoCount() { return Object.keys(A.S.photos || {}).length; }
  function vehText() {
    var S = A.S, v = A.vehLabel(), p = 'Not given';
    if (S.veh.pt) p = (A.PTL[S.veh.pt] || S.veh.pt) + (S.veh.ptFrom ? (S.veh.ptFrom === 'you' ? ' (chosen by you)' : ' (from ' + S.veh.ptFrom + ')') : '');
    return 'Car: ' + (v || 'Not given') + '\nCar type: ' + p + '\n';
  }
  function reportText(r) {
    var S = A.S, c = A.catById(S.cat), n = photoCount(), t = '';
    t += 'CAR TROUBLE - DIAGNOSTIC REPORT (TEST VERSION)\nCreated: ' + now() + '\n\n' + vehText() + 'Problem: ' + (c ? c.label : 'Not chosen') + '\n\n';
    t += 'WHAT YOU REPORTED (your answers - these are the facts)\n';
    t += S.trail.length ? S.trail.map(function (s, i) { return (i + 1) + '. ' + s.q + '\n   Answer: ' + s.a + (s.test ? ' (result of a check you did)' : ''); }).join('\n') + '\n' : 'No answers recorded.\n';
    t += '\nWHAT THIS SUGGESTS (worked out from your answers - NOT a confirmed repair)\n' + r.t + '\n';
    t += line('Evidence', A.CONF[r.c] || A.CONF.insufficient) + line('Is it safe to drive', A.DRIVE[r.drive || ''] || A.DRIVE['']) + line('Safety', r.safe) + line('What to do next', r.step) + line('Why we think this', r.why) + line('What we cannot tell yet', r.unk) + line('How hard is it', A.DIFF[r.diff]) + line('Tools', r.tools) + line('Do you need a professional', A.proText(r)) + line('Tests a mechanic may need to do', r.need);
    if (n) t += '\nPhotos: ' + n + ' attached on this device only. They are not part of this report.\n';
    t += '\nLIMITATIONS\nCar Trouble gives general guidance based on your answers. It cannot see or test the car, and nothing here is a confirmed diagnosis or repair. No VIN (vehicle identification number) is included.\n';
    return t;
  }
  function mechText(r) {
    var S = A.S, c = A.catById(S.cat), tests = S.trail.filter(function (s) { return s.test; }), t = '';
    t += 'SUMMARY FOR A MECHANIC (from the Car Trouble self-help guide, test version)\nDate: ' + now() + '\n' + vehText() + 'Complaint: ' + (c ? c.label : 'Not given') + '\n\n';
    t += 'Owner observations:\n' + (S.trail.length ? S.trail.map(function (s) { return '- ' + s.q + ' -> ' + s.a; }).join('\n') : '- None recorded') + '\n\n';
    t += 'Checks the owner did:\n' + (tests.length ? tests.map(function (s) { return '- ' + s.q + ' -> ' + s.a; }).join('\n') : '- None reported') + '\n\n';
    t += 'Where the guide ended (a suspicion, not a diagnosis): ' + r.t + '\n' + line('Evidence level', A.CONF[r.c] || A.CONF.insufficient) + line('Suggested tests', r.need);
    if (r.tech && r.tech.length) t += 'Technical notes:\n' + r.tech.map(function (x) { return '- ' + x; }).join('\n') + '\n';
    t += line('Safety note given to the owner', r.safe) + line('Driving advice given to the owner', A.DRIVE[r.drive || ''] || A.DRIVE['']);
    if (photoCount()) t += 'The owner has ' + photoCount() + ' photo(s) on their device.\n';
    t += '\nPlease confirm the cause with your own testing before replacing any parts.\n';
    return t;
  }

 /* ---------- copy / print / download ---------- */
 function status(m) { var el = D.getElementById('xstat'); if (!el) return; el.textContent = ''; setTimeout(function () { el.textContent = m; }, 60); }
  function copyText(txt, okMsg) {
    function fallback() {
      var ta = D.createElement('textarea'), ok = false;
      ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px'; D.body.appendChild(ta); ta.select();
      try { ok = D.execCommand('copy'); } catch (e) { ok = false; }
      D.body.removeChild(ta);
      status(ok ? okMsg : 'Copying is not available in this browser. Open the report text below, then select it and copy it.');
    }
    if (g.navigator.clipboard && g.isSecureContext) g.navigator.clipboard.writeText(txt).then(function () { status(okMsg); }, fallback); else fallback();
  }
  function download(txt) {
    try {
      var b = new Blob([txt], { type: 'text/plain;charset=utf-8' }), u = URL.createObjectURL(b), a = D.createElement('a');
      a.href = u; a.download = 'car-trouble-report-' + stamp() + '.txt'; D.body.appendChild(a); a.click(); D.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
      status('Download started. Look in your Downloads folder (on an iPhone, the Files app).');
    } catch (e) { status('Downloading is not available in this browser. Use Copy report instead.'); }
  }
  A.resultExtras = function () {
    var r = curR();
    return '<section class="noprint" aria-label="Keep or share this result"><h3>Keep or share this result</h3><div class="xrow">' +
      '<button type="button" class="btn" data-act="xcopy">Copy report</button>' +
      '<button type="button" class="btn2" data-act="xprint">Print</button>' +
      '<button type="button" class="btn2" data-act="xdl">Download as a text file</button>' +
      (STORE ? '<button type="button" class="btn2" data-act="xsave">Save on this device</button>' : '') +
      '</div><p class="status" id="xstat" role="status" aria-live="polite"></p>' +
      '<details class="more"><summary>See the full report</summary><pre class="report">' + esc(reportText(r)) + '</pre></details>' +
      '<details class="more"><summary>Summary for a mechanic</summary><p class="small">Show or send this to a mechanic. It lists what you saw and checked, and asks them to test before replacing parts.</p><pre class="report">' + esc(mechText(r)) + '</pre><button type="button" class="btn2" data-act="xcopym">Copy mechanic summary</button></details></section>';
  };
  A.acts.xcopy = function () { copyText(reportText(curR()), 'Report copied. You can paste it into a text message or email.'); };
  A.acts.xcopym = function () { copyText(mechText(curR()), 'Mechanic summary copied.'); };
  A.acts.xprint = function () { try { g.print(); } catch (e) { status('Printing is not available here. Use Copy report instead.'); } };
  A.acts.xdl = function () { download(reportText(curR())); };
  A.acts.xsave = function () {
    var S = A.S, r = curR(), c = A.catById(S.cat), a = loadSaved();
    var sig = [S.cat, S.cur, A.vehLabel(), S.veh.pt].concat(S.trail.map(function (s) { return s.a; })).join('|');
    for (var i = 0; i < a.length; i++) { if (a[i].sig === sig) { status('This result is already saved on this device.'); return; } }
    a.unshift({ id: String(Date.now()) + String(Math.floor(Math.random() * 1000)), date: now(), title: (c ? c.label + ': ' : '') + r.t, car: A.vehLabel(), sig: sig, text: reportText(r) });
    if (a.length > MAXSAVED) a = a.slice(0, MAXSAVED);
    status(writeSaved(a) ? 'Saved on this device. Find it on the home screen under "Reports saved on this device". Saved reports can be lost if browser data is cleared.' : 'Sorry, this report could not be saved (storage may be full or turned off). Use Copy or Download instead.');
  };

 /* ---------- saved reports screen ---------- */
 A.screens.saved = function () {
   var a = loadSaved(), h = '<h2 tabindex="-1" data-focus>Reports saved on this device</h2><p class="note">These are kept only in this web browser on this device. They are not backed up or shared, and they can be lost if browser data is cleared or you use private browsing. They never include your VIN or photos.</p>';
   if (!STORE) h += '<p class="warn">This browser is not letting the app save anything (storage may be turned off, or you may be in private browsing).</p>';
   if (!a.length) h += '<p>No saved reports yet. When you reach a result, press "Save on this device".</p>';
   else {
     h += '<ul class="saved">';
     a.forEach(function (x) {
       h += '<li><details class="more"' + (pending === x.id ? ' open' : '') + '><summary>' + esc(x.title) + '<br><span class="small">' + esc(x.date) + (x.car ? ' &middot; ' + esc(x.car) : '') + '</span></summary><pre class="report">' + esc(x.text) + '</pre><div class="xrow">';
       if (pending === x.id) h += '<p><strong>Delete this report? This cannot be undone.</strong></p><button type="button" class="btn" data-act="xdelyes" data-id="' + esc(x.id) + '">Yes, delete it</button><button type="button" class="btn2" data-act="xcancel">Keep it</button>';
       else h += '<button type="button" class="btn2" data-act="xcopys" data-id="' + esc(x.id) + '">Copy</button><button type="button" class="btn2" data-act="xdel" data-id="' + esc(x.id) + '">Delete this report</button>';
       h += '</div></details></li>';
     });
     h += '</ul><div class="xrow">' + (pending === '*' ? '<p><strong>Delete all ' + a.length + ' saved reports? This cannot be undone.</strong></p><button type="button" class="btn" data-act="xclryes">Yes, delete all</button><button type="button" class="btn2" data-act="xcancel">Keep them</button>' : '<button type="button" class="btn2" data-act="xclr">Delete all saved reports</button>') + '</div>';
   }
   return h + '<p class="status" id="xstat" role="status" aria-live="polite"></p><nav class="nav" aria-label="Guide controls"><button type="button" class="btn2" data-act="home">&larr; Back to the start</button></nav>';
 };
  A.backs = A.backs || {};
  A.backs.saved = function () { pending = null; A.S.screen = 'home'; };
  function findSaved(id) { var a = loadSaved(); for (var i = 0; i < a.length; i++) { if (a[i].id === id) return a[i]; } return null; }
  A.acts.saved = function () { pending = null; A.S.screen = 'saved'; A.S.ret = 'home'; A.render(); };
  A.acts.xcopys = function (el) { var x = findSaved(el.getAttribute('data-id')); if (x) copyText(x.text, 'Report copied.'); };
  A.acts.xdel = function (el) { pending = el.getAttribute('data-id'); A.render(true); var b = D.querySelector('[data-act="xdelyes"]'); if (b) b.focus(); };
  A.acts.xclr = function () { pending = '*'; A.render(true); var b = D.querySelector('[data-act="xclryes"]'); if (b) b.focus(); };
  A.acts.xcancel = function () { pending = null; A.render(); };
  A.acts.xdelyes = function (el) { var id = el.getAttribute('data-id'), ok = writeSaved(loadSaved().filter(function (x) { return x.id !== id; })); pending = null; A.render(); status(ok ? 'Report deleted.' : 'Sorry, the report could not be deleted.'); };
  A.acts.xclryes = function () { var ok = writeSaved([]); pending = null; A.render(); status(ok ? 'All saved reports deleted.' : 'Sorry, the reports could not be deleted.'); };

 /* ---------- photos (kept in this tab only) ---------- */
 function revoke(p) { try { if (p && p.url) URL.revokeObjectURL(p.url); } catch (e) { /* ignore */ } }
  function clearPhotos() { var P = A.S && A.S.photos; if (P) Object.keys(P).forEach(function (k) { revoke(P[k]); delete P[k]; }); errs = {}; }
  function pid(key) { return 'ph_' + String(key).replace(/[^a-z0-9]/gi, '_'); }
  function refocus(key) { var el = D.getElementById(pid(key)); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }
  A.onReset.push(clearPhotos);
  var vs = A.vehicleSaved; A.vehicleSaved = function () { clearPhotos(); return vs.apply(this, arguments); };
  var goHome = A.acts.home; A.acts.home = function () { clearPhotos(); pending = null; return goHome.apply(this, arguments); };
  var goCat = A.acts.cat; A.acts.cat = function () { clearPhotos(); return goCat.apply(this, arguments); };
  A.photoHtml = function (key) {
    var p = A.S.photos[key], id = pid(key);
    var h = '<div class="phpick"><h3>Add a photo (optional)</h3><p class="small">A photo can help a mechanic see what you saw. It stays on this device: it is not uploaded, sent or saved, and Car Trouble cannot look at or analyze photos. It is cleared when you start over or close this page.</p>';
    if (p) h += '<div class="phprev"><img data-ph src="' + esc(p.url) + '" alt="Your photo: ' + esc(p.name) + '"><p class="small">' + esc(p.name) + ' (' + esc(p.mb) + ' MB)</p><button type="button" class="btn2" data-act="phrm" data-key="' + esc(key) + '">Remove photo</button></div>';
    h += '<label for="' + id + '">' + (p ? 'Use a different photo' : 'Choose or take a photo') + '</label><input type="file" id="' + id + '" accept="image/*,.heic,.heif" data-change="photo" data-key="' + esc(key) + '">';
    if (errs[key]) h += '<p class="warn" role="alert">' + esc(errs[key]) + '</p>';
    return h + '</div>';
  };
  A.changes.photo = function (el) {
    var key = el.getAttribute('data-key'), f = el.files && el.files[0], u = '';
    if (!key || !f) return;
    delete errs[key];
    var okType = f.type ? /^image\//i.test(f.type) : /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(f.name || '');
    if (!okType) errs[key] = 'That file is not a picture. Please choose a photo (for example JPG, PNG or HEIC).';
    else if (!f.size) errs[key] = 'That file seems to be empty. Please choose another photo.';
    else if (f.size > MAXMB * 1048576) errs[key] = 'That photo is too large (over ' + MAXMB + ' MB). Please choose a smaller one.';
    else {
      try { u = URL.createObjectURL(f); } catch (e) { u = ''; }
      if (!u) errs[key] = 'This browser cannot attach photos.';
      else { revoke(A.S.photos[key]); A.S.photos[key] = { url: u, name: f.name || 'photo', mb: (f.size / 1048576).toFixed(1) }; }
    }
    A.render(true); refocus(key);
  };
  A.acts.phrm = function (el) { var key = el.getAttribute('data-key'); revoke(A.S.photos[key]); delete A.S.photos[key]; delete errs[key]; A.render(true); refocus(key); };

 A.extras = { reportText: reportText, mechText: mechText, loadSaved: loadSaved, storageOk: STORE };
})(window);
