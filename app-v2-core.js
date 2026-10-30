/* Car Trouble v2 (STAGING) - app-v2-core.js
Core screens for test.html: home, car type, questions, results, navigation, illustrations and tree validation.
Load order: trees-v2.js, trees-v2b.js, vehicle-data-v2.js, app-v2-core.js, app-v2-vehicle.js, app-v2-extras.js.
Production index.html does not load this file. One state object (CTApp.S). All text is escaped with esc() before display.
Other files plug in through CTApp.screens, .acts, .changes, .inputs, .photoHtml, .resultExtras and .onReset. */
(function (g) {
  'use strict';
  var T = g.CarTroubleTrees, D = g.document;
  var N = T ? T.N : {}, R = T ? T.R : {}, TERMS = T ? T.TERMS : {}, CATS = T ? T.CATS : [];
  var A = g.CTApp = { screens: {}, after: {}, acts: {}, changes: {}, inputs: {}, onReset: [], photoHtml: function () { return ''; }, resultExtras: function () { return ''; } };
  var PTS = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Not sure'];
  var PTL = { Gasoline: 'Gasoline', Diesel: 'Diesel', Hybrid: 'Hybrid (gas + electric)', Electric: 'Fully electric', 'Not sure': 'I’m not sure' };
  var CONF = { confirmed: 'Confirmed by a test you reported', strong: 'Strong evidence', possible: 'Possible cause', insufficient: 'Not enough information yet', stop: 'Safety first — stop here' };
  var DIFF = { beginner: 'Beginner — no tools or experience needed', tools: 'Basic tools — or have a shop do it', advanced: 'Advanced — test equipment and experience needed', pro: 'Professional — have a mechanic do this', emergency: 'Emergency — your safety comes first' };
  var DRIVE = { no: 'Do not drive', caution: 'Drive only if you must — gently and for short distances — until it is checked', ok: 'Likely OK to drive — stop if anything changes or gets worse', '': 'Can’t be judged from your answers. If in doubt, don’t drive' };
  var MISSING = { t: 'This part of the guide isn’t available', c: 'insufficient', why: 'The app reached a step that is missing from its content. This is a fault in the app, not in your car.', step: 'Press Start over and try again, or show this report to a mechanic.', diff: 'pro', drive: '' };
  var memo = {}, root = null;

 function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function blankVeh() { return { year: '', make: '', model: '', engine: null, pt: '', ptFrom: '' }; }
  function newState(veh) { return { screen: 'home', ret: 'home', veh: veh || blankVeh(), cat: null, ptAsked: false, trail: [], cur: null, photos: {} }; }
  function catById(id) { for (var i = 0; i < CATS.length; i++) { if (CATS[i].id === id) return CATS[i]; } return null; }
  function pt() { return (A.S && A.S.veh.pt) || 'Not sure'; }
  function vehLabel(v) { v = v || A.S.veh; var s = [v.year, v.make, v.model].filter(Boolean).join(' '); if (v.engine && v.engine.label) s += (s ? ' · ' : '') + v.engine.label; return s; }

 /* ---------- tree logic ---------- */
 function startFor(c, p) { return (c && c.start && (c.start[p] || c.start.def)) || ''; }
  function shows(cond, p) { if (!cond) return true; if (cond.pt && cond.pt.indexOf(p) < 0) return false; if (cond.no && cond.no.indexOf(p) >= 0) return false; return true; }
  function visibleOpts(id, p) { var n = N[id]; return n && n.opts ? n.opts.filter(function (o) { return shows(o[2], p); }) : []; }
  function resolve(next, c, p) { return next === '@start' ? startFor(c, p) : next; }
  /* Longest number of questions still possible from this node (used for the honest "of up to" progress line). */
 function depth(id, p, c, stack) {
   if (!N[id]) return 0;
   var k = id + '|' + p + '|' + c.id;
   if (k in memo) return memo[k];
   stack = stack || {};
   if (stack[id]) return 0;
   stack[id] = 1;
   var best = 0;
   visibleOpts(id, p).forEach(function (o) { var d = 1 + depth(resolve(o[1], c, p), p, c, stack); if (d > best) best = d; });
   delete stack[id];
   return (memo[k] = best);
 }

 /* Automated content check: missing targets, unknown terms/pictures, invalid fields, dead ends per powertrain, loops, unreachable nodes. */
 function validateTrees() {
   var errors = [], warnings = [], reach = {};
   var CK = { confirmed: 1, strong: 1, possible: 1, insufficient: 1, stop: 1 }, DK = { beginner: 1, tools: 1, advanced: 1, pro: 1, emergency: 1 };
   function exists(id) { return !!(N[id] || R[id]); }
   function checkRefs(where, terms, pic) {
     (terms || []).forEach(function (t) { if (!TERMS[t]) errors.push(where + ' uses unknown term "' + t + '"'); });
     if (pic && !PICS[pic]) errors.push(where + ' uses unknown picture "' + pic + '"');
   }
   Object.keys(N).forEach(function (id) {
     var n = N[id];
     if (R[id]) errors.push(id + ' is both a question and a result');
     if (!n.q) errors.push('Question ' + id + ' has no text');
     if (!n.opts || n.opts.length < 2) errors.push('Question ' + id + ' has fewer than 2 answers');
     (n.opts || []).forEach(function (o) { if (o[1] !== '@start' && !exists(o[1])) errors.push(id + ': answer "' + o[0] + '" points to missing "' + o[1] + '"'); });
     checkRefs('Question ' + id, n.terms, n.pic);
     PTS.forEach(function (p) { if (n.opts && visibleOpts(id, p).length === 0) errors.push('Question ' + id + ' has no answers for ' + p); });
   });
   Object.keys(R).forEach(function (id) {
     var r = R[id];
     if (!r.t || !r.step) errors.push('Result ' + id + ' is missing a title or next step');
     if (!CK[r.c]) errors.push('Result ' + id + ' has an invalid evidence level "' + r.c + '"');
     if (r.diff && !DK[r.diff]) errors.push('Result ' + id + ' has an invalid difficulty "' + r.diff + '"');
     if (!((r.drive || '') in DRIVE)) errors.push('Result ' + id + ' has an invalid drive value "' + r.drive + '"');
     checkRefs('Result ' + id, r.terms, r.pic);
   });
   CATS.forEach(function (c) {
     PTS.forEach(function (p) {
       var s = startFor(c, p);
       if (!exists(s)) { errors.push('Category ' + c.id + ' has a missing start "' + s + '" for ' + p); return; }
       var color = {};
       (function walk(id, path) {
         reach[id] = 1;
         if (!N[id]) return;
         if (color[id] === 1) { errors.push('Loop in ' + c.id + ' (' + p + '): ' + path.concat(id).join(' > ')); return; }
         if (color[id] === 2) return;
         color[id] = 1;
         visibleOpts(id, p).forEach(function (o) { var nx = resolve(o[1], c, p); if (exists(nx)) walk(nx, path.concat(id)); });
         color[id] = 2;
       })('safety', []);
     });
   });
   Object.keys(N).concat(Object.keys(R)).forEach(function (id) { if (!reach[id]) warnings.push('Not reachable from any category: ' + id); });
   function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
   return { errors: uniq(errors), warnings: uniq(warnings), questions: Object.keys(N).length, results: Object.keys(R).length, categories: CATS.length };
 }

 /* ---------- general illustrations (never shown as the user's exact car) ---------- */
 var L = ' font-size="13" text-anchor="middle" fill="currentColor"';
  var FL = [['#3cb371', 'Green, orange, pink or blue-green; sweet smell', 'Coolant'], ['#5a3a1a', 'Light brown to black; oily', 'Engine oil'], ['#c0392b', 'Red or pink; oily', 'Transmission or power-steering fluid'], ['#d4b04a', 'Clear to yellow-brown; slippery', 'Possibly brake fluid (serious)'], ['#3f8fe0', 'Bright blue, thin', 'Windshield washer fluid'], ['#dff1fb', 'Clear water, no smell', 'Usually A/C condensation (normal)']];
  function fluidSvg() {
    var h = '<svg viewBox="0 0 380 ' + (FL.length * 52 + 10) + '" role="img" aria-label="' + esc('Leak color guide. ' + FL.map(function (f) { return f[1] + ': ' + f[2]; }).join('. ')) + '">';
    FL.forEach(function (f, i) { var y = i * 52 + 10; h += '<ellipse cx="34" cy="' + (y + 20) + '" rx="26" ry="16" fill="' + f[0] + '" stroke="#777"/><text x="72" y="' + (y + 16) + '" font-size="14" font-weight="bold" fill="currentColor">' + esc(f[2]) + '</text><text x="72" y="' + (y + 34) + '" font-size="13" fill="currentColor">' + esc(f[1]) + '</text>'; });
    return h + '</svg>';
  }
  var PICS = {
    battery: { cap: 'A typical car battery. Yours may look different, sit in another place, or be under a plastic cover.', svg: '<svg viewBox="0 0 320 200" role="img" aria-label="Drawing of a car battery: a box with a positive post marked plus and a negative post marked minus, each with a cable clamp. Crusty white and green buildup is shown on the positive clamp."><rect x="40" y="80" width="240" height="110" rx="10" fill="#2b2b2b"/><rect x="70" y="56" width="44" height="28" rx="4" fill="#b03030"/><rect x="206" y="56" width="44" height="28" rx="4" fill="#666"/><circle cx="78" cy="60" r="9" fill="#d8ecd0"/><circle cx="96" cy="54" r="7" fill="#eef5e6"/><circle cx="108" cy="62" r="6" fill="#a9d6cc"/><text x="92" y="145" font-size="44" text-anchor="middle" fill="#fff">+</text><text x="228" y="145" font-size="44" text-anchor="middle" fill="#fff">–</text><text x="92" y="20"' + L + '>+ positive (often red)</text><text x="92" y="40"' + L + '>crusty buildup</text><text x="228" y="20"' + L + '>– negative</text><text x="228" y="40"' + L + '>clamp on post</text></svg>' },
    dash: { cap: 'Some common warning symbols. Yours may look a little different — your owner’s manual shows the exact ones for your car.', svg: '<svg viewBox="0 0 360 240" role="img" aria-label="Six common dashboard warning symbols: an engine outline for check engine, an oil can for oil pressure, a battery for charging, a thermometer in liquid for engine temperature, a tire cross-section with an exclamation mark for tire pressure, and a key for the security system."><g fill="none" stroke-width="4" stroke-linejoin="round"><path d="M22 50h14v-10h28v10h10l8 8h8v-8h6v32h-6v-8h-8l-10 10H36l-14-14z" stroke="#d48a00"/><path d="M140 72l18-14h38l16 6 22-10-14 24-14 8h-66z" stroke="#c62828"/><rect x="262" y="46" width="76" height="40" rx="4" stroke="#c62828"/><path d="M60 132v42" stroke="#c62828" stroke-width="6"/><path d="M28 202q8-6 16 0t16 0t16 0t16 0" stroke="#c62828"/><path d="M152 146c-14 18-14 36 0 54h56c14-18 14-36 0-54" stroke="#d48a00"/><circle cx="280" cy="170" r="14" stroke="#d48a00"/><path d="M294 170h44M326 170v12M314 170v8" stroke="#d48a00"/></g><circle cx="234" cy="80" r="4" fill="#c62828"/><circle cx="60" cy="182" r="9" fill="#c62828"/><rect x="272" y="38" width="12" height="8" fill="#c62828"/><rect x="316" y="38" width="12" height="8" fill="#c62828"/><text x="284" y="76" font-size="22" text-anchor="middle" fill="#c62828">+</text><text x="324" y="76" font-size="22" text-anchor="middle" fill="#c62828">–</text><text x="180" y="186" font-size="30" font-weight="bold" text-anchor="middle" fill="#d48a00">!</text><text x="60" y="108"' + L + '>Check engine</text><text x="180" y="108"' + L + '>Oil pressure</text><text x="300" y="108"' + L + '>Battery / charging</text><text x="60" y="228"' + L + '>Engine temperature</text><text x="180" y="228"' + L + '>Tire pressure</text><text x="300" y="228"' + L + '>Key / security</text></svg>' },
    reservoir: { cap: 'A typical coolant overflow tank. The shape, color and location vary between cars.', svg: '<svg viewBox="0 0 320 230" role="img" aria-label="Drawing of a see-through coolant overflow tank with MAX and MIN lines on its side and colored liquid between them, and a cap on top."><rect x="130" y="24" width="60" height="22" rx="5" fill="#333"/><rect x="90" y="44" width="140" height="160" rx="16" fill="#eef2f7" stroke="#888" stroke-width="3"/><rect x="93" y="112" width="134" height="89" rx="12" fill="#3cb371" opacity=".85"/><path d="M90 84h30M90 154h30" stroke="#333" stroke-width="3"/><text x="80" y="89" font-size="15" text-anchor="end" fill="currentColor">MAX</text><text x="80" y="159" font-size="15" text-anchor="end" fill="currentColor">MIN</text><text x="160" y="16"' + L + '>cap — never open when hot</text><text x="160" y="222"' + L + '>liquid level (color varies)</text></svg>' },
    fluids: { cap: 'A general guide to leak colors. Colors can vary and fade, so treat this as a clue, not proof.', svg: fluidSvg() },
    dipstick: { cap: 'The end of a typical oil dipstick. Some cars have no dipstick and show oil level on a screen — see your owner’s manual.', svg: '<svg viewBox="0 0 340 130" role="img" aria-label="Drawing of the end of an engine oil dipstick with a low mark and a full mark. The oil film should end between the two marks."><rect x="20" y="58" width="270" height="14" rx="7" fill="#bbb"/><rect x="20" y="58" width="140" height="14" rx="7" fill="#8a5a14" opacity=".85"/><circle cx="306" cy="65" r="16" fill="none" stroke="#e0a800" stroke-width="6"/><path d="M100 46v38M200 46v38" stroke="#333" stroke-width="3"/><text x="100" y="36"' + L + '>low (MIN)</text><text x="200" y="36"' + L + '>full (MAX)</text><text x="150" y="110"' + L + '>The oil film should end between the marks</text></svg>' },
    tire: { cap: 'A general tire drawing. Any bulge, bubble, cut or exposed cord means the tire is unsafe.', svg: '<svg viewBox="0 0 340 200" role="img" aria-label="Drawing of a tire seen from the side, showing the tread that touches the road, the sidewall, and a bulge on the sidewall."><circle cx="120" cy="100" r="88" fill="#2b2b2b"/><circle cx="120" cy="100" r="50" fill="#aaa"/><circle cx="120" cy="100" r="10" fill="#666"/><ellipse cx="176" cy="58" rx="17" ry="13" fill="#444" stroke="#e53935" stroke-width="3"/><path d="M194 52h30M190 112h34M200 170h24" stroke="currentColor" stroke-width="2"/><text x="282" y="46"' + L + '>bulge or bubble:</text><text x="282" y="64"' + L + '>don’t drive</text><text x="282" y="116"' + L + '>sidewall</text><text x="282" y="174"' + L + '>tread</text></svg>' },
    penny: { cap: 'The penny test is a rough check only. A tire shop can measure tread depth exactly.', svg: '<svg viewBox="0 0 320 210" role="img" aria-label="Drawing of a penny placed head-first into a tire tread groove. If you can see the top of Lincoln’s head, the tread is worn and the tire should be replaced."><rect x="20" y="120" width="280" height="70" fill="#2b2b2b"/><rect x="138" y="120" width="44" height="70" fill="#111"/><circle cx="160" cy="118" r="40" fill="#b87333" stroke="#7a4a20" stroke-width="2"/><ellipse cx="160" cy="112" rx="14" ry="18" fill="#9a5f2a"/><path d="M160 30v40" stroke="currentColor" stroke-width="2"/><path d="M152 62l8 10 8-10" fill="none" stroke="currentColor" stroke-width="2"/><text x="160" y="20"' + L + '>Lincoln’s head pointing down into the groove</text><text x="160" y="205"' + L + '>See all of his head? The tread is worn.</text></svg>' }
  };

 /* ---------- shared HTML pieces ---------- */
 function navHtml(back) { return '<nav class="nav" aria-label="Guide controls">' + (back !== false ? '<button type="button" class="btn2" data-act="back">← Back</button>' : '') + '<button type="button" class="btn2" data-act="restart">Start over</button></nav>'; }
  function termsHtml(ids) { return (ids || []).map(function (t) { var x = TERMS[t]; return x ? '<details class="more"><summary>' + esc(x[0]) + '</summary><p>' + esc(x[1]) + '</p></details>' : ''; }).join(''); }
  function picHtml(id) { var p = PICS[id]; return p ? '<details class="more pic"><summary>Show me what that looks like</summary><figure>' + p.svg + '<figcaption>' + esc(p.cap) + '</figcaption></figure></details>' : ''; }
  function lookHtml(l) {
    if (!l) return '';
    var rows = [['What it looks like', l.what], ['Where it usually is', l.where], ['What to look for', l.how], ['If you can’t find it', l.cant]];
    var h = (l.safe ? '<p class="warn"><strong>Safety:</strong> ' + esc(l.safe) + '</p>' : '') + '<details class="more"><summary>How to check this</summary><dl>';
    rows.forEach(function (r) { if (r[1]) h += '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>'; });
    return h + '</dl></details>';
  }
  function crumb() { var c = catById(A.S.cat), v = vehLabel(); return '<p class="crumb">' + esc(c ? c.label : '') + (v ? ' · ' + esc(v) : (A.S.veh.pt && A.S.veh.pt !== 'Not sure' ? ' · ' + esc(PTL[A.S.veh.pt]) : '')) + '</p>'; }
  function disclaimer() { return '<p class="small">Car Trouble gives general guidance based on your answers. It can’t see or test your car, and it never confirms a repair. If you’re unsure, ask a qualified mechanic. In an emergency, call your local emergency number (911 in the U.S.).</p>'; }

 /* ---------- screens ---------- */
 function homeHtml() {
   var S = A.S, v = vehLabel(), n = A.savedCount ? A.savedCount() : 0;
   var car = v ? 'Your car: <strong>' + esc(v) + '</strong>' : (S.veh.pt ? 'Car type: <strong>' + esc(PTL[S.veh.pt]) + '</strong>' : 'No car details yet — that’s fine.');
   var h = '<h1 class="title" tabindex="-1" data-focus>What’s wrong with your car?</h1><p class="lead">Choose the problem that fits best. We’ll ask simple questions, one at a time. You don’t need to know anything about cars.</p>' +
     '<div class="vehbar"><span>' + car + '</span> <button type="button" class="link" data-act="vehicle">' + (v || S.veh.pt ? 'Change car details' : 'Add car details (optional)') + '</button></div><div class="cats">';
   CATS.forEach(function (c) { h += '<button type="button" class="cat" data-act="cat" data-id="' + esc(c.id) + '"><span class="icon" aria-hidden="true">' + esc(c.icon) + '</span><span class="cl">' + esc(c.label) + '</span><span class="cs">' + esc(c.sub) + '</span></button>'; });
   h += '</div>';
   if (A.screens.saved) h += '<p><button type="button" class="link" data-act="saved">Reports saved on this device (' + n + ')</button></p>';
   return h + disclaimer();
 }
  function ptHtml() {
    var h = crumb() + '<h2 tabindex="-1" data-focus>What kind of car is it?</h2><p class="help">Different kinds of cars need different checks. If you don’t know, choose “I’m not sure” — that’s fine.</p><div class="opts">';
    PTS.forEach(function (p) { h += '<button type="button" class="opt" data-act="pt" data-pt="' + esc(p) + '">' + esc(PTL[p]) + '</button>'; });
    h += '</div>';
    if (A.screens.vehicle) h += '<p><button type="button" class="link" data-act="vehicle">Or look up my car by year, make and model, or by VIN</button></p>';
    return h + navHtml();
  }
  function questionHtml() {
    var S = A.S, c = catById(S.cat), n = N[S.cur], p = pt(), opts = visibleOpts(S.cur, p);
    var step = S.trail.length + 1, total = Math.max(step, S.trail.length + depth(S.cur, p, c));
    var h = crumb() + '<div class="prog" aria-hidden="true"><span style="width:' + Math.round(100 * (step - 1) / total) + '%"></span></div>' +
      '<p class="steps">Question ' + step + ' of up to ' + total + '</p><h2 tabindex="-1" data-focus>' + esc(n.q) + '</h2>';
    if (S.cur === startFor(c, p) && c.note && c.note[p]) h += '<p class="note">' + esc(c.note[p]) + '</p>';
    if (n.help) h += '<p class="help">' + esc(n.help) + '</p>';
    h += lookHtml(n.look) + termsHtml(n.terms) + picHtml(n.pic) + '<div class="opts" role="group" aria-label="Answers">';
    opts.forEach(function (o, i) { h += '<button type="button" class="opt" data-act="ans" data-i="' + i + '">' + esc(o[0]) + '</button>'; });
    h += '</div>';
    if (n.photo) h += A.photoHtml(S.cur);
    return h + navHtml();
  }
  function proText(r) {
    if (r.diff === 'emergency') return 'Get yourself to safety first, then arrange help (roadside assistance, a tow, or emergency services).';
    if (r.diff === 'pro' || r.diff === 'advanced') return 'Yes — this needs a mechanic’s testing or repair.';
    if (r.c === 'insufficient') return 'Probably — a mechanic can test what we couldn’t check here.';
    if (r.diff === 'tools') return 'Optional — you can do this if you have the tools and feel comfortable, or a shop can do it.';
    return 'Not necessarily — but see a mechanic if it happens again or you’re unsure.';
  }
  function resultHtml() {
    var S = A.S, r = R[S.cur] || MISSING;
    var h = crumb() + '<p class="steps">Result</p><h2 tabindex="-1" data-focus>' + esc(r.t) + '</h2>' +
      '<p class="badge c-' + esc(r.c) + '">' + esc(CONF[r.c] || CONF.insufficient) + '</p>' +
      '<div class="drive d-' + esc(r.drive || 'unknown') + '"><strong>Is it safe to drive?</strong> ' + esc(DRIVE[r.drive || ''] || DRIVE['']) + '</div>' +
      (r.safe ? '<p class="warn"><strong>Safety:</strong> ' + esc(r.safe) + '</p>' : '') +
      '<h3>What to do next</h3><p>' + esc(r.step) + '</p>' +
      (r.why ? '<h3>Why we think this</h3><p>' + esc(r.why) + '</p>' : '') +
      (r.unk ? '<h3>What we can’t tell yet</h3><p>' + esc(r.unk) + '</p>' : '') +
      '<dl class="facts"><dt>How hard is it?</dt><dd>' + esc(DIFF[r.diff] || 'Not rated') + '</dd>' + (r.tools ? '<dt>Tools</dt><dd>' + esc(r.tools) + '</dd>' : '') +
      '<dt>Do you need a professional?</dt><dd>' + esc(proText(r)) + '</dd></dl>' + termsHtml(r.terms) + picHtml(r.pic) +
      '<h3>What you told us</h3><ol class="told">' + S.trail.map(function (s) { return '<li>' + esc(s.q) + '<br><strong>' + esc(s.a) + '</strong>' + (s.test ? ' <span class="tag">test result</span>' : '') + '</li>'; }).join('') + '</ol>';
    if (r.need) h += '<details class="more"><summary>Tests a mechanic may need to do</summary><p>' + esc(r.need) + '</p></details>';
    if (r.tech && r.tech.length) h += '<details class="more"><summary>Technical details (for a mechanic)</summary><ol>' + r.tech.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>';
    if (r.c !== 'stop' || r.diff !== 'emergency') h += A.photoHtml('result:' + S.cur);
    return h + A.resultExtras(r) + disclaimer() + navHtml();
  }
  A.screens.home = homeHtml;
  A.screens.pt = ptHtml;
  A.screens.node = function () { return N[A.S.cur] ? questionHtml() : resultHtml(); };

 /* ---------- flow ---------- */
 function begin() { var S = A.S; S.trail = []; S.cur = 'safety'; S.screen = 'node'; render(); }
  function pickCat(id) {
    var S = A.S;
    if (!catById(id)) return;
    S.cat = id; S.trail = []; S.cur = null;
    if (S.veh.pt) { S.ptAsked = false; begin(); } else { S.ptAsked = true; S.screen = 'pt'; render(); }
  }
  function answer(i) {
    var S = A.S, c = catById(S.cat), p = pt(), o = visibleOpts(S.cur, p)[i];
    if (!o || !N[S.cur]) return;
    var next = resolve(o[1], c, p);
    if (!N[next] && !R[next]) console.error('Car Trouble: missing step "' + next + '" after "' + S.cur + '"');
    S.trail.push({ id: S.cur, q: N[S.cur].q, a: o[0], test: !!(o[2] && o[2].t) });
    S.cur = next;
    render();
  }
  function back() {
    var S = A.S;
    if (S.screen === 'node') {
      if (S.trail.length) S.cur = S.trail.pop().id;
      else { S.cur = null; S.screen = S.ptAsked ? 'pt' : 'home'; if (!S.ptAsked) S.cat = null; }
    } else if (S.screen === 'pt') { S.screen = 'home'; S.cat = null; }
    else if (A.backs && A.backs[S.screen]) { A.backs[S.screen](); }
    else { S.screen = S.ret || 'home'; }
    render();
  }
  function restart() {
    var S = A.S;
    if (S.trail.length && g.confirm && !g.confirm('Start over? Your answers in this guide will be cleared.')) return;
    A.onReset.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
    A.S = newState(S.veh);
    render();
  }
  /* Called by app-v2-vehicle.js after car details change. Any diagnosis in progress is discarded. */
 function vehicleSaved() {
   var S = A.S;
   S.trail = []; S.cur = null;
   if (S.ret === 'pt' && S.cat) { if (S.veh.pt) { S.ptAsked = true; begin(); return; } S.screen = 'pt'; }
   else { S.screen = 'home'; S.cat = null; }
   render();
 }
  A.acts.cat = function (el) { pickCat(el.getAttribute('data-id')); };
  A.acts.pt = function (el) { var p = el.getAttribute('data-pt'); if (PTS.indexOf(p) < 0) return; A.S.veh.pt = p; A.S.veh.ptFrom = 'you'; begin(); };
  A.acts.ans = function (el) { answer(parseInt(el.getAttribute('data-i'), 10)); };
  A.acts.back = function () { back(); };
  A.acts.restart = function () { restart(); };
  A.acts.home = function () { A.S.screen = 'home'; A.S.cat = null; A.S.trail = []; A.S.cur = null; render(); };
  A.acts.vehicle = function () { var S = A.S; if (!A.screens.vehicle) return; S.ret = S.screen === 'pt' ? 'pt' : 'home'; S.screen = 'vehicle'; render(); };

 /* ---------- rendering and events ---------- */
 /* Keeps one history entry while inside the app so the phone's Back button steps back instead of leaving the page. */
 function guard() { try { if (!(g.history.state && g.history.state.ct)) g.history.pushState({ ct: 1 }, ''); } catch (e) { /* ignore */ } }
  function onPop() { if (A.S && A.S.screen !== 'home') back(); }
  function render(noFocus) {
    var S = A.S, f = A.screens[S.screen], h;
    try { h = f ? f() : homeHtml(); }
    catch (e) { console.error(e); h = '<h2 tabindex="-1" data-focus>Something went wrong</h2><p>Sorry — this screen couldn’t be shown. Nothing has happened to your car. Press Start over to try again.</p>' + navHtml(false); }
    root.innerHTML = h;
    if (A.after[S.screen]) { try { A.after[S.screen](); } catch (e) { console.error(e); } }
    if (S.screen !== 'home') guard();
    if (!noFocus) {
      var t = root.querySelector('[data-focus]');
      if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
      g.scrollTo(0, 0);
    }
  }
  function init() {
    root = D.getElementById('app');
    if (!root) return;
    if (!T || !N.safety) { root.innerHTML = '<p class="warn">The diagnostic questions didn’t load. Please check your connection and refresh the page.</p>'; return; }
    A.S = newState();
    root.addEventListener('click', function (ev) {
      var el = ev.target && ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (!el || !root.contains(el)) return;
      var f = A.acts[el.getAttribute('data-act')];
      if (f) { ev.preventDefault(); f(el, ev); }
    });
    root.addEventListener('change', function (ev) { var el = ev.target, k = el && el.getAttribute && el.getAttribute('data-change'); if (k && A.changes[k]) A.changes[k](el, ev); });
    root.addEventListener('input', function (ev) { var el = ev.target, k = el && el.getAttribute && el.getAttribute('data-input'); if (k && A.inputs[k]) A.inputs[k](el, ev); });
    root.addEventListener('error', function (ev) {
      var t = ev.target;
      if (t && t.tagName === 'IMG' && t.hasAttribute('data-ph')) { var s = D.createElement('span'); s.className = 'small'; s.textContent = 'Photo attached. This browser can’t show a preview of this file type.'; t.parentNode.replaceChild(s, t); }
    }, true);
    g.addEventListener('popstate', onPop);
    var v = validateTrees();
    if (v.errors.length) console.error('Car Trouble content errors (' + v.errors.length + '):', v.errors);
    render(true);
  }

 A.esc = esc; A.render = render; A.newState = newState; A.blankVeh = blankVeh; A.validateTrees = validateTrees; A.visibleOpts = visibleOpts; A.startFor = startFor;
  A.resolve = resolve; A.catById = catById; A.pt = pt; A.vehLabel = vehLabel; A.navHtml = navHtml; A.termsHtml = termsHtml; A.picHtml = picHtml; A.disclaimer = disclaimer;
  A.begin = begin; A.answer = answer; A.back = back; A.restart = restart; A.pickCat = pickCat; A.vehicleSaved = vehicleSaved; A.depth = depth;
  A.PTS = PTS; A.PTL = PTL; A.CONF = CONF; A.DIFF = DIFF; A.DRIVE = DRIVE; A.PICS = PICS; A.MISSING = MISSING; A.proText = proText;
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})(window);
