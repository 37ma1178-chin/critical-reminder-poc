// Interior model from data/vehicles.json (Azad Automotive Customs' approximate internal dimensions):
// usable living length behind a placeable partition, and the wheel-arch zones furniture must respect.
//
//   Interior.load()                              → data/vehicles.json
//   Interior.entryFor(data, vehicleId)           → the Azad entry for a data/vehicles/<id>.json variant, or null
//   Interior.partitionOffset(entry)              → { value, pending, range } (686 mm default while pending)
//   Interior.bareLength(entry)                   → lengthWithPartition + offset
//   Interior.usableLength(entry, position)       → bare length − partition position (no partition: position 0)
//   Interior.placePartition(entry, position, t)  → the partition as a placeable part, not part of the shell
//   Interior.model(entry, spec, layout)          → the above plus arch zones in the vehicle frame
//   Interior.checkPlacement(zones, item)         → { ok, blocked, reason, covers }
//   Interior.archCover(zone, item)               → the cover generated from the furniture placed over an arch
//   Interior.blockedPlacements(model, placements)→ camper placements that may not go where they are
//
// The partition is a component placed at `position` mm behind the front of the bare length (the back
// of the driver seats); it is not part of the shell. Arch covers are not fixed parts: the furniture
// placed over an arch is built around it, and the cover comes from that furniture. While an arch's
// dimensions are pending (all null in data/vehicles.json), nothing may be placed over its keep-out
// zone, which is the estimated wheel housing from data/vehicles/<id>.json at the high end of its
// error band. Vehicle frame as in js/vehicle.js: x from the rear bumper, y from the centreline, mm.
(function (global) {
  'use strict';
  const DATA_URL = 'data/vehicles.json';
  const PENDING = 'arch data pending';

  async function load(url) {
    const res = await fetch(url || DATA_URL);
    if (!res.ok) throw new Error(`Could not load ${url || DATA_URL}: HTTP ${res.status}`);
    return res.json();
  }

  function entryFor(data, vehicleId) {
    return (data && data.vehicles || []).find(v => (v.vehicleIds || []).includes(vehicleId)) || null;
  }

  function partitionOffset(entry) {
    const pending = entry.partitionOffset_mm == null;
    return { value: pending ? entry.partitionOffsetDefault_mm : entry.partitionOffset_mm, pending, range: entry.partitionOffsetRange_mm || null };
  }
  const bareLength = entry => entry.lengthWithPartition_mm + partitionOffset(entry).value;

  // position: mm from the front of the bare length to the partition's rear face.
  // undefined = where Azad fits it (the offset); null or 0 = no partition.
  function usableLength(entry, position) {
    const pos = position === undefined ? partitionOffset(entry).value : (position || 0);
    const bare = bareLength(entry);
    if (pos < 0 || pos > bare) throw new RangeError(`partition position ${pos} mm is outside the bare length (0–${bare} mm)`);
    return bare - pos;
  }

  // The partition as a placed part. thickness comes from the catalog (data/components.json#partition).
  function placePartition(entry, position, thickness) {
    const pos = position === undefined ? partitionOffset(entry).value : position;
    if (pos < thickness) throw new RangeError(`a ${thickness} mm partition needs a position of at least ${thickness} mm`);
    return {
      id: 'partition', placeable: true, part_of_shell: false,
      position_mm: pos, thickness_mm: thickness,
      frontFace_mm: pos - thickness, rearFace_mm: pos,       // both measured rear-wards from the back of the driver seats
      usableLength_mm: usableLength(entry, pos),
      positionPending: position === undefined && partitionOffset(entry).pending,
    };
  }

  const archKnown = entry => ['height_mm', 'width_mm', 'length_mm', 'startFromFront_mm'].every(k => entry.wheelArch && entry.wheelArch[k] != null);

  // High end of an estimate's band, from the vehicle file's provenance (js/vehicle.js toSpec)
  function high(spec, path, value) {
    const p = spec && spec.provenance && spec.provenance[path];
    return value + (p && p.expected_error ? (p.expected_error.plus || 0) : 0);
  }

  // Arch zones in the vehicle frame. Known: from Azad's figures, against the drawn side walls.
  // Pending: the estimated rear wheel housing from data/vehicles/<id>.json, widened to the high end of
  // its error band, labelled "arch data pending".
  function archZones(entry, spec, lay) {
    const hw = lay.interior.halfWidth;
    if (archKnown(entry)) {
      const a = entry.wheelArch;
      const x1 = lay.interior.x0 + bareLength(entry) - a.startFromFront_mm, x0 = x1 - a.length_mm;
      return [-1, 1].map(side => ({
        side: side < 0 ? 'left' : 'right', status: 'known', x0, x1,
        y0: side > 0 ? hw - a.width_mm : -hw, y1: side > 0 ? hw : -hw + a.width_mm, top: a.height_mm,
        source: entry.wheelArch.source || entry.source,
      }));
    }
    const base = 'interior.wheel_arch.';
    return lay.wheelHousings.filter(h => h.axle === 'rear').map(h => {
      const len = high(spec, base + 'length_along_vehicle', h.length), wid = high(spec, base + 'intrusion_from_each_side_wall', h.width);
      return {
        side: h.side < 0 ? 'left' : 'right', status: 'pending', label: PENDING,
        x0: h.cx - len / 2, x1: h.cx + len / 2,
        y0: h.side > 0 ? hw - wid : -hw, y1: h.side > 0 ? hw : -hw + wid,
        top: high(spec, base + 'height_above_floor', h.height),
        source: `keep-out until Azad sends the arch: estimated wheel housing in data/vehicles/${spec.id}.json (interior.wheel_arch) at the high end of its error band, centred on the rear axle`,
      };
    });
  }

  // What the furniture over an arch is, for its generated cover. Arch-tolerant items are the ones the
  // catalogs mark (components.json clears_wheel_housing, design_catalog.json arch_tolerant).
  function coverType(item) {
    const c = item.component || item;
    if (!(c.clears_wheel_housing || c.arch_tolerant)) return null;
    const id = String(item.id || c.id || '');
    if (/bunk|bed/.test(id)) return 'bed frame';
    if (/bench|sofa|seat/.test(id)) return 'seat base';
    return 'cabinet base';
  }

  // The cover is the part of the furniture's base that encloses the arch: where the two overlap in
  // plan, as high as the arch. Any part of the arch the furniture does not reach stays exposed.
  function archCover(zone, item) {
    const type = coverType(item);
    if (!type) return null;
    const x0 = Math.max(zone.x0, item.x0), x1 = Math.min(zone.x1, item.x1);
    const y0 = Math.max(zone.y0, item.y0), y1 = Math.min(zone.y1, item.y1);
    const exposed = (zone.x1 - zone.x0) - (x1 - x0);
    return { type, side: zone.side, x0, x1, y0, y1, height: zone.top, coversWholeArch: exposed <= 0 && y1 - y0 >= zone.y1 - zone.y0, exposedLength_mm: Math.max(0, exposed) };
  }

  const overlaps = (z, it) => it.x0 < z.x1 && it.x1 > z.x0 && it.y0 < z.y1 && it.y1 > z.y0 && (it.z0 || 0) < z.top;

  // item: { id, x0, x1, y0, y1, z0?, component? } in the vehicle frame.
  function checkPlacement(zones, item) {
    const hits = zones.filter(z => overlaps(z, item));
    if (!hits.length) return { ok: true, zones: [] };
    if (hits.some(z => z.status === 'pending')) return { ok: false, blocked: true, reason: PENDING, zones: hits };
    if (!coverType(item)) return { ok: false, blocked: true, reason: 'needs a flat floor; only a bed frame, seat base, bench or cabinet may sit over an arch (D-WHEEL-ARCH)', zones: hits };
    return { ok: true, zones: hits, covers: hits.map(z => archCover(z, item)) };
  }

  function model(entry, spec, lay) {
    const off = partitionOffset(entry);
    const bare = bareLength(entry);
    return {
      entry, partitionOffset: off, bareLength: bare,
      lengthWithPartition: entry.lengthWithPartition_mm, usableLength: usableLength(entry),
      width: entry.width_mm, height: entry.height_mm, verified: !!entry.verified,
      bareFrontX: lay ? lay.interior.x0 + bare : null,
      archPending: !archKnown(entry),
      archZones: lay ? archZones(entry, spec, lay) : [],
    };
  }

  function blockedPlacements(m, placements) {
    return placements.map(p => ({ placement: p, check: checkPlacement(m.archZones, p) })).filter(r => r.check.blocked);
  }

  // Plain-text lines for an info panel (the page escapes / formats them)
  function panelLines(m) {
    const e = m.entry, off = m.partitionOffset;
    return [
      `${e.label}, ${e.source}${e.verified ? '' : ', not verified'}`,
      `Length with Azad's partition ${e.lengthWithPartition_mm} mm (${e.as_given.length})`,
      `Bare length ${m.bareLength} mm = ${e.lengthWithPartition_mm} + partition offset ${off.value}${off.pending ? ` (temporary default; offset pending, Azad says ${off.range ? off.range.join('–') : '?'} mm)` : ''}`,
      `Width ${e.width_mm} mm (${e.as_given.width}) · height ${e.height_mm} mm (${e.as_given.height})`,
      `Wheel arches: ${m.archPending ? 'arch data pending; nothing may be placed over the hatched zones' : 'from Azad'}`,
    ];
  }

  const api = { load, entryFor, partitionOffset, bareLength, usableLength, placePartition, archKnown, archZones, coverType, archCover, checkPlacement, model, blockedPlacements, panelLines, PENDING, DATA_URL };
  global.Interior = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
