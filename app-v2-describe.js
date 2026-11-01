/* Car Trouble v2 (BETA) - app-v2-describe.js
"Describe it in your own words": a text box under the problem list and on the "Let's describe it for a mechanic" result.
Simple keyword matching suggests the section(s) that fit best; the person always makes the final choice, and every
section still starts with the safety check. Nothing typed is sent anywhere. The description stays in this tab only and
is added to the report and the mechanic summary. Loads after app-v2-bug.js and before app-v2-theme.js. */
(function (g) {
'use strict';
var A = g.CTApp, T = g.CarTroubleTrees, D = g.document;
if (!A || !T || !A.screens.home) return;
var esc = A.esc, R = T.R, keep = false, MAX = 400;

/* Keywords per section. Whole words or phrases; a trailing * matches the start of a word (vibrat* = vibrate, vibrating). */
var K = {
nostart: ['wont start', 'will not start', 'wont turn on', 'doesnt start', 'does not start', 'not starting', 'no start', 'hard to start', 'crank*', 'turn over', 'turns over', 'starter', 'immobilizer', 'key not detected', 'dead', 'nothing happens'],
warning: ['warning*', 'light on', 'light is on', 'light came on', 'lights on', 'check engine', 'engine light', 'cel', 'dash*', 'message', 'symbol', 'indicator', 'code', 'codes', 'obd*', 'service soon', 'maintenance required'],
overheat: ['overheat*', 'over heat*', 'running hot', 'runs hot', 'gets hot', 'hot', 'temperature', 'temp', 'steam*', 'coolant', 'antifreeze', 'radiator', 'boil*'],
battery: ['battery', 'batteries', 'jump*', 'drain*', 'keeps dying', 'goes dead', 'dies overnight', 'alternator', 'dead battery'],
noise: ['nois*', 'sound*', 'squeal*', 'squeak*', 'grind*', 'click*', 'hum', 'hums', 'humming', 'knock*', 'rattl*', 'whin*', 'clunk*', 'tick*', 'roar*', 'buzz*', 'thump*', 'screech*', 'loud', 'pop', 'pops', 'popping', 'whistl*', 'growl*'],
shake: ['shak*', 'vibrat*', 'wobbl*', 'shimmy*', 'shudder*', 'rough idle', 'idles rough', 'idle rough', 'jerk*', 'bounc*'],
brakes: ['brak*', 'stopping', 'abs', 'rotor*', 'pad', 'pads', 'pedal', 'spongy', 'handbrake', 'parking brake'],
steering: ['steer*', 'pull*', 'drift*', 'alignment', 'hard to turn', 'power steering', 'off center', 'off centre', 'wander*'],
leak: ['leak*', 'drip*', 'puddle*', 'fluid*', 'spot under', 'spots under', 'wet', 'under the car'],
climate: ['a/c', 'ac', 'air con*', 'aircon', 'air condition*', 'heater', 'heat', 'no heat', 'cold air', 'hot air', 'warm air', 'blower', 'fan', 'defrost*', 'defog*', 'vent', 'vents', 'climate', 'freon', 'refrigerant'],
power: ['power', 'slow', 'accelerat*', 'hesitat*', 'sluggish', 'limp*', 'weak', 'bog*', 'pickup', 'pick up', 'turbo', 'transmission', 'slip*', 'shift*', 'gear*', 'no power', 'lost power', 'loss of power'],
stall: ['stall*', 'shuts off', 'shut off', 'shutting off', 'dies', 'died', 'dying', 'cuts out', 'cut out', 'cutting out', 'turns off'],
tires: ['tire*', 'tyre*', 'flat', 'puncture*', 'tread', 'pressure', 'nail', 'screw in', 'bulge', 'blowout', 'blow out'],
electrical: ['headlight*', 'taillight*', 'brake light*', 'bulb*', 'window*', 'lock', 'locks', 'radio', 'stereo', 'fob', 'remote', 'fuse*', 'wiper*', 'horn', 'electrical', 'turn signal*', 'blinker*', 'screen', 'usb', 'charger', 'interior light*', 'dome light'],
other: ['smell*', 'odor*', 'odour*', 'smoke*', 'smoking', 'exhaust', 'fumes', 'burning', 'rotten egg*', 'sulfur', 'sulphur', 'musty', 'mold*', 'mildew']
};
var DANGER = ['fire', 'flame*', 'smoke*', 'smoking', 'burning', 'fuel smell', 'gas smell', 'smell gas', 'smell fuel', 'smells like gas', 'smells like fuel', 'leaking gas', 'leaking fuel', 'steam*', 'no brakes', 'brakes failed', 'brakes fail*', 'brake failure', 'crash*', 'flood*', 'spark*'];

function norm(s) { return ' ' + String(s || '').toLowerCase().replace(/[\u2018\u2019'`]/g, '').replace(/[^a-z0-9\/]+/g, ' ').trim() + ' '; }
function hit(t, k) { return k.charAt(k.length - 1) === '*' ? t.indexOf(' ' + k.slice(0, -1)) >= 0 : t.indexOf(' ' + k + ' ') >= 0; }
function match(text) {
var t = norm(text), out = [];
(T.CATS || []).forEach(function (c, i) {
var s = 0;
(K[c.id] || []).forEach(function (k) { if (hit(t, k)) s += k.indexOf(' ') >= 0 ? 2 : 1; });
if (s) out.push({ c: c, s: s, i: i });
});
out.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
return out.slice(0, 3).map(function (x) { return x.c; });
}
function danger(text) { var t = norm(text); return DANGER.some(function (k) { return hit(t, k); }); }

/* ---------- display ---------- */
(function () { var s = D.createElement('style'); s.textContent = '.describe{margin:1.4rem 0;padding:.9rem 1rem;border:1px solid var(--line);border-radius:14px;background:var(--card,transparent)}.describe h3{margin-top:.2rem}.describe textarea{width:100%;box-sizing:border-box;font:inherit;font-size:1.05rem;padding:.6rem .7rem;border-radius:12px;border:1px solid var(--line);background:var(--soft,#fff);color:var(--fg,#000)}.describe textarea:focus{border-color:var(--accent);outline:none}.describe .opt .dsub{display:block;font-weight:400;font-size:.92rem;color:var(--muted);margin-top:.2rem}'; D.head.appendChild(s); })();
function $(id) { return D.getElementById(id); }
function onHome() { return A.S && A.S.screen === 'home'; }
function boxHtml() {
var home = onHome();
return '<section class="describe noprint" aria-labelledby="d-h"><h3 id="d-h">' + (home ? 'Can’t find your problem? Describe it in your own words' : 'Describe it in your own words') + '</h3>' +
'<p class="small">For example: “squealing noise when I brake” or “car shakes at highway speed”. We’ll suggest the section that fits best. Nothing you type is sent anywhere.</p>' +
'<label for="d-text" class="lbl">What’s happening?</label><textarea id="d-text" rows="3" maxlength="' + MAX + '" data-input="desc">' + esc(A.S.desc || '') + '</textarea>' +
'<div class="xrow"><button type="button" class="btn" data-act="dFind">Find my problem</button></div><div id="d-out"></div></section>';
}
function outHtml(t) {
if (!t) return '<p class="status err" id="d-res" tabindex="-1">Type a few words about what you’re noticing first.</p>';
var m = match(t), home = onHome(), h = '';
if (danger(t)) h += '<p class="warn"><strong>Safety first:</strong> if there’s smoke, fire, a strong fuel smell, steam, or the brakes feel like they’re failing, get yourself to safety before anything else. Every section starts with a safety check.</p>';
if (!m.length) return h + '<p class="note" id="d-res" tabindex="-1">We couldn’t match that to a section yet. Try describing what you hear, see, smell or feel, and when it happens (for example when braking, turning, starting or at highway speed). ' + (home ? 'Or choose the closest section from the list above.' : 'Your description has been added to your report and the mechanic summary.') + '</p>';
h += '<p id="d-res" tabindex="-1"><strong>' + (m.length === 1 ? 'This sounds like:' : 'This could be one of these — choose the best fit:') + '</strong></p><div class="opts">';
m.forEach(function (c) { h += '<button type="button" class="opt" data-act="dGo" data-id="' + esc(c.id) + '">' + esc(c.icon) + ' ' + esc(c.label) + '<span class="dsub">' + esc(c.sub) + '</span></button>'; });
return h + '</div><p class="small">These suggestions come from the words you used — they are not a diagnosis. Your description will be added to your report.</p>';
}
A.inputs.desc = function (el) { A.S.desc = el.value.slice(0, MAX); };
A.acts.dFind = function () {
var el = $('d-text'), t = (el ? el.value : '').trim().slice(0, MAX), out = $('d-out');
A.S.desc = t;
if (!out) return;
out.innerHTML = outHtml(t);
var f = $('d-res'); if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } if (f.scrollIntoView) f.scrollIntoView({ block: 'center' }); }
};
var goCat = A.acts.cat;
A.acts.cat = function () { if (!keep && A.S) delete A.S.desc; keep = false; return goCat.apply(this, arguments); };
A.acts.dGo = function (el) { keep = true; A.acts.cat(el); };

/* Under the problem list on the home screen. */
var home = A.screens.home;
A.screens.home = function () {
var h = home(), i = h.indexOf('<div class="cats">'), j = i < 0 ? -1 : h.indexOf('</div>', i);
return j < 0 ? h + boxHtml() : h.slice(0, j + 6) + boxHtml() + h.slice(j + 6);
};
/* On the catch-all "Let's describe it for a mechanic" result. */
var DEAD = { r_osDescribe: 1 };
var node = A.screens.node;
A.screens.node = function () {
var h = node(), id = A.S.cur, r = R[id];
if (!r || !DEAD[id]) return h;
var anchor = '<h3>What to do next</h3><p>' + esc(r.step) + '</p>', i = h.indexOf(anchor);
if (i < 0) return h.replace('<h3>What you told us</h3>', boxHtml() + '<h3>What you told us</h3>');
return h.slice(0, i + anchor.length) + boxHtml() + h.slice(i + anchor.length);
};

/* ---------- report and mechanic summary ---------- */
var X = A.expert = A.expert || {}, base = X.text || function () { return ''; };
X.text = function (r, mech) {
var d = A.S && A.S.desc ? String(A.S.desc).trim() : '';
var pre = d ? (mech ? 'Owner’s description (own words): "' + d + '"\n' : '\nIN YOUR OWN WORDS\n' + d + '\n') : '';
return pre + base.apply(this, arguments);
};
A.describe = { match: match, danger: danger, norm: norm, K: K };
})(window);
