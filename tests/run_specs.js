// Runs the two test questionnaires and checks the hard expectations.
//   node tests/run_specs.js            (exit code 1 if an expectation fails)
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('../js/eligibility.js');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const rules = read('data/rules.json'), cat = read('data/design_catalog.json');
const files = read('data/vehicles/index.json').vehicles.map(v => read(`data/vehicles/${v.id}.json`));
let failed = 0;
const expect = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failed++; };

const B = E.evaluate(read('data/questionnaires/test_B.json'), files, rules, cat).results;
const vans = B.filter(r => r.kind === 'van'), buses = B.filter(r => r.kind === 'bus_chassis');
expect(vans.every(r => r.tiers.every(t => t.verdict === 'REJECTED')), `test B: all ${vans.length} vans REJECTED`);
expect(vans.every(r => r.tiers[0].rejected.some(x => x.includes('L-MC-SEAT-CAP'))), 'test B: every van rejection cites the motor caravan seat cap (L-MC-SEAT-CAP)');
expect(buses.every(r => r.route === 'bus_body'), 'test B: every bus chassis is pointed to the bus-body route (Rule 125C)');
expect(buses.some(r => r.tiers[0].verdict !== 'REJECTED'), `test B: at least one bus chassis is still a candidate (${buses.filter(r => r.tiers[0].verdict !== 'REJECTED').map(r => r.id).join(', ')})`);

const A = E.evaluate(read('data/questionnaires/test_A.json'), files, rules, cat).results;
expect(A.every(r => r.category.startsWith('M1')), 'test A: 6 seats + driver is M1 for every vehicle');
expect(A.every(r => r.tiers.every(t => t.mods.some(m => m.id === 'grey_tank') && t.mods.some(m => m.id === 'black_tank'))), 'test A: grey tank always, black tank with the cassette toilet');
expect(A.every(r => r.tiers.every(t => t.verdict !== 'ELIGIBLE' || t.fit.status === 'PASS')), 'test A: nothing is ELIGIBLE unless it fits at the unfavourable end of every band');
process.exit(failed ? 1 : 0);
