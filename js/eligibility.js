// Eligibility engine: questionnaire → per-vehicle verdict (ELIGIBLE / REJECTED / UNDECIDED).
//
// Inputs are data only: data/vehicles/<id>.json (every number with confidence and error band),
// data/rules.json (LEGAL / CONVERSION / DESIGN / STATE layers + PENDING items) and
// data/design_catalog.json (module footprints). Nothing here invents a vehicle dimension.
//
//   REJECTED   a LEGAL rule or CONVERSION gate fails (rule + clause given), a state check fails,
//              or the requested items do not fit even at the most generous end of every
//              dimension's error band (FIT, with the sizes used).
//   UNDECIDED  the answer depends on an ESTIMATED / UNKNOWN dimension (named, with its ± band),
//              on a PENDING item, or on an unanswered fact the vehicle is likely to fail.
//              A layout that fits on the estimate but not at the low end is UNDECIDED, never ELIGIBLE.
//   ELIGIBLE   everything checkable passes at the unfavourable end of every band. Unanswered
//              conversion gates and build requirements are listed as conditions.
//
// FIT is a screening model, not a layout: furniture stands against the two side walls (two
// lanes) with an aisle between; full-width items (transverse bed, partition) span both lanes;
// the entry door keeps its stretch of the kerb-side lane clear. Facing items must leave the
// D-AISLE-MIN fail width between them by day; a deployed bed may take the aisle at night but
// not the furniture opposite.
(function (global) {
  'use strict';

  // ---------- numbers with uncertainty ----------
  // { est, low, high, conf, text } from a { value, expected_error, alt_estimates } field.
  // Alternate estimates widen the band unless marked superseded.
  function band(f) {
    if (!f || f.value == null || typeof f.value !== 'number') return null;
    const e = f.expected_error || {};
    let low = f.value - (e.minus || 0), high = f.value + (e.plus || 0);
    const alts = (f.alt_estimates || []).filter(a => !a.superseded && typeof a.value === 'number');
    alts.forEach(a => {
      const ae = a.expected_error || {};
      low = Math.min(low, a.value - (ae.minus || 0));
      high = Math.max(high, a.value + (ae.plus || 0));
    });
    const altTxt = alts.length ? `; other estimate${alts.length > 1 ? 's' : ''} ${alts.map(a => a.value).join(', ')}` : '';
    return { est: f.value, low, high, conf: f.confidence, text: (e.text ? e.text.split(' (')[0] : '±0') + altTxt, src: f.source };
  }
  const r0 = n => Math.round(n);
  const bandTxt = (b, unit) => b.low === b.high ? `${r0(b.est)}${unit || ' mm'} (${b.conf})` : `${r0(b.est)}${unit || ' mm'} (${b.conf}, ${b.text}; range ${r0(b.low)}–${r0(b.high)})`;

  // ---------- vehicle model ----------
  function vehicleModel(file) {
    const b = file.body, it = file.interior;
    const v = {
      id: file.id, name: file.display_name, kind: file.kind, build: file.body_build, family: file.body_family,
      L: band(b.length), W: band(b.width), H: band(b.height), WB: band(b.wheelbase), ROH: band(b.rear_overhang), GVW: band(b.gvw_kg),
      len: band(it.usable_length), wid: band(it.usable_width), stand: band(it.standing_height),
      emission: file.emission_standard ? file.emission_standard.value : null,
      availability: file.availability ? file.availability.value : 'current',
      x0: it.living_x0_from_rear.value,
    };
    // Entry door: the stretch of the kerb-side lane it keeps clear inside the living area
    const d = it.entry_door, from = d.from_front.value, to = d.to_front.value;
    const partition = v.L.est - v.x0 - v.len.est, rear = v.L.est - v.x0;
    const ov = (a, z) => Math.max(0, Math.min(z, rear) - Math.max(a, partition));
    const pe = (d.from_front.expected_error || {}).plus || 0;
    const se = d.width && d.width.expected_error ? (d.width.expected_error.plus || 0) : 0;
    const opts = [ov(from, to), ov(from - pe, to - pe), ov(from + pe, to + pe)];
    v.door = { est: ov(from, to), low: Math.min(...opts), high: Math.min(Math.max(...opts) + (ov(from, to) > 0 ? se : 0), to - from + se), conf: d.from_front.confidence,
      text: (d.from_front.expected_error || {}).text || '' };
    v.arch = band(it.wheel_arch.length_along_vehicle);
    v.archInLiving = v.ROH.est > v.x0 && v.ROH.est < v.x0 + v.len.est;
    return v;
  }

  // ---------- request → modules ----------
  function amenityIds(q) { return [...(q.amenities || []), ...(q.add_ons || [])]; }

  // Every combination of generic-amenity variants (e.g. sofa_cum_bed → lengthwise or transverse)
  function variantCombos(q, cat) {
    const variants = cat.amenity_variants || {};
    const gens = amenityIds(q).filter(a => variants[a]);
    let combos = [{}];
    gens.forEach(g => { combos = combos.flatMap(c => variants[g].map(v => Object.assign({}, c, { [g]: v }))); });
    return combos;
  }

  // The module set for one variant combination, with why each module is there.
  function resolveModules(q, cat, rules, combo, state) {
    const mods = new Map();
    const add = (id, why) => {
      if (!cat.modules[id]) throw new Error(`design_catalog.json has no module "${id}"`);
      const m = mods.get(id) || { id, why: [] }; if (!m.why.includes(why)) m.why.push(why); mods.set(id, m);
    };
    const map = id => combo[id] ? [combo[id]] : (cat.amenity_map[id] || [id]);
    amenityIds(q).forEach(a => map(a).forEach(id => add(id, 'requested')));
    if (q.toilet && !['washroom_compact', 'washroom_spacious', 'washroom_builder'].some(w => mods.has(w))) add('washroom_compact', 'requested (toilet)');

    // State tourism overlay (commercial use only)
    if (state) state.required.forEach(r => (cat.amenity_map[r.id] || []).forEach(id => add(combo[r.id] || id, `${state.name} policy: ${r.text}`)));

    // Legal minimums (L-MC-MIN-EQUIP): seats are the travel seats; add the rest if missing
    const provides = () => new Set([...mods.keys()].flatMap(id => cat.modules[id].provides || []));
    let p = provides();
    if (!p.has('sleeping')) add(cat.law_minimum_fill.sleeping[0], 'L-MC-MIN-EQUIP: sleeping accommodation');
    p = provides();
    if (!p.has('table')) add('removable_table', 'L-MC-MIN-EQUIP: table');
    if (!p.has('cooking')) cat.law_minimum_fill.cooking.forEach(id => add(id, 'L-MC-MIN-EQUIP: cooking facility'));
    p = provides();
    if (!p.has('storage')) add('overhead_lockers', 'L-MC-MIN-EQUIP: storage');
    add('grey_tank', 'L-GREY-TANK');
    if (q.toilet === 'cassette' || q.toilet === 'fixed') add('black_tank', 'L-BLACK-TANK (fixed toilet)');
    if ([...mods.keys()].some(id => (cat.living_electrics_triggers || []).includes(id))) add('electrical_cabinet', 'L-LIVING-ELECTRICS (24 h back-up, fuses, 230 V inlet)');
    if (q.toilet || [...mods.keys()].some(id => /washroom/.test(id))) add('fresh_water_tank', 'washroom needs fresh water');

    // Hosting: an item that fits inside a host present in the set takes no floor of its own
    const list = [...mods.values()].map(m => Object.assign({}, cat.modules[m.id], m));
    list.forEach(m => {
      const hosts = list.filter(h => (h.hosts || []).includes(m.id));
      if (hosts.length) m.hostedBy = hosts[0].id;
    });
    return list;
  }

  // ---------- packing (screening fit) ----------
  // walls: [{ label, length, depth, night_depth }], full: total full-width length.
  // Returns { need, minAisle, left, right } for the best arrangement whose facing items keep
  // `aisle` clear by day (and deployed beds fit at night), or null.
  function pack(walls, fullLen, W, aisle, door) {
    if (walls.some(m => m.depth + aisle > W)) return null;
    const n = walls.length;
    const laneLen = lane => lane.reduce((s, m) => s + m.length, 0);
    const cands = [];
    if (n <= 14) {
      for (let mask = 0; mask < (1 << n); mask++) {
        const left = [], right = [];
        walls.forEach((m, i) => ((mask >> i) & 1 ? left : right).push(m));
        cands.push({ left, right, need: fullLen + Math.max(door + laneLen(left), laneLen(right)) });
      }
    } else {
      // Too many items to try every split: balanced greedy, plus pairs on one side / the rest on the other
      const split = (toLeft) => {
        const left = [], right = [];
        walls.forEach(m => { const f = toLeft(m); if (f === true) left.push(m); else if (f === false) right.push(m); });
        [...walls].filter(m => toLeft(m) === null).sort((a, b) => b.length - a.length)
          .forEach(m => (door + laneLen(left) <= laneLen(right) ? left : right).push(m));
        cands.push({ left, right, need: fullLen + Math.max(door + laneLen(left), laneLen(right)) });
      };
      split(() => null);
      split(m => (m.id === 'seat_pair' ? false : m.id === 'seat' ? true : null));
      split(m => (m.id === 'seat_pair' ? true : m.id === 'seat' ? false : null));
    }
    cands.sort((a, b) => a.need - b.need);
    const seen = new Set();
    let tried = 0, best = null;
    for (const c of cands) {
      if (best && c.need >= best.need) break;          // a split can only get longer once laid out
      const key = c.left.map(m => m.label).sort().join(',');
      if (seen.has(key)) continue; seen.add(key);
      if (++tried > 400) break;
      ['deep', 'long'].forEach(pref => {
        const res = sweep(c.left, c.right, W, aisle, door, pref);
        if (res && (!best || res.need < best.need)) best = Object.assign({ need: fullLen + res.need }, res, { need: fullLen + res.need });
      });
    }
    return best;
  }
  // Lay both lanes out front to back. The lane that ends nearer the front takes its next item:
  // the first one (deepest or longest first) that is compatible with what is already opposite
  // (day: depths + aisle ≤ W; night: bed depths ≤ W). If none fits, the lane skips forward to
  // the end of the blocking item opposite, leaving a gap. Returns the laid-out lanes and length.
  function sweep(left, right, W, aisle, door, pref) {
    const order = pref === 'deep' ? (a, b) => b.depth - a.depth || b.length - a.length : (a, b) => b.length - a.length || b.depth - a.depth;
    const lanes = {
      L: { items: door > 0 ? [{ label: 'entry door (keep clear)', length: door, depth: 0, x0: 0, x1: door }] : [], pos: door, rem: [...left].sort(order) },
      R: { items: [], pos: 0, rem: [...right].sort(order) },
    };
    const compatible = (m, x0, opp) => opp.items.every(o => o.x1 <= x0 || o.x0 >= x0 + m.length ||
      (m.depth + o.depth + aisle <= W && (m.night_depth || m.depth) + (o.night_depth || o.depth) <= W));
    let guard = 0;
    while ((lanes.L.rem.length || lanes.R.rem.length) && guard++ < 500) {
      const k = !lanes.R.rem.length || (lanes.L.rem.length && lanes.L.pos <= lanes.R.pos) ? 'L' : 'R';
      const me = lanes[k], opp = lanes[k === 'L' ? 'R' : 'L'];
      const i = me.rem.findIndex(m => compatible(m, me.pos, opp));
      if (i >= 0) {
        const m = me.rem.splice(i, 1)[0];
        me.items.push(Object.assign({}, m, { x0: me.pos, x1: me.pos + m.length }));
        me.pos += m.length;
      } else {
        // skip to the end of the nearest opposite item that blocks the first remaining item
        const ends = opp.items.filter(o => o.x1 > me.pos).map(o => o.x1);
        if (!ends.length) return null;
        me.pos = Math.min(...ends);
      }
    }
    if (lanes.L.rem.length || lanes.R.rem.length) return null;
    const pl = lanes.L.items, pr = lanes.R.items;
    const cuts = [...new Set([0, ...pl.flatMap(m => [m.x0, m.x1]), ...pr.flatMap(m => [m.x0, m.x1])])].sort((a, b) => a - b);
    let minAisle = Infinity;
    for (let i = 0; i < cuts.length - 1; i++) {
      const mid = (cuts[i] + cuts[i + 1]) / 2;
      const a = pl.find(m => m.x0 <= mid && mid < m.x1), b = pr.find(m => m.x0 <= mid && mid < m.x1);
      if (a || b) minAisle = Math.min(minAisle, W - (a ? a.depth : 0) - (b ? b.depth : 0));
    }
    return { need: Math.max(lanes.L.pos, lanes.R.pos), minAisle, left: pl, right: pr };
  }

  // Floor items for one module set and seat tier. Seats: singles or side-by-side pairs.
  function floorItems(mods, seatsLiving, tier, strategy) {
    const walls = [], full = [];
    mods.filter(m => !m.hostedBy && m.kind !== 'zero_floor').forEach(m => {
      const it = { label: m.label || m.id, id: m.id, length: m.length, depth: m.depth, night_depth: m.night_depth };
      (m.kind === 'full_width' ? full : walls).push(it);
    });
    // Seats: singles (1 + 1 across the aisle), pairs (2 + 2) or rows of three (2 + 1)
    let s = seatsLiving;
    let nPairs = strategy === 'pairs' ? Math.floor(s / 2) : strategy === 'rows3' ? Math.round(s / 3) : 0;
    while (nPairs-- > 0 && s >= 2) { walls.push({ label: `2 × ${tier.id} seats`, id: 'seat_pair', length: tier.pitch, depth: 2 * tier.width + 40, seats: 2 }); s -= 2; }
    while (s-- > 0) walls.push({ label: `${tier.id} seat`, id: 'seat', length: tier.pitch, depth: tier.width, seats: 1 });
    return { walls, fullLen: full.reduce((t, m) => t + m.length, 0), full };
  }

  function fitAt(mods, seatsLiving, tier, W, door, aisle) {
    let best = null;
    ['singles', 'pairs', 'rows3'].forEach(strategy => {
      const { walls, fullLen, full } = floorItems(mods, seatsLiving, tier, strategy);
      const r = pack(walls, fullLen, W, aisle, door);
      if (r && (!best || r.need < best.need)) best = Object.assign(r, { full, strategy });
    });
    return best;
  }

  // Fit across the error bands → { status: PASS | FAIL | UNDECIDED, ... }
  function fitCheck(v, mods, seatsLiving, tier, aisleRule) {
    const failW = aisleRule.fail, warnW = aisleRule.warn;
    const S = {
      worst: { L: v.len.low, W: v.wid.low, door: v.door.high },
      est: { L: v.len.est, W: v.wid.est, door: v.door.est },
      best: { L: v.len.high, W: v.wid.high, door: v.door.low },
    };
    const run = (sc, aisle) => { const r = fitAt(mods, seatsLiving, tier, sc.W, sc.door, aisle); return r && r.need <= sc.L ? r : (r ? Object.assign(r, { tooLong: true }) : null); };
    const res = {}; Object.keys(S).forEach(k => { res[k] = run(S[k], failW); });
    const fits = k => res[k] && !res[k].tooLong;
    const out = { tier: tier.id, scenarios: S, res };
    if (fits('worst')) {
      out.status = 'PASS';
      out.need = res.worst.need; out.minAisle = res.worst.minAisle;
      const clean = run(S.worst, warnW);
      out.aisleWarning = !(clean && !clean.tooLong);
      out.arrangement = clean && !clean.tooLong ? clean : res.worst;
      return out;
    }
    if (!fits('best')) {
      out.status = 'FAIL';
      out.need = res.best ? res.best.need : null;
      out.reason = res.best ? `needs ${r0(res.best.need)} mm of living length; at most ${r0(S.best.L)} mm even at the long end of the estimate`
        : `no two-sided arrangement keeps a ${failW} mm aisle within ${r0(S.best.W)} mm of width`;
      return out;
    }
    // Decision depends on the uncertain dimensions: find which ones flip it
    out.status = 'UNDECIDED';
    out.fitsOnEstimate = fits('est');
    out.need = (out.fitsOnEstimate ? res.est : res.best).need;
    const flips = [];
    const base = fits('est') ? S.est : S.best;
    const probe = (key, val, label, b) => {
      const sc = Object.assign({}, base, { [key]: val });
      const r = run(sc, failW);
      if (!(r && !r.tooLong)) flips.push(`${label} ${b}`);
    };
    probe('L', S.worst.L, 'living length', bandTxt(v.len));
    probe('W', S.worst.W, 'living width', bandTxt(v.wid));
    if (v.door.high !== v.door.low) probe('door', S.worst.door, 'entry-door position', `(door keeps ${r0(v.door.est)} mm clear, ${r0(v.door.low)}–${r0(v.door.high)})`);
    out.dependsOn = flips.length ? flips : ['the combination of living length, width and door position at their unfavourable ends'];
    out.arrangement = res.est && !res.est.tooLong ? res.est : res.best;
    return out;
  }

  // ---------- rules ----------
  function category(seats, gvw) {
    if (seats <= 8) return { cat: 'M1', firm: true };
    if (gvw.high <= 5000) return { cat: 'M2', firm: true };
    if (gvw.low > 5000) return { cat: 'M3', firm: true };
    return { cat: gvw.est > 5000 ? 'M3' : 'M2', firm: false };
  }
  const ruleById = (rules, id) => ['LEGAL', 'CONVERSION', 'DESIGN'].flatMap(l => rules.layers[l]).find(r => r.id === id);
  const citeTxt = (rules, id) => {
    const r = ruleById(rules, id); if (!r) return id;
    return `${id} (${(r.cite || []).map(c => `${c.doc} ${c.clause}`).join('; ')})`;
  };

  function evaluateVehicle(file, q, rules, cat) {
    const v = vehicleModel(file);
    const seats = q.seats_excluding_driver;
    const out = { id: v.id, name: v.name, kind: v.kind, legal: [], conversion: [], state: [], design: [], requirements: [], pending: new Set(), rejected: [], undecided: [], conditions: [] };
    const reject = (why) => out.rejected.push(why);
    // Interior figures that are known to be shaky: say so on every result that leans on them
    out.caveats = [];
    const iw = file.interior.usable_width, il = file.interior.usable_length;
    if (v.kind === 'van' && il.confidence === 'ESTIMATED' && v.family !== 'force_urbania') {
      out.caveats.push('living length is the handover planning value, not measured; the one van measured so far (Urbania 4400) came out 899 mm shorter than its handover value [P-VAN-CAB-LENGTH]');
      out.pending.add('P-VAN-CAB-LENGTH');
    }
    if (v.kind === 'van' && /Revised default/.test(iw.method || '')) { out.caveats.push('living width is the Urbania width ratio applied to this body, not measured [P-WIDTH-RATIO]'); out.pending.add('P-WIDTH-RATIO'); }
    if (v.family === 'force_urbania') out.pending.add('P-BUILDER-WIDTH-HEIGHT');
    const undecide = (why) => out.undecided.push(why);

    // Route: motor caravan (AIS-124) or bus body (Rule 125C)
    const cap = ruleById(rules, 'L-MC-SEAT-CAP').check;
    out.route = 'motor_caravan';
    if (seats > cap.max_before_amendment) {
      if (v.build === 'incomplete_chassis') {
        out.route = 'bus_body';
        out.routeNote = `not a motor caravan: ${seats} seats > ${cap.max} (and > ${cap.max_before_amendment} before Amd 1), ${citeTxt(rules, 'L-MC-SEAT-CAP')}. Route: coach body on this chassis under the bus body code, ${citeTxt(rules, 'L-BUS-BODY-CODE')}.`;
        undecide('bus body code AIS-052 is not in the rulebook (document missing), so the bus-route requirements cannot be checked [P-AIS052]');
        out.pending.add('P-AIS052');
      } else {
        reject(`${seats} passenger seats is above the motor caravan cap of ${cap.max} excluding the driver (${cap.max_before_amendment} before Amd 1): ${citeTxt(rules, 'L-MC-SEAT-CAP')}. The alternative for 13+ passengers is a bus body built on a chassis, ${citeTxt(rules, 'L-BUS-BODY-CODE')}; this is a complete van, so that route needs a bus chassis instead.`);
      }
    } else if (seats > cap.max) {
      undecide(`${seats} seats: allowed under the 2014 scope (${cap.max_before_amendment}) but not under Amd 1 (${cap.max}) [P-AMD1]`);
      out.pending.add('P-AMD1');
    }

    // Category and Rule 93
    const c = category(seats, v.GVW);
    out.category = c.cat + (c.firm ? '' : ' (depends on GVW estimate)');
    if (!c.firm) undecide(`category M2 vs M3 depends on GVW ${bandTxt(v.GVW, ' kg')}`);
    const lim = (id, q2) => ruleById(rules, id).check.limit_mm[q2];
    const dimCheck = (id, label, b, limit, unit) => {
      if (!b) { undecide(`${label} UNKNOWN, ${citeTxt(rules, id)}`); return; }
      if (b.low > limit) reject(`${label} ${bandTxt(b, unit)} exceeds ${limit}${unit || ' mm'}: ${citeTxt(rules, id)}`);
      else if (b.high > limit) undecide(`${label} ${bandTxt(b, unit)} may exceed ${limit}${unit || ' mm'} (${id})`);
      else out.legal.push(`${label} ${r0(b.high)}${unit || ' mm'} ≤ ${limit}${unit || ' mm'} at the high end (${id})`);
    };
    dimCheck('L-R93-WIDTH', 'overall width', v.W, lim('L-R93-WIDTH', c.cat));
    const roofExtra = (q.expansions || []).includes('pop_top') ? null : 0;
    if (roofExtra === null) { undecide('pop-top raised height not known; Rule 93 height and whether the raised state counts are open [P-OQ-02]'); out.pending.add('P-OQ-02'); }
    else dimCheck('L-R93-HEIGHT', 'overall height (roof AC excluded for M)', v.H, lim('L-R93-HEIGHT', c.cat));
    dimCheck('L-R93-LENGTH', `overall length (${c.cat} limit)`, v.L, lim('L-R93-LENGTH', c.cat));
    const ratio = { est: v.ROH.est / v.WB.est * 100, low: v.ROH.low / v.WB.est * 100, high: v.ROH.high / v.WB.est * 100, conf: v.ROH.conf, text: v.ROH.text };
    dimCheck('L-R93-OVERHANG', 'rear overhang', Object.assign(ratio, { est: Math.round(ratio.est * 10) / 10, low: Math.round(ratio.low * 10) / 10, high: Math.round(ratio.high * 10) / 10 }), 60, ' % of wheelbase');
    if (v.id === 'ashokleyland_viking_5334wb') out.pending.add('P-OQ-13');
    if ((q.expansions || []).includes('slide_out')) { undecide('slide-out legality unresolved [P-OQ-01]'); out.pending.add('P-OQ-01'); }

    // Equipment by GVW (Rule 138) and AIS-124
    const gv = v.GVW.est;
    out.requirements.push(`2 × 2 kg fire extinguishers, one by the driver (L-EXTINGUISHERS)`);
    out.requirements.push(`${gv > 7500 ? 2 : 1} warning triangle${gv > 7500 ? 's' : ''}, ${gv > 7500 ? 2 : gv > 4000 ? 1 : 0} wheel chock${gv > 4000 && gv <= 7500 ? '' : 's'}, spare wheel, tool kit, first-aid kit (L-R138-EQUIPMENT, GVW ${gv} kg)`);
    out.requirements.push('All living equipment bolted, riveted, screwed or welded (L-MC-FIXING); wiring to IS 2465 (L-WIRING); lap belts at least on every travel seat (L-TRAVEL-SEATS)');
    if (c.cat === 'M3') out.requirements.push('M3 body: emergency exits, rear underrun protection (L-M3-BODY-EXTRAS, earlier report)');

    // Conversion gates
    const cv = q.conversion || {};
    const gate = (id, ok, txt) => { if (ok === null) out.conditions.push(`${txt} (${id}: not answered)`); else if (!ok) reject(`${txt}: ${citeTxt(rules, id)}`); else out.conversion.push(`${txt}: yes (${id})`); };
    if (v.build === 'oem_monocoque') {
      const age = cv.base_vehicle_age_years;
      if (v.availability === 'legacy') {
        if (age == null) { undecide('base vehicle: legacy BS-IV model (2018 brochure); whether any unit can be ≤ 3 years old is not known [P-LEGACY-T26]'); out.pending.add('P-LEGACY-T26'); }
        else if (age === 0) reject(`base vehicle: legacy model, not sold new; a conversion needs a registered vehicle ≤ 3 years old, ${citeTxt(rules, 'C-BASE-AGE')}`);
        else gate('C-BASE-AGE', age <= 3, `base vehicle ${age} years old ≤ 3`);
      } else gate('C-BASE-AGE', age == null ? null : age <= 3, age == null ? 'base vehicle ≤ 3 years old' : `base vehicle ${age} years old ≤ 3`);
      gate('C-RTO-14-DAYS', cv.will_endorse_rc_within_14_days == null ? null : !!cv.will_endorse_rc_within_14_days, 'RC endorsement applied for within 14 days');
    } else {
      gate('C-NEW-BUILD-TYPE-APPROVAL', cv.will_obtain_type_approval == null ? null : !!cv.will_obtain_type_approval, 'type approval of the new body by a Rule 126 agency, registration under Rule 47(g)');
    }
    gate('C-NO-MECHANICAL-CHANGES', !(cv.mechanical_changes || []).length, (cv.mechanical_changes || []).length ? `mechanical changes requested: ${cv.mechanical_changes.join(', ')}` : 'no chassis, suspension, brake, fuel or engine changes');
    gate('C-WORKSHOP', cv.workshop == null ? null : ruleById(rules, 'C-WORKSHOP').gate.allowed.includes(cv.workshop), 'work by the OEM, its dealer or a State-authorised workshop');
    gate('C-FORM-22F', cv.will_obtain_form_22f == null ? null : !!cv.will_obtain_form_22f, 'Form 22F compliance certificate');
    if ((q.expansions || []).some(x => ['pop_top', 'slide_out'].includes(x))) out.conditions.push('changed overall dimensions must be tested (C-DIMENSION-CHANGE)');

    // State overlay (commercial only)
    let state = null;
    if (q.use === 'commercial' && q.state && rules.layers.STATE[q.state]) {
      const S = rules.layers.STATE[q.state];
      state = { name: q.state[0].toUpperCase() + q.state.slice(1), required: S.required || [] };
      (S.required || []).forEach(r => { if (r.pending) out.pending.add(r.pending); });
      (S.vehicle_checks || []).forEach(vc => {
        if (vc.check === 'emission_latest' || vc.check === 'emission_bs_vi') {
          if (v.emission == null) undecide(`${state.name}: "${vc.text}" — emission standard UNKNOWN for this vehicle`);
          else if (!/BS-VI/.test(v.emission)) reject(`${state.name}: "${vc.text}" — vehicle is ${v.emission} (${S.doc} ${S.cite.clause})`);
          else out.state.push(`${vc.text}: ${v.emission}`);
        }
        if (vc.check === 'base_age_3') out.conditions.push(`${state.name}: ${vc.text}`);
      });
      out.pending.add('P-OQ-06');
      out.requirements.push(`Transport registration: fitness certificate, speed limiter, VLTD with panic button, FASTag, tourist permit across states (L-TRANSPORT-REGISTRATION, partly earlier report)`);
    } else if (q.use === 'commercial') out.requirements.push('Transport registration (L-TRANSPORT-REGISTRATION)');

    // Design checks on the vehicle itself
    const stand = ruleById(rules, 'D-STANDING-HEIGHT').values;
    if (v.stand.low < stand.min_mm) out.design.push(`standing height ${bandTxt(v.stand)} may be below ${stand.min_mm} mm (D-STANDING-HEIGHT, DESIGN STANDARD)`);
    out.design.push('kerb mass UNKNOWN: weigh the base vehicle before freezing the design (D-PAYLOAD)');

    // FIT per seat tier, best variant combination
    const aisleVals = ruleById(rules, 'D-AISLE-MIN').values;
    const aisleRule = { fail: aisleVals.fail_below_mm || aisleVals.min_mm, warn: aisleVals.warn_below_mm || aisleVals.min_mm };
    const seatsLiving = Math.max(0, seats - cat.defaults.cab_passenger_seats.value);
    const tiers = (q.seat_tiers && q.seat_tiers.length ? q.seat_tiers : ['standard']).map(t => Object.assign({ id: t }, cat.seat_tiers[t]));
    out.tiers = tiers.map(tier => {
      let best = null;
      variantCombos(q, cat).forEach(combo => {
        const mods = resolveModules(q, cat, rules, combo, state);
        const f = fitCheck(v, mods, seatsLiving, tier, aisleRule);
        const rank = { PASS: 0, UNDECIDED: 1, FAIL: 2 }[f.status];
        if (!best || rank < best.rank || (rank === best.rank && (f.need || 1e9) < (best.fit.need || 1e9))) best = { rank, fit: f, mods, combo };
      });
      const f = best.fit, t = { tier: tier.id, fit: f, mods: best.mods, combo: best.combo, rejected: [...out.rejected], undecided: [...out.undecided], design: [] };
      if (f.status === 'FAIL') t.rejected.push(`FIT: ${f.reason} (sizes from data/design_catalog.json, ${tier.id} seats ${tier.width} × ${tier.pitch} mm, aisle ≥ ${aisleRule.fail} mm: D-AISLE-MIN)`);
      if (f.status === 'UNDECIDED') t.undecided.push(`FIT: ${f.fitsOnEstimate ? 'fits on the estimate but not at the unfavourable end' : 'does not fit on the estimate, only at the favourable end'} (needs ${r0(f.need)} mm); depends on ${f.dependsOn.join('; ')}`);
      if (f.status === 'PASS' && f.aisleWarning) t.design.push(`aisle ${r0(f.minAisle)} mm: in the ${aisleRule.fail}–${aisleRule.warn} mm WARNING band (D-AISLE-MIN)`);
      if (f.arrangement && f.arrangement.minAisle < aisleRule.warn && f.status !== 'PASS') t.design.push(`best arrangement leaves a ${r0(f.arrangement.minAisle)} mm aisle (WARNING band, D-AISLE-MIN)`);
      const bed = best.mods.find(m => m.id === 'sofa_cum_bed_transverse');
      if (bed) {
        const berth = ruleById(rules, 'D-BERTH-SIZE').values.single_min[0];
        if (v.wid.est < berth) t.design.push(`transverse sofa-cum-bed: berth length = living width ${r0(v.wid.est)} mm < ${berth} mm (D-BERTH-SIZE) and it sleeps 1`);
      }
      if (v.archInLiving && f.arrangement) t.design.push(`rear wheel arch (est. ${r0(v.arch.est)} mm long, 200 mm in from each wall) sits inside the living area: only bed bases, benches or cabinets over it; seats need a plinth (D-WHEEL-ARCH)`);
      t.verdict = t.rejected.length ? 'REJECTED' : t.undecided.length ? 'UNDECIDED' : 'ELIGIBLE';
      return t;
    });
    out.pending = [...out.pending];
    return out;
  }

  function evaluate(q, vehicleFiles, rules, cat) {
    return { questionnaire: q, results: vehicleFiles.map(f => evaluateVehicle(f, q, rules, cat)) };
  }

  // ---------- plain-text report ----------
  function formatText(report, rules) {
    const q = report.questionnaire, L = [];
    const tiers = q.seat_tiers && q.seat_tiers.length ? q.seat_tiers : ['standard'];
    L.push(`${q.id}: ${q.title}`);
    L.push(`Use ${q.use}${q.state ? ', ' + q.state : ''} · ${q.seats_excluding_driver} passenger seats excl. driver (1 in the cab, ${Math.max(0, q.seats_excluding_driver - 1)} in the living area) · seat tiers: ${tiers.join(', ')}`);
    L.push('');
    L.push('SUMMARY');
    const w = Math.max(...report.results.map(r => r.name.length));
    report.results.forEach(r => {
      const cells = r.tiers.map(t => `${t.tier}: ${t.verdict}`).join(' | ');
      L.push(`  ${r.name.padEnd(w)}  ${r.route === 'bus_body' ? '[bus route] ' : ''}${cells}`);
    });
    const counts = {}; report.results.forEach(r => r.tiers.forEach(t => { counts[t.tier] = counts[t.tier] || {}; counts[t.tier][t.verdict] = (counts[t.tier][t.verdict] || 0) + 1; }));
    Object.entries(counts).forEach(([t, c]) => L.push(`  ${t}: ${['ELIGIBLE', 'UNDECIDED', 'REJECTED'].map(k => `${c[k] || 0} ${k.toLowerCase()}`).join(', ')}`));
    const first = report.results[0] && report.results[0].tiers[0];
    if (first) {
      L.push('');
      L.push('Items in the space check, as resolved for the first vehicle (each line below names any variant chosen):');
      first.mods.forEach(m => L.push(`  - ${m.label || m.id}${m.kind === 'zero_floor' ? ' (no floor area)' : m.hostedBy ? ` (inside ${m.hostedBy})` : m.kind === 'full_width' ? ` (${m.length} mm, full width)` : ` (${m.length} × ${m.depth} mm)`}: ${m.why.join('; ')}`));
    }
    report.results.forEach(r => {
      L.push('');
      L.push(`== ${r.name}  [${r.id}]  ${r.kind}, category ${r.category}${r.route === 'bus_body' ? ', bus-body route' : ''}`);
      r.tiers.forEach(t => {
        const f = t.fit;
        const fitTxt = f.status === 'PASS' ? `fits: needs ${Math.round(f.need)} mm, min aisle ${Math.round(f.minAisle)} mm at the unfavourable end`
          : f.status === 'FAIL' ? 'does not fit' : 'fit undecided';
        L.push(`  ${t.tier.padEnd(17)} ${t.verdict.padEnd(9)} ${fitTxt}${Object.keys(t.combo).length ? ' · ' + Object.values(t.combo).join(', ') : ''}`);
        t.rejected.forEach(x => L.push(`      REJECTED BY: ${x}`));
        if (!t.rejected.length) t.undecided.forEach(x => L.push(`      UNDECIDED: ${x}`));
        t.design.forEach(x => L.push(`      design warning: ${x}`));
      });
      if (r.routeNote) L.push(`    route: ${r.routeNote}`);
      r.legal.forEach(x => L.push(`    legal ok: ${x}`));
      r.state.forEach(x => L.push(`    state ok: ${x}`));
      (r.caveats || []).forEach(x => L.push(`    caveat: ${x}`));
      r.conditions.forEach(x => L.push(`    to confirm: ${x}`));
      r.design.forEach(x => L.push(`    design warning: ${x}`));
      if (r.pending.length) L.push(`    pending: ${r.pending.join(', ')}`);
    });
    L.push('');
    L.push('Build requirements for every eligible vehicle (from the first result):');
    (report.results[0] ? report.results[0].requirements : []).forEach(x => L.push(`  - ${x}`));
    return L.join('\n');
  }

  const api = { evaluate, evaluateVehicle, formatText, band, vehicleModel, resolveModules, pack };
  global.Eligibility = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
