/* Car Trouble - app.js (Phase 1 fix)
Loaded after the inline script in index.html. These function declarations replace the original
vehicleScreen, loadModels, decodeVin, render, choose, back and restart.
Fixes: (1) engine dropdown now populates from EPA data for the selected year/make/model;
(2) "Continue to symptoms" crashed because current/answers/history were never declared
(and "history" collided with window.history) - navigation state is now declared here.
Diagnostic data (N, GUIDES, TOOL_HINTS) and helpers (esc, vehicleBanner, guidePanel, safetyGate,
report) still live in index.html until they are migrated. Requires vehicle-data.js. */
var current = 'start', answers = [], navHistory = [];
var engineState = { loading: false, status: '', result: null, request: 0, epaModel: '', manualList: [] };

(function () {
  var css = document.createElement('style');
  css.textContent = '.spinner{display:inline-block;width:12px;height:12px;border:2px solid #70c5ff;border-right-color:transparent;border-radius:50%;animation:ctspin .8s linear infinite;vertical-align:-2px;margin-right:6px}@keyframes ctspin{to{transform:rotate(360deg)}}.engine-note{font-size:12px;color:#9fb4d4}';
  document.head.appendChild(css);
})();

function norm2(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }

function resetEngine() {
  engineState.request++;
  engineState.loading = false; engineState.status = ''; engineState.result = null; engineState.epaModel = ''; engineState.manualList = [];
  vehicle.engine = ''; vehicle.engineInfo = null; vehicle.engineChoice = '';
}
function upstreamChanged() {
  vehicle.model = ''; vehicle.vinEngine = null; vinStatus = ''; modelOptions = []; modelStatus = ''; modelRequest++;
  resetEngine();
  vehicleScreen();
  loadModels();
}

function engineOptionsHtml() {
  var opts = (engineState.result && engineState.result.engines) || [];
  var ph;
  if (!vehicle.model) ph = 'Select a model first';
  else if (engineState.loading) ph = 'Loading engines…';
  else if (opts.length) ph = 'Select engine (' + opts.length + ' found)';
  else ph = 'No engine list available - choose “I’m not sure”';
  var html = '<option value="">' + esc(ph) + '</option>';
  if (vehicle.vinEngine) html += '<option value="vin"' + (vehicle.engineChoice === 'vin' ? ' selected' : '') + '>From VIN: ' + esc(vehicle.vinEngine.label) + '</option>';
  opts.forEach(function (e, i) { html += '<option value="e' + i + '"' + (vehicle.engineChoice === 'e' + i ? ' selected' : '') + '>' + esc(e.label) + '</option>'; });
  if (vehicle.model) html += '<option value="unsure"' + (vehicle.engineChoice === 'unsure' ? ' selected' : '') + '>I’m not sure</option>';
  return html;
}

function vehicleScreen() {
  var s = document.getElementById('screen');
  document.getElementById('bar').style.width = '5%';
  document.getElementById('trail').textContent = 'Step 1: Identify your vehicle';
  var makes = VEHICLE_MAKES.slice();
  if (vehicle.make && makes.indexOf(vehicle.make) < 0) makes.push(vehicle.make);
  var years = []; for (var y = 2027; y >= 1981; y--) years.push(y);
  var info = vehicle.engineInfo;
  var note = info ? 'Source: ' + info.source + (info.epaModels && info.epaModels.length ? ' (EPA listing: ' + info.epaModels.join(', ') + ')' : '') : '';
  var manual = engineState.manualList.length ? '<label>Optional: if one of these EPA listings is your vehicle, pick it<select id="vepamodel"><option value="">Choose EPA listing…</option>' + engineState.manualList.map(function (m) { return '<option value="' + esc(m) + '"' + (engineState.epaModel === m ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></label>' : '';
  s.innerHTML = '<div class="eyebrow">Step 1 · Your vehicle</div><h1>I own a...</h1><p>Select the year, manufacturer and model. Engine options load automatically.</p><div class="vehicle-fields">'
  + '<label>Year<select id="vyear"><option value="">Select year</option>' + years.map(function (y) { return '<option value="' + y + '"' + (vehicle.year === String(y) ? ' selected' : '') + '>' + y + '</option>'; }).join('') + '</select></label>'
  + '<label>Manufacturer<select id="vmake"><option value="">Select manufacturer</option>' + makes.map(function (m) { return '<option' + (vehicle.make === m ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></label>'
  + '<label>Model<select id="vmodel"' + (!vehicle.make || !vehicle.year ? ' disabled' : '') + '><option value="">' + (vehicle.make && vehicle.year ? 'Select model' : 'Select year and manufacturer first') + '</option>' + modelOptions.map(function (m) { return '<option value="' + esc(m) + '"' + (vehicle.model === m ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') + '</select></label>'
  + '<div class="model-status" id="modelstatus" aria-live="polite">' + esc(modelStatus) + '</div>'
  + '<label>Engine<select id="vengine"' + (!vehicle.model || engineState.loading ? ' disabled' : '') + ' aria-busy="' + engineState.loading + '">' + engineOptionsHtml() + '</select></label>'
  + '<div class="model-status" id="enginestatus" aria-live="polite">' + (engineState.loading ? '<span class="spinner" aria-hidden="true"></span>' : '') + esc(engineState.status) + '</div>'
  + manual
  + (note ? '<div class="engine-note">' + esc(note) + '</div>' : '')
  + '<label>Powertrain<select id="vpower"><option value="">Select powertrain</option>' + ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Not sure'].map(function (v) { return '<option' + (vehicle.powertrain === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></label>'
  + '<label>Optional: 17-character VIN (to identify engine automatically)<input id="vvin" maxlength="17" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter VIN" value="' + esc(vehicle.vin) + '"></label>'
  + '<div class="bottom"><button class="secondary" id="decodeVin"' + (vinBusy ? ' disabled' : '') + '>' + (vinBusy ? 'Decoding…' : 'Identify vehicle from VIN') + '</button></div>'
  + '<div class="model-status" aria-live="polite">' + esc(vinStatus) + '</div></div>'
  + '<div class="bottom"><button id="vehicleNext" class="choice"' + (!(vehicle.year && vehicle.make && vehicle.model && vehicle.powertrain) ? ' disabled' : '') + '>Continue to symptoms →</button></div>'
  + '<p style="font-size:12px;opacity:.75">Models come from NHTSA’s public vehicle database (vPIC). Engine options come from the U.S. EPA FuelEconomy.gov database for the exact year, make and model selected; it covers U.S.-market light-duty vehicles only. A VIN decode, when available, is more specific. No vehicle-specific repair specifications are assumed.</p>';

on('vyear', 'change', function (e) { vehicle.year = e.target.value; upstreamChanged(); });
  on('vmake', 'change', function (e) { vehicle.make = e.target.value; upstreamChanged(); });
  on('vmodel', 'change', function (e) { vehicle.model = e.target.value; vehicle.vinEngine = null; vinStatus = ''; resetEngine(); vehicleScreen(); if (vehicle.model) loadEngines(); });
  on('vengine', 'change', function (e) {
    var v = e.target.value; vehicle.engineChoice = v;
    if (v === 'vin' && vehicle.vinEngine) { vehicle.engineInfo = vehicle.vinEngine; vehicle.engine = vehicle.vinEngine.label; }
    else if (v === 'unsure') { vehicle.engineInfo = null; vehicle.engine = 'Not sure'; }
    else if (v.charAt(0) === 'e' && engineState.result) { var eng = engineState.result.engines[+v.slice(1)]; vehicle.engineInfo = eng || null; vehicle.engine = eng ? eng.label : ''; }
    else { vehicle.engineInfo = null; vehicle.engine = ''; }
    if (vehicle.engineInfo && vehicle.engineInfo.powertrain) vehicle.powertrain = vehicle.engineInfo.powertrain;
    vehicleScreen();
  });
  on('vepamodel', 'change', function (e) {
    engineState.epaModel = e.target.value; engineState.result = null;
    vehicle.engine = ''; vehicle.engineInfo = null; vehicle.engineChoice = '';
    if (engineState.epaModel) loadEngines(engineState.epaModel); else vehicleScreen();
  });
  on('vvin', 'input', function (e) { vehicle.vin = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17); });
  on('decodeVin', 'click', decodeVin);
  on('vpower', 'change', function (e) { vehicle.powertrain = e.target.value; vehicleScreen(); });
  on('vehicleNext', 'click', function () {
    if (!(vehicle.year && vehicle.make && vehicle.model && vehicle.powertrain)) return;
    if (!vehicle.engine) vehicle.engine = 'Not sure';
    current = 'start'; navHistory = []; answers = [];
    render();
  });
}

async function loadModels() {
  if (!vehicle.make || !vehicle.year) return;
  var req = ++modelRequest, year = vehicle.year, make = vehicle.make;
  modelStatus = 'Loading models…'; vehicleScreen();
  try {
    var list = await VehicleData.getModels(year, make);
    if (req !== modelRequest) return;
    modelOptions = list;
    modelStatus = list.length ? list.length + ' models found for ' + year + ' ' + make : 'No models returned for this year and manufacturer';
  } catch (e) {
    if (req !== modelRequest) return;
    modelOptions = FALLBACK_MODELS[make] || [];
    modelStatus = modelOptions.length ? 'Model database unavailable - showing an offline backup list (not year-verified)' : 'Model database unavailable. Check your connection and re-select the year or manufacturer.';
  }
  vehicleScreen();
}

async function loadEngines(epaModel) {
  if (!vehicle.year || !vehicle.make || !vehicle.model) return;
  var req = ++engineState.request, year = vehicle.year, make = vehicle.make, model = vehicle.model;
  engineState.loading = true;
  engineState.status = 'Looking up engines for ' + year + ' ' + make + ' ' + model + '…';
  vehicleScreen();
  var r = null, msg = '';
  try {
    r = await VehicleData.getEngines(year, make, model, { siblings: modelOptions, epaModel: epaModel || '' });
    if (r.status === 'ok') msg = r.engines.length + (r.engines.length === 1 ? ' engine' : ' engines') + ' listed by the EPA for this vehicle.' + (r.partial ? ' Some details could not be loaded, so the list may be incomplete.' : '');
    else if (r.status === 'nomake') msg = 'The EPA has no ' + year + ' ' + make + ' listings. Choose “I’m not sure” or try the VIN.';
    else if (r.status === 'nomatch') msg = 'The EPA does not list a ' + year + ' ' + make + ' ' + model + ' under that name (heavy-duty and commercial models are not covered). Choose “I’m not sure”, try the VIN, or pick a matching EPA listing below.';
    else msg = 'The EPA lists this model but returned no engine details. Choose “I’m not sure” or try the VIN.';
  } catch (e) {
    r = null;
    msg = 'Could not reach the engine database (' + (e && e.message ? e.message : 'network error') + '). Choose “I’m not sure” to continue, or re-select the model to retry.';
  }
  if (req !== engineState.request || year !== vehicle.year || make !== vehicle.make || model !== vehicle.model) return;
  engineState.loading = false;
  engineState.status = msg;
  engineState.result = r && r.status === 'ok' ? r : null;
  if (r && r.status === 'nomatch') engineState.manualList = r.allEpaModels;
  vehicleScreen();
}

function matchMake(m) {
  for (var i = 0; i < VEHICLE_MAKES.length; i++) { if (norm2(VEHICLE_MAKES[i]) === norm2(m)) return VEHICLE_MAKES[i]; }
  return String(m || '').toLowerCase().replace(/(^|[ -])[a-z]/g, function (c) { return c.toUpperCase(); });
}

async function decodeVin() {
  var vin = vehicle.vin;
  if (!VehicleData.validVin(vin)) { vinStatus = 'Enter a valid 17-character VIN (the letters I, O and Q are never used).'; vehicleScreen(); return; }
  vinBusy = true; vinStatus = 'Checking NHTSA VIN data…'; vehicleScreen();
  try {
    var d = await VehicleData.decodeVin(vin);
    var make = matchMake(d.make);
    var changed = d.year !== vehicle.year || norm2(make) !== norm2(vehicle.make) || (d.model && norm2(d.model) !== norm2(vehicle.model));
    if (d.year !== vehicle.year || norm2(make) !== norm2(vehicle.make)) {
      vehicle.year = d.year; vehicle.make = make; vehicle.model = ''; modelOptions = []; modelStatus = '';
      resetEngine();
      await loadModels();
    }
    var m = modelOptions.filter(function (x) { return norm2(x) === norm2(d.model); })[0];
    if (!m && d.model) { modelOptions = modelOptions.concat([d.model]).sort(function (a, b) { return a.localeCompare(b); }); m = d.model; }
    if ((m || '') !== vehicle.model) { vehicle.model = m || ''; resetEngine(); }
    vehicle.vinEngine = d.engine.label ? d.engine : null;
    if (vehicle.vinEngine) {
      vehicle.engineChoice = 'vin'; vehicle.engineInfo = vehicle.vinEngine; vehicle.engine = vehicle.vinEngine.label;
      if (vehicle.vinEngine.powertrain) vehicle.powertrain = vehicle.vinEngine.powertrain;
    }
    vinStatus = (changed ? 'This VIN belongs to a ' + d.year + ' ' + make + ' ' + d.model + '; your selections were updated to match. ' : 'The VIN matches your selection. ')
    + (vehicle.vinEngine ? 'Engine identified from the VIN.' : 'NHTSA did not return engine details for this VIN; pick from the list or choose “I’m not sure”.')
    + (d.warning ? ' NHTSA note: ' + d.warning : '');
  } catch (e) {
    vinStatus = 'Could not decode this VIN: ' + (e && e.message ? e.message : 'network error') + '. You can still pick the engine from the list or choose “I’m not sure”.';
  } finally { vinBusy = false; }
  vehicleScreen();
  if (vehicle.model && !engineState.result && !engineState.loading) loadEngines();
}

function render() {
  var n = N[current], s = document.getElementById('screen');
  var gate = safetyGate();
  if (gate) { s.innerHTML = gate; document.getElementById('trail').textContent = 'Vehicle identification'; return; }
  document.getElementById('bar').style.width = Math.min(100, Math.max(3, (navHistory.length + 1) * 10)) + '%';
  document.getElementById('trail').textContent = answers.length ? vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + ' · Your path: ' + answers.join(' → ') : 'Choose an observation to begin.';
  if (n.end) {
    s.innerHTML = vehicleBanner() + '<div class="eyebrow">Diagnostic endpoint</div><div class="result"><h1>' + n.end + '</h1><p>' + n.action + '</p></div>' + guidePanel(current) + '<div class="alert"><strong>Important:</strong> This is a likely diagnosis or next action, not a confirmed repair unless a specified test passed.</div><div class="bottom"><button class="secondary" onclick="back()">← Previous question</button><button class="secondary" onclick="restart()">Start over</button><button class="secondary" onclick="report()">Copy diagnostic report</button></div>';
  } else {
    s.innerHTML = vehicleBanner() + '<div class="eyebrow">Question ' + (navHistory.length + 1) + '</div><h1>' + n.q + '</h1>' + (n.desc ? '<p>' + n.desc + '</p>' : '') + '<div class="choices">' + n.opts.map(function (o, i) { return '<button class="choice" onclick="choose(' + i + ')">' + o[0] + ' <span style="float:right">›</span></button>'; }).join('') + '</div><div class="bottom"><button class="secondary" onclick="back()"' + (navHistory.length ? '' : ' disabled') + '>← Back</button><button class="secondary" onclick="restart()">Start over</button></div>';
  }
  window.scrollTo(0, 0);
}
function choose(i) { var o = N[current].opts[i]; navHistory.push(current); answers.push(o[0]); current = o[1]; render(); }
function back() { if (!navHistory.length) return; current = navHistory.pop(); answers.pop(); render(); }
function restart() { current = 'start'; navHistory = []; answers = []; vehicleScreen(); }

vehicleScreen();
