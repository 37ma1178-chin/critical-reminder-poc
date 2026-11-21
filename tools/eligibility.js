// Run the eligibility engine on a questionnaire and print a plain-text report.
//
//   node tools/eligibility.js data/questionnaires/test_A.json
//   node tools/eligibility.js <questionnaire> [--vehicles DIR] [--rules FILE] [--catalog FILE] [--json OUT]
//
// Defaults: data/vehicles/, data/rules.json, data/design_catalog.json. The overrides let two
// data versions be compared (e.g. before and after a data update).
'use strict';
const fs = require('fs');
const path = require('path');
const Eligibility = require('../js/eligibility.js');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const root = path.join(__dirname, '..');
const qPath = args.find(a => a.endsWith('.json') && !args.includes('--' + a));
if (!qPath) { console.error('usage: node tools/eligibility.js <questionnaire.json> [--vehicles DIR] [--rules FILE] [--catalog FILE] [--json OUT]'); process.exit(2); }
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));

const vehDir = opt('--vehicles', path.join(root, 'data/vehicles'));
const rules = read(opt('--rules', path.join(root, 'data/rules.json')));
const catalog = read(opt('--catalog', path.join(root, 'data/design_catalog.json')));
const index = read(path.join(vehDir, 'index.json'));
const files = index.vehicles.map(v => read(path.join(vehDir, v.id + '.json')));
const q = read(qPath);

const report = Eligibility.evaluate(q, files, rules, catalog);
console.log(Eligibility.formatText(report, rules));
const out = opt('--json');
if (out) {
  const slim = report.results.map(r => ({ id: r.id, name: r.name, route: r.route, category: r.category,
    tiers: r.tiers.map(t => ({ tier: t.tier, verdict: t.verdict, fit: t.fit.status, need: t.fit.need && Math.round(t.fit.need), rejected: t.rejected, undecided: t.undecided, design: t.design })),
    conditions: r.conditions, pending: r.pending }));
  fs.writeFileSync(out, JSON.stringify({ questionnaire: q.id, results: slim }, null, 2) + '\n');
}
