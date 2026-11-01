✔/* Car Trouble v2 (BETA) - app-v2-deep.js
Deeper, branching steps for experienced DIYers. Loads right after app-v2-expert.js and replaces the short
"Keep going" lists with test-by-test steps: what to do, what a good and a bad reading looks like, where each
result leads, how to confirm the fix, and when to hand it to a certified mechanic.
Section 1: Car won't start (gasoline / diesel). Other sections still use the lists in app-v2-expert.js.
Readings are rough guides only - always check the service information for your exact vehicle. */
(function (g) {
'use strict';
var A = g.CTApp, T = g.CarTroubleTrees, D = g.document;
if (!A || !T || !A.expert) return;
var R = T.R, X = A.expert.X, Y = {};
var STILL = 'Still not fixed? You have ruled out everything you tested above. Write down each reading (the mechanic summary in your report already lists these steps) and hand it to a certified mechanic for the remaining tests.';
var NOCRANK = 'Don’t crank for more than about 10–15 seconds at a time. Rest the starter a minute between tries, and keep the battery on a charger while you test.';

/* ---------- battery tests (jump worked / needs a jump / drained / battery test) ---------- */
var BT = [
'Resting voltage: car off for at least an hour (or switch the headlights on for one minute, then off, to remove surface charge). Meter on DC volts, red on the + post, black on the – post — on the posts themselves, not the clamps. ✔ Good: about 12.6 V or more (full). ✘ Bad: about 12.2–12.4 V is partly flat — charge it. Below about 12.0 V is deeply flat — charge it and suspect the battery or a drain.',
'Connection check: while a helper cranks, measure from the + post to the + clamp, then from the – post to the – clamp. ✔ Good: under about 0.2 V on each. ✘ Bad: higher — clean and tighten that connection (battery-connection steps) before blaming the battery.',
'Charge it fully with a smart charger set to the type on the label (flooded, AGM or EFB) until the charger shows full — often several hours. ✘ Bad: the charger reports a fault or never finishes — the battery is usually worn out.',
'Self-discharge check: disconnect the – cable, leave the charged battery 12 hours, and measure again. ✔ Good: still about 12.5 V or more. ✘ Bad: it fell on its own — the battery can’t hold a charge; replace it. If it only falls when connected to the car, something is draining it (see the drain step below).',
'Load test: a conductance tester set to the CCA on the label, or a free parts-store test. ✔ Good: “Good battery”, or CCA close to the rating. ✘ Bad: “Replace”, or far under the rating on a fully charged battery — replace it. “Charge and retest” means it wasn’t full yet.',
'Cranking voltage: meter on the posts while cranking for a few seconds. ✔ Good: stays above about 9.6–10 V and the engine spins briskly. ✘ Bad: drops lower with a charged, tested battery — check the cables and starter (“jump-start didn’t work” steps).',
'Charging check: engine running, measure at the posts, then again with the headlights, blower on high and rear defrost on. ✔ Good: roughly 13.5–14.8 V, and still above about 13 V with the load on. ✘ Bad: stays near 12.6 V or sinks with the load — charging fault (charging-system steps). Above about 15 V — overcharging, which ruins batteries. Note: some “smart” systems drop to about 12.8–13 V on purpose when the battery is full; check the service information before condemning the alternator.',
'If the battery and charging both pass but it goes flat again: key-off drain test. Car locked and asleep (wait 20–60 minutes), clamp meter or ammeter on the – cable. ✔ Good: roughly 50 mA or less (check your service information). ✘ Bad: higher — find the circuit by measuring the millivolt drop across each fuse, instead of pulling fuses (that wakes the modules up).',
'Confirm the fix: let the car sit overnight and start it in the morning, then re-check resting voltage after two or three days of normal use. ✔ Good: it starts easily and rests at 12.4 V or more.',
STILL];
Y.r_jumpWorked = BT; Y.r_needJump = BT; Y.r_drained = BT; Y.r_testBatt = BT;

Y.r_terminal = [
'Look before you touch: a cracked case, leaking acid or a swollen battery means stop — use the damaged-battery steps instead.',
'Prove the bad connection first, so you can prove the fix later: while a helper cranks (or with the headlights on if it won’t crank), measure from the + post to its clamp, then from the – post to its clamp. ✔ Good: under about 0.2 V. ✘ Bad: higher on either side — that connection is a problem.',
'Car off, key out. Remove the negative (–) clamp first, then the positive (+). Tuck both clamps aside so they can’t spring back onto the posts.',
'Clean: baking soda and water (or terminal-cleaner spray) on the crust until the fizzing stops, then a terminal brush on the posts and inside the clamps until both are bright metal. Rinse lightly and dry. Keep the mix out of the battery vents.',
'Inspect the cables: flex each one near the clamp and peel back the end of the insulation slightly. ✔ Good: flexible, bright copper. ✘ Bad: stiff, swollen, green under the insulation, or broken strands — replace that cable or cable end. Cleaning won’t fix corrosion inside a cable.',
'Check the other ends too: follow the – cable to the body or engine and the + cable to the starter and fuse box. Clean and tighten those — a corroded ground bolt causes exactly the same symptoms.',
'Refit positive (+) first, then negative (–). Tighten until you can’t twist the clamp on the post by hand — don’t overtighten, lead posts deform. Add terminal-protector spray or felt washers.',
'Repeat the voltage-drop test from step 2. ✔ Good: each connection now under about 0.2 V and the car starts normally. ✘ Bad: still high — the clamp or cable is damaged inside; replace it.',
'The poor connection may have left the battery run down: charge it and load-test it (battery steps), then check for roughly 13.5–14.8 V at the posts with the engine running.',
'Confirm the fix: several normal starts over the next few days, and no quick return of the crust. ✘ Bad: heavy crust back within weeks on the + side — suspect overcharging or a leaking post seal; check charging voltage.',
STILL];

var CRANKCIRC = [
'Positive-side voltage drop: meter red on the battery + post, black on the large terminal at the starter, while a helper cranks. ✔ Good: under about 0.5 V. ✘ Bad: higher — corroded or loose cable end, or a failing cable; repair it and retest.',
'Ground-side voltage drop: meter red on the engine block or starter case, black on the battery – post, while cranking. ✔ Good: under about 0.3–0.5 V. ✘ Bad: higher — clean or replace the engine-to-body ground strap and the battery – cable.',
'Starter trigger: back-probe the small wire at the starter solenoid with a test light to ground while a helper turns to START. ✔ Good: bright light — the starter is being told to run, so the fault is the starter itself (next step). ✘ Bad: no light — the problem is upstream: the starter relay (swap in an identical relay), its fuse, the park/neutral or clutch switch, the ignition switch, or the security system blocking the start (security steps if a key light flashes).',
'Before condemning the starter, make sure the engine turns: key out, breaker bar on the crankshaft pulley bolt, turn it in its normal direction. ✔ Good: turns with steady resistance — the starter has failed. ✘ Bad: won’t turn or hits a hard stop — stop here; a seized engine or fluid in a cylinder needs professional diagnosis.',
'Replace the starter: battery – off, photograph and label the wires, remove the mounting bolts (keep any shims), fit the new unit, and torque the bolts and cable nuts to spec. Many parts stores will bench-test the old one to confirm it was bad.',
'Confirm the fix: several cold and warm starts. ✔ Good: quick, strong cranking, and cranking voltage stays above about 10 V.',
STILL];

Y.r_jumpFailed = [
'Rule out the jump itself: clamps biting bare metal, donor car running at a fast idle for five minutes first, cables not thin or damaged. One more try with a good jump pack or a different donor is worth it.',
'Battery voltage while a helper tries to start. ✔ Good: stays above about 9.6–10 V and nothing turns — power is there but isn’t reaching or being used by the starter; carry on below. ✘ Bad: falls below about 9.6 V — charge and load-test the battery and clean the terminals first (battery steps).'].concat(CRANKCIRC);

Y.r_starter = [
'Charge the battery fully first — a battery at about 12.2 V can still light the headlights brightly but can’t turn a starter. ✔ Good: about 12.6 V rested and it passes a load test. ✘ Bad: lower — charge and test before going further.',
'Listen for where the click comes from. A click at the starter (low on the engine) means the solenoid is getting its signal. A click only from the under-hood fuse box means the relay works but the starter isn’t answering. No click at the starter — go straight to the trigger test below.',
'If you have an inductive amp clamp: clamp the starter cable while cranking. ✔ Good: within the range in the service information. ✘ Bad: very high with slow or no cranking — the starter is dragging or the engine is tight; zero — an open circuit in the starter or solenoid.'].concat(CRANKCIRC);

Y.r_range = [
'Check the display first: move the shifter through every position with the engine off (foot on brake). ✔ Good: the dash shows the same gear as the shifter each time. ✘ Bad: it lags, skips or shows the wrong gear — the shift cable or linkage is out of adjustment, stretched or has a broken bushing; fix that first.',
'Find the range (park/neutral) switch — usually on the side of the transmission where the shift cable connects, or at the shifter on some cars. Check the connector for corrosion, water and bent pins.',
'Test it with the wiring diagram: continuity across the start-circuit pins in Park and in Neutral, or watch the range reading on a scan tool. ✔ Good: closed (or reads P / N) in both. ✘ Bad: open in Park, or flickers when you wiggle the shifter — the switch is worn or out of adjustment.',
'Adjust first: many switches have slotted holes and a pin or gauge position for Neutral in the service information. Replace the switch only if it still fails after adjustment.',
'Confirm the fix: it starts every time in Park and in Neutral, and it does NOT crank in Reverse or Drive (test with the parking brake on and foot hard on the brake). Reverse lights should come on only in Reverse.',
STILL];

Y.r_immob = [
'Rule out low voltage first: charge the 12-volt battery and confirm about 12.6 V rested — low voltage is a common cause of key-not-recognized faults.',
'Fresh batteries in every key and fob, then try each key, including the backup method in the owner’s manual (fob held against the start button, or a hidden slot).',
'Watch the security light during a start attempt. A steady light that goes out usually means the key was accepted; flashing usually means rejected — check your manual for your car’s pattern.',
'Inspect the antenna ring around the ignition lock (or the antenna near the start button) and its connector. Keep other keys, fobs and RFID cards away from the key while starting.',
'Scan the immobilizer or body module with a tool that supports your make. ✔ “Key not read” codes point to the antenna or wiring. ✘ “Key read but not authorized” points to the key programming or the module.',
'Key programming and module replacement usually need a dealer-level tool and the security PIN — most DIYers stop here and use a dealer or an automotive locksmith. Never install a bypass.',
'Confirm the fix: every key starts the car several times in a row, and the security light behaves normally.',
STILL];
Y.r_immobMaybe = Y.r_immob;

Y.r_crankPro = [
'Scan first: write down stored and pending codes. Then watch live data while cranking. ✔ Good: engine RPM reads roughly 150–300. ✘ Bad: RPM reads 0 — the computer can’t see the crankshaft sensor, so it won’t fire spark or fuel. Test that sensor’s power, ground, signal and connector with the wiring diagram.',
'Security check: if the scan data shows the key as not authorized, or a key light flashes while cranking, go to the security steps — fuel and spark are being blocked on purpose.',
'Fuel pump prime: key to ON (don’t start) and listen at the open filler neck or under the rear seat. ✔ Good: a hum for about two seconds. ✘ Bad: silence — check the fuel pump fuse and relay (swap in an identical relay), then power and ground at the pump connector.',
'Fuel pressure: gauge on the test port if your engine has one, then cycle the key. ✔ Good: reaches the spec in the service information and holds for several minutes after key-off. ✘ Bad: zero or low — pump, filter, regulator or wiring; it drops fast — a leaking injector, regulator or check valve. Direct-injection engines: gauge only the low-pressure side; read high-side pressure in scan data. Never open the high-pressure side.',
'Spark: use an adjustable spark tester on one coil or plug lead while cranking (pull the fuel pump fuse first so it doesn’t flood). Never hold a lead or use a screwdriver. ✔ Good: a strong blue spark across the gap. ✘ Bad: none on any cylinder — a shared cause: crank sensor, ignition fuse or relay, or engine-computer power (engine-computer steps).',
'Pull one spark plug after a few seconds of cranking. ✔ Wet and smells of fuel — fuel is getting in. ✘ Dry — fuel isn’t being delivered (pump, pressure or injector command). Black and soaked — flooded: hold the gas pedal to the floor while cranking briefly (clear-flood mode on most cars), or replace the plugs. Don’t use starting fluid on modern engines, and never on diesels.',
'Fuel and spark present but still no start: compression test (all plugs out, throttle open, fuel pump fuse out, battery on charge). ✔ Good: cylinders within about 10–15% of each other and near spec. ✘ Bad: all low and similar — the timing belt or chain may have jumped or broken (common when it died suddenly); check the timing marks. One or two low — valves or head gasket; do a leak-down test.',
NOCRANK,
'Confirm the fix: it starts within a few seconds cold and warm, codes are cleared and don’t return after a couple of drives.',
STILL];

Y.r_ecuPower = [
'Confirm the clue: some cars skip the bulb check. Plug in a scan tool, key ON. ✔ Good: it talks to the engine computer — the computer has power, so use the cranks-but-won’t-start steps instead. ✘ Bad: other modules answer but the engine computer doesn’t — carry on here.',
'Test every engine-computer fuse in place with a test light on both sides (a fuse can look fine and still be open). Include the main fusible links near the battery.',
'Main (EFI) relay: listen or feel for its click at key-on, or swap in an identical relay. With the wiring diagram, check for battery voltage on its output at key ON.',
'Back-probe the computer’s power pins (constant and ignition-switched) at key ON. ✔ Good: within about 0.5 V of battery voltage. ✘ Bad: missing or low — trace that circuit back to the fuse or relay.',
'Voltage-drop test each computer ground to the battery – post at key ON. ✔ Good: under about 0.1 V. ✘ Bad: higher — clean and tighten the engine-to-body ground straps and the ground eyelets on the engine.',
'Inspect the computer connectors for water, green corrosion or pushed-back pins, and the harness for rodent damage.',
'Good power and grounds but still no communication: the computer itself may have failed. A replacement usually needs programming to your car and immobilizer pairing — line up a dealer or programmer before buying one.',
'Confirm the fix: the check-engine light does its bulb check at key ON, the scan tool connects, and the car starts.',
STILL];

Y.r_refuel = [
'Rule out wrong fuel first: check the receipt and smell a sample. Diesel in a gasoline car or gasoline in a diesel — stop and use the wrong-fuel steps.',
'Reproduce it: fill the tank, then try a warm restart within 10 minutes. ✔ Typical purge-valve pattern: long cranking that finally catches when you hold the gas pedal down, then a rough idle for a few seconds. That points to fuel vapor flooding the engine.',
'Find the EVAP purge valve — usually on or near the intake, with one hose to the engine and one toward the charcoal canister.',
'Engine off: disconnect the canister-side hose and apply vacuum with a hand vacuum pump. ✔ Good: holds vacuum unpowered, then releases with a click when you briefly power it with fused jumper leads. ✘ Bad: won’t hold vacuum — stuck open; replace it.',
'Check the canister hose: charcoal granules or liquid fuel in it means the canister is damaged and will ruin a new valve — replace the canister too. A common cause is topping off after the pump clicks off — stop at the first click.',
'Scan for EVAP codes and clear them after the repair.',
'Confirm the fix: fill up and do a warm restart within 10 minutes — it should start as quickly as usual. The EVAP readiness monitor should complete over the next few drives.',
STILL];

Y.r_gradual = [
'Get a baseline: count the seconds of cranking before it starts, cold and warm. You’ll use this to prove the repair.',
'Battery: fully charge and load-test it, and check cranking voltage stays above about 9.6–10 V (battery steps). A slow crank makes every other weakness worse.',
'Prime test: turn the key to ON for two seconds, off, and repeat two or three times before cranking. ✔ If it now starts quickly, fuel pressure is bleeding off while parked — continue with the next step. ✘ No change — skip to the sensor checks.',
'Fuel pressure hold: gauge on the test port, run the engine, shut it off and watch for 10–20 minutes. ✔ Good: stays near spec. ✘ Bad: falls quickly — a leaking pump check valve, regulator or injector. Some causes show a fuel smell or a wet plug in one cylinder.',
'Coolant temperature sensor: after an overnight cold soak, the scan-tool coolant reading should be within a few degrees of outside air. ✘ If it reads much warmer, the computer gives too little fuel for a cold start — test or replace the sensor.',
'Ignition wear: pull the plugs and compare against the service interval. ✘ Worn electrodes, wide gaps, oil or carbon fouling — replace as a set, gapped and torqued to spec. Check coil boots for cracks or tracking marks.',
'Air: check the air filter and look for split intake ducting. Clean the throttle body if it is coated, and do any idle relearn.',
'Codes and fuel trims: even without a light, check for pending codes and long-term fuel trims. ✔ Good: within about ±10%. ✘ Bad: well positive — air leak or weak fuel supply; well negative — leaking injector or fuel pressure too high.',
'Confirm the fix: compare cranking time with your baseline. It should be back to about one or two seconds.',
STILL];

Y.r_cold = [
'Battery: load-test it at its rated CCA. Cold cuts battery output sharply and exposes weak batteries first. ✘ Fails — replace it with one at least as strong as the rating in the manual.',
'Oil: confirm the oil is the cold-weather grade in the owner’s manual. Thick oil makes the engine hard to turn in the cold.',
'Gasoline — coolant temperature sensor: after an overnight cold soak, the scan-tool reading should be close to outside air. ✘ Reads much warmer — the engine gets too little fuel for a cold start; test the sensor against its resistance chart.',
'Gasoline — fuel pressure hold: see the “harder to start over time” steps. Pressure bleed-down is worse in the cold.',
'Diesel — glow plugs: engine cold, disconnect each plug lead and measure plug resistance to ground. ✔ Good: a low reading within spec (often only a few ohms or less). ✘ Bad: open (no reading) — that plug has failed. Then confirm the glow plug relay or module powers the plugs at key-on with a test light.',
'Diesel — fuel gelling: cloudy or waxy fuel in the filter or bowl means the fuel has gelled. Warm the car indoors, replace the filter, and use winter-blend fuel or an approved anti-gel additive (it prevents gelling but won’t always reverse it).',
'Block heater (if fitted): check the cord for damage and measure the element resistance against spec. A working block heater makes cold starts much easier.',
'Confirm the fix: it starts normally on the next cold morning, within a few seconds.',
STILL];

Y.r_grind = [
'Stop cranking — every attempt can chip more teeth. Disconnect the battery – before working near the starter.',
'Check the starter is tight: loose mounting bolts or a missing shim let the gears clash. ✘ Loose — torque the bolts to spec and inspect before trying again.',
'Remove the starter and inspect the pinion (small gear). ✔ Good: square, even teeth. ✘ Bad: chipped, rounded or burred teeth — the starter needs replacing; check the ring gear too.',
'Inspect the flywheel or flexplate ring gear through the starter opening while you turn the engine slowly with a breaker bar on the crank bolt. Look all the way round — damage is often in one or two spots where the engine usually stops.',
'Damaged pinion only: replace the starter. Damaged ring gear: the flywheel or flexplate needs replacing, which usually means removing the transmission — a big job most DIYers hand off.',
'Make sure the starter lets go once the engine runs: a grinding whine after the engine has started points to a sticking ignition switch or starter relay — test those.',
'Confirm the fix: clean, quiet engagement on several cold and warm starts with no grinding.',
STILL];

Y.r_engage = [
'Stop repeated attempts and disconnect the battery – before working near the starter.',
'Remove the starter and check the drive: the pinion should turn freely one way and lock the other way. ✘ Turns freely both ways — the one-way clutch has failed; replace the starter or drive.',
'Bench-test: clamp it in a vise and use fused jumper leads. ✔ Good: the pinion shoots out and spins when the solenoid is powered. ✘ Bad: it spins but doesn’t move out — a sticking drive or solenoid fork. Keep fingers clear.',
'Inspect the ring gear through the starter opening while turning the engine by hand — worn teeth can let a good pinion skip.',
'Replace the starter (or drive), torque the mounting bolts to spec, and refit any shims.',
'Confirm the fix: the engine cranks every time with no free-spinning whir.',
STILL];

Y.r_flashCel = [
'Don’t drive with a flashing light. Test only with short idles to protect the catalytic converter.',
'Scan for codes and per-cylinder misfire counts, and note the freeze-frame data (RPM, load, temperature) when it was set.',
'Coil swap: move the coil (or plug lead) from the misfiring cylinder to a neighbor, clear codes and idle briefly. ✔ The misfire moves with the coil — the coil is bad. ✘ It stays put — carry on.',
'Spark plug: pull the plug from that cylinder. ✘ Cracked insulator, worn or closed gap, oil or fuel fouling — replace the plugs as a set, gapped and torqued to spec. Oil-soaked plugs point to valve-cover or tube seals, or internal oil burning.',
'Injector: listen with a stethoscope for clicking, measure resistance against spec, or swap it with a neighbor if the design allows. ✔ The misfire moves — the injector is bad.',
'Vacuum leaks near that cylinder: smoke-test the intake. A leak at one intake runner often misfires just that cylinder.',
'Compression on the affected cylinder (and its neighbors). ✔ Good: within about 10–15% of the others. ✘ Low — do a leak-down test: air hissing from the intake or exhaust means valves; from the oil filler means rings; bubbles in the coolant mean a head gasket.',
'Confirm the fix: clear codes, idle and then drive gently. Misfire counts should stay at or near zero and the light shouldn’t return.',
STILL];
Y.r_misfire = Y.r_flashCel;

Y.r_codes = [
'Read stored and pending codes with freeze-frame data. Write down the exact codes (such as P0301), not just the description.',
'Look up each code in the service information and check for technical service bulletins (TSBs) and recalls — many codes have a known fix.',
'Start with the code group: P030x — misfire (misfire steps). P0171 / P0174 — running lean (vacuum leaks, a dirty MAF, low fuel pressure). P0335 / P0340 — crank or cam sensor (sensor wiring and connector first). P0420 — catalyst (fix misfires and oxygen-sensor faults first). U-codes — module communication (power, grounds and network wiring).',
'Inspect the wiring and connector for the circuit the code names: bent pins, corrosion, rubbed wires or oil in the connector.',
'Prove it with live data before buying parts: watch the sensor reading while reproducing the problem. ✔ Readings make sense and change smoothly — the code may be historic. ✘ Readings stick, jump or are out of range — follow the code’s diagnostic chart.',
'Repair only what testing proves faulty. A code names a circuit, not always a part.',
'Confirm the fix: clear the codes, drive normally for a few days, and recheck. The code shouldn’t return and the readiness monitors should complete.',
STILL];

Y.r_diePro = [
'Watch the security light as it dies. ✘ Flashing — the immobilizer is cutting the engine after it starts; use the security steps.',
'Pedal test: start it and hold the gas pedal slightly down. ✔ Keeps running — an idle-air problem: clean the throttle body, check the idle air control valve if fitted, and do the idle relearn. ✘ Dies anyway — fuel supply or a sensor; carry on.',
'Fuel pressure: gauge on the test port, start it and watch as it dies. ✔ Good: stays at spec. ✘ Bad: drops just before it dies — pump, filter, regulator or pump wiring.',
'Large vacuum leak: listen for hissing and smoke-test the intake. Check the PCV hose and brake-booster hose — a disconnected one can stop an engine from idling.',
'MAF sensor: unplug it and try to start. ✔ It now keeps running (roughly) — the MAF reading is wrong; clean it with MAF cleaner only, then retest, and replace if needed. ✘ No change — plug it back in.',
'Scan for pending codes even with no light on, and watch RPM, fuel trims and MAF reading in the seconds before it dies.',
'Confirm the fix: it starts and idles steadily for several minutes, cold and warm, including with the A/C on.',
STILL];

Y.r_glowFault = [
'Scan for glow plug circuit codes — they often name the cylinder.',
'Engine cool: disconnect each glow plug lead and measure resistance from the plug terminal to ground. ✔ Good: a low reading within spec. ✘ Bad: open (no reading) — that plug has failed.',
'Check that the glow plug relay or module powers the plugs at key-on: test light on the plug bus or lead. ✘ No power — check the large fuse, the relay or module, and its control wiring.',
'Remove failed plugs carefully: warm the engine, use penetrating oil, and turn slowly with a proper deep socket. Stop if one feels seized — a snapped glow plug in the head is a costly repair.',
'Fit new plugs torqued exactly to spec (they are easy to overtighten) and clear the codes.',
'Confirm the fix: the glow plug light behaves normally and it starts promptly when cold.',
STILL];

Y.r_dieselDry = [
'Add plenty of fuel — well above the minimum — so the pickup can reach it.',
'Prime the fuel system per your engine: many have a hand primer on the filter housing — pump until it feels firm. Others prime by cycling the key to ON several times so the electric lift pump runs.',
'If the filter has a bleed screw, open it until fuel comes out with no bubbles, then close it.',
NOCRANK,
'✘ Still no start after priming: check the water separator, replace the fuel filter (pre-fill it with clean fuel if the design allows), and prime again.',
'Never loosen high-pressure injector lines on a common-rail diesel while cranking or running — the fuel jet can inject into skin.',
'Confirm the fix: it starts, idles smoothly without stumbling, and doesn’t die after a few minutes (that would mean air is still in the system).',
STILL];

Y.r_dieselPro = [
'Scan and watch live data while cranking: rail pressure (desired vs. actual), engine RPM signal and immobilizer status. ✘ RPM reads 0 — test the crank sensor. ✘ Key not authorized — security steps.',
'Low-pressure side first: fuel filter condition, water in the separator, and lift-pump pressure versus spec. ✘ Low — replace the filter, check the lift pump’s power and ground.',
'Rail pressure low while cranking with a good supply: do an injector return (leak-off) test per the service information. ✘ One injector returning far more than the others is dumping pressure — replace it.',
'Check the glow plugs and the intake air heater if fitted (glow plug steps).',
'Check the air intake for blockages, and that any intake throttle or EGR valve is not stuck closed.',
'High-pressure diesel fuel can inject through skin — never feel for leaks by hand, and wait for pressure to bleed down before opening any line.',
'Confirm the fix: it starts promptly cold and warm, rail pressure reaches desired quickly while cranking, and no codes return.',
STILL];

Y.r_hotStart = [
'Reproduce it on purpose: drive until fully warm, shut off for 10–20 minutes, then try to start with a scan tool connected.',
'Slow cranking when hot: voltage-drop test the starter cables while hot (positive under about 0.5 V, ground under about 0.3–0.5 V). ✘ Fine cold but high hot — heat-soaked cables or a worn starter; check starter current.',
'Normal cranking but no start: watch RPM in scan data. ✘ RPM 0 only when hot — the crank or cam sensor is failing with heat; replace it.',
'Fuel pressure hold after a hot shut-off. ✘ Drops fast — leaking injector or check valve; hot fuel then vapor-locks.',
'Coolant temperature reading when hot. ✘ Shows cold when the engine is hot — the computer gives far too much fuel and floods it; test the sensor.',
'Try a clear-flood start (pedal held to the floor while cranking). ✔ Starts that way — flooding from leaking injectors or high pressure.',
'Confirm the fix: several warm restarts after 10–20 minutes, each starting within a couple of seconds.',
STILL];

Y.r_interPro = [
'Be ready to test during a failure: keep a test light and a meter in the car. Intermittent faults can only be caught while happening.',
'During a failure, note: does the security light flash? Does the starter relay click? Does the fuel pump hum at key-on? Does the engine crank at all? Each answer points to a different section above.',
'No crank during the failure: test for power at the starter trigger wire (starter steps). ✘ No power — check the park/neutral or clutch switch, ignition switch and starter relay.',
'Cranks but no start during the failure: check RPM in scan data and fuel pump operation (cranks-but-won’t-start steps).',
'Wiggle-test the harness and connectors at the starter, ignition switch, fuse box and engine computer while monitoring — if wiggling triggers the fault, you’ve found the area.',
'Read codes right after a failure; some are only stored briefly.',
'Confirm the fix: two weeks of normal starts with no repeat.',
STILL];

Y.r_charging = [
'Battery first: charge and load-test it — a bad battery can make a good alternator look faulty.',
'Charging voltage at the posts, engine at fast idle with the headlights, blower on high and rear defrost on. ✔ Good: roughly 13.5–14.8 V (smart charging varies — check the service information). ✘ Bad: near 12.6 V or falling — not charging; over about 15 V — overcharging.',
'Belt: inspect for cracks, glazing and slipping (squeal under load) and check the tensioner moves smoothly and holds the belt tight.',
'Output-cable voltage drop: meter from the alternator output terminal to the battery + post under load. ✔ Good: under about 0.3–0.5 V. ✘ Bad: higher — corroded or loose cable or fusible link; repair it.',
'Ground voltage drop: alternator case to battery – post under load. ✔ Good: under about 0.3 V. ✘ Bad: higher — clean the mounting points and ground straps.',
'Scan for charging codes — on many cars the engine computer controls the alternator. Check the alternator fuse and the control wire with the wiring diagram.',
'Low output with a good belt, connections and control signal: replace the alternator, with the battery disconnected first.',
'Confirm the fix: charging voltage back in range under load, and the battery stays at about 12.6 V after sitting overnight.',
STILL];
Y.r_wlBatt = Y.r_charging;

/* ---------- attach (replaces the short lists from app-v2-expert.js) ---------- */
Object.keys(Y).forEach(function (k) { if (R[k]) { R[k].x = Y[k]; X[k] = Y[k]; } else console.warn('Car Trouble deep steps: unknown result ' + k); });

/* ---------- display: put Good / Bad readings on their own lines ---------- */
(function () { var s = D.createElement('style'); s.textContent = '.xsteps .xg,.xsteps .xb{display:block;margin-top:.3rem;padding-left:.2rem}.xsteps .xg b{color:var(--ok-line)}.xsteps .xb b{color:var(--no-line)}.xsteps .xc{color:var(--ok-line)}'; D.head.appendChild(s); })();
function pretty(h) {
var i = h.indexOf('<ol class="xsteps">'); if (i < 0) return h;
var j = h.indexOf('</ol>', i); if (j < 0) return h;
var part = h.slice(i, j)
.replace(/ ✘ ([^✔<]*)/g, '<span class="xb"><b>✘</b> $1</span>')
.replace(/ ✔ ([^✘<]*)/g, '<span class="xg"><b>✔</b> $1</span>')
.replace(/<li>Confirm the fix:/g, '<li><strong class="xc">Confirm the fix:</strong>')
.replace(/<li>Still not fixed\?/g, '<li><strong>Still not fixed?</strong>');
return h.slice(0, i) + part + h.slice(j);
}
var node = A.screens.node;
A.screens.node = function () { return pretty(node.apply(this, arguments)); };
A.expert.deep = Y;
})(window);
