// Compares each handover GLB's interior with Azad's approximate internal dimensions (data/vehicles.json).
// Report only: the GLBs are read, never rescaled or rewritten.
//
//   node tools/validate_azad_glb.js     → prints the table, writes tests/results/azad_glb_check.{md,json}
//
// What is measured in each GLB (metres → mm, see tools/glb_boxes.js for the frame):
//   bare length  back of the driver's seat backrest (Cab/Seat_Driver_Back, rear face)
//                to the inside of the rear wall (Interior_AIS124_Living/Floor_Living, rear edge)
//   width        width of Floor_Living (inner wall face to inner wall face at the floor)
//   height       top of Floor_Living to the highest fitted item in Interior_AIS124_Living
//                (overhead lockers / wet-room walls, built up to the ceiling)
// Azad's bare length is lengthWithPartition + partition offset (686 mm default while pending), so the
// length comparison also says whether the GLB falls inside Azad's 2–2.5 ft offset range.
'use strict';
const fs = require('fs');
const path = require('path');
const { readGltf, worldBoxes } = require('./glb_boxes.js');
const Interior = require('../js/interior.js');

const root = path.join(__dirname, '..');
const TOL = 50; // mm: flag anything further apart than this
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const az = read('data/vehicles.json');

function measure(vehicleId) {
  const vf = read(`data/vehicles/${vehicleId}.json`);
  const boxes = worldBoxes(readGltf(path.join(root, vf.glb.file)));
  const find = name => { const b = boxes.find(x => x.name === name); if (!b) throw new Error(`${vf.glb.file}: no node ${name}`); return b; };
  const floor = find('Floor_Living'), seat = find('Seat_Driver_Back');
  const living = boxes.filter(b => b.path.includes('Interior_AIS124_Living') && b.name !== 'Floor_Living');
  const ceiling = Math.max(...living.map(b => b.max[1]));
  const mm = v => Math.round(v * 1000);
  return {
    vehicleId, glb: vf.glb.file,
    bareLength: mm(seat.min[0] - floor.min[0]),
    width: mm(floor.max[2] - floor.min[2]),
    height: mm(ceiling - floor.max[1]),
    data: { usable_length: vf.interior.usable_length.value, usable_width: vf.interior.usable_width.value, standing_height: vf.interior.standing_height.value },
  };
}

const rows = [];
az.vehicles.forEach(e => {
  const bare = Interior.bareLength(e), off = Interior.partitionOffset(e);
  const range = off.range ? [e.lengthWithPartition_mm + off.range[0], e.lengthWithPartition_mm + off.range[1]] : null;
  [...e.vehicleIds.map(id => [id, 'match']), ...(e.alternateVehicleIds || []).map(id => [id, 'alternate'])].forEach(([id, role]) => {
    const g = measure(id);
    const d = { length: g.bareLength - bare, width: g.width - e.width_mm, height: g.height - e.height_mm };
    rows.push({
      azad: e.label, role, vehicleId: id, glb: g.glb,
      azad_mm: { bareLength: bare, bareLengthRange: range, partitionOffsetPending: off.pending, width: e.width_mm, height: e.height_mm },
      glb_mm: { bareLength: g.bareLength, width: g.width, height: g.height },
      diff_mm: d,
      flags: Object.entries(d).filter(([, v]) => Math.abs(v) > TOL).map(([k]) => k),
      lengthInsideOffsetRange: range ? g.bareLength >= range[0] && g.bareLength <= range[1] : null,
    });
  });
});

// Cross-check where the vehicle file has a seat layout matched to Force's render: the back of the cab
// seats on the render gives a second bare length, and so an implied partition offset.
const renderChecks = [];
az.vehicles.forEach(e => e.vehicleIds.forEach(id => {
  const vf = read(`data/vehicles/${id}.json`), s = vf.stock_seating;
  if (!s) return;
  const L = vf.body.length.value, x0 = vf.interior.living_x0_from_rear.value;
  const num = f => (f && typeof f === 'object' ? f.value : f);
  const centre = num(s.cab_seat_center_from_front), depth = num(s.cab_seat_depth);
  const back = centre + depth / 2;
  const bare = L - back - x0;
  renderChecks.push(`${e.label}: Force's render puts the back of the cab seats ${back} mm from the front (seat centre ${centre} + half of ${depth}), so the bare length is ${L} − ${back} − ${x0} = ${bare} mm and the partition offset would be ${bare - e.lengthWithPartition_mm} mm, against Azad's 610–762 mm. Ask Azad where they measured from.`);
}));

// ---- table ----
const sgn = v => (v > 0 ? '+' : '') + v;
const cell = (a, g, dv) => `${String(a).padStart(5)} ${String(g).padStart(5)} ${sgn(dv).padStart(5)}${Math.abs(dv) > TOL ? ' !' : '  '}`;
const W = Math.max(...rows.map(r => (r.azad + (r.role === 'alternate' ? ' (alt)' : '')).length), 20);
const G = Math.max(...rows.map(r => r.vehicleId.length));
const lines = [
  `GLB interior vs Azad (data/vehicles.json), mm. "!" = more than ${TOL} mm apart. Report only: no GLB was changed.`,
  `Azad bare length = length with partition + ${az.components.partition.default_position_mm} mm default offset (pending); GLB bare length = back of the driver's seat to the rear wall.`,
  '',
  `${'Azad'.padEnd(W)}  ${'GLB'.padEnd(G)}  bare length            width                  height`,
  `${''.padEnd(W)}  ${''.padEnd(G)}   Azad   GLB  diff        Azad   GLB  diff        Azad   GLB  diff`,
];
rows.forEach(r => lines.push(`${(r.azad + (r.role === 'alternate' ? ' (alt)' : '')).padEnd(W)}  ${r.vehicleId.padEnd(G)}  ${cell(r.azad_mm.bareLength, r.glb_mm.bareLength, r.diff_mm.length)}    ${cell(r.azad_mm.width, r.glb_mm.width, r.diff_mm.width)}    ${cell(r.azad_mm.height, r.glb_mm.height, r.diff_mm.height)}`));
lines.push('');
const nFlag = rows.filter(r => r.flags.length).length;
renderChecks.forEach(t => lines.push('Render cross-check: ' + t));
lines.push(`${nFlag} of ${rows.length} comparisons have at least one dimension more than ${TOL} mm off. GLB bare length inside Azad's 2–2.5 ft offset range: ${rows.filter(r => r.lengthInsideOffsetRange).map(r => r.vehicleId).join(', ') || 'none'}.`);
console.log(lines.join('\n'));

// ---- files ----
const outDir = path.join(root, 'tests/results');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'azad_glb_check.json'), JSON.stringify({ generated_by: 'tools/validate_azad_glb.js', tolerance_mm: TOL, rows }, null, 2) + '\n');
const md = [
  '# GLB interiors vs Azad\'s internal dimensions',
  '',
  `Generated by \`node tools/validate_azad_glb.js\`. Azad figures from \`data/vehicles.json\` (approx, not verified); GLBs from \`assets/models/\`, read only. Flag = more than ${TOL} mm apart. **No GLB was rescaled.**`,
  '',
  'GLB measurements: bare length = rear face of the driver\'s seat backrest to the rear edge of `Floor_Living`; width = `Floor_Living` width; height = top of `Floor_Living` to the highest fitted living item (overhead lockers, built to the ceiling). Azad bare length = length with partition + 686 mm (temporary default offset; Azad says 2–2.5 ft, so the range column shows +610 to +762).',
  '',
  '| Azad | GLB | Bare length Azad | (offset range) | GLB | Diff | Width Azad | GLB | Diff | Height Azad | GLB | Diff | Flags |',
  '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|',
  ...rows.map(r => `| ${r.azad}${r.role === 'alternate' ? ' (alternate)' : ''} | \`${r.vehicleId}\` | ${r.azad_mm.bareLength} | ${r.azad_mm.bareLengthRange ? r.azad_mm.bareLengthRange.join('–') : ''} | ${r.glb_mm.bareLength} | ${sgn(r.diff_mm.length)} | ${r.azad_mm.width} | ${r.glb_mm.width} | ${sgn(r.diff_mm.width)} | ${r.azad_mm.height} | ${r.glb_mm.height} | ${sgn(r.diff_mm.height)} | ${r.flags.length ? '**' + r.flags.join(', ') + '**' : 'ok'} |`),
  '',
  `${nFlag} of ${rows.length} comparisons have at least one dimension more than ${TOL} mm off.`,
  '',
  ...(renderChecks.length ? ['## Cross-check against the OEM seat render', '', ...renderChecks.map(t => `- ${t}`), ''] : []),
];
fs.writeFileSync(path.join(outDir, 'azad_glb_check.md'), md.join('\n'));
