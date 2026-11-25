// World-space bounding boxes of every mesh node in a GLB, read from the glTF JSON chunk only
// (node transforms × accessor min/max of POSITION). Nothing is rendered or changed.
// GLB frame: metres, +X forward, +Y up, −Z = left (kerb). Origin mid-body at ground level.
'use strict';
const fs = require('fs');

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

// [{ name, path: [ancestor names…, name], min: [x, y, z], max: [x, y, z] }] in metres
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

module.exports = { readGltf, worldBoxes };
