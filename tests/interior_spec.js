// Checks data/vehicles.json (Azad interior figures) and js/interior.js.
//   node tests/interior_spec.js        (exit code 1 if an expectation fails)
'use strict';
const fs = require('fs');
const path = require('path');
const V = require('../js/vehicle.js');
const I = require('../js/interior.js');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const data = read('data/vehicles.json'), comps = read('data/components.json');
let failed = 0;
const expect = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++; };
const ftin = s => { const m = /^(\d+)'(\d+)"$/.exec(s); return Math.round((+m[1] * 12 + +m[2]) * 25.4); };

// ---- data/vehicles.json ----
const vs = data.vehicles;
expect(vs.length === 5, '5 Azad vehicles');
expect(vs.every(e => ftin(e.as_given.length) === e.lengthWithPartition_mm && ftin(e.as_given.width) === e.width_mm && ftin(e.as_given.height) === e.height_mm),
  'every mm value is the feet-and-inches figure × 25.4, rounded');
expect(vs.every(e => e.partitionOffset_mm === null && e.partitionOffsetDefault_mm === 686), 'partition offset pending (null) with the 686 mm temporary default');
expect(vs.every(e => e.bareLength_mm === e.lengthWithPartition_mm + e.partitionOffsetDefault_mm && I.bareLength(e) === e.bareLength_mm), 'bareLength_mm = lengthWithPartition_mm + offset');
expect(vs.every(e => e.source === 'Azad Automotive Customs, approx, Nov 2026' && e.verified === false), 'source and verified: false on every entry');
expect(vs.every(e => ['height_mm', 'width_mm', 'length_mm', 'startFromFront_mm'].every(k => e.wheelArch[k] === null)), 'every wheelArch field is null (pending)');
expect(vs.every(e => e.vehicleIds.every(id => fs.existsSync(path.join(root, `data/vehicles/${id}.json`)))), 'every matched vehicle id exists in data/vehicles/');

// ---- partition: a placeable component, usable length = bare − position ----
const u = I.entryFor(data, 'force_urbania_4400wb');
expect(I.usableLength(u) === 4115, 'Urbania 4400: partition at the offset gives the length with partition back (4115)');
expect(I.usableLength(u, 0) === 4801 && I.usableLength(u, null) === 4801, 'no partition: usable length = bare length (4801)');
expect(I.usableLength(u, 500) === 4301, 'partition moved to 500 mm: usable length 4301');
const part = I.placePartition(u, undefined, comps.components.find(c => c.id === 'partition').footprint.length);
expect(part.placeable && !part.part_of_shell && part.positionPending && part.rearFace_mm - part.frontFace_mm === 50, 'partition is placeable, not part of the shell, 50 mm thick from the catalog');
let threw = false; try { I.usableLength(u, 99999); } catch (e) { threw = true; }
expect(threw, 'a partition position beyond the bare length is refused');
expect(I.entryFor(data, 'force_traveller_4020wb') === null, 'vehicles Azad did not measure have no entry');

// ---- arches: pending blocks placement; known arches generate a cover from the furniture ----
const spec = V.toSpec(read('data/vehicles/force_urbania_4400wb.json')), lay = V.layout(spec);
const m = I.model(u, spec, lay);
expect(m.archPending && m.archZones.length === 2 && m.archZones.every(z => z.status === 'pending'), 'Urbania 4400: two arch zones, both pending');
const P = V.camperPlacements(spec, comps, V.defaultSelection(comps));
const blocked = I.blockedPlacements(m, P.placements).map(r => r.placement.id);
expect(blocked.length > 0 && I.blockedPlacements(m, P.placements).every(r => r.check.reason === I.PENDING), `default camper layout: ${blocked.join(', ')} blocked with "${I.PENDING}"`);
expect(!blocked.includes('electrical_panel') && !blocked.includes('crew_bunk'), 'wall-mounted items above the zone and items away from it are not blocked');
const bench = P.placements.find(p => p.id === 'lounge_bench');
expect(blocked.includes('lounge_bench') && bench.component.clears_wheel_housing, 'even an arch-tolerant bench is blocked while the arch is pending');

// Same vehicle with made-up arch figures (test only, not data): built-around furniture gets a cover
const known = JSON.parse(JSON.stringify(u));
Object.assign(known.wheelArch, { height_mm: 300, width_mm: 220, length_mm: 950, startFromFront_mm: 2700 });
const mk = I.model(known, spec, lay);
expect(!mk.archPending && mk.archZones.every(z => z.status === 'known' && z.top === 300 && z.x1 - z.x0 === 950), 'known arch: zones from the arch figures');
const zr = mk.archZones.find(z => z.side === 'right');
const benchOver = { id: 'lounge_bench', component: bench.component, x0: zr.x0 - 100, x1: zr.x1 + 100, y0: zr.y0 - 200, y1: zr.y1 };
const cb = I.checkPlacement(mk.archZones, benchOver);
expect(cb.ok && cb.covers[0].type === 'seat base' && cb.covers[0].height === 300 && cb.covers[0].coversWholeArch, 'bench over a known arch: allowed, cover generated as a 300 mm seat base');
const toilet = P.placements.find(p => p.id === 'toilet_cubicle');
const ct = I.checkPlacement(mk.archZones, Object.assign({}, toilet, { x0: zr.x0, x1: zr.x0 + 900, y0: zr.y0, y1: zr.y1 }));
expect(!ct.ok && /flat floor/.test(ct.reason), 'washroom over a known arch: refused (needs a flat floor)');
const short = I.checkPlacement(mk.archZones, Object.assign({}, benchOver, { x1: zr.x0 + 400 }));
expect(short.ok && !short.covers[0].coversWholeArch && short.covers[0].exposedLength_mm === 550, 'furniture covering part of an arch leaves the rest exposed (550 mm)');

console.log(failed ? `\n${failed} expectation(s) failed` : '\nAll interior expectations met.');
process.exit(failed ? 1 : 0);
