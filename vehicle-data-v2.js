/* Car Trouble v2 (STAGING) - vehicle-data-v2.js
Isolated copy of vehicle-data.js for test.html. Production index.html does not load this file.
Public data sources, no API keys:
- NHTSA vPIC (https://vpic.nhtsa.dot.gov/api/): models for make + year, VIN decoding.
- EPA FuelEconomy.gov (https://www.fueleconomy.gov/feg/ws/): engine configurations for year + make + model.
EPA and NHTSA name models differently (NHTSA "F-150" vs EPA "F150 Pickup 4WD"), so EPA model names are matched
to the selected NHTSA model by leading word tokens. EPA covers U.S. light-duty vehicles (1984+), not heavy-duty trucks.
Privacy: the VIN is sent only to NHTSA vPIC when the user presses the decode button. Nothing is stored. */
(function (global) {
  'use strict';
  var EPA = 'https://www.fueleconomy.gov/ws/rest/vehicle';
  var VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
  var TIMEOUT_MS = 15000, MAX_DETAILS = 40, CONCURRENCY = 6;
  var cache = new Map();

  var MAKES = ['Acura','Alfa Romeo','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge','Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia','Land Rover','Lexus','Lincoln','Mazda','Mercedes-Benz','MINI','Mitsubishi','Nissan','Polestar','Porsche','Ram','Rivian','Subaru','Tesla','Toyota','Volkswagen','Volvo'];
  var FALLBACK_MODELS = {Toyota:['4Runner','Camry','Corolla','Highlander','Prius','RAV4','Sienna','Tacoma','Tundra'],Honda:['Accord','Civic','CR-V','HR-V','Odyssey','Pilot','Ridgeline'],Ford:['Bronco','Edge','Escape','Expedition','Explorer','F-150','Focus','Mustang','Ranger'],Chevrolet:['Camaro','Colorado','Equinox','Malibu','Silverado','Suburban','Tahoe','Traverse'],Nissan:['Altima','Frontier','Maxima','Murano','Pathfinder','Rogue','Sentra','Titan'],Hyundai:['Elantra','Kona','Palisade','Santa Fe','Sonata','Tucson'],Kia:['Forte','K5','Optima','Sorento','Soul','Sportage','Telluride'],Jeep:['Cherokee','Compass','Gladiator','Grand Cherokee','Renegade','Wrangler'],Subaru:['Ascent','BRZ','Crosstrek','Forester','Impreza','Legacy','Outback'],BMW:['3 Series','5 Series','X1','X3','X5'],Volkswagen:['Atlas','Golf','Jetta','Passat','Tiguan']};

  function qs(p) { return Object.keys(p).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]); }).join('&'); }

    function fetchText(url) {
      if (cache.has(url)) return cache.get(url);
      var p = (async function () {
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
          try {
            var r = await fetch(url, ctrl ? { signal: ctrl.signal } : {});
            if (!r.ok) throw new Error('server returned HTTP ' + r.status);
            return await r.text();
          } catch (e) {
            if (e && e.name === 'AbortError') throw new Error('request timed out');
            if (e && /fetch|network|load/i.test(e.message || '')) throw new Error('network error - check your connection');
            throw e;
          } finally { clearTimeout(timer); }
          })();
          cache.set(url, p);
          p.catch(function () { cache.delete(url); });
            return p;
            }
            async function fetchJson(url) {
              var t = await fetchText(url);
              try { return JSON.parse(t); } catch (e) { throw new Error('unreadable response from server'); }
            }

              function parseXml(text) {
                var doc = new DOMParser().parseFromString(text, 'application/xml');
                if (!doc.documentElement || doc.getElementsByTagName('parsererror').length) throw new Error('unreadable response from EPA');
                return doc;
              }
                function childText(el, tag) {
                  var kids = el.children;
                  for (var i = 0; i < kids.length; i++) { if (kids[i].tagName === tag) return (kids[i].textContent || '').trim(); }
                    return '';
                }
                  async function epaMenu(kind, params) {
                    var text = await fetchText(EPA + '/menu/' + kind + '?' + qs(params));
                    if (!text.trim()) return [];
                    var items = parseXml(text).getElementsByTagName('menuItem');
                    var out = [];
                    for (var i = 0; i < items.length; i++) { var v = childText(items[i], 'value'); if (v) out.push({ text: childText(items[i], 'text'), value: v }); }
                      return out;
                  }
                    var DETAIL_FIELDS = ['id','model','baseModel','displ','cylinders','tCharger','sCharger','atvType','fuelType1','fuelType2','eng_dscr','evMotor','trany','drive'];
                    async function epaVehicle(id) {
                      var root = parseXml(await fetchText(EPA + '/' + encodeURIComponent(id))).documentElement;
                      var out = {};
                      DETAIL_FIELDS.forEach(function (f) { out[f] = childText(root, f); });
                        return out;
                        }

                        function tokens(s) {
                          return String(s || '').toLowerCase().replace(/[(][^)]*[)]/g, ' ').replace(/([a-z0-9])-(?=[a-z0-9])/g, '$1').split(/[^a-z0-9]+/).filter(Boolean);
                                                                         }
                                                                         function startsWith(a, b) {
                                                                           if (!b.length || b.length > a.length) return false;
                                                                           for (var i = 0; i < b.length; i++) { if (a[i] !== b[i]) return false; }
                                                                             return true;
                                                                         }
                                                                           function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

                                                                             /* EPA models whose name begins with the selected model's words, excluding ones that belong to a longer sibling
                                                                             model (so "Corolla" does not pick up "Corolla iM" when NHTSA lists both). */
                                                                             function matchEpaModels(model, epaModels, siblings) {
                                                                               var sel = tokens(model);
                                                                               if (!sel.length) return [];
                                                                               var longer = (siblings || []).map(tokens).filter(function (t) { return t.length > sel.length && startsWith(t, sel); });
                                                                                 return epaModels.filter(function (m) {
                                                                                   var mt = tokens(m);
                                                                                   if (!startsWith(mt, sel)) return false;
                                                                                   return !longer.some(function (t) { return startsWith(mt, t); });
                                                                                     });
                                                                                     }

                                                                                     function flag(v) { v = String(v || '').toLowerCase(); return v !== '' && v !== 'false' && v !== 'n' && v !== 'null' && v !== '0'; }
                                                                                       function parseOptionText(t) {
                                                                                         var cyl = /([0-9]+) cyl/i.exec(t), displ = /([0-9]+(?:[.][0-9]+)?) L/.exec(t);
                                                                                         return { displ: displ ? displ[1] : '', cylinders: cyl ? cyl[1] : '', tCharger: /turbo/i.test(t) ? 'T' : '', sCharger: /super/i.test(t) ? 'S' : '', atvType: /FFV/.test(t) ? 'FFV' : '', fuelType1: '', fuelType2: '', eng_dscr: '' };
                                                                                       }
                                                                                         function powertrainOf(v) {
                                                                                           var atv = (v.atvType || '').toLowerCase(), f1 = (v.fuelType1 || '').toLowerCase();
                                                                                           if (atv === 'ev' || f1 === 'electricity') return 'Electric';
                                                                                           if (atv.indexOf('hybrid') >= 0) return 'Hybrid';
                                                                                           if (atv === 'fcv' || f1.indexOf('hydrogen') >= 0) return 'Electric';
                                                                                           if (atv === 'diesel' || f1.indexOf('diesel') >= 0) return 'Diesel';
                                                                                           if (f1.indexOf('gasoline') >= 0 || atv === 'ffv') return 'Gasoline';
                                                                                           return '';
                                                                                         }
                                                                                           function fuelLabel(v) {
                                                                                             var atv = (v.atvType || '').toLowerCase(), f1 = v.fuelType1 || '', f2 = v.fuelType2 || '';
                                                                                             if (atv === 'ev' || f1 === 'Electricity') return 'Battery electric';
                                                                                             if (atv === 'fcv' || /hydrogen/i.test(f1)) return 'Hydrogen fuel cell';
                                                                                             if (atv === 'ffv' || /E85/i.test(f2)) return 'Flex-fuel (gasoline or E85)';
                                                                                             if (/^bifuel/.test(atv)) return (f1 || 'Gasoline') + ' or ' + (f2 || 'alternative fuel');
                                                                                             return f1 ? f1.charAt(0) + f1.slice(1).toLowerCase() : '';
                                                                                           }
                                                                                             function describe(v) {
                                                                                               var pt = powertrainOf(v), displ = parseFloat(v.displ), cyl = parseInt(v.cylinders, 10);
                                                                                               var eng = [];
                                                                                               if (displ > 0) eng.push(displ.toFixed(1) + 'L');
                                                                                               if (cyl > 0) eng.push(cyl + '-cylinder');
                                                                                               if (flag(v.tCharger)) eng.push('turbo');
                                                                                               if (flag(v.sCharger)) eng.push('supercharged');
                                                                                               var parts = [];
                                                                                               if (eng.length) parts.push(eng.join(' ')); else if (pt === 'Electric') parts.push('Electric motor');
                                                                                               if (/plug-in/i.test(v.atvType || '')) parts.push('plug-in hybrid'); else if (/hybrid/i.test(v.atvType || '')) parts.push('hybrid');
                                                                                               var f = fuelLabel(v);
                                                                                               if (f && !(eng.length === 0 && f === 'Battery electric')) parts.push(f);
                                                                                               return { label: parts.join(' · ') || 'Engine details not listed', powertrain: pt, displacementL: displ > 0 ? displ.toFixed(1) : '', cylinders: cyl > 0 ? String(cyl) : '', turbo: flag(v.tCharger), supercharged: flag(v.sCharger), fuel: f };
                                                                                             }

                                                                                               async function mapLimit(items, limit, fn) {
                                                                                                 var results = new Array(items.length), next = 0;
                                                                                                 async function worker() {
                                                                                                   while (next < items.length) {
                                                                                                     var k = next++;
                                                                                                     try { results[k] = { ok: true, value: await fn(items[k]) }; } catch (e) { results[k] = { ok: false, error: e }; }
                                                                                                   }
                                                                                                 }
                                                                                                     var workers = [];
                                                                                                   for (var w = 0; w < Math.min(limit, items.length); w++) workers.push(worker());
                                                                                                   await Promise.all(workers);
                                                                                                   return results;
                                                                                                 }

                                                                                                   async function findEpaMake(year, make) {
                                                                                                     var makes = await epaMenu('make', { year: year });
                                                                                                     for (var i = 0; i < makes.length; i++) { if (norm(makes[i].value) === norm(make)) return makes[i].value; }
                                                                                                       return '';
                                                                                                   }
                                                                                                     
                                                                                                     /* Returns { status: 'ok' | 'empty' | 'nomatch' | 'nomake' | 'tooold', engines, epaModels, allEpaModels, partial }. */
                                                                                                     async function getEngines(year, make, model, opts) {
                                                                                                       opts = opts || {};
                                                                                                       if (+year < 1984) return { status: 'tooold', engines: [], epaModels: [], allEpaModels: [], partial: false };
                                                                                                       var epaMake = await findEpaMake(year, make);
                                                                                                       if (!epaMake) return { status: 'nomake', engines: [], epaModels: [], allEpaModels: [], partial: false };
                                                                                                       var all = (await epaMenu('model', { year: year, make: epaMake })).map(function (m) { return m.value; });
                                                                                                         var matched = opts.epaModel ? [opts.epaModel] : matchEpaModels(model, all, opts.siblings);
                                                                                                         if (!matched.length) return { status: 'nomatch', engines: [], epaModels: [], allEpaModels: all, partial: false };
                                                                                                         var lists = await Promise.all(matched.map(function (m) {
                                                                                                           return epaMenu('options', { year: year, make: epaMake, model: m }).then(function (list) { return list.map(function (o) { return { id: o.value, text: o.text, epaModel: m }; }); });
                                                                                                             }));
                                                                                                             var seen = {}, flat = [];
                                                                                                             lists.forEach(function (list) { list.forEach(function (o) { if (!seen[o.id]) { seen[o.id] = 1; flat.push(o); } }); });
                                                                                                               var limited = flat.slice(0, MAX_DETAILS);
                                                                                                               var details = await mapLimit(limited, CONCURRENCY, function (o) { return epaVehicle(o.id); });
                                                                                                                 var partial = flat.length > limited.length;
                                                                                                                 var entries = limited.map(function (o, i) {
                                                                                                                   var ok = !!(details[i] && details[i].ok);
                                                                                                                   if (!ok) partial = true;
                                                                                                                   return { o: o, ok: ok, d: ok ? details[i].value : null, e: describe(ok ? details[i].value : parseOptionText(o.text)) };
                                                                                                                 });
                                                                                                                   entries.sort(function (a, b) { return (b.ok ? 1 : 0) - (a.ok ? 1 : 0); });
                                                                                                                     var engines = [];
                                                                                                                     entries.forEach(function (x) {
                                                                                                                       var core = [x.e.displacementL, x.e.cylinders, x.e.turbo, x.e.supercharged].join('|');
                                                                                                                       var found = null;
                                                                                                                       for (var i = 0; i < engines.length; i++) { var g = engines[i]; if (x.ok ? g.label === x.e.label : g.core === core) { found = g; break; } }
                                                                                                                         if (!found) {
                                                                                                                           found = { label: x.e.label, core: core, powertrain: x.e.powertrain, displacementL: x.e.displacementL, cylinders: x.e.cylinders, turbo: x.e.turbo, supercharged: x.e.supercharged, fuel: x.e.fuel, epaModels: [], epaIds: [], descriptors: [], source: 'EPA FuelEconomy.gov', detailed: x.ok };
                                                                                                                           engines.push(found);
                                                                                                                         }
                                                                                                                           if (found.epaModels.indexOf(x.o.epaModel) < 0) found.epaModels.push(x.o.epaModel);
                                                                                                                                                                 found.epaIds.push(x.o.id);
                                                                                                                                                                 if (x.d && x.d.eng_dscr && found.descriptors.indexOf(x.d.eng_dscr) < 0) found.descriptors.push(x.d.eng_dscr);
                                                                                                                                                                });
                                                                                                                       var order = { Gasoline: 0, Diesel: 1, Hybrid: 2, Electric: 3 };
                                                                                                                       function rank(p) { return p in order ? order[p] : 4; }
                                                                                                                         engines.sort(function (a, b) { return (rank(a.powertrain) - rank(b.powertrain)) || ((parseFloat(a.displacementL) || 0) - (parseFloat(b.displacementL) || 0)) || a.label.localeCompare(b.label); });
                                                                                                                           return { status: engines.length ? 'ok' : 'empty', engines: engines, epaModels: matched, allEpaModels: all, partial: partial };
                                                                                                                           }
                                                                                                                           
                                                                                                                           /* Cars and light trucks only. vPIC's unfiltered list mixes in motorcycles and trailers, so models are requested per
                                                                                                                           vehicle type and merged. If any typed request fails, or none returns models, the unfiltered list is used instead. */
                                                                                                                           var MODEL_TYPES = ['passenger car', 'multipurpose passenger vehicle (mpv)', 'truck', 'incomplete vehicle'];
                                                                                                                           function modelNames(rows, make) {
                                                                                                                             var exact = rows.filter(function (r) { return norm(r.Make_Name) === norm(make); });
                                                                                                                               var out = {};
                                                                                                                               (exact.length ? exact : rows).forEach(function (r) { if (r.Model_Name) out[String(r.Model_Name).trim()] = 1; });
                                                                                                                                 return Object.keys(out);
                                                                                                                                 }
                                                                                                                                 async function getModels(year, make) {
                                                                                                                                   var base = VPIC + '/GetModelsForMakeYear/make/' + encodeURIComponent(make) + '/modelyear/' + encodeURIComponent(year);
                                                                                                                                   var res = await Promise.all(MODEL_TYPES.map(function (t) {
                                                                                                                                     return fetchJson(base + '/vehicletype/' + encodeURIComponent(t) + '?format=json').then(function (d) { return d.Results || []; }, function () { return null; });
                                                                                                                                       }));
                                                                                                                                       var merged = {};
                                                                                                                                       res.forEach(function (rows) { if (rows) modelNames(rows, make).forEach(function (n) { merged[n] = 1; }); });
                                                                                                                                         var list = Object.keys(merged);
                                                                                                                                         if (!list.length || res.indexOf(null) >= 0) {
                                                                                                                                           try { var all = modelNames((await fetchJson(base + '?format=json')).Results || [], make); if (all.length) list = all; }
                                                                                                                                           catch (e) { if (!list.length) throw e; }
                                                                                                                                         }
                                                                                                                                           return list.sort(function (a, b) { return a.localeCompare(b); });
                                                                                                                                             }
                                                                                                                                             
                                                                                                                                             function cleanVin(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17); }
                                                                                                                                               function vinProblem(v) {
                                                                                                                                                 if (!v) return 'Enter the 17-character VIN.';
                                                                                                                                                 if (/[IOQ]/.test(v)) return 'VINs never use the letters I, O or Q. Check for the numbers 1 or 0 instead.';
                                                                                                                                                 if (v.length !== 17) return 'A VIN has exactly 17 characters. You entered ' + v.length + '.';
                                                                                                                                                 return '';
                                                                                                                                               }
                                                                                                                                                 function validVin(v) { return /^[A-HJ-NPR-Z0-9]{17}$/.test(v); }
                                                                                                                                                   async function decodeVin(vin) {
                                                                                                                                                     if (!validVin(vin)) throw new Error(vinProblem(vin) || 'Enter a valid 17-character VIN');
                                                                                                                                                     var d = await fetchJson(VPIC + '/DecodeVinValues/' + encodeURIComponent(vin) + '?format=json');
                                                                                                                                                     var r = (d.Results && d.Results[0]) || {};
                                                                                                                                                     var codes = String(r.ErrorCode || '0').split(',').map(function (x) { return x.trim(); });
                                                                                                                                                       if (!r.Make || !r.ModelYear) throw new Error('NHTSA could not identify this VIN' + (r.ErrorText ? ' (' + r.ErrorText + ')' : ''));
                                                                                                                                                       var displ = parseFloat(r.DisplacementL), cyl = parseInt(r.EngineCylinders, 10), el = r.ElectrificationLevel || '', fuel = r.FuelTypePrimary || '';
                                                                                                                                                       var eng = [];
                                                                                                                                                       if (displ > 0) eng.push(displ.toFixed(1) + 'L');
                                                                                                                                                       if (cyl > 0) eng.push(cyl + '-cylinder');
                                                                                                                                                       if (/^yes/i.test(r.Turbo || '')) eng.push('turbo');
                                                                                                                                                       var pt = '';
                                                                                                                                                       if (/BEV|FCEV/.test(el)) pt = 'Electric'; else if (/HEV/.test(el)) pt = 'Hybrid';
                                                                                                                                                       else if (/diesel/i.test(fuel)) pt = 'Diesel'; else if (/electric/i.test(fuel) && !/gasoline/i.test(fuel)) pt = 'Electric'; else if (/gasoline/i.test(fuel)) pt = 'Gasoline';
                                                                                                                                                       var parts = [];
                                                                                                                                                       if (eng.length) parts.push(eng.join(' '));
                                                                                                                                                       if (r.EngineModel) parts.push('engine code ' + r.EngineModel);
                                                                                                                                                       if (pt === 'Hybrid') parts.push(/PHEV/.test(el) ? 'plug-in hybrid' : 'hybrid');
                                                                                                                                                       if (fuel) parts.push(fuel);
                                                                                                                                                       return {
                                                                                                                                                         year: String(r.ModelYear), make: r.Make, model: r.Model || '',
                                                                                                                                                         engine: { label: parts.join(' · '), powertrain: pt, displacementL: displ > 0 ? displ.toFixed(1) : '', cylinders: cyl > 0 ? String(cyl) : '', engineCode: r.EngineModel || '', fuel: fuel, source: 'NHTSA VIN decode', detailed: true },
                                                                                                                                                         warning: codes.every(function (c) { return c === '0'; }) ? '' : (r.ErrorText || 'NHTSA reported a partial decode')
                                                                                                                                                           };
                                                                                                                                                           }
                                                                                                                                                           
                                                                                                                                                           global.VehicleDataV2 = { MAKES: MAKES, FALLBACK_MODELS: FALLBACK_MODELS, getModels: getModels, getEngines: getEngines, decodeVin: decodeVin, validVin: validVin, cleanVin: cleanVin, vinProblem: vinProblem, norm: norm,
                                                                                                                                                                                   _test: { tokens: tokens, matchEpaModels: matchEpaModels, describe: describe, parseOptionText: parseOptionText, powertrainOf: powertrainOf } };
                                                                                                                                                           })(window);
                                                                                                                                                           
