// Converts the research handover (data/handover/, read-only) into one repo vehicle file per
// variant: data/vehicles/<id>.json, plus data/vehicles/index.json.
//
//   node tools/import_handover.js
//
// Every number keeps { value, unit, confidence, source } (+ method / expected_error / note /
// alt_estimates where they apply). Nothing here invents a dimension: values come from the
// handover vehicles.json, the handover build inputs (models/source/vehicles.py, build_camper.py,
// quoted below with their file), the India Urbania brochure in data/reference/, and the repo's
// earlier Urbania file (data/reference/urbania-17-render-scaled.json, render-scaled values). Where two sources disagree
// the better-evidenced one is primary and the other is kept in alt_estimates.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HO = 'data/handover/rv_handover_part1_models_data_research';
const HANDOVER = JSON.parse(fs.readFileSync(path.join(ROOT, HO, 'data/vehicles.json'), 'utf8'));
const REPO_URBANIA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/reference/urbania-17-render-scaled.json'), 'utf8'));
const OUT = path.join(ROOT, 'data/vehicles');
const MODELS_OUT = 'assets/models';

const SRC = {
  india_brochure: 'Force Motors Urbania DX brochure (India), technical specifications, PDF page 6, code URBANIADX/27072025/25000; data/reference/force-urbania-dx-brochure-2026.pdf and its page image data/reference/force-urbania-dx-brochure-2026-specs-page.png',
  za_brochure: 'Force Motors Urbania brochure hosted on the South Africa Urbania site, technical specifications, PDF page 8 of 9; data/handover/rv_handover_part3_urbania_brochure/research/oem_snapshots/Force_Urbania_brochure_urbania-co-za.pdf',
  listings: 'Cardekho / ZigWheels Urbania 4400 listings (carried over from data/reference/urbania-17-render-scaled.json body.source_notes.listings_only)',
  render_top: 'Force Motors Urbania 4400WB 16+D top-view render, pixel-measured; data/reference/force-urbania-4400wb-16d-topview.jpg and topview-measurement-annotated.png (repo task 2)',
  render_side: 'Force Motors Urbania 4400WB side render, scaled; data/reference/force-urbania-4400wb-side.jpg (repo task 5)',
  vehicles_py: HO + '/models/source/vehicles.py (GLB build inputs, 19 Nov 2026)',
  build_py: HO + '/models/source/build_camper.py (GLB build rules)',
  handover_vj: HO + '/data/vehicles.json',
  conf_report: HO + '/data/interior_confidence_report.md',
  builder_oct: 'Azad Automotive Customs, "Voyager VIP on Force Urbania" (WB 4400), dimensioned top-view layouts, PDF pages 2–3, Oct 2026; data/reference/builders/azad_voyager-vip_urbania-4400_oct-2026.pdf',
};

// Body builder measurements (BUILDER_MEASURED: measured by a body builder on a built vehicle, shown on
// their dimensioned layout drawing; between CONFIRMED and ESTIMATED). Inches on the drawing.
const BUILDER = {
  urbania_living_length: 4191,   // 165 in, behind the driver partition
  urbania_living_width: 1651,    // 65 in "(internal)"
  urbania_wb: 4400,
  urbania_body_width: 2095,
};
const WIDTH_RATIO = BUILDER.urbania_living_width / BUILDER.urbania_body_width;   // 0.788

// Shape inputs the GLBs were built with (models/source/vehicles.py: nose, hood, windscreen run).
// Only used to draw an estimated side profile for variants without an OEM side render.
const BUILD_SHAPE = {
  force_traveller_3050wb: { nose: 850, hood: 1250, ws: 600 },
  force_traveller_3350wb: { nose: 850, hood: 1250, ws: 600 },
  force_traveller_3700wb: { nose: 850, hood: 1250, ws: 600 },
  force_traveller_4020wb: { nose: 850, hood: 1250, ws: 600 },
  'force_traveller-widerbody_3350wb': { nose: 850, hood: 1250, ws: 650 },
  'force_traveller-widerbody_4020wb': { nose: 850, hood: 1250, ws: 650 },
  force_traveller26_4020wb: { nose: 850, hood: 1250, ws: 650 },
  force_urbania_3350wb: { nose: 750, hood: 1200, ws: 750 },
  force_urbania_3615wb: { nose: 750, hood: 1200, ws: 750 },
  force_urbania_4400wb: { nose: 750, hood: 1200, ws: 750 },
  'tata_winger-highroof_3488wb': { nose: 550, hood: 1150, ws: 800 },
};

const FAMILY = {
  force_traveller_3050wb: 'force_traveller_n_standard', force_traveller_3350wb: 'force_traveller_n_standard',
  force_traveller_3700wb: 'force_traveller_n_standard', force_traveller_4020wb: 'force_traveller_n_standard',
  'force_traveller-widerbody_3350wb': 'force_traveller_n_wider_body', 'force_traveller-widerbody_4020wb': 'force_traveller_n_wider_body',
  force_traveller26_4020wb: 'force_traveller_26_legacy',
  force_urbania_3350wb: 'force_urbania', force_urbania_3615wb: 'force_urbania', force_urbania_4400wb: 'force_urbania',
  'tata_winger-highroof_3488wb': 'tata_winger_high_roof',
  tata_lp410_3400wb: 'tata_lp410_chassis', eicher_pro3010l_5260wb: 'eicher_pro3010l_chassis', ashokleyland_viking_5334wb: 'ashok_leyland_viking_chassis',
};
const BUS_IDS = new Set(['tata_lp410_3400wb', 'eicher_pro3010l_5260wb', 'ashokleyland_viking_5334wb']);

// ---------- helpers ----------
const P = (value, unit, confidence, source, extra) => Object.assign({ value, unit, confidence, source }, extra || {});
const est = (value, unit, source, method, err, extra) => P(value, unit, 'ESTIMATED', source, Object.assign({ method }, err ? { expected_error: err } : {}, extra || {}));

// "±150 mm", "−200/+30 mm (...)", "±150–200 mm", "±300 mm plus up to −235 mm ..." → { minus, plus, text }
function parseError(text) {
  if (!text) return null;
  const t = String(text).replace(/−/g, '-');
  let m;
  if ((m = t.match(/^-\s*(\d+)\s*\/\s*\+\s*(\d+)/))) return { minus: +m[1], plus: +m[2], text };
  if ((m = t.match(/±\s*(\d+)\s*[–-]\s*(\d+)/))) return { minus: +m[2], plus: +m[2], text };
  if ((m = t.match(/±\s*(\d+)/))) {
    const extra = t.match(/plus up to -\s*(\d+)/);
    return { minus: +m[1] + (extra ? +extra[1] : 0), plus: +m[1], text };
  }
  return { minus: null, plus: null, text };
}
// Copy a handover {value, unit, confidence, source, ...} field, parsing expected_error
function from(h, extra) {
  if (!h) return null;
  const o = { value: h.value, unit: h.unit, confidence: h.confidence, source: h.source };
  if (h.method) o.method = h.method;
  if (h.note) o.note = h.note;
  if (h.expected_error) o.expected_error = parseError(h.expected_error);
  if (h.leads) o.leads = h.leads;
  return Object.assign(o, extra || {});
}

function parseTyre(size, glbDiameterM, glbWidthM) {
  const s = String(size);
  let m;
  if ((m = s.match(/(\d{3})\/(\d{2})\s*R\s*(\d+(?:\.\d+)?)/))) {
    const width = +m[1], aspect = +m[2], rim = +m[3];
    return { width, aspect, rim_in: rim, diameter: Math.round(rim * 25.4 + 2 * width * aspect / 100), derived: true };
  }
  if ((m = s.match(/^(\d{3})\s*R\s*(\d+)/))) return { width: +m[1], aspect: null, rim_in: +m[2], diameter: Math.round(glbDiameterM * 1000), derived: false };
  if ((m = s.match(/^(\d+\.\d+)\s*R\s*(\d+)/))) return { width: Math.round(+m[1] * 25.4), aspect: null, rim_in: +m[2], diameter: Math.round(glbDiameterM * 1000), derived: false };
  return { width: Math.round(glbWidthM * 1000), aspect: null, rim_in: null, diameter: Math.round(glbDiameterM * 1000), derived: false };
}

function maxSeats(v) {
  const s = String(v.seating_as_sold.value);
  if (/chassis|Driver only/i.test(s) || v.seating_as_sold.value == null) {
    const m = s.match(/(\d+)\+D to (\d+)\+D/);
    if (m) return P(+m[2], 'seats excl. driver', 'ESTIMATED', v.seating_as_sold.source, { method: 'Largest of the indicative bus layouts quoted for the chassis; not a camper figure' });
    return P(null, 'seats excl. driver', 'UNKNOWN', 'Incomplete chassis: seating depends on the body builder');
  }
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (/seater/i.test(s) && !/\+D/.test(s)) {
    return P(Math.max(...nums), 'seats excl. driver', 'ESTIMATED', v.seating_as_sold.source,
      { note: `OEM says "${s}"; whether this includes the driver is unclear (handover open question 22). Taken as passenger seats here.` });
  }
  return P(Math.max(...nums), 'seats excl. driver', v.seating_as_sold.confidence, v.seating_as_sold.source, { method: `Largest option in "${s}"` });
}

const EMISSION = {
  force_traveller26_4020wb: P('BS-IV', 'emission standard', 'CONFIRMED', 'Force Motors Traveller 26 brochure, June 2018 (BS-IV, legacy); ' + HO + '/research/oem_snapshots/Force_Traveller_26_brochure_June2018_wikibus-copy.pdf'),
  'tata_winger-highroof_3488wb': P(null, 'emission standard', 'UNKNOWN', 'Tata Winger 12S page refused access on 21 Nov 2026 (handover research/sources.md)'),
  tata_lp410_3400wb: P(null, 'emission standard', 'UNKNOWN', 'No OEM card for the 3400 mm wheelbase; one aggregator listing reportedly says BS-III (handover open question 15)'),
  eicher_pro3010l_5260wb: P('BS-VI', 'emission standard', 'CONFIRMED', 'Eicher Pro 3010 L chassis page ("BSVI"); ' + HO + '/research/oem_snapshots/eicher_pro-3010-l-chassis.html'),
  ashokleyland_viking_5334wb: P(null, 'emission standard', 'UNKNOWN', 'Not stated on the saved Ashok Leyland Viking specification page'),
};
for (const id of ['force_urbania_3350wb', 'force_urbania_3615wb', 'force_urbania_4400wb']) {
  EMISSION[id] = P('BS-VI', 'emission standard', 'CONFIRMED', SRC.za_brochure + ' (engine "Type BS-VI")', { note: 'The India brochure page does not state the emission standard.' });
}
for (const wb of ['3050', '3350', '3700', '4020']) {
  EMISSION[`force_traveller_${wb}wb`] = P('BS-VI Stage 2', 'emission standard', 'CONFIRMED', `Force Motors Traveller ${wb}WB page; ${HO}/research/oem_snapshots/forcemotors_traveller-${wb}wb.html`);
}
for (const wb of ['3350', '4020']) {
  EMISSION[`force_traveller-widerbody_${wb}wb`] = P('BS-VI Stage 2', 'emission standard', 'CONFIRMED', `Force Motors Traveller Wider Body ${wb}WB page; ${HO}/research/oem_snapshots/forcemotors_traveller-wider-body-${wb}wb.html`);
}

function availability(id) {
  if (id === 'force_traveller26_4020wb') return P('legacy', 'status', 'CONFIRMED', 'Handover: legacy BS-IV model from a June 2018 brochure; not in the Force Traveller N passenger range read on 21 Nov 2026 (' + HO + '/research/reports/camper-glb_README.md)',
    { note: 'A conversion needs a registered base vehicle of at most 3 years (AIS-124 cl. 0.0(b)). The production end date is not in the data, so whether such a unit can exist is open.' });
  if (id === 'tata_lp410_3400wb') return P('uncertain', 'status', 'ESTIMATED', 'Handover open question 15: Tata lists LP 410/31, /33, /36 chassis; the 3400 mm wheelbase card was not found and may not be current');
  return P('current', 'status', 'CONFIRMED', 'Listed on the OEM site as read for the handover (21 Nov 2026)');
}

const fileMap = Object.fromEntries(fs.readFileSync(path.join(ROOT, HO, 'models/filename_map.csv'), 'utf8').trim().split('\n').slice(1)
  .map(l => l.split(',')).map(([n, o, op, sha]) => [n, { original: o, sha256: sha }]));

// Estimated side profile from the GLB build rules (build_camper.py), in the repo's terms
// (heights above ground, x positions measured from the front bumper).
function buildProfile(id, L, H, gc, floor, cabFromFront, kind) {
  const src = SRC.build_py + ' and ' + SRC.vehicles_py;
  const method = 'Shape rule the handover GLB was built with; a drawing aid, not a measurement';
  const e = (value, unit) => est(value, unit || 'mm', src, method, null);
  const side_windows = [];
  if (kind === 'van') {
    const s = BUILD_SHAPE[id];
    const bodyBottom = gc + 120, belt = s.hood + 50;
    for (let x = cabFromFront + 100; x + 1050 < L - 350; x += 1050 + 140) side_windows.push([x, x + 1050]);
    return {
      body_bottom_height: e(bodyBottom), hood_length: e(s.nose),
      bumper_top_height: e(s.hood - 150), hood_height: e(s.hood), nose_length: e(s.nose),
      windshield_base_from_front: e(s.nose), windshield_base_height: e(s.hood),
      windshield_top_from_front: e(s.nose + s.ws), windshield_top_height: e(H - 50),
      roof_start_from_front: e(s.nose + s.ws + 250), rear_roof_corner_radius: e(80),
      window_sill_height: e(belt), window_top_height: e(H - 300),
      cladding_bottom_height: e(belt - 160), cladding_top_height: e(belt - 80),
      cab_door: P(null, 'mm', 'UNKNOWN', 'Cab doors are not modelled in the GLB and not published'),
      sliding_door: est({ from_front: cabFromFront + 50, to_front: cabFromFront + 950, side: 'left' }, 'mm', src, 'GLB placeholder kerb-side entry door, 50–950 mm behind the estimated cab boundary', { minus: 300, plus: 300, text: '±300 mm position, ±200 mm size (interior_confidence_report.md)' }),
      cab_window: e({ from_front: Math.round(s.nose + s.ws * 0.6), to_front: cabFromFront - 150 }),
      side_windows_from_front: e(side_windows),
      wheel_arch_clearance: e(60),
    };
  }
  const bodyBottom = Math.max(gc + 300, 450), belt = floor + 850;
  for (let x = cabFromFront + 100; x + 1350 < L - 350; x += 1350 + 140) side_windows.push([x, x + 1350]);
  return {
    body_bottom_height: e(bodyBottom), hood_length: e(0),
    bumper_top_height: e(bodyBottom + 550), hood_height: e(bodyBottom + 550), nose_length: e(0),
    windshield_base_from_front: e(0), windshield_base_height: e(bodyBottom + 550),
    windshield_top_from_front: e(120), windshield_top_height: e(H - 280),
    roof_start_from_front: e(380), rear_roof_corner_radius: e(100),
    window_sill_height: e(belt), window_top_height: e(H - 300),
    cladding_bottom_height: e(belt - 160), cladding_top_height: e(belt - 80),
    cab_door: P(null, 'mm', 'UNKNOWN', 'Not modelled; the coach body does not exist yet'),
    sliding_door: est({ from_front: 250, to_front: 950, side: 'left' }, 'mm', src, 'GLB placeholder entry door at the front of the coach body (x 0.25–0.95 m behind the nose)', { minus: 300, plus: 300, text: '±300 mm position, ±200 mm size' }),
    cab_window: e({ from_front: 250, to_front: cabFromFront - 150 }),
    side_windows_from_front: e(side_windows),
    wheel_arch_clearance: e(60),
  };
}

// ---------- India brochure, Urbania (data/reference, page 6) ----------
const INDIA = {
  3350: { gvw: 3750, seats: [9, 10] }, 3615: { gvw: 4260, seats: [9, 12, 13] }, 4400: { gvw: 4685, seats: [12, 13, 16] },
};

function convert(v) {
  const id = v.id, e = v.external, i = v.internal, g = v.glb_build_values;
  const isBus = BUS_IDS.has(id), isUrbania = id.startsWith('force_urbania_');
  const kind = isBus ? 'bus_chassis' : 'van';
  const L = e.length.value, W = e.width.value, H = e.height.value, WB = v.wheelbase.value;
  const tyre = parseTyre(e.tyre.value, g.tyre_diameter_m, null);

  const body = {
    length: from(e.length), width: from(e.width), height: from(e.height), wheelbase: from(v.wheelbase),
    ground_clearance: from(e.ground_clearance),
    front_overhang: from(e.front_overhang), rear_overhang: from(e.rear_overhang),
    front_track: P(null, 'mm', 'UNKNOWN', 'Not published on the OEM pages read for the handover'),
    rear_track: P(null, 'mm', 'UNKNOWN', 'Not published on the OEM pages read for the handover'),
    tyre: {
      size: from(e.tyre),
      width: P(tyre.width, 'mm', tyre.derived || /^\d{3}\s*R/.test(e.tyre.value) ? e.tyre.confidence : 'ESTIMATED', tyre.derived || /^\d{3}\s*R/.test(e.tyre.value) ? 'Section width read from the tyre size ' + e.tyre.value : SRC.vehicles_py, { method: 'From the tyre size' }),
      aspect: P(tyre.aspect, '%', tyre.aspect == null ? 'UNKNOWN' : e.tyre.confidence, 'From the tyre size ' + e.tyre.value),
      rim_in: P(tyre.rim_in, 'in', tyre.rim_in == null ? 'UNKNOWN' : e.tyre.confidence, 'From the tyre size ' + e.tyre.value),
      diameter: tyre.derived
        ? P(tyre.diameter, 'mm', e.tyre.confidence === 'CONFIRMED' ? 'CONFIRMED' : 'ESTIMATED', 'Derived from the tyre size ' + e.tyre.value, { method: 'rim × 25.4 + 2 × width × aspect' })
        : est(tyre.diameter, 'mm', SRC.vehicles_py, `Tyre diameter the GLB was built with; "${e.tyre.value}" does not give it directly`, { minus: 30, plus: 30, text: '±30 mm (tyre class only)' }),
    },
    gvw_kg: from(v.gvw),
    rear_wheels: P(/dual/i.test(e.rear_wheels) ? 'dual' : 'single', 'layout', 'CONFIRMED', 'Handover vehicles.json external.rear_wheels: "' + e.rear_wheels + '"'),
    axles: est(2, 'count', SRC.handover_vj, 'One wheelbase is published per variant, so two axles', null),
  };
  if (e.chassis_height) body.chassis_height = from(e.chassis_height);

  const xRearInner = 60; // build_camper.py: xr = rear + 40 mm wall + 20 mm
  const interior = {
    living_x0_from_rear: est(xRearInner, 'mm', SRC.build_py, 'Living area starts 40 mm wall + 20 mm inside the rear face (xr = xB + t + 0.02)', { minus: 30, plus: 60, text: '−30/+60 mm' }),
    usable_length: from(i.usable_length),
    usable_width: from(i.usable_width),
    standing_height: from(i.standing_height),
    floor_height: from(i.floor_height),
    wheel_arch: {
      note: i.wheel_arch_intrusion.note,
      intrusion_from_each_side_wall: from(i.wheel_arch_intrusion.intrusion_from_each_side_wall),
      height_above_floor: from(i.wheel_arch_intrusion.height_above_floor),
      length_along_vehicle: from(i.wheel_arch_intrusion.length_along_vehicle),
    },
  };
  const door = i.doors[0];
  const FOH = e.front_overhang.value;
  const df = FOH - door.front_edge_x_from_front_axle.value, dr = FOH - door.rear_edge_x_from_front_axle.value;
  interior.entry_door = {
    side: P('left', 'side', 'ESTIMATED', SRC.build_py, { method: 'Kerb (left) side, as modelled in the GLB' }),
    from_front: est(Math.min(df, dr), 'mm', SRC.build_py, 'Converted from the handover x-from-front-axle: front overhang − x', parseError(door.front_edge_x_from_front_axle.expected_error)),
    to_front: est(Math.max(df, dr), 'mm', SRC.build_py, 'Converted from the handover x-from-front-axle: front overhang − x', parseError(door.rear_edge_x_from_front_axle.expected_error)),
    width: from(door.width),
    height: from(door.height),
    oem_door_size: from(door.oem_door_size),
  };

  const cabFromFront = L - xRearInner - i.usable_length.value;
  const out = {
    id, schema: 'rv-vehicle/1',
    display_name: `${v.brand} ${v.model} ${WB} WB`,
    brand: v.brand, model: v.model, variant_name: v.variant_name,
    kind, body_build: isBus ? 'incomplete_chassis' : 'oem_monocoque', body_family: FAMILY[id],
    units: 'mm',
    sources_note: 'Imported from the research handover by tools/import_handover.js. CONFIRMED = official OEM or government document; BUILDER_MEASURED = measured by a body builder on a built vehicle (dimensioned layout drawing), between CONFIRMED and ESTIMATED; ESTIMATED = planning value, derived figure or non-official source; UNKNOWN = not found (value null). Interior dimensions are design estimates, not measurements (' + SRC.conf_report + ').',
    body,
    seating_as_sold: from(v.seating_as_sold),
    seats_as_sold_max: maxSeats(v),
    category_as_sold: from(v.category_as_sold),
    emission_standard: EMISSION[id],
    availability: availability(id),
    base_price_ex_showroom: from(v.base_price_ex_showroom),
    interior,
    exterior_profile: buildProfile(id, L, H, e.ground_clearance.value, i.floor_height.value, cabFromFront, kind),
    glb: {
      file: `${MODELS_OUT}/${id}.glb`,
      handover_file: `${HO}/${v.glb_file}`,
      original: (fileMap[path.basename(v.glb_file)] || {}).original,
      sha256: (fileMap[path.basename(v.glb_file)] || {}).sha256,
      units: 'metres', up_axis: '+Y', forward_axis: '+X (nose)', kerb_side: '−Z (left)',
      origin: 'Mid-length of the body, on the centreline, at ground level. NOT the front axle and NOT the repo origin (rear bumper). Repo x (mm from rear bumper) = (glb_x_m + L/2) × 1000.',
      front_axle_x_in_glb_m: g.front_axle_x_in_glb_m, rear_axle_x_in_glb_m: g.rear_axle_x_in_glb_m,
      built_with: { front_overhang_mm: Math.round(g.FOH_m * 1000), ground_clearance_mm: Math.round(g.ground_clearance_m * 1000), floor_mm: Math.round(g.floor_m * 1000), cab_mm: Math.round(g.cab_m * 1000) },
      layout_as_built: g.layout,
    },
  };

  if (isUrbania) urbaniaIndia(out, WB);
  applyBuilder(out, WB, isUrbania);
  return out;
}

// Azad Automotive Customs (Oct 2026) measured the Urbania 4400 interior. It supersedes the render
// scaling and the handover planning defaults for the Urbania; the Urbania 3350 / 3615 are derived
// from it; the width-loss ratio becomes the revised default for the other vans. Bus chassis are
// unchanged (their coach body does not exist yet).
function applyBuilder(out, WB, isUrbania) {
  const it = out.interior;
  const supersede = (f, why) => Object.assign({}, f, { superseded: true, why_not_primary: why });
  const keepAlts = f => (f.alt_estimates || []).map(a => supersede(a, (a.why_not_primary || '') + ' Superseded by the builder measurement.'));
  if (out.kind !== 'van') return;
  if (isUrbania && WB === BUILDER.urbania_wb) {
    it.usable_length = P(BUILDER.urbania_living_length, 'mm', 'BUILDER_MEASURED', SRC.builder_oct,
      { method: '165 in: living length behind the driver partition, on the builder\'s dimensioned top view', expected_error: { minus: 25, plus: 25, text: '±25 mm (drawing in whole inches; schematic, not to scale)' },
        alt_estimates: [supersede(it.usable_length, 'Render-scaled estimate.'), ...keepAlts(it.usable_length)] });
    it.usable_width = P(BUILDER.urbania_living_width, 'mm', 'BUILDER_MEASURED', SRC.builder_oct,
      { method: '65 in "(internal)": finished width inside the builder\'s FRP and wood side trims. The height it was taken at is not stated.', expected_error: { minus: 25, plus: 25, text: '±25 mm (drawing in whole inches)' },
        alt_estimates: [supersede(it.usable_width, 'Render-scaled estimate.'), ...keepAlts(it.usable_width)] });
    return;
  }
  if (isUrbania) {
    const len = BUILDER.urbania_living_length - (BUILDER.urbania_wb - WB);
    it.usable_length = est(len, 'mm', SRC.builder_oct, `Derived: builder-measured 4400WB living length ${BUILDER.urbania_living_length} − wheelbase difference ${BUILDER.urbania_wb - WB}. Assumes the cab and rear body are the same on every wheelbase.`,
      { minus: 50, plus: 50, text: '±50 mm (builder figure ±25 plus the same-cab assumption)' },
      { alt_estimates: [supersede(it.usable_length, 'Render-derived estimate.'), ...keepAlts(it.usable_length)] });
    it.usable_width = est(BUILDER.urbania_living_width, 'mm', SRC.builder_oct, 'Same body cross-section as the builder-measured 4400WB (65 in internal).',
      { minus: 25, plus: 25, text: '±25 mm' },
      { alt_estimates: [supersede(it.usable_width, 'Render-scaled estimate.'), ...keepAlts(it.usable_width)] });
    return;
  }
  const W = out.body.width.value, wid = Math.round(W * WIDTH_RATIO);
  it.usable_width = est(wid, 'mm', SRC.builder_oct, `Revised default: exterior width ${W} × ${(WIDTH_RATIO * 100).toFixed(1)} %, the finished-width ratio measured by Azad Automotive Customs on the Urbania 4400 (1651 / 2095). Not measured on this vehicle.`,
    { minus: 50, plus: 150, text: '−50/+150 mm (ratio from one Urbania build; bare-panel widths can be about 150 mm more, e.g. the Force Traveller cargo leaflet gives 1680 mm on a 1925 mm body)' },
    { alt_estimates: [supersede(it.usable_width, 'Handover planning default (outside width − 80 mm).')] });
}

// India brochure wins for India; better-evidenced interior values win; every replaced
// handover figure is kept in alt_estimates. The full list is in data/vehicles/URBANIA_RECONCILIATION.md.
function urbaniaIndia(out, WB) {
  const b = out.body, ind = INDIA[WB], r = REPO_URBANIA, ra = r.assumptions;
  const alt = (h, why) => Object.assign({}, h, { why_not_primary: why });
  b.gvw_kg = P(ind.gvw, 'kg', 'CONFIRMED', SRC.india_brochure, { alt_estimates: [alt(b.gvw_kg, 'South Africa brochure; the India brochure wins for India')] });
  b.ground_clearance = P(170, 'mm', 'CONFIRMED', SRC.india_brochure + ' ("Min. ground clearance 170")', { alt_estimates: [alt(b.ground_clearance, 'South Africa brochure says 200 mm min.; the India brochure wins for India')] });
  b.front_track = P(1750, 'mm', 'CONFIRMED', SRC.india_brochure, { note: 'Same 1750 mm in the South Africa brochure' });
  b.rear_track = P(1750, 'mm', 'CONFIRMED', SRC.india_brochure);
  b.length.source = SRC.india_brochure + '; same in ' + SRC.za_brochure;
  b.width.source = b.length.source; b.height.source = b.length.source; b.wheelbase.source = b.length.source;
  b.tyre.size.source = b.length.source;
  out.seating_as_sold = P(ind.seats.join('/') + '+D', 'seats excl. driver', 'CONFIRMED', SRC.india_brochure + ' ("Seating capacity (Excl. Driver)")',
    { alt_estimates: [alt(out.seating_as_sold, 'Handover figure (India site / South Africa brochure lists 10/13/17)')] });
  out.seats_as_sold_max = P(Math.max(...ind.seats), 'seats excl. driver', 'CONFIRMED', SRC.india_brochure, { method: `Largest option in ${ind.seats.join('/')}` });
  out.category_as_sold.method = (out.category_as_sold.method || '') + ` India GVW ${ind.gvw} kg is also ≤ 5 t, so the category does not change.`;

  if (WB === 4400) {
    b.front_overhang = est(r.body.front_overhang, 'mm', SRC.listings, 'Not in either brochure; listing value', { minus: 50, plus: 50, text: '±50 mm (listing; not an OEM figure)' },
      { alt_estimates: [alt(b.front_overhang, 'Handover planning value with no stated basis')] });
    b.rear_overhang = est(r.body.rear_overhang, 'mm', SRC.listings, 'Listing value; 950 + 4400 + 1660 = 7010', { minus: 50, plus: 50, text: '±50 mm' },
      { alt_estimates: [alt(b.rear_overhang, 'Derived from the handover front-overhang estimate')] });
  } else {
    const foh = b.front_overhang.value;
    b.rear_overhang = est(out.body.length.value - WB - foh, 'mm', SRC.vehicles_py, `Derived: length − wheelbase − estimated front overhang ${foh}`, { minus: 150, plus: 150, text: '±150 mm' });
  }

  // Interior: the cab depth and wall thickness scaled off Force's own 4400WB top-view render are
  // better evidence than the handover planning defaults. The cab and cross-section are common to
  // the Urbania family (the handover itself uses the same 1800 mm cab for all three).
  const L = out.body.length.value, W = out.body.width.value;
  const len = L - ra.cab_depth - ra.rear_wall_thickness, wid = W - 2 * ra.interior_wall_thickness;
  const famNote = WB === 4400 ? '' : ' Applied to this wheelbase because the Urbania cab and body cross-section are common to all three wheelbases.';
  const it = out.interior;
  it.living_x0_from_rear = est(ra.rear_wall_thickness, 'mm', SRC.render_top, 'Rear wall thickness used with the render-scaled cab depth (data/reference/urbania-17-render-scaled.json)', { minus: 50, plus: 50, text: '±50 mm' },
    { alt_estimates: [alt(it.living_x0_from_rear, 'Handover build rule')] });
  it.usable_length = est(len, 'mm', SRC.render_top, `Overall length ${L} − cab boundary ${ra.cab_depth} mm from the front (behind the cab seat backs) − rear wall ${ra.rear_wall_thickness}.${famNote}`, { minus: 50, plus: 50, text: '±50 mm (render scale)' },
    { alt_estimates: [alt(it.usable_length, `Handover planning default. It starts the living area about ${L - it.usable_length.value - 60} mm from the front, which puts the cab seats about 800 mm further forward than Force's render shows`)] });
  it.usable_width = est(wid, 'mm', SRC.render_top, `Width ${W} − 2 × ${ra.interior_wall_thickness} mm wall scaled off the render.${famNote}`, { minus: 50, plus: 50, text: '±50 mm (render scale)' },
    { alt_estimates: [alt(it.usable_width, 'Handover planning default (outside width − 80 mm), which its own report says may be up to 200 mm too wide')] });
  it.floor_height.alt_estimates = [est(ra.floor_height, 'mm', 'data/reference/urbania-17-render-scaled.json assumptions.floor_height', 'Typical value for this van class, not measured', null, { why_not_primary: 'Also a guess; the handover value is used for consistency across variants' })];
  const repoArch = ra.wheel_housing;
  it.wheel_arch.intrusion_from_each_side_wall.alt_estimates = [est(repoArch.width, 'mm', 'data/reference/urbania-17-render-scaled.json assumptions.wheel_housing', repoArch.note, null, { why_not_primary: 'Also an estimate' })];
  it.wheel_arch.height_above_floor.alt_estimates = [est(repoArch.height, 'mm', 'data/reference/urbania-17-render-scaled.json assumptions.wheel_housing', repoArch.note, null, { why_not_primary: 'Also an estimate' })];

  // Exterior shape: Force's side render (repo task 5) beats the GLB build rule.
  const pr = ra.profile, render = (value, unit) => est(value, unit || 'mm', SRC.render_side, 'Scaled off the side render (±100 mm); brochure figures win where they exist', { minus: 100, plus: 100, text: '±100 mm' });
  const ep = {};
  ep.body_bottom_height = render(ra.body_bottom_height);
  ep.hood_length = render(ra.hood_length);
  for (const k of ['bumper_top_height', 'hood_height', 'nose_length', 'windshield_base_from_front', 'windshield_base_height', 'windshield_top_from_front', 'windshield_top_height', 'roof_start_from_front', 'rear_roof_corner_radius', 'window_sill_height', 'window_top_height', 'cladding_bottom_height', 'cladding_top_height', 'wheel_arch_clearance']) ep[k] = render(pr[k]);
  ep.cab_door = render(pr.cab_door);
  ep.sliding_door = render(pr.sliding_door);
  if (WB === 4400) ep.side_windows_from_front = render(pr.side_windows_from_front);
  else {
    // Same window pattern as the 4400 render (start behind the sliding door, pane + gap), cut to this body length
    const [[a0, a1], [b0]] = pr.side_windows_from_front, pane = a1 - a0, gap = b0 - a1, wins = [];
    for (let x = a0; x < L - 350 - 600; x += pane + gap) wins.push([x, Math.min(x + pane, L - 350)]);
    ep.side_windows_from_front = est(wins, 'mm', SRC.render_side, `4400WB render window pattern (start ${a0}, pane ${pane}, gap ${gap}) repeated on this body length`, { minus: 100, plus: 100, text: '±100 mm' });
  }
  out.exterior_profile = ep;

  const sd = pr.sliding_door;
  it.entry_door = {
    side: render(sd.side, 'side'),
    from_front: render(sd.from_front), to_front: render(sd.to_front),
    width: render(sd.to_front - sd.from_front),
    height: it.entry_door.height, oem_door_size: it.entry_door.oem_door_size,
    alt_estimates: [{ from_front: it.entry_door.from_front, to_front: it.entry_door.to_front, why_not_primary: 'GLB placeholder door' }],
  };

  if (WB === 4400) {
    const s = r.stock_seating;
    out.stock_seating = Object.assign({}, s, { source: SRC.render_top, confidence: 'ESTIMATED', confidence_note: 'Pattern matches the Force 16+D render exactly; positions ±50 mm (repo task 2).' });
  }
}

// ---------- run ----------
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(ROOT, MODELS_OUT), { recursive: true });
const index = [];
for (const v of HANDOVER.vehicles) {
  const out = convert(v);
  fs.writeFileSync(path.join(OUT, v.id + '.json'), JSON.stringify(out, null, 2) + '\n');
  fs.copyFileSync(path.join(ROOT, HO, v.glb_file), path.join(ROOT, out.glb.file));
  index.push({
    id: out.id, display_name: out.display_name, kind: out.kind, body_family: out.body_family,
    wheelbase: out.body.wheelbase.value, length: out.body.length.value, width: out.body.width.value,
    has_stock_seating: !!out.stock_seating, has_oem_side_render: out.id.startsWith('force_urbania_'),
  });
}
index.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'van' ? -1 : 1) || a.body_family.localeCompare(b.body_family) || a.wheelbase - b.wheelbase);
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({ default: 'force_urbania_4400wb', vehicles: index }, null, 2) + '\n');
console.log(`wrote ${index.length} vehicle files to data/vehicles/ and ${index.length} GLBs to ${MODELS_OUT}/`);
