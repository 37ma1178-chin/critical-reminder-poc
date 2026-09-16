// Shared vehicle model for every view (3D viewer, 2D top view, later the side profile).
//
// Loads data/urbania-17.json and derives all shared geometry from it ONCE, so the
// views can never disagree with each other. Nothing in here invents a dimension:
// every number comes from the JSON. Views only convert units and draw.
//
// Vehicle frame (all millimetres):
//   x: 0 at the rear bumper, increasing toward the front (0 .. body.length)
//   y: 0 on the centreline, positive toward the RIGHT side of the vehicle
//      (the driver side on a right-hand-drive vehicle)
//
// Usage (plain script, no bundler):
//   <script src="js/vehicle.js"></script>
//   const V = await Vehicle.load();   // { spec, layout }
(function (global) {
  'use strict';

  const DATA_URL = 'data/urbania-17.json';
  const COMPONENTS_URL = 'data/components.json';

  function warn(msg) { console.warn('[vehicle] ' + msg); }

  // Sanity checks on the data itself. These only warn — the drawing must still come up.
  function validate(spec) {
    const b = spec.body;
    const sumL = b.front_overhang + b.wheelbase + b.rear_overhang;
    if (sumL !== b.length) warn(`front_overhang + wheelbase + rear_overhang = ${sumL}, but body.length = ${b.length}`);
    const s = spec.stock_seating;
    const counted = s.front_seats + s.middle_rows * (s.seats_per_row_left + s.seats_per_row_right) + s.rear_bench_seats;
    if (counted !== s.total) warn(`stock_seating adds up to ${counted} seats, but total = ${s.total}`);
  }

  // Derive every shared position/size from the spec.
  function layout(spec) {
    const b = spec.body, a = spec.assumptions, s = spec.stock_seating;
    const L = b.length, W = b.width;

    const frontAxleX = L - b.front_overhang;
    const rearAxleX = b.rear_overhang;
    const partitionX = L - a.cab_depth; // cab/dashboard zone ends here, passenger cabin begins

    const interior = {
      x0: a.rear_wall_thickness,            // inside face of the rear doors
      x1: partitionX,                        // partition / cab boundary
      halfWidth: W / 2 - a.interior_wall_thickness,
    };
    interior.length = interior.x1 - interior.x0;
    interior.width = interior.halfWidth * 2;
    interior.cx = (interior.x0 + interior.x1) / 2;

    const wheelY = W / 2 - a.wheel_track_inset_from_body_edge;
    const wheels = [];
    [frontAxleX, rearAxleX].forEach(x => [-1, 1].forEach(side => wheels.push({
      x, y: side * wheelY, diameter: a.wheel_radius * 2, width: a.wheel_width, side,
    })));

    // ---- Stock seating ----
    // Every seat is a rectangle centred at (cx, cy): `depth` runs along x (front–rear),
    // `width` runs along y (left–right). All seats face the front.
    const seats = [];
    const groupWidth = n => n * s.seat_width + (n - 1) * s.paired_seat_gap;

    // Cab: driver (right, RHD) and co-driver (left)
    const cabX = L - s.cab_seat_center_from_front;
    seats.push({ kind: 'driver', cx: cabX, cy: +s.cab_seat_lateral_offset, depth: s.cab_seat_size, width: s.cab_seat_size, count: 1 });
    seats.push({ kind: 'codriver', cx: cabX, cy: -s.cab_seat_lateral_offset, depth: s.cab_seat_size, width: s.cab_seat_size, count: 1 });

    // Middle rows: a group on the left of the aisle, a group on the right
    for (let r = 0; r < s.middle_rows; r++) {
      const cx = interior.x1 - s.first_row_setback - r * s.row_pitch;
      if (s.seats_per_row_left > 0) {
        const w = groupWidth(s.seats_per_row_left);
        seats.push({ kind: 'row', side: 'left', row: r, cx, cy: -(s.aisle_width / 2 + w / 2), depth: s.seat_depth, width: w, count: s.seats_per_row_left });
      }
      if (s.seats_per_row_right > 0) {
        const w = groupWidth(s.seats_per_row_right);
        seats.push({ kind: 'row', side: 'right', row: r, cx, cy: +(s.aisle_width / 2 + w / 2), depth: s.seat_depth, width: w, count: s.seats_per_row_right });
      }
    }

    // Rear bench spans the full interior width, set back from the rear wall
    seats.push({
      kind: 'bench',
      cx: interior.x0 + s.rear_bench_setback + s.rear_bench_depth / 2, cy: 0,
      depth: s.rear_bench_depth, width: interior.width, count: s.rear_bench_seats,
    });

    const seatCount = seats.reduce((n, seat) => n + seat.count, 0);

    // Wheel housings: the box each wheel occupies inside the cabin, against the side wall.
    const wh = a.wheel_housing;
    const wheelHousings = wheels.map(w => ({
      x0: w.x - wh.length / 2, x1: w.x + wh.length / 2, cx: w.x,
      y0: w.side > 0 ? interior.halfWidth - wh.width : -interior.halfWidth,
      y1: w.side > 0 ? interior.halfWidth : -interior.halfWidth + wh.width,
      cy: w.side * (interior.halfWidth - wh.width / 2),
      length: wh.length, width: wh.width, height: wh.height, side: w.side,
      axle: w.x === frontAxleX ? 'front' : 'rear',
    })).filter(h => h.x1 > interior.x0 && h.x0 < interior.x1); // only those inside the passenger cabin

    return { frontAxleX, rearAxleX, partitionX, interior, wheels, wheelHousings, seats, seatCount };
  }

  // ---- Camper modules (data/components.json) ----
  // Lays the modules named in layout_rules.order_from_partition out rear-wards from the
  // partition in fixed, non-overlapping zones separated by layout_rules.gap_between_modules.
  // Returns zones in the vehicle frame (mm): x0/x1 = rear/front edge of the zone.
  function camperZones(spec, catalog) {
    const lay = layout(spec);
    const byId = Object.fromEntries(catalog.components.map(c => [c.id, c]));
    const gap = catalog.layout_rules.gap_between_modules;
    const zones = [];
    let front = lay.interior.x1; // partition face
    catalog.layout_rules.order_from_partition.forEach((id, i) => {
      const c = byId[id];
      if (!c) { warn(`layout_rules names unknown component "${id}"`); return; }
      if (i > 0) front -= gap;
      const x1 = front, x0 = front - c.footprint.length;
      if (c.footprint.width > lay.interior.width) warn(`${id} is ${c.footprint.width} wide but the interior is only ${lay.interior.width}`);
      zones.push({ id, component: c, x0, x1, cx: (x0 + x1) / 2, length: c.footprint.length, width: c.footprint.width, height: c.footprint.height });
      front = x0;
    });
    const walkway = front - lay.interior.x0;
    if (walkway < 0) warn(`camper modules overrun the interior by ${-walkway} mm`);
    zones.forEach(z => {
      z.overWheelHousing = lay.wheelHousings.filter(h => h.x1 > z.x0 && h.x0 < z.x1).map(h => h.axle + (h.side > 0 ? '-right' : '-left'));
      if (z.overWheelHousing.length && !z.component.clears_wheel_housing) {
        warn(`${z.id} zone (${z.x0}–${z.x1}) spans the ${z.overWheelHousing.join(', ')} wheel housing and does not clear it`);
      }
    });
    return { zones, byId, walkway, rearWalkwayX0: lay.interior.x0, rearWalkwayX1: front };
  }

  // Sum of price_inr ranges for a list of component ids, using the given variant per id where one applies.
  function priceRange(catalog, ids, variantById) {
    const byId = Object.fromEntries(catalog.components.map(c => [c.id, c]));
    let min = 0, max = 0;
    ids.forEach(id => {
      const c = byId[id];
      if (!c) return;
      let p = c.price_inr;
      if (c.variants) {
        const v = c.variants.find(v => v.id === String((variantById || {})[id])) || c.variants[0];
        p = v.price_inr;
      }
      if (p) { min += p.min; max += p.max; }
      if (c.mount_price_inr) { min += c.mount_price_inr.min; max += c.mount_price_inr.max; }
    });
    return { min, max };
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${url}: HTTP ${res.status}`);
    return res.json();
  }

  async function load(url) {
    const spec = await fetchJson(url || DATA_URL);
    validate(spec);
    let components = null;
    try { components = await fetchJson(COMPONENTS_URL); }
    catch (e) { warn(`${e.message} — camper modules unavailable`); }
    return { spec, layout: layout(spec), components, camper: components ? camperZones(spec, components) : null };
  }

  // Human-readable spec lines shared by the info panels of every view.
  function specLines(spec) {
    const b = spec.body, s = spec.stock_seating;
    return {
      size: `Length ${b.length}mm · Width ${b.width}mm · Height ${b.height}mm`,
      chassis: `Wheelbase ${b.wheelbase}mm · Ground clearance ${b.ground_clearance}mm`,
      overhang: `Front overhang ${b.front_overhang}mm · Rear overhang ${b.rear_overhang}mm`,
      seating: `Stock layout: ${s.pattern} = ${s.total}`,
      oneLine: `L ${b.length}mm · W ${b.width}mm · H ${b.height}mm · Wheelbase ${b.wheelbase}mm · F/R overhang ${b.front_overhang}/${b.rear_overhang}mm`,
    };
  }

  global.Vehicle = { load, layout, validate, specLines, camperZones, priceRange, DATA_URL, COMPONENTS_URL };
})(window);
