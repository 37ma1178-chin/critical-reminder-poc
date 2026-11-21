// Reads the floor-standing furniture out of each handover GLB (assets/models/) and checks the
// walkable aisle against rules.json D-AISLE-MIN. Reads the glTF JSON chunk only (node transforms
// × accessor min/max of POSITION); geometry is not changed and nothing is rendered.
//
//   node tools/extract_glb_layouts.js        → data/layouts/glb/<id>.json + a printed summary
//
// GLB frame: metres, +X forward, +Y up, −Z = left (kerb). Origin mid-body at ground level.
// Repo frame: mm, x from the rear bumper, y positive to the right: x = (x_glb + L/2)·1000, y = z_glb·1000.
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('../js/eligibility.js');
const root = path.join(__dirname, '..');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'data/rules.json'), 'utf8'));

function readGltf(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('utf8', 0, 4) !== 'glTF') throw new Error(file + ': not a GLB');
  const len = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + len));
}
// 4×4 column-major helpers
const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
function trs(n) {
  if (n.matrix) return n.matrix;
  const [tx, ty, tz] = n.translation || [0, 0, 0], [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1];
  return [
    (1 - 2 * (y * y + z * z)) * sx, (2 * (x * y + z * w)) * sx, (2 * (x * z - y * w)) * sx, 0,
    (2 * (x * y - z * w)) * sy, (1 - 2 * (x * x + z * z)) * sy, (2 * (y * z + x * w)) * sy, 0,
    (2 * (x * z + y * w)) * sz, (2 * (y * z - x * w)) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1];
}
const apply = (m, p) => [0, 1, 2].map(r => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r]);

function worldBoxes(g) {
  const out = [];
  const visit = (ni, parentM, path) => {
    const n = g.nodes[ni], M = mul(parentM, trs(n)), p = [...path, n.name || ''];
    if (n.mesh != null) {
      let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
      g.meshes[n.mesh].primitives.forEach(pr => {
        const acc = g.accessors[pr.attributes.POSITION];
        for (const cx of [acc.min[0], acc.max[0]]) for (const cy of [acc.min[1], acc.max[1]]) for (const cz of [acc.min[2], acc.max[2]]) {
          const w = apply(M, [cx, cy, cz]);
          mn = mn.map((v, i) => Math.min(v, w[i])); mx = mx.map((v, i) => Math.max(v, w[i]));
        }
      });
      out.push({ name: n.name, path: p, min: mn, max: mx });
    }
    (n.children || []).forEach(c => visit(c, M, p));
  };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  g.scenes[g.scene || 0].nodes.forEach(ni => visit(ni, I, []));
  return out;
}

const index = JSON.parse(fs.readFileSync(path.join(root, 'data/vehicles/index.json'), 'utf8')).vehicles;
const outDir = path.join(root, 'data/layouts/glb');
fs.mkdirSync(outDir, { recursive: true });
const summary = [];
for (const v of index) {
  const vf = JSON.parse(fs.readFileSync(path.join(root, `data/vehicles/${v.id}.json`), 'utf8'));
  const g = readGltf(path.join(root, vf.glb.file));
  const L = vf.body.length.value / 1000;
  const boxes = worldBoxes(g);
  const floor = boxes.find(b => b.name === 'Floor_Living');
  const zf = floor ? floor.max[1] : null;
  // Floor-standing living furniture: in the living group, standing on the floor, at least 300 mm tall
  const furniture = boxes.filter(b => b.path.includes('Interior_AIS124_Living') && b.name !== 'Floor_Living'
      && zf != null && b.min[1] <= zf + 0.06 && b.max[1] >= zf + 0.3)
    .map(b => ({ name: b.name, x0: Math.round((b.min[0] + L / 2) * 1000), x1: Math.round((b.max[0] + L / 2) * 1000), y0: Math.round(b.min[2] * 1000), y1: Math.round(b.max[2] * 1000), height: Math.round((b.max[1] - zf) * 1000) }));
  const widthAtFloor = floor ? Math.round((floor.max[2] - floor.min[2]) * 1000) : null;
  const check = E.aisleCheck(furniture, widthAtFloor, rules);
  const rec = {
    id: v.id, source: vf.glb.file, extracted_by: 'tools/extract_glb_layouts.js',
    note: 'Floor-standing furniture of the handover GLB layout (build_camper.py), repo frame in mm. A design proposal from the handover, not a measured interior.',
    layout_as_built: vf.glb.layout_as_built, floor_height_mm: Math.round(zf * 1000), living_width_in_glb_mm: widthAtFloor,
    furniture, aisle_check: check,
  };
  fs.writeFileSync(path.join(outDir, v.id + '.json'), JSON.stringify(rec, null, 2) + '\n');
  summary.push(rec);
}
const w = Math.max(...summary.map(s => s.id.length));
console.log(`D-AISLE-MIN on the handover GLB layouts (fail < ${E.aisleRule(rules).fail} mm, warn < ${E.aisleRule(rules).warn} mm):`);
summary.forEach(s => {
  const c = s.aisle_check;
  console.log(`  ${s.id.padEnd(w)}  ${c.status.padEnd(7)} narrowest ${String(c.min_mm).padStart(4)} mm between ${c.where ? `${c.where.left} and ${c.where.right}, x ${c.where.x0}–${c.where.x1}` : '–'}`);
});
