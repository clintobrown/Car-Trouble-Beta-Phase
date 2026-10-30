/* Car Trouble v2 (STAGING) - trees-v2b.js
Second half of the diagnostic content. Must load after trees-v2.js. Same node/result format (see trees-v2.js header). */
(function (g) {
  'use strict';
  var T = g.CarTroubleTrees, N = T.N, R = T.R, FUEL = T.FUEL, T1 = T.T1;

 /* ---------- STRANGE NOISES ---------- */
 N.nz_start = { q: 'When do you hear the noise?', help: 'Pick the situation where the noise is most noticeable.', opts: [
   ['When I press the brakes', 'bk_noise'],
   ['When I turn the steering wheel', 'st_noise'],
   ['Going over bumps', 'nz_bump'],
   ['When I try to start the car', 'ns_grind', FUEL],
   ['While driving, and it changes with the car’s speed', 'nz_speed'],
   ['From the engine area, even when parked with the engine running', 'nz_eng', FUEL],
   ['I’m not sure', 'r_noisePro']] };
  N.nz_bump = { q: 'What does the bump noise sound like?', opts: [
    ['Clunk or knock', 'r_bumps'], ['Rattle', 'r_rattle'], ['Squeak or creak', 'r_bumps'], ['I’m not sure', 'r_bumps']] };
  N.nz_speed = { q: 'What does it sound like?', help: 'A noise that changes with the car’s speed (not engine speed) usually comes from the wheels, tires, or axles.', opts: [
    ['A hum, growl, or roar that gets louder as the car goes faster', 'nz_hum'],
    ['A thumping or flapping', 'ti_look'],
    ['A clicking that speeds up as the car goes faster', 'r_clickSpeed'],
    ['I’m not sure', 'r_noisePro']] };
  N.nz_hum = { q: 'Does the hum change when you gently steer left or right at steady speed?', help: 'Only try this on an empty, safe road at moderate speed.', opts: [
    ['Yes, it gets louder or quieter', 'r_bearing', T1], ['No change', 'r_humTire', T1], ['I’m not sure', 'r_humTire']] };
  N.nz_eng = { q: 'What does the engine-area noise sound like?', opts: [
    ['A squeal, especially at startup or with the A/C on', 'r_belt'],
    ['Knocking or tapping that speeds up with the engine', 'nz_oil'],
    ['Hissing', 'r_hiss'],
    ['A loud roar or rumble, worse when accelerating', 'r_exhaust'],
    ['I’m not sure', 'r_noisePro']] };
  N.nz_oil = { q: 'Check the engine oil level. What does the dipstick show?', pic: 'dipstick', look: {
    what: 'The dipstick is a long thin metal stick with a loop or handle, often yellow or orange.',
    where: 'Under the hood, sticking out of the engine. Some newer cars have no dipstick and show oil level on the dashboard screen instead.',
    how: 'Park on level ground, turn the engine off and wait 5–10 minutes. Pull the stick out, wipe it, push it fully back in, pull it out again, and see where the oil reaches between the two marks.',
    cant: 'If there’s no dipstick, check your owner’s manual for how your car shows oil level — or choose “I can’t check it”.',
    safe: 'Engine off only. Parts under the hood can be hot.' }, opts: [
    ['Below the lower mark, or no oil on the stick', 'r_lowOil', T1], ['Between the marks', 'r_knock', T1], ['I can’t check it', 'r_knock']] };
  R.r_bumps = { t: 'A worn suspension or steering part is possible', c: 'possible', why: 'Noises over bumps usually come from parts that let the wheels move: shocks, struts, links, bushings or ball joints.', step: 'Have a mechanic inspect the suspension and steering parts. Tell them which corner the noise seems to come from.', diff: 'pro', drive: 'caution', need: 'Suspension and steering inspection on a lift' };
  R.r_rattle = { t: 'Something loose is likely rattling', c: 'possible', why: 'Rattles over bumps often come from loose heat shields, exhaust parts, or items in the car.', step: 'First check the trunk, glove box and door pockets for loose items. If it continues, have a mechanic look underneath for loose heat shields or exhaust parts.', diff: 'beginner', drive: 'ok', need: 'Underbody inspection' };
  R.r_bearing = { t: 'A wheel bearing problem is possible', c: 'possible', why: 'A hum that rises with speed and changes when you steer often comes from a worn wheel bearing.', unk: 'Tire wear patterns can make a similar noise.', step: 'Have a mechanic check the wheel bearings and tires soon. A badly worn bearing can eventually affect steering and braking.', diff: 'pro', drive: 'caution', need: 'Wheel bearing play and noise check; tire inspection' };
  R.r_humTire = { t: 'Tire noise or a wheel bearing is possible', c: 'possible', why: 'A hum that rises with speed often comes from uneven tire wear or a wheel bearing.', step: 'Check the tires for uneven wear (see the Tire section). Have a shop inspect the tires and wheel bearings.', diff: 'pro', drive: 'caution', need: 'Tire wear inspection; wheel bearing check' };
  R.r_clickSpeed = { t: 'Something in a tire, or an axle joint, is possible', c: 'possible', why: 'A click that speeds up with the car often comes from a nail or stone in the tread. If it’s loudest while turning, a worn CV (axle) joint is common.', step: 'Park safely and look at the tire tread for a nail, screw or stone. If you find nothing, have a mechanic check the CV joints.', diff: 'beginner', drive: 'caution', terms: ['cv'], need: 'Tire inspection; CV joint and boot inspection' };
  R.r_belt = { t: 'A worn or slipping drive belt is possible', c: 'possible', why: 'A squeal at startup or when the A/C turns on is a classic sign of a belt that is worn, loose or wet.', step: 'With the engine off, look at the rubber belt at the front or side of the engine for cracks, fraying or a shiny surface. Have it checked — if it breaks, many cars lose battery charging and power steering, and some lose engine cooling.', safe: 'Never touch or look closely at belts while the engine is running.', diff: 'pro', drive: 'caution', need: 'Drive belt and tensioner inspection' };
  R.r_hiss = { t: 'A leak of coolant, air, or exhaust is possible', c: 'possible', why: 'Hissing often comes from steam or coolant escaping, an air (vacuum) leak, or an exhaust leak.', step: 'If there’s steam or a sweet smell, stop and use the Overheating section. Otherwise have a mechanic look for vacuum and exhaust leaks.', safe: 'Never open the coolant cap on a hot engine.', diff: 'pro', drive: 'caution', need: 'Vacuum leak test; cooling system pressure test; exhaust inspection' };
  R.r_exhaust = { t: 'An exhaust leak is likely', c: 'possible', why: 'A loud roar or rumble that gets worse when accelerating usually comes from a hole or loose joint in the exhaust.', step: 'Have the exhaust inspected soon.', safe: 'Exhaust contains carbon monoxide, which you can’t see or smell. Don’t sit in the car with the engine running in a closed space. If you get a headache or feel dizzy while driving, open the windows and stop.', diff: 'pro', drive: 'caution', need: 'Exhaust system inspection' };
  R.r_lowOil = { t: 'The engine oil is low', c: 'strong', why: 'You saw the oil level below the safe mark. Low oil can cause knocking and serious engine damage.', unk: 'If the knocking continues after adding oil, damage may already have occurred.', step: 'Add the oil type and amount shown in your owner’s manual (or on the oil filler cap), a little at a time, rechecking the dipstick. Then find out why it was low — a leak or the engine burning oil.', safe: 'If the red oil light comes on, or the knocking doesn’t stop after adding oil, don’t drive.', diff: 'beginner', tools: 'The correct engine oil; a funnel helps', drive: 'caution', need: 'Oil leak / consumption check' };
  R.r_knock = { t: 'Engine knocking needs a mechanic', c: 'possible', why: 'Knocking or tapping that follows engine speed can come from low oil pressure, worn internal parts, or the wrong fuel.', step: 'Avoid hard acceleration and long drives. Have a mechanic listen to the engine and check oil pressure soon.', diff: 'pro', drive: 'caution', need: 'Oil pressure test; engine noise diagnosis' };
  R.r_noisePro = { t: 'The noise needs to be heard by a mechanic', c: 'insufficient', why: 'Noises are hard to describe, and your answers don’t yet point to one area.', step: 'Record a video with sound when it happens, and note when it occurs (speed, turning, braking, cold or warm engine). Show the video and this report to a mechanic.', diff: 'beginner', drive: '', need: 'Road test with the mechanic' };

 /* ---------- SHAKING / VIBRATION ---------- */
 N.vb_start = { q: 'When does the shaking happen?', opts: [
   ['At certain speeds, often on the highway', 'vb_speed'],
   ['Only when I press the brakes', 'r_rotors'],
   ['When stopped with the engine running', 'vb_idle', FUEL],
   ['When I speed up', 'vb_accel'],
   ['It started suddenly, or it’s getting worse fast', 'ti_look'],
   ['I’m not sure', 'ti_look']] };
  N.vb_speed = { q: 'Did it start after hitting a pothole or curb, or after tire work?', opts: [
    ['Yes', 'ti_look'], ['No', 'r_balance'], ['I’m not sure', 'r_balance']] };
  N.vb_idle = { q: 'Is the check-engine light on?', terms: ['cel', 'misfire'], pic: 'dash', opts: [
    ['Yes, it’s flashing', 'r_flashCel'], ['Yes, it’s steady', 'r_misfire'], ['No', 'r_idleShake'], ['I’m not sure', 'r_codes']] };
  N.vb_accel = { q: 'Is the check-engine light on or flashing?', terms: ['cel'], opts: [
    ['Flashing', 'r_flashCel'], ['Steady', 'r_misfire'], ['No', 'r_accel'], ['I’m not sure', 'r_accel']] };
  R.r_rotors = { t: 'Uneven brake rotors are likely', c: 'strong', why: 'Shaking or pulsing that happens only when braking usually comes from brake rotors (the discs the pads squeeze) that have worn unevenly.', step: 'Have the brakes inspected. Rotors are often resurfaced or replaced along with the pads.', diff: 'pro', drive: 'caution', need: 'Brake rotor runout/thickness check; pad inspection' };
  R.r_balance = { t: 'A tire balance or wheel problem is likely', c: 'possible', why: 'Vibration at certain speeds most often comes from a tire that is out of balance, unevenly worn, or a bent wheel.', step: 'Have a tire shop check the balance, tire condition and wheels.', diff: 'pro', drive: 'caution', need: 'Wheel balance; tire and wheel inspection' };
  R.r_misfire = { t: 'An engine misfire is possible', c: 'possible', why: 'Shaking with a steady check-engine light often means one cylinder isn’t firing properly.', step: 'Have the trouble codes read soon. Avoid long trips and hard acceleration. If the light starts flashing, stop driving.', diff: 'tools', drive: 'caution', terms: ['misfire', 'obd'], need: 'Scan for misfire codes; ignition and fuel injector tests' };
  R.r_idleShake = { t: 'Rough idle — engine mounts or idle problem', c: 'possible', why: 'Shaking while stopped, with no warning light, can come from worn engine mounts or an uneven idle.', step: 'Have a mechanic check the engine mounts and idle quality.', diff: 'pro', drive: 'ok', need: 'Engine mount inspection; idle quality check' };
  R.r_accel = { t: 'An axle joint or engine mount problem is possible', c: 'possible', why: 'Shaking only when accelerating often comes from a worn inner axle (CV) joint or engine mount.', step: 'Have a mechanic inspect the axles and engine mounts.', diff: 'pro', drive: 'caution', terms: ['cv'], need: 'CV joint and engine mount inspection' };

 /* ---------- BRAKES ---------- */
 N.bk_start = { q: 'What’s happening with the brakes?', help: 'If braking feels weak right now, stop driving as soon as it’s safe.', opts: [
   ['The pedal sinks to the floor, feels very soft, or the car is slow to stop', 'x_brakes'],
   ['The pedal is very hard to push', 'r_hardPedal'],
   ['Squealing or grinding when braking', 'bk_noise'],
   ['The steering wheel or pedal shakes when braking', 'r_rotors'],
   ['The car pulls to one side when braking', 'r_brakePull'],
   ['A brake warning light is on', 'bk_light'],
   ['Fluid leaking near a wheel', 'r_brakeLeak'],
   ['I’m not sure', 'r_brakeCheck']] };
  N.bk_noise = { q: 'Which sound is it?', opts: [
    ['A high squeal or squeak', 'bk_squeal'], ['Harsh metal-on-metal grinding', 'r_padsGone'], ['I’m not sure', 'r_brakeCheck']] };
  N.bk_squeal = { q: 'When does the squeal happen?', opts: [
    ['Only for the first few stops on a damp morning, then it goes away', 'r_brakeRust'], ['Most times I brake', 'r_pads'], ['I’m not sure', 'r_pads']] };
  N.bk_light = { q: 'Is the parking brake fully released?', help: 'The parking brake may be a pedal, a hand lever, or a button marked (P). If it’s even partly on, the red brake light stays on.', opts: [
    ['It was on — the light went out when I released it', 'r_parkBrake', T1], ['It’s released and the light is still on', 'bk_fluid'], ['I’m not sure how to check', 'bk_fluid']] };
  N.bk_fluid = { q: 'Look at the brake fluid tank. Where is the level?', look: {
    what: 'A small see-through plastic tank with MIN and MAX marks. The cap usually has a brake symbol or says “brake fluid”.',
    where: 'Usually under the hood on the driver’s side, near the back of the engine area, against the wall between the engine and the cabin.',
    how: 'Compare the liquid with the MIN and MAX marks on the side. Don’t open the cap.',
    cant: 'Look up “brake fluid” in your owner’s manual, or choose “I can’t find it”.',
    safe: 'Look only. Brake fluid damages paint and irritates skin and eyes.' }, opts: [
    ['Below MIN', 'r_brakeFluidLow', T1], ['Between MIN and MAX', 'r_brakeLight', T1], ['I can’t find it or can’t tell', 'r_brakeLight']] };
  R.r_hardPedal = { t: 'Power brake assist may have failed', c: 'stop', why: 'A brake pedal that suddenly becomes very hard to push usually means the power assist isn’t working. The brakes need much more force to stop the car.', step: 'Don’t drive. Have the car towed and the brake booster/assist system inspected.', diff: 'pro', drive: 'no', need: 'Brake booster and vacuum/assist inspection' };
  R.r_brakePull = { t: 'A sticking brake or uneven brakes are possible', c: 'possible', why: 'Pulling to one side when braking often means one brake is grabbing harder or sticking. Uneven tire pressure can also contribute.', step: 'Check that the tires are evenly inflated. Have the brakes inspected soon.', diff: 'pro', drive: 'caution', need: 'Brake caliper and hose inspection; tire pressure check' };
  R.r_brakeLeak = { t: 'Possible brake fluid leak — don’t drive', c: 'stop', why: 'Fluid near a wheel can be brake fluid. Losing brake fluid can make the brakes fail.', unk: 'It could be another fluid, but brakes are too important to guess.', step: 'Don’t drive. Have the car towed and the brakes inspected.', diff: 'pro', drive: 'no', need: 'Brake hydraulic leak inspection' };
  R.r_brakeCheck = { t: 'Have the brakes inspected', c: 'insufficient', why: 'Your answers don’t point to one brake problem, and brake problems shouldn’t be guessed at.', step: 'Have a mechanic inspect the brakes soon. If braking feels weak at any point, stop driving.', diff: 'pro', drive: 'caution', need: 'Full brake inspection' };
  R.r_padsGone = { t: 'Brake pads may be worn down to metal', c: 'strong', why: 'Harsh grinding when braking usually means the pad material is gone and metal is rubbing on metal. This reduces braking and damages the rotors quickly.', step: 'Avoid driving except slowly and directly to a repair shop — a tow is safer. Have the brakes inspected right away.', diff: 'pro', drive: 'no', need: 'Brake pad and rotor inspection' };
  R.r_brakeRust = { t: 'Light surface rust is the likely cause', c: 'possible', why: 'A squeal that happens only for the first few stops on damp mornings and then goes away is commonly caused by a thin layer of rust on the rotors.', step: 'Usually no repair is needed. If the noise continues all the time, becomes grinding, or braking feels different, have the brakes checked.', diff: 'beginner', drive: 'ok' };
  R.r_pads = { t: 'Worn brake pads are likely', c: 'possible', why: 'Many brake pads have a small metal tab designed to squeal when the pads get thin.', step: 'Have the brakes inspected soon, before it turns into grinding.', diff: 'pro', drive: 'caution', need: 'Brake pad thickness inspection' };
  R.r_parkBrake = { t: 'The parking brake was on', c: 'confirmed', why: 'The light went out when you released the parking brake.', step: 'No repair needed. If the light comes back with the parking brake off, run this check again.', diff: 'beginner', drive: 'ok' };
  R.r_brakeFluidLow = { t: 'Brake fluid is low', c: 'strong', why: 'You saw the brake fluid below MIN. Low fluid can come from a leak or from badly worn brake pads.', unk: 'We can’t tell whether there’s a leak.', step: 'Don’t just top it up and forget it. Have the brakes inspected before driving further. If the pedal feels soft or sinks, don’t drive at all.', diff: 'pro', drive: 'no', need: 'Brake leak inspection; pad wear check' };
  R.r_brakeLight = { t: 'Brake warning light needs checking', c: 'insufficient', why: 'The red brake light can mean low fluid, a hydraulic problem, or an electronic brake fault. From here we can’t tell which, so we can’t say the brakes are safe.', step: 'Have the brake system inspected and scanned before you rely on it. A mobile mechanic or a tow is the safest choice. If the pedal feels different or the car is slow to stop, don’t drive at all.', diff: 'pro', drive: '', need: 'Brake system inspection; brake/ABS module scan' };

 /* ---------- STEERING ---------- */
 N.st_start = { q: 'What’s the steering problem?', opts: [
   ['The car pulls or drifts to one side', 'st_pull'],
   ['Steering suddenly became very heavy', 'r_assistLoss'],
   ['The steering wheel shakes', 'vb_speed'],
   ['A noise when I turn the wheel', 'st_noise'],
   ['The steering feels loose, or the car wanders', 'r_loose'],
   ['The steering wheel is crooked when driving straight', 'r_align'],
   ['I’m not sure', 'r_steerPro']] };
  N.st_pull = { q: 'Check the tires. Does one look lower than the others?', help: 'Low pressure on one side is a common and easy-to-fix reason for pulling.', pic: 'tire', opts: [
    ['Yes, one looks low', 'ti_check'], ['They all look the same', 'st_pullBrake'], ['I’m not sure', 'ti_check']] };
  N.st_pullBrake = { q: 'Does it pull mostly when you brake?', opts: [
    ['Yes, mainly when braking', 'r_brakePull'], ['No, it pulls while driving normally', 'r_align'], ['I’m not sure', 'r_align']] };
  N.st_noise = { q: 'What does the noise sound like when turning?', opts: [
    ['Clicking or popping, mostly in sharp turns', 'r_cv'], ['A whine or groan', 'st_whine'], ['Clunking or knocking', 'r_bumps'], ['I’m not sure', 'r_steerPro']] };
  N.st_whine = { q: 'If your car has a power steering fluid tank, where is the level?', help: 'Many newer cars use electric power steering and have no fluid tank at all.', look: {
    what: 'A small plastic tank, often with a steering-wheel symbol on the cap.',
    where: 'Under the hood, usually near the front or side of the engine.',
    how: 'Compare the level with the marks on the tank (some caps have a small dipstick). Engine off.',
    cant: 'If you can’t find one, your car may have electric steering — choose “No tank, or I can’t find it”.',
    safe: 'Look only, with the engine off.' }, opts: [
    ['Low', 'r_psLow', T1], ['Normal', 'r_steerPro', T1], ['No tank, or I can’t find it', 'r_steerPro']] };
  R.r_assistLoss = { t: 'Power steering assist may have failed', c: 'stop', why: 'Steering that suddenly becomes very heavy usually means the power assist stopped working. You can still steer, but it takes much more effort.', unk: 'On some cars a broken drive belt causes this, and the battery light may also come on.', step: 'Pull over safely. Avoid driving, especially at speed or in traffic. Have it towed or inspected where it sits.', diff: 'pro', drive: 'no', need: 'Power steering system inspection; drive belt check' };
  R.r_loose = { t: 'Worn steering or suspension parts are possible', c: 'possible', why: 'Loose steering or wandering often comes from worn joints in the steering or suspension.', step: 'Have the steering and suspension inspected soon. Drive gently until then.', safe: 'If the steering feels very loose or makes clunking sounds, don’t drive — worn steering parts can fail.', diff: 'pro', drive: 'caution', need: 'Steering linkage, ball joint and wheel bearing inspection' };
  R.r_align = { t: 'Wheel alignment problem is likely', c: 'possible', why: 'A crooked steering wheel, pulling while driving normally, or uneven tire edges are common signs of misalignment.', unk: 'A worn suspension part or a tire problem can cause the same signs.', step: 'Have a tire or alignment shop check the alignment and tire condition.', diff: 'pro', drive: 'ok', terms: ['align'], need: 'Wheel alignment check; tire wear inspection' };
  R.r_cv = { t: 'A worn CV (axle) joint is likely', c: 'possible', why: 'Clicking or popping in sharp turns is a classic sign of a worn CV joint.', step: 'Have the CV joints and their rubber boots inspected. A torn boot lets grease out and dirt in.', diff: 'pro', drive: 'caution', terms: ['cv'], need: 'CV joint and boot inspection' };
  R.r_psLow = { t: 'Power steering fluid is low', c: 'strong', why: 'You saw a low fluid level, and low fluid commonly causes whining when turning.', step: 'Add the power steering fluid type listed in your owner’s manual up to the mark, then have the system checked for leaks.', diff: 'beginner', tools: 'The correct power steering fluid', drive: 'caution', need: 'Power steering leak inspection' };
  R.r_steerPro = { t: 'Have the steering inspected', c: 'insufficient', why: 'Your answers don’t point to one cause, and steering problems affect safety.', step: 'Have a mechanic inspect the steering and suspension soon.', diff: 'pro', drive: 'caution', need: 'Steering and suspension inspection' };

 /* ---------- FLUID LEAKS ---------- */
 N.lk_start = { q: 'What color is the fluid?', help: 'Slide a piece of white paper or cardboard under the drip for a few minutes to see the color. Color is only a clue — it can’t prove what a fluid is.', pic: 'fluids', photo: true, opts: [
   ['Clear like water, near the front passenger side', 'lk_water'],
   ['Green, orange, pink, or yellow', 'r_coolLeak'],
   ['Brown or black', 'lk_oil'],
   ['Red or reddish-brown', 'r_redLeak'],
   ['Blue', 'r_washer'],
   ['It smells like fuel', 'x_fuel'],
   ['Clear-to-yellowish and slippery, near a wheel', 'r_brakeLeak'],
   ['I’m not sure', 'lk_where']] };
  N.lk_water = { q: 'Was the air conditioning or defroster running recently?', opts: [
    ['Yes', 'r_acWater'], ['No', 'lk_where'], ['I’m not sure', 'r_acWater']] };
  N.lk_oil = { q: 'How big is the leak?', opts: [
    ['A few drops', 'r_oilSmall'], ['A puddle, or it drips steadily', 'r_oilBig'], ['I’m not sure', 'r_oilSmall']] };
  N.lk_where = { q: 'Where under the car is the drip?', pic: 'fluids', opts: [
    ['Front, under the engine', 'r_leakFront'], ['Near a wheel', 'r_brakeLeak'], ['Middle of the car', 'r_leakMid'], ['Back of the car', 'r_leakRear'], ['I’m not sure', 'r_leakPro']] };
  R.r_acWater = { t: 'Probably normal A/C water', c: 'strong', why: 'Clear, odorless water dripping near the front passenger side after using the A/C or defroster is usually normal condensation.', step: 'No repair needed if it’s clear, odorless and stops after a while. If it feels slippery, smells, or is colored, run this guide again.', diff: 'beginner', drive: 'ok' };
  R.r_coolLeak = { t: 'A coolant leak is possible', c: 'possible', why: 'Green, orange, pink or yellow fluid, often with a sweet smell, is commonly coolant.', step: 'When the engine is fully cool, check the coolant level (Overheating section). Watch the temperature gauge closely and have the leak repaired soon.', safe: 'Coolant is poisonous to children and pets — clean up puddles. Never open the cap on a warm engine.', diff: 'beginner', drive: 'caution', need: 'Cooling system pressure test' };
  R.r_oilSmall = { t: 'A small oil leak is possible', c: 'possible', why: 'Brown or black fluid is commonly engine oil. A few drops is usually not urgent.', step: 'Check the oil level regularly with the dipstick and top up if needed. Have the leak looked at during your next service.', pic: 'dipstick', diff: 'beginner', drive: 'ok', need: 'Oil leak inspection' };
  R.r_oilBig = { t: 'A significant oil leak is possible', c: 'possible', why: 'A puddle or steady drip of brown or black fluid can mean the engine is losing oil quickly.', step: 'Check the oil level before driving. If it’s low, add oil, and have the leak inspected soon. If the red oil light comes on, stop the engine.', pic: 'dipstick', diff: 'beginner', drive: 'caution', need: 'Oil leak inspection' };
  R.r_redLeak = { t: 'A transmission or power steering fluid leak is possible', c: 'possible', why: 'Red or reddish-brown fluid is commonly transmission fluid or power steering fluid.', step: 'Have a mechanic find the source soon. Low transmission fluid can damage the transmission.', diff: 'pro', drive: 'caution', need: 'Leak source inspection' };
  R.r_washer = { t: 'Probably windshield washer fluid', c: 'possible', why: 'Blue fluid is commonly windshield washer fluid, which isn’t harmful to the car.', step: 'Check the washer fluid tank and its hoses. Not urgent.', diff: 'beginner', drive: 'ok' };
  R.r_leakFront = { t: 'A leak from the engine area', c: 'insufficient', why: 'Several fluids can leak from the front: oil, coolant, power steering fluid, or A/C water.', step: 'Use white paper to check the color, then run this section again. If the puddle is large or growing, have it inspected before driving far.', diff: 'beginner', drive: 'caution', need: 'Leak source inspection' };
  R.r_leakMid = { t: 'A leak from the middle of the car', c: 'insufficient', why: 'Leaks from the middle are often transmission fluid, but can be other fluids.', step: 'Check the color with white paper and have a mechanic identify the source.', diff: 'pro', drive: 'caution', need: 'Leak source inspection' };
  R.r_leakRear = { t: 'A leak from the back of the car', c: 'insufficient', why: 'Leaks near the back can be fuel, brake fluid, or rear axle fluid, depending on the car.', step: 'If it smells like fuel, don’t start the car. Otherwise, have a mechanic identify the source before driving far.', diff: 'pro', drive: 'caution', need: 'Leak source inspection' };
  R.r_leakPro = { t: 'Have the leak identified', c: 'insufficient', why: 'Without the color or location, we can’t narrow it down.', step: 'Put white paper under the car overnight to catch drips, take a photo, and show it to a mechanic.', diff: 'beginner', drive: 'caution', need: 'Leak source inspection' };

 /* ---------- HEATING & A/C ---------- */
 N.cl_start = { q: 'What’s wrong with the heat or air conditioning?', opts: [
   ['No air comes out of the vents at all', 'cl_noair'],
   ['A/C blows air, but it isn’t cold', 'cl_ac'],
   ['Heater blows air, but it isn’t warm', 'cl_heat', FUEL],
   ['Heater blows air, but it isn’t warm', 'r_evClimate', { pt: ['Electric'] }],
   ['Air only comes out at some fan speeds', 'r_blowerRes'],
   ['A bad smell from the vents', 'r_smell'],
   ['Windows fog up and won’t clear', 'r_fog'],
   ['I’m not sure', 'r_climatePro']] };
  N.cl_noair = { q: 'Can you hear the fan running when you turn it up?', opts: [
    ['No sound at all', 'r_blower'], ['I hear the fan, but little air comes out', 'r_cabinFilter'], ['I’m not sure', 'r_blower']] };
  N.cl_ac = { q: 'With the A/C on, does the air get at least a little cool?', opts: [
    ['A little cooler, but not cold', 'r_acLow'], ['Not at all', 'r_acNone'], ['Cold on one side, warm on the other', 'r_blend'], ['I’m not sure', 'r_acNone']] };
  N.cl_heat = { q: 'After 10–15 minutes of driving, where is the engine temperature gauge?', opts: [
    ['It stays low, near cold', 'r_thermostat'], ['In the normal middle area', 'r_heaterCore'], ['It’s high', 'oh_now'], ['I’m not sure, or there’s no gauge', 'r_heaterCore']] };
  R.r_blower = { t: 'The blower fan or its fuse may have failed', c: 'possible', why: 'If you hear nothing at any fan speed, the fan motor, its fuse, or its control may not be working.', step: 'Check the fuse for the blower/heater using the fuse chart in your owner’s manual (only if you’re comfortable). Otherwise have a shop check the blower motor.', diff: 'tools', drive: 'ok', need: 'Blower fuse, motor and control check' };
  R.r_cabinFilter = { t: 'A clogged cabin air filter is possible', c: 'possible', why: 'If the fan runs but little air comes out, a dirty cabin air filter is a common cause.', step: 'Check or replace the cabin air filter — your owner’s manual usually shows where it is (often behind the glove box).', diff: 'beginner', drive: 'ok' };
  R.r_acLow = { t: 'A/C may be low on refrigerant', c: 'possible', why: 'Air that’s only slightly cool often means the system is low on refrigerant, usually from a small leak.', step: 'Have an A/C shop test the system and find any leak.', safe: 'Do-it-yourself recharge cans can overcharge the system. A/C refrigerant is under pressure and can cause frostbite.', diff: 'pro', drive: 'ok', need: 'A/C pressure and leak test' };
  R.r_acNone = { t: 'The A/C system isn’t cooling', c: 'insufficient', why: 'No cooling can come from a refrigerant leak, the compressor not running, an electrical fault, or controls.', step: 'Have an A/C shop test the system. Mention whether you hear a click from under the hood when you turn the A/C on.', diff: 'pro', drive: 'ok', need: 'A/C system diagnosis' };
  R.r_blend = { t: 'A temperature blend door problem is possible', c: 'possible', why: 'Different temperatures from different sides often mean a small motor that controls air mixing isn’t working.', step: 'Have a shop check the climate control system.', diff: 'pro', drive: 'ok', need: 'Blend door actuator check' };
  R.r_thermostat = { t: 'A thermostat stuck open is possible', c: 'possible', why: 'If the engine never warms up to normal, the heater can’t get hot. A thermostat stuck open is a common cause.', step: 'Have a mechanic check the thermostat and coolant level.', diff: 'pro', drive: 'ok', need: 'Thermostat test; coolant level check' };
  R.r_heaterCore = { t: 'Low coolant or a heater problem is possible', c: 'possible', why: 'With a normal engine temperature but no heat, coolant may be low or not flowing through the heater.', step: 'When the engine is cool, check the coolant level (Overheating section). If it’s normal, have a mechanic check the heater system.', safe: 'Never open the coolant cap when the engine is warm.', diff: 'pro', drive: 'ok', need: 'Coolant level; heater core flow check' };
  R.r_evClimate = { t: 'Electric car heating problem — service needed', c: 'insufficient', why: 'Electric cars heat the cabin with electric heaters or heat pumps, so engine-based checks don’t apply.', step: 'Check the climate settings and any messages on the screen, then contact the manufacturer’s service center.', diff: 'pro', drive: 'ok', need: 'Manufacturer climate system diagnosis' };
  R.r_blowerRes = { t: 'A fan speed control part has likely failed', c: 'strong', why: 'When the fan works only on some speeds (often only on high), a part called the blower resistor or speed module has usually failed.', step: 'Have a shop replace the faulty blower speed control. Not urgent.', diff: 'pro', drive: 'ok', need: 'Blower resistor/module check' };
  R.r_smell = { t: 'Vent smell — check the cause', c: 'possible', why: 'A musty smell often comes from moisture in the A/C system or a dirty cabin filter. A sweet smell can mean a coolant leak. A burning smell is more serious.', step: 'Replace the cabin air filter for musty smells. For a sweet smell, check the coolant level and watch for fogging. For burning smells, have the car inspected before driving far.', diff: 'beginner', drive: 'caution', need: 'Inspection if sweet or burning smell' };
  R.r_fog = { t: 'Window fogging problem', c: 'possible', why: 'Windows that won’t clear are often caused by recirculation mode being on, a damp cabin, or the A/C not working. Greasy fog with a sweet smell can mean a heater coolant leak.', step: 'Turn off recirculation, turn on the A/C with the defrost setting (A/C dries the air). If the fog is greasy or smells sweet, have the heater system checked.', diff: 'beginner', drive: 'caution', need: 'Heater core inspection if greasy fog' };
  R.r_climatePro = { t: 'Have the climate system checked', c: 'insufficient', why: 'Your answers don’t point to one cause.', step: 'Note what happens at each fan speed and temperature setting, and show this report to a shop.', diff: 'pro', drive: 'ok', need: 'Climate system diagnosis' };

 /* ---------- LOSS OF POWER ---------- */
 N.pw_start = { q: 'How does the loss of power feel?', opts: [
   ['The check-engine light is flashing', 'r_flashCel', FUEL],
   ['The car suddenly went into a slow mode with a warning message', 'r_limp'],
   ['Engine revs rise, but the car doesn’t speed up', 'r_slip', FUEL],
   ['Sluggish, hesitates, or stumbles when I press the gas', 'pw_cel', FUEL],
   ['Weak only going uphill or with a full load', 'pw_cel', FUEL],
   ['Reduced power with a turtle symbol or battery message', 'r_evPower', { pt: ['Electric', 'Hybrid'] }],
   ['I’m not sure', 'pw_cel', FUEL],
   ['I’m not sure', 'r_evPower', { pt: ['Electric'] }]] };
  N.pw_cel = { q: 'Is the check-engine light on (steady)?', terms: ['cel'], pic: 'dash', opts: [
    ['Yes', 'r_codes'], ['No', 'pw_fuel'], ['I’m not sure', 'r_codes']] };
  N.pw_fuel = { q: 'Did it start soon after getting fuel?', opts: [
    ['Yes', 'r_badFuel'], ['No', 'r_powerPro'], ['I’m not sure', 'r_powerPro']] };
  R.r_limp = { t: 'The car may be in a protective “limp” mode', c: 'possible', why: 'Many cars limit power after detecting a problem, to protect the engine or transmission.', step: 'Drive gently to a safe place or a shop. Have the trouble codes read — they usually explain why.', diff: 'tools', drive: 'caution', terms: ['limp', 'obd'], need: 'Scan all modules for codes' };
  R.r_slip = { t: 'Transmission or clutch slipping is possible', c: 'possible', why: 'When the engine revs rise but the car doesn’t speed up, power isn’t reaching the wheels — often because an automatic transmission or a manual clutch is slipping.', step: 'Avoid hard acceleration and towing. Have the transmission (or clutch) inspected soon, including the fluid level where checkable.', diff: 'pro', drive: 'caution', need: 'Transmission fluid check; transmission scan; clutch inspection (manual)' };
  R.r_badFuel = { t: 'Poor-quality or wrong fuel is possible', c: 'possible', why: 'Problems that start right after refueling can come from contaminated or wrong fuel.', step: 'Check your receipt for the correct fuel type. If it was wrong, stop driving and have the fuel system drained. Otherwise mention the timing to a mechanic.', diff: 'pro', drive: 'caution', need: 'Fuel quality check' };
  R.r_powerPro = { t: 'Loss of power needs testing', c: 'insufficient', why: 'Power loss without a warning light can come from fuel delivery, air intake, exhaust restriction, or ignition problems.', step: 'Have a mechanic road-test the car and check fuel pressure and air intake. Bring this report.', diff: 'pro', drive: 'caution', need: 'Road test; fuel pressure test; air filter and intake check; exhaust restriction check' };
  R.r_evPower = { t: 'Reduced power in a hybrid or electric car', c: 'insufficient', why: 'Hybrids and electric cars limit power when the battery is very low, too hot or cold, or a fault is detected.', step: 'Check the battery level and any messages on the screen. If a warning is shown, drive gently to a safe place and contact the manufacturer’s service center.', safe: 'Never touch orange high-voltage cables.', diff: 'pro', drive: 'caution', need: 'Manufacturer diagnostic scan' };

 /* ---------- STALLING ---------- */
 N.sl_start = { q: 'When does the engine stall?', opts: [
   ['When slowing down, stopping, or idling', 'sl_cel'],
   ['While driving at speed', 'x_stallDriving'],
   ['Right after starting', 'ns_die'],
   ['When the A/C or lots of electrical items are on', 'r_charging'],
   ['After getting fuel', 'r_refuel'],
   ['I’m not sure', 'sl_cel']] };
  N.sl_cel = { q: 'Is a warning light on?', pic: 'dash', opts: [
    ['The check-engine light', 'r_codes'], ['The battery light', 'r_charging'], ['Neither', 'r_stallPro'], ['I’m not sure', 'r_codes']] };
  R.r_stallPro = { t: 'Stalling with no warning light needs testing', c: 'insufficient', why: 'Stalling at idle without warning lights is often related to idle control, air leaks, or fuel delivery.', step: 'Have a mechanic check idle control, look for air leaks, and test fuel pressure. Avoid situations where a stall would be dangerous.', diff: 'pro', drive: 'caution', need: 'Idle/throttle inspection; vacuum leak test; fuel pressure test' };

 /* ---------- TIRES ---------- */
 N.ti_start = { q: 'What’s wrong with the tire?', pic: 'tire', photo: true, opts: [
   ['It’s flat or nearly flat', 'ti_flat'],
   ['The tire pressure warning light is on', 'ti_tpms'],
   ['A bulge, bubble, cut, or damage on the side', 'x_bulge'],
   ['Something is stuck in the tread', 'r_nail'],
   ['The tread looks worn', 'ti_tread'],
   ['The car shakes at certain speeds', 'vb_speed'],
   ['I’m not sure', 'ti_look']] };
  N.ti_flat = { q: 'Where are you right now?', opts: [
    ['Still driving', 'x_flatDriving'], ['Stopped in a safe place', 'ti_spare'], ['Stopped somewhere unsafe', 'x_spot']] };
  N.ti_spare = { q: 'Does your car have a spare tire or a tire repair kit?', help: 'Look under the trunk or cargo floor. On many trucks and SUVs the spare hangs under the vehicle. Many newer cars have a sealant kit instead of a spare. Your owner’s manual will say.', opts: [
    ['A spare, and I know how to change a tire', 'r_spare'], ['A sealant repair kit', 'r_sealant'], ['No, I’m not sure, or I don’t want to change it', 'r_roadside']] };
  N.ti_tpms = { q: 'Is the tire pressure light steady or flashing?', terms: ['tpms'], help: 'On many cars, a steady light means a tire is low. A light that flashes for about a minute and then stays on usually means a problem with the monitoring system itself.', pic: 'dash', opts: [
    ['Steady', 'ti_check'], ['It flashes, then stays on', 'r_tpmsFault'], ['I’m not sure', 'ti_check']] };
  N.ti_check = { q: 'Check the tire pressures with a gauge. What did you find?', help: 'Compare each tire with the pressure on the sticker inside the driver’s door frame — not the maximum number printed on the tire. Check when the tires are cold. Many gas stations have air pumps with gauges.', opts: [
    ['One or more tires were low', 'r_tireLow', T1], ['All match the door sticker', 'r_tpmsReset', T1], ['I can’t check right now', 'r_tireCheck']] };
  N.ti_look = { q: 'Walk around the car and look at each tire. What do you see?', pic: 'tire', photo: true, look: {
    what: 'The tires, including the smooth side walls.',
    where: 'All four wheels.',
    how: 'Look for a tire that sags more than the others, a bulge or bubble on the side, cuts, a nail or screw in the tread, or tread worn smooth.',
    cant: 'If you can’t look safely (for example, beside a busy road), get to safety first.',
    safe: 'Only check when parked safely, away from traffic, with the engine off.' }, opts: [
    ['A tire looks flat or low', 'ti_flat'], ['A bulge or bubble on the side', 'x_bulge'], ['A nail, screw, or object in the tread', 'r_nail'], ['Worn or uneven tread', 'ti_tread'], ['Everything looks normal', 'r_tireOk'], ['I’m not sure', 'r_tireShop']] };
  N.ti_tread = { q: 'Try the penny test. What do you see?', help: 'Put a U.S. penny into a tread groove with Lincoln’s head upside down and facing you. If you can see the top of his head, the tread is very worn (about 2/32 of an inch or less). Try a few spots on each tire.', pic: 'penny', opts: [
    ['I can see all of Lincoln’s head', 'r_treadLow', T1], ['Part of his head is covered', 'ti_uneven', T1], ['I don’t have a penny, or I’m not sure', 'r_tireShop']] };
  N.ti_uneven = { q: 'Is one edge of the tire more worn than the other, or worn in patches?', opts: [
    ['Yes', 'r_align'], ['No, it wears evenly', 'r_treadOk'], ['I’m not sure', 'r_tireShop']] };
  R.r_spare = { t: 'Put on the spare tire', c: 'strong', why: 'You have a flat, a spare, and a safe place to work.', step: 'Follow your owner’s manual. In general: park on firm level ground, hazards on, parking brake set; loosen the wheel nuts slightly before lifting; use only the jack points shown in the manual; never put any part of your body under the car. Temporary spares have speed and distance limits printed on them — get the flat repaired or replaced soon.', safe: 'Stop if the ground is soft or sloped, or if you are near traffic — call roadside assistance instead.', diff: 'tools', tools: 'The jack and wrench supplied with the car', drive: 'caution', need: 'Tire repair or replacement' };
  R.r_sealant = { t: 'Use the tire repair kit', c: 'possible', why: 'Sealant kits can seal small punctures in the tread long enough to reach a tire shop.', unk: 'They can’t fix sidewall damage or large holes.', step: 'Follow the kit’s instructions and your owner’s manual exactly. Drive gently to a tire shop and tell them sealant was used.', diff: 'tools', drive: 'caution', need: 'Tire inspection and repair' };
  R.r_roadside = { t: 'Call roadside assistance', c: 'insufficient', why: 'Changing a tire without the right equipment or experience can be dangerous.', step: 'Call roadside assistance (often included with insurance, auto clubs, or new-car warranties). Stay in a safe place while you wait.', diff: 'beginner', drive: 'no' };
  R.r_nail = { t: 'Object in the tire — get it repaired', c: 'strong', why: 'A nail or screw in the tread usually causes a slow leak.', step: 'Leave the object in place (removing it can make the leak worse). Check the pressure and drive gently to a tire shop. Punctures in the tread can often be repaired; damage near or on the sidewall usually can’t.', diff: 'beginner', drive: 'caution', need: 'Tire puncture inspection and repair' };
  R.r_tpmsFault = { t: 'Tire pressure monitoring system fault is likely', c: 'possible', why: 'A light that flashes and then stays on usually means the monitoring system has a fault, such as a sensor battery.', unk: 'The system may not warn you about low tires until it’s repaired.', step: 'Check all tire pressures with a gauge yourself, then have a tire shop check the sensors.', diff: 'beginner', drive: 'ok', need: 'TPMS sensor check' };
  R.r_tireLow = { t: 'One or more tires were low', c: 'confirmed', why: 'You measured low pressure.', unk: 'If the same tire keeps going low, it probably has a leak.', step: 'Fill the tires to the pressure on the door sticker. The warning light may take a short drive to turn off. Check again in a day — if one has dropped, have it inspected for a leak.', diff: 'beginner', tools: 'Tire pressure gauge; air pump', drive: 'ok', need: 'Leak check if pressure drops again' };
  R.r_tpmsReset = { t: 'Pressures are correct — the system may need a reset', c: 'possible', why: 'If all tires match the door sticker but the light stays on, the system may need resetting, or a sensor may be faulty.', step: 'Drive for a short while; the light may turn off by itself. Check your owner’s manual for a reset procedure. If it stays on, have a tire shop check the sensors. Don’t forget the spare if your car monitors it.', diff: 'beginner', drive: 'ok', need: 'TPMS sensor check if light stays on' };
  R.r_tireCheck = { t: 'Check the tire pressures soon', c: 'insufficient', why: 'A steady tire pressure light usually means at least one tire is low, but we haven’t measured it yet.', step: 'Look at each tire. Drive gently to the nearest air pump and check all four with a gauge. If a tire looks flat, don’t drive on it.', diff: 'beginner', drive: 'caution', need: 'Tire pressure check' };
  R.r_treadLow = { t: 'Tread is very worn — replace the tires', c: 'strong', why: 'Seeing all of Lincoln’s head means the tread is at or below about 2/32 of an inch, the minimum commonly used in the U.S. Worn tires grip poorly, especially in rain.', step: 'Replace the tires soon. Until then, drive slower in wet weather and leave extra stopping distance.', diff: 'pro', drive: 'caution', need: 'Tire replacement; alignment check if wear is uneven' };
  R.r_treadOk = { t: 'Tread depth looks acceptable', c: 'possible', why: 'The penny test didn’t show severe wear, and the wear looks even.', unk: 'A penny test is a rough check. It can’t detect internal tire damage.', step: 'Keep checking pressures monthly. If you still notice a problem, have a tire shop inspect the tires.', diff: 'beginner', drive: '' };
  R.r_tireOk = { t: 'No obvious tire problem was seen', c: 'insufficient', why: 'A quick visual check didn’t find anything, but many tire problems can’t be seen this way.', unk: 'A visual check can’t confirm tires are safe.', step: 'Check all pressures with a gauge. If you still notice shaking, pulling or noise, have a tire shop inspect the tires and wheels.', diff: 'beginner', drive: '', need: 'Tire pressure check; tire and wheel inspection' };
  R.r_tireShop = { t: 'Have a tire shop take a look', c: 'insufficient', why: 'We couldn’t narrow it down from what you saw.', step: 'Many tire shops will look at a tire quickly. Show them this report and any photos.', diff: 'beginner', drive: 'caution', need: 'Tire inspection' };

 /* ---------- ELECTRICAL ---------- */
 N.el_start = { q: 'What isn’t working?', opts: [
   ['One light (headlight, brake light, or turn signal)', 'el_light'],
   ['A turn signal blinks very fast', 'r_bulbOut'],
   ['Power windows, locks, or mirrors', 'el_one'],
   ['Radio, screen, or power outlets', 'el_one'],
   ['Lots of things at once, or things flicker', 'r_charging'],
   ['The key fob doesn’t work', 'r_fobBatt'],
   ['I’m not sure', 'el_one']] };
  N.el_light = { q: 'Is it one side only, or both sides?', opts: [
    ['Only one side', 'r_bulbOut'], ['Both sides, or all of them', 'r_fuse'], ['I’m not sure', 'r_fuse']] };
  N.el_one = { q: 'Did it stop working suddenly, all at once?', opts: [
    ['Yes, suddenly', 'r_fuse'], ['It worked on and off first', 'r_switchWire'], ['I’m not sure', 'r_fuse']] };
  R.r_bulbOut = { t: 'A burned-out bulb is likely', c: 'strong', why: 'One light out on one side — or a turn signal blinking fast, which often means a bulb is out — usually points to a single bulb.', step: 'Walk around the car with the lights on to find which bulb is out. Replace it with the type listed in your owner’s manual, or have a shop do it.', diff: 'tools', drive: 'caution', need: 'Bulb replacement' };
  R.r_fuse = { t: 'A blown fuse is possible', c: 'possible', why: 'When something stops working suddenly, or both sides fail together, a fuse protecting that circuit is a common cause.', unk: 'A fuse that blows again means there’s a wiring fault.', step: 'Use the fuse chart in your owner’s manual to find the right fuse (only if comfortable, with the car off). Replace it only with the same rating. If it blows again, have the wiring checked.', safe: 'Never use a higher-rated fuse or a wire in place of a fuse — it can cause a fire.', diff: 'tools', tools: 'Owner’s manual fuse chart; fuse puller; correct spare fuse', drive: 'ok', need: 'Circuit check if the fuse blows again' };
  R.r_switchWire = { t: 'A switch or wiring problem is possible', c: 'possible', why: 'Things that work on and off often have a worn switch or a loose connection.', step: 'Have an auto electrician or shop check the switch and wiring. Note when it fails.', diff: 'pro', drive: 'ok', need: 'Switch and wiring check' };
  R.r_fobBatt = { t: 'The key fob battery may be weak', c: 'possible', why: 'A weak battery inside the fob is the most common reason a fob stops working.', step: 'Replace the fob battery (the type is usually printed on the battery or in the manual). Use the mechanical key if the fob has one. If it still doesn’t work, a dealer or locksmith can test it.', diff: 'beginner', tools: 'Replacement coin battery', drive: 'ok' };

})(window);
