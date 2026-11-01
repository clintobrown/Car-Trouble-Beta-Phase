/* Car Trouble v2 (BETA) - app-v2-theme.js
Modern look (black with royal blue, purple and green) and a car-details-first start.
Loads last, after app-v2-bug.js. Only styles and the car screen change; questions and results are unchanged.
Start: two buttons, "I know my VIN#" or "I don't know my VIN# at the moment". The VIN button shows the VIN lookup;
the other shows the year, make and model menus. Year, make and model are required before Save; engine and car
type stay optional. Car details can be changed later from the problem list. No web fonts or outside files are loaded. */
(function (g) {
'use strict';
var A = g.CTApp, D = g.document;
if (!A) return;

/* ---------- theme ---------- */
var CSS = ':root{color-scheme:dark;--bg:#05060b;--fg:#eef1ff;--muted:#b6bcd8;--line:#2b3156;--accent:#7b93ff;--accent-fg:#ffffff;--soft:#0c0f22;--warn-bg:#2a2108;--warn-line:#f5c451;--no-bg:#2c0c16;--no-line:#ff7088;--ok-bg:#05271a;--ok-line:#34e8a0;--blue:#3d5afe;--purple:#9b5cff;--green:#34e8a0;--card:rgba(14,18,40,.78);--glow:0 0 0 1px rgba(123,147,255,.6),0 10px 34px rgba(61,90,254,.3)}' +
'html{background:#05060b}' +
'body{background:radial-gradient(1100px 620px at 0% -10%,rgba(61,90,254,.24),transparent 60%),radial-gradient(900px 560px at 105% 5%,rgba(155,92,255,.22),transparent 60%),radial-gradient(900px 520px at 50% 115%,rgba(52,232,160,.10),transparent 60%),#05060b;background-attachment:fixed;color:var(--fg);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI Variable","Segoe UI",Roboto,Arial,sans-serif}' +
'.testbar{background:linear-gradient(90deg,rgba(61,90,254,.94),rgba(155,92,255,.94));color:#fff;border-bottom:1px solid rgba(255,255,255,.18);box-shadow:0 6px 24px rgba(61,90,254,.35);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}' +
'.testbar strong{letter-spacing:.14em;text-transform:uppercase;font-size:1.05rem}.testbar a,.testbar span{color:#fff}' +
'main{padding-top:1.5rem}' +
'h1.title{font-size:2.1rem;font-weight:800;letter-spacing:-.01em;background:linear-gradient(90deg,#8ea4ff 0%,#c39bff 50%,#5ff0b8 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}' +
'h2{font-weight:750;letter-spacing:-.005em}h3{color:#aab8ff}.lead,.help,.steps,.crumb,.cat .cs{color:var(--muted)}' +
'.kicker{display:inline-block;margin:0 0 .5rem;padding:.2rem .75rem;border-radius:999px;font-size:.85rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--green);background:rgba(52,232,160,.10);border:1px solid rgba(52,232,160,.4)}' +
'.cat,.opt{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01)),var(--card);border:1px solid var(--line);border-radius:16px;color:var(--fg);transition:border-color .15s,box-shadow .15s,transform .15s}' +
'.cat:hover,.opt:hover{border-color:var(--accent);box-shadow:var(--glow);transform:translateY(-2px)}' +
'.cat{grid-template-columns:2.7rem 1fr;column-gap:.85rem}' +
'.cat .icon{width:2.7rem;height:2.7rem;display:flex;align-items:center;justify-content:center;border-radius:12px;background:linear-gradient(135deg,rgba(61,90,254,.4),rgba(155,92,255,.4));box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-size:1.4rem}' +
'.btn{background:linear-gradient(135deg,var(--blue),var(--purple));border:0;color:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(61,90,254,.35);font-weight:700}.btn:hover{filter:brightness(1.12)}' +
'.btn2{background:rgba(155,92,255,.08);border:1px solid rgba(155,92,255,.6);color:var(--fg);border-radius:12px}.btn2:hover{border-color:var(--green);box-shadow:0 0 0 1px rgba(52,232,160,.45)}' +
'.link{color:#8ea4ff}.link:hover{color:var(--green)}:focus-visible{outline:3px solid var(--green);outline-offset:3px}' +
'.vehbar,details.more,.phpick,.saved li{background:var(--card);border:1px solid var(--line);border-radius:14px}.phpick{border-style:dashed}details.more>summary{color:#a9b8ff}' +
'.prog{background:rgba(255,255,255,.06);border:1px solid var(--line);height:.55rem}.prog span{background:linear-gradient(90deg,var(--blue),var(--purple),var(--green));box-shadow:0 0 12px rgba(155,92,255,.6)}' +
'.badge{border-radius:999px;border-width:1px}.drive,.warn,.note,.handoff{border-radius:14px}.drive{border-width:1px;border-left-width:6px}' +
'select,input[type="text"]{background:#0a0d1d;border:1px solid var(--line);border-radius:12px;color:var(--fg)}select:focus,input[type="text"]:focus{border-color:var(--accent);box-shadow:var(--glow)}.radio input{accent-color:var(--purple)}' +
'pre.report{background:#0a0d1d;border:1px solid var(--line);border-radius:12px}' +
'figure svg{background:#f4f5fb;border-radius:12px;padding:.5rem;color:#111}' +
'.carstep{border:1px solid var(--line);border-radius:18px;padding:.25rem 1.1rem 1rem;background:var(--card);box-shadow:0 20px 60px rgba(0,0,0,.45)}' +
'.vchoice{display:grid;gap:.9rem;margin:1.2rem 0 .6rem}.vchoice .opt{display:block;width:100%;text-align:left;padding:1.15rem 1.25rem;font-size:1.2rem;font-weight:750;cursor:pointer}.vchoice .opt small{display:block;margin-top:.35rem;font-size:.95rem;font-weight:400;color:var(--muted)}' +
'.req{color:var(--green);font-weight:600;font-size:.8em}.optl{color:var(--muted);font-weight:400;font-size:.8em}#v-reqmsg:empty{display:none}' +
'select[aria-invalid="true"],input[aria-invalid="true"]{border-color:var(--no-line);box-shadow:0 0 0 1px var(--no-line)}' +
'@media print{:root{--bg:#fff;--fg:#000;--muted:#333;--line:#999;--soft:#f3f3f3;--card:#fff;--accent:#0b4fa8}body{background:#fff!important;color:#000!important}h1.title{background:none;color:#000;-webkit-text-fill-color:#000}figure svg{background:none}}';
var st = D.createElement('style'); st.id = 'ct-theme'; st.textContent = CSS; D.head.appendChild(st);
var tc = D.createElement('meta'); tc.name = 'theme-color'; tc.content = '#05060b'; D.head.appendChild(tc);

/* ---------- car details first: VIN or menus; year, make and model required ---------- */
var done = false, mode = '';
function $(id) { return D.getElementById(id); }
function hasCar() { var v = A.S && A.S.veh; return !!(v && v.year && v.make && v.model); }
function draftW() { return A.vehicleDebug && A.vehicleDebug.draft ? A.vehicleDebug.draft() : null; }
function intro() { return !done && !!(A.S && A.S.intro); }
var CHOICE = '<div class="carstep"><p class="kicker">Step 1 of 2</p><h2 tabindex="-1" data-focus>First, tell us about your car</h2>' +
'<p class="help">Do you have your VIN (Vehicle Identification Number) handy? It’s the 17-character code at the bottom of the windshield on the driver’s side, on the sticker in the driver’s door frame, and on your registration or insurance card.</p>' +
'<div class="vchoice"><button type="button" class="opt" data-act="vMode" data-mode="vin">I know my VIN#<small>We’ll look up the year, make and model for you.</small></button>' +
'<button type="button" class="opt" data-act="vMode" data-mode="manual">I don’t know my VIN# at the moment<small>Choose the year, make and model from menus.</small></button></div></div>';
var home = A.screens.home, veh = A.screens.vehicle;
if (home && veh) {
A.screens.home = function () {
var S = A.S;
if (!done && !hasCar() && !S.cat) { S.screen = 'vehicle'; S.ret = 'home'; S.intro = true; return A.screens.vehicle(); }
return (S.intro ? '<p class="kicker">Step 2 of 2</p>' : '') + home().replace('Add car details (optional)', 'Add car details');
};
A.screens.vehicle = function () {
var h = veh(), w = draftW(), on = intro();
if (on && !mode) return CHOICE;
h = h.replace('<h2 tabindex="-1" data-focus>Your car (optional)</h2>', on ? '<p class="kicker">Step 1 of 2</p><h2 tabindex="-1" data-focus>' + (mode === 'vin' ? 'Enter your VIN' : 'Choose your car') + '</h2>' : '<h2 tabindex="-1" data-focus>Your car</h2>');
h = h.replace(/<p class="help">Everything here is optional[\s\S]*?<\/p>/, '<p class="help">' + (on && mode === 'vin' ? 'Type your VIN and press Look up VIN, then check the year, make and model.' : 'Year, make and model are required.') + ' Engine and car type are optional, but they help us skip checks that don’t apply to your car.</p>');
h = h.replace('<label for="v-year">Year</label><select id="v-year"', '<label for="v-year">Year <span class="req">(required)</span></label><select id="v-year" required aria-required="true"');
h = h.replace('<label for="v-make">Make (brand)</label><select id="v-make"', '<label for="v-make">Make (brand) <span class="req">(required)</span></label><select id="v-make" required aria-required="true"');
h = h.replace('<label for="v-model">Model</label><select id="v-model"', '<label for="v-model">Model <span class="req">(required)</span></label><select id="v-model" required aria-required="true"');
h = h.replace('<label for="v-engine">Engine</label>', '<label for="v-engine">Engine <span class="optl">(optional)</span></label>');
h = h.replace('What kind of car is it?</legend>', 'What kind of car is it? <span class="optl">(optional)</span></legend>');
h = h.replace('<div class="acts"><button type="button" class="btn" data-act="vSave">', '<p class="status err" id="v-reqmsg" role="alert"></p><div class="acts"><button type="button" class="btn" data-act="vSave">');
if (!on) return h;
if (mode === 'manual') h = h.replace(/<details class="more" id="v-vinbox"[\s\S]*?<\/details>/, '');
else {
h = h.replace(/<details class="more" id="v-vinbox"( open)?>/, '<details class="more" id="v-vinbox" open>').replace('<summary>Have your VIN? Look up the car automatically</summary>', '<summary>Your VIN</summary>');
h = h.replace('<div class="field"><label for="v-year">', '<div id="v-fields"' + (w && w.year ? '' : ' hidden') + '><h3>Check your car</h3><div class="field"><label for="v-year">');
h = h.replace('<p class="status err" id="v-reqmsg"', '</div><p class="status err" id="v-reqmsg"');
}
h = h.replace('<button type="button" class="btn2" data-act="back">Cancel</button>', '<button type="button" class="btn2" data-act="vMode" data-mode="">← Back</button>' + (mode === 'vin' ? '<button type="button" class="btn2" data-act="vMode" data-mode="manual">I’ll choose from menus instead</button>' : ''));
h = h.replace('<button type="button" class="btn2" data-act="vClear">Clear all car details</button>', '');
return '<div class="carstep">' + h + '</div>';
};
A.acts.vMode = function (el) { var m = el.getAttribute('data-mode') || ''; mode = m === 'vin' || m === 'manual' ? m : ''; A.render(); };
var save = A.acts.vSave;
if (save) A.acts.vSave = function () {
var w = draftW();
if (w) {
var o = $('v-other'), model = w.modelOther ? (o ? o.value.trim() : '') : w.model, miss = [], first = null;
[['year', 'v-year', w.year], ['make', 'v-make', w.make], ['model', w.modelOther ? 'v-other' : 'v-model', model]].forEach(function (f) {
var el = $(f[1]);
if (el) el.removeAttribute('aria-invalid');
if (!f[2]) { miss.push(f[0]); if (el) { el.setAttribute('aria-invalid', 'true'); if (!first) first = el; } }
});
if (miss.length) {
var msg = $('v-reqmsg'), fs = $('v-fields');
if (fs && fs.hidden) { if (msg) msg.textContent = 'Please look up your VIN first, or choose your car from the menus instead.'; var vin = $('v-vin'); if (vin) vin.focus(); return; }
if (msg) msg.textContent = 'Please choose the ' + (miss.length === 3 ? 'year, make and model' : miss.join(' and ')) + ' to continue. These are required.';
if (first) first.focus();
return;
}
}
return save.apply(this, arguments);
};
var vb = A.backs && A.backs.vehicle;
A.backs = A.backs || {};
A.backs.vehicle = function () { if (intro()) { mode = ''; A.S.screen = 'vehicle'; return; } if (vb) return vb.apply(this, arguments); A.S.screen = A.S.ret || 'home'; };
var saved = A.vehicleSaved;
A.vehicleSaved = function () { done = true; mode = ''; return saved.apply(this, arguments); };
}
A.theme = { introDone: function () { return done; }, mode: function () { return mode; } };
})(window);
