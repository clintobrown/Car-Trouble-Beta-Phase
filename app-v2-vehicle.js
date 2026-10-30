/* Car Trouble v2 (STAGING) - app-v2-vehicle.js
Optional car details screen for test.html: year > make > model (NHTSA) > engine (EPA) or "not sure", car type, and VIN lookup.
Needs vehicle-data-v2.js and app-v2-core.js. Changes are made on a draft and only applied when the user presses Save.
Every lookup has a request number, so an older reply can never overwrite a newer choice.
Changing year or make clears model and engine; changing model clears engine. The VIN is sent only to NHTSA when
the user presses Look up, is never stored, and is never shown in reports. */
(function (g) {
  'use strict';
  var A = g.CTApp, V = g.VehicleDataV2, D = g.document;
  if (!A) return;
  var esc = A.esc, W = null, req = { models: 0, engines: 0, vin: 0 };

 /* Accessibility fix for test.html: the whole screen should not be a live region (screen readers would read it twice).
  Status messages use role="status" instead, and the heading of each new screen receives focus. */
 var main = D.getElementById('app');
  if (main) main.removeAttribute('aria-live');

 if (!V) {
   A.screens.vehicle = function () { return '<h2 tabindex="-1" data-focus>Car details are unavailable</h2><p>The car lookup didn’t load. You can still continue — the guide works without car details.</p>' + A.navHtml(); };
   return;
 }

 function $(id) { return D.getElementById(id); }
  function say(id, text, err) { var el = $(id); if (el) { el.textContent = text || ''; el.className = 'status' + (err ? ' err' : ''); } }
  function draft(v) { return { year: v.year || '', make: v.make || '', model: v.model || '', engine: v.engine || null, pt: v.pt || '', ptFrom: v.ptFrom || '', vinEngine: v.engine && v.engine.source === 'NHTSA VIN decode' ? v.engine : null, models: [], modelsFallback: false, engines: [], modelOther: false, vinPending: null }; }
  function cancelLookups() { req.models++; req.engines++; req.vin++; }
  function autoPt() { if (W.ptFrom === 'engine' || W.ptFrom === 'vin') { W.pt = ''; W.ptFrom = ''; } }
  function makeName(m) { for (var i = 0; i < V.MAKES.length; i++) { if (V.norm(V.MAKES[i]) === V.norm(m)) return V.MAKES[i]; } return String(m || '').toLowerCase().replace(/(^|[\s-])([a-z])/g, function (x, a, b) { return a + b.toUpperCase(); }); }

 /* ---------- screen ---------- */
 function vehicleHtml() {
   var top = new Date().getFullYear() + 1, years = '<option value="">Choose year</option>', y, i;
   if (W.year && (+W.year > top || +W.year < 1981)) years += '<option selected>' + esc(W.year) + '</option>';
   for (y = top; y >= 1981; y--) years += '<option' + (String(y) === W.year ? ' selected' : '') + '>' + y + '</option>';
   var makes = '<option value="">Choose make</option>', known = false;
   for (i = 0; i < V.MAKES.length; i++) { var m = V.MAKES[i]; if (m === W.make) known = true; makes += '<option' + (m === W.make ? ' selected' : '') + '>' + esc(m) + '</option>'; }
   if (W.make && !known) makes += '<option selected>' + esc(W.make) + '</option>';
   var pts = A.PTS.map(function (p) { return '<label class="radio"><input type="radio" name="v-pt" value="' + esc(p) + '" data-change="pt"' + (W.pt === p ? ' checked' : '') + '> ' + esc(A.PTL[p]) + '</label>'; }).join('');
   return '<h2 tabindex="-1" data-focus>Your car (optional)</h2><p class="help">Everything here is optional. It helps us skip checks that don’t apply to your car. You can stop at any point and press Save.</p>' +
     '<details class="more" id="v-vinbox"' + (W.vinPending ? ' open' : '') + '><summary>Have your VIN? Look up the car automatically</summary>' +
     '<p class="small">The VIN is a 17-character code. It is usually on a small plate at the bottom of the windshield on the driver’s side, on a sticker in the driver’s door frame, and on your registration or insurance card.</p>' +
     '<p class="small"><strong>Privacy:</strong> when you press Look up, the VIN is sent to the U.S. government’s vehicle database (NHTSA) to identify the car. This app does not save it or put it in your report.</p>' +
     '<div class="field"><label for="v-vin">VIN</label><input type="text" id="v-vin" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="30" data-input="vin" aria-describedby="v-vinmsg"></div>' +
     '<button type="button" class="btn2" data-act="vinLookup">Look up VIN</button><p class="status" id="v-vinmsg" role="status"></p><div id="v-vinconf"></div></details>' +
     '<div class="field"><label for="v-year">Year</label><select id="v-year" data-change="year">' + years + '</select></div>' +
     '<div class="field"><label for="v-make">Make (brand)</label><select id="v-make" data-change="make">' + makes + '</select></div>' +
     '<div class="field"><label for="v-model">Model</label><select id="v-model" data-change="model" aria-describedby="v-modelmsg"></select>' +
     '<div id="v-otherbox" hidden><label for="v-other" class="lbl">Type your model</label><input type="text" id="v-other" maxlength="40" data-input="other" autocomplete="off"></div><p class="status" id="v-modelmsg" role="status"></p></div>' +
     '<div class="field"><label for="v-engine">Engine</label><select id="v-engine" data-change="engine" aria-describedby="v-engmsg"></select><p class="status" id="v-engmsg" role="status"></p></div>' +
     '<fieldset class="field"><legend class="lbl">What kind of car is it?</legend>' + pts + '<p class="small" id="v-ptnote"></p></fieldset>' +
     '<div class="acts"><button type="button" class="btn" data-act="vSave">Save car details</button><button type="button" class="btn2" data-act="back">Cancel</button><button type="button" class="btn2" data-act="vClear">Clear all car details</button></div>';
 }

 /* ---------- filling the lists ---------- */
 function engText(e) { var s = e.label; if (e.descriptors && e.descriptors.length) s += ' (' + e.descriptors.join(', ') + ')'; if (e.epaModels && e.epaModels.length > 1) s += ' — ' + e.epaModels.join(' / '); return s; }
  function showOther(on) { var b = $('v-otherbox'), o = $('v-other'); if (b) b.hidden = !on; if (on && o && !o.value) o.value = W.model; }
  function clearConf() { var c = $('v-vinconf'); if (c) c.innerHTML = ''; }
  function ptNote() {
    var el = $('v-ptnote');
    if (el) el.textContent = W.ptFrom === 'engine' ? 'Filled in from the engine you chose. Change it if it’s wrong.' : (W.ptFrom === 'vin' ? 'Filled in from the VIN lookup. Change it if it’s wrong.' : '');
    var radios = D.querySelectorAll('input[name="v-pt"]');
    for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === W.pt;
  }
  function fillModels() {
    var sel = $('v-model');
    if (!sel) return;
    if (!W.year || !W.make) { sel.innerHTML = '<option value="">Choose year and make first</option>'; sel.disabled = true; showOther(false); return; }
    var list = W.models.slice();
    if (W.model && !W.modelOther && list.indexOf(W.model) < 0) list.unshift(W.model);
    sel.innerHTML = '<option value="">Choose model</option>' + list.map(function (m) { return '<option' + (m === W.model && !W.modelOther ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '<option value="__other"' + (W.modelOther ? ' selected' : '') + '>My model isn’t listed</option>';
    sel.disabled = false;
    showOther(W.modelOther);
  }
  function fillEngines() {
    var sel = $('v-engine');
    if (!sel) return;
    if (!W.model) { sel.innerHTML = '<option value="">Choose a model first</option>'; sel.disabled = true; return; }
    var h = '<option value="">I’m not sure / skip</option>', matched = !W.engine;
    if (W.vinEngine) { h += '<option value="vin"' + (W.engine === W.vinEngine ? ' selected' : '') + '>From VIN: ' + esc(W.vinEngine.label) + '</option>'; if (W.engine === W.vinEngine) matched = true; }
    W.engines.forEach(function (e, i) { var t = engText(e), on = !!(W.engine && W.engine !== W.vinEngine && W.engine.label === t); if (on) matched = true; h += '<option value="' + i + '"' + (on ? ' selected' : '') + '>' + esc(t) + '</option>'; });
    if (!matched) h += '<option value="keep" selected>' + esc(W.engine.label) + '</option>';
    sel.innerHTML = h;
    sel.disabled = false;
  }

 /* ---------- lookups (each guarded by a request number) ---------- */
 function loadModels(thenEngines) {
   var id = ++req.models, year = W.year, make = W.make, sel = $('v-model');
   W.models = [];
   if (!year || !make) { fillModels(); say('v-modelmsg', ''); return; }
   if (sel) { sel.innerHTML = '<option value="">Loading models…</option>'; sel.disabled = true; }
   say('v-modelmsg', 'Loading models from NHTSA…');
   function done() { fillModels(); if (thenEngines && W.model && !W.modelOther) loadEngines(); }
   V.getModels(year, make).then(function (list) {
     if (id !== req.models || !W) return;
     W.models = list;
     if (!list.length) { W.models = (V.FALLBACK_MODELS[make] || []).slice(); say('v-modelmsg', 'NHTSA has no ' + year + ' ' + make + ' models on record. ' + (W.models.length ? 'Showing common models instead, or choose “My model isn’t listed”.' : 'Choose “My model isn’t listed” to type it.')); }
     else say('v-modelmsg', list.length + ' models found (source: NHTSA).');
     done();
   }, function (e) {
     if (id !== req.models || !W) return;
     W.models = (V.FALLBACK_MODELS[make] || []).slice();
     say('v-modelmsg', 'Couldn’t load the model list (' + e.message + '). ' + (W.models.length ? 'Showing common models instead, or choose “My model isn’t listed”.' : 'Choose “My model isn’t listed” to type it.'), true);
     done();
   });
 }
  function loadEngines() {
    var id = ++req.engines, year = W.year, make = W.make, model = W.model;
    W.engines = [];
    fillEngines();
    if (!year || !make || !model) { say('v-engmsg', ''); return; }
    var sel = $('v-engine');
    if (sel) sel.disabled = true;
    say('v-engmsg', 'Looking up engine types from EPA… You can skip this.');
    V.getEngines(year, make, model, { siblings: W.models }).then(function (res) {
      if (id !== req.engines || !W) return;
      W.engines = res.engines || [];
      var msg = {
        ok: 'These are the engine types EPA lists for this model (source: EPA FuelEconomy.gov). EPA can’t tell which one is in your car — choose yours if you know it, or leave “I’m not sure”.' + (res.partial ? ' Some details couldn’t be loaded, so the list may be incomplete.' : ''),
        empty: 'EPA has no engine details for this model. You can continue without choosing one.',
        nomatch: 'EPA lists this model under a different name, so we couldn’t match an engine. You can continue without choosing one.',
        nomake: 'EPA has no ' + year + ' ' + make + ' records. You can continue without choosing an engine.',
        tooold: 'EPA engine records start with 1984 models. You can continue without choosing an engine.'
      }[res.status] || 'You can continue without choosing an engine.';
      say('v-engmsg', msg);
      fillEngines();
    }, function (e) {
      if (id !== req.engines || !W) return;
      say('v-engmsg', 'Couldn’t reach EPA for engine types (' + e.message + '). You can continue without choosing an engine.', true);
      fillEngines();
    });
  }
  function applyVin(d) {
    cancelLookups();
    W.year = d.year; W.make = makeName(d.make); W.model = d.model || ''; W.modelOther = false; W.vinPending = null;
    W.vinEngine = d.engine && d.engine.label ? d.engine : null;
    W.engine = W.vinEngine;
    if (W.vinEngine && W.vinEngine.powertrain) { W.pt = W.vinEngine.powertrain; W.ptFrom = 'vin'; } else autoPt();
    var note = 'Found: ' + [d.year, W.make, d.model].filter(Boolean).join(' ') + '.' + (d.model ? '' : ' The VIN didn’t include the model — please choose it below.') + (W.vinEngine ? ' Engine details come from the VIN.' : ' The VIN didn’t include engine details.') + (d.warning ? ' Note from NHTSA: ' + d.warning : '');
    A.render(true);
    var box = $('v-vinbox');
    if (box) box.open = true;
    say('v-vinmsg', note);
  }

 /* ---------- events ---------- */
 function resetFromYearMake() {
   req.vin++; W.vinPending = null; clearConf();
   W.model = ''; W.modelOther = false; W.engine = null; W.vinEngine = null; W.engines = [];
   autoPt(); ptNote(); fillEngines(); say('v-engmsg', '');
   loadModels(false);
 }
  A.changes.year = function (el) { W.year = el.value; resetFromYearMake(); };
  A.changes.make = function (el) { W.make = el.value; resetFromYearMake(); };
  A.changes.model = function (el) {
    req.vin++; W.vinPending = null; clearConf();
    W.engine = null; W.vinEngine = null; autoPt(); ptNote();
    if (el.value === '__other') {
      W.modelOther = true; W.model = ''; W.engines = []; req.engines++;
      showOther(true); fillEngines();
      say('v-engmsg', 'Engine types can’t be looked up for a typed model. You can continue without one.');
      var o = $('v-other'); if (o) o.focus();
      return;
    }
    W.modelOther = false; showOther(false); W.model = el.value;
    loadEngines();
  };
  A.inputs.other = function (el) { W.model = el.value.trim().slice(0, 40); fillEngines(); };
  A.changes.engine = function (el) {
    var v = el.value, e;
    autoPt();
    if (v === '') W.engine = null;
    else if (v === 'vin') W.engine = W.vinEngine;
    else if (v !== 'keep') { e = W.engines[+v]; W.engine = e ? { label: engText(e), powertrain: e.powertrain, source: e.source || 'EPA FuelEconomy.gov', detailed: !!e.detailed } : null; }
    if (W.engine && W.engine.powertrain) { W.pt = W.engine.powertrain; W.ptFrom = W.engine.source === 'NHTSA VIN decode' ? 'vin' : 'engine'; }
    ptNote();
  };
  A.changes.pt = function (el) { W.pt = el.value; W.ptFrom = 'you'; ptNote(); };
  A.inputs.vin = function (el) { var c = V.cleanVin(el.value); say('v-vinmsg', c.length ? c.length + ' of 17 characters' : ''); };
  A.acts.vinLookup = function () {
    var el = $('v-vin'), vin = V.cleanVin(el ? el.value : ''), p = V.vinProblem(vin);
    clearConf(); W.vinPending = null;
    if (!p && !V.validVin(vin)) p = 'That doesn’t look like a valid VIN. Check each character and try again.';
    if (p) { say('v-vinmsg', p, true); if (el) el.focus(); return; }
    var id = ++req.vin;
    say('v-vinmsg', 'Looking up this VIN with NHTSA…');
    V.decodeVin(vin).then(function (d) {
      if (id !== req.vin || !W) return;
      var diff = [];
      if (W.year && W.year !== d.year) diff.push('Year: you chose ' + W.year + ', the VIN says ' + d.year);
      if (W.make && V.norm(W.make) !== V.norm(d.make)) diff.push('Make: you chose ' + W.make + ', the VIN says ' + makeName(d.make));
      if (W.model && d.model && V.norm(W.model) !== V.norm(d.model)) diff.push('Model: you chose ' + W.model + ', the VIN says ' + d.model);
      if (!diff.length) { applyVin(d); return; }
      W.vinPending = d;
      say('v-vinmsg', 'The VIN doesn’t match what you chose. Which is right?', true);
      $('v-vinconf').innerHTML = '<ul>' + diff.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><div class="acts"><button type="button" class="btn" data-act="vinUse">Use the VIN details</button><button type="button" class="btn2" data-act="vinKeep">Keep my choices</button></div>';
    }, function (e) {
      if (id !== req.vin || !W) return;
      say('v-vinmsg', 'VIN lookup didn’t work: ' + e.message + '. You can choose your car from the lists below instead.', true);
    });
  };
  A.acts.vinUse = function () { if (W && W.vinPending) applyVin(W.vinPending); };
  A.acts.vinKeep = function () { W.vinPending = null; clearConf(); say('v-vinmsg', 'Kept your choices. The VIN details were not used.'); };
  A.acts.vSave = function () {
    if (W.modelOther) { var o = $('v-other'); if (o) W.model = o.value.trim().slice(0, 40); }
    cancelLookups();
    var v = A.S.veh;
    v.year = W.year; v.make = W.make; v.model = W.model; v.engine = W.engine; v.pt = W.pt; v.ptFrom = W.ptFrom;
    W = null;
    A.vehicleSaved();
  };
  A.acts.vClear = function () { cancelLookups(); W = draft(A.blankVeh()); A.render(true); };
  var openCore = A.acts.vehicle;
  A.acts.vehicle = function (el) { cancelLookups(); W = draft(A.S.veh); openCore(el); };
  A.backs = A.backs || {};
  A.backs.vehicle = function () { cancelLookups(); W = null; A.S.screen = A.S.ret || 'home'; if (A.S.screen === 'home') A.S.cat = null; };
  A.onReset.push(function () { cancelLookups(); W = null; });
  A.screens.vehicle = function () { if (!W) W = draft(A.S.veh); return vehicleHtml(); };
  A.after.vehicle = function () { fillModels(); fillEngines(); ptNote(); if (W.year && W.make) loadModels(!!W.model && !W.modelOther); };
  A.vehicleDebug = { draft: function () { return W; }, req: req };
})(window);
