// Shared vehicle model for every view (3D viewer, 2D top view, side profile) and the
// eligibility engine.
//
// Loads one vehicle file, data/vehicles/<id>.json, and derives all shared geometry from it
// ONCE, so the views can never disagree with each other. Nothing in here invents a dimension:
// every number comes from the file. Each number there is { value, unit, confidence, source };
// toSpec() unwraps them into plain numbers for the geometry and keeps the provenance in
// spec.provenance[path], so a view can say which numbers are estimates.
//
// Vehicle frame (all millimetres):
//   x: 0 at the rear bumper, increasing toward the front (0 .. body.length)
//   y: 0 on the centreline, positive toward the RIGHT side of the vehicle
//      (the driver side on a right-hand-drive vehicle)
//
// Usage (plain script, no bundler):
//   <script src="js/vehicle.js"></script>
//   const V = await Vehicle.load('force_traveller_3350wb');   // { spec, layout, components, camper }
//   Vehicle.load() with no id loads DEFAULT_ID (the Urbania 4400 the 3D viewer is built for).
(function (global) {
  'use strict';

  const DEFAULT_ID = 'force_urbania_4400wb';
  const INDEX_URL = 'data/vehicles/index.json';
  const vehicleUrl = id => `data/vehicles/${encodeURIComponent(id)}.json`;
  const COMPONENTS_URL = 'data/components.json';

  function warn(msg) { console.warn('[vehicle] ' + msg); }

  // { value, unit, confidence, source } → value, recursively; provenance kept by dotted path.
  function unwrap(node, path, prov) {
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      if ('value' in node && 'confidence' in node) { prov[path] = node; return node.value; }
      const out = {};
      Object.keys(node).forEach(k => { out[k] = unwrap(node[k], path ? path + '.' + k : k, prov); });
      return out;
    }
    return node;
  }

  // Vehicle file → the plain-number spec every view and layout() use.
  function toSpec(file) {
    const prov = {};
    const body = unwrap(file.body, 'body', prov);
    const interior = unwrap(file.interior, 'interior', prov);
    const ep = unwrap(file.exterior_profile, 'exterior_profile', prov);
    const x0 = interior.living_x0_from_rear;
    const arch = interior.wheel_arch;
    const profile = Object.assign({}, ep);
    delete profile.body_bottom_height; delete profile.hood_length;
    return {
      id: file.id, vehicle: file.display_name, kind: file.kind, body_build: file.body_build, body_family: file.body_family,
      body, interior,
      assumptions: {
        cab_depth: body.length - x0 - interior.usable_length,
        rear_wall_thickness: x0,
        interior_wall_thickness: (body.width - interior.usable_width) / 2,
        hood_length: ep.hood_length,
        body_bottom_height: ep.body_bottom_height,
        floor_height: interior.floor_height,
        wheel_housing: { length: arch.length_along_vehicle, width: arch.intrusion_from_each_side_wall, height: arch.height_above_floor },
        profile,
      },
      stock_seating: file.stock_seating || null,
      seats_as_sold_max: file.seats_as_sold_max ? file.seats_as_sold_max.value : null,
      gvw_kg: body.gvw_kg,
      emission_standard: file.emission_standard ? file.emission_standard.value : null,
      provenance: prov,
      raw: file,
    };
  }

  // Provenance of a dotted path, e.g. confidence(spec, 'body.front_overhang') → 'ESTIMATED'
  function provenance(spec, path) { return spec.provenance[path] || null; }
  function confidence(spec, path) { const p = provenance(spec, path); return p ? p.confidence : null; }

  // Sanity checks on the data itself. These only warn — the drawing must still come up.
  function validate(spec) {
    const b = spec.body;
    const sumL = b.front_overhang + b.wheelbase + b.rear_overhang;
    if (sumL !== b.length) warn(`${spec.id}: front_overhang + wheelbase + rear_overhang = ${sumL}, but body.length = ${b.length}`);
    const s = spec.stock_seating;
    if (!s) return;
    const skipped = (s.rows_without_left_seat || []).length;
    const counted = s.front_seats + s.middle_rows * (s.seats_per_row_left + s.seats_per_row_right) - skipped * s.seats_per_row_left + s.rear_bench_seats;
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
    interior.area_m2 = Math.round(interior.length * interior.width / 1e4) / 100;   // passenger cabin floor, behind the cab
    const cab = { x0: partitionX, x1: L - a.hood_length, width: interior.width };
    cab.length = cab.x1 - cab.x0;
    cab.area_m2 = Math.round(cab.length * cab.width / 1e4) / 100;

    // Wheels: size from the tyre code (rim + 2 × sidewall; the file carries the result), position
    // from the track (centre to centre). Track is UNKNOWN for most variants: then the wheels are
    // drawn with their outer face on the body side, a drawing convention flagged by trackKnown.
    const t = b.tyre;
    const tyreDiameter = t.diameter || Math.round(t.rim_in * 25.4 + 2 * t.width * t.aspect / 100);
    const trackKnown = b.front_track != null && b.rear_track != null;
    const wheels = [];
    [[frontAxleX, b.front_track], [rearAxleX, b.rear_track]].forEach(([x, track]) => [-1, 1].forEach(side => wheels.push({
      x, y: side * (track != null ? track / 2 : W / 2 - t.width / 2), diameter: tyreDiameter, width: t.width, side,
    })));

    // ---- Stock seating (only where a seat layout was matched to an OEM drawing) ----
    // Every seat is a rectangle centred at (cx, cy): `depth` runs along x (front–rear),
    // `width` runs along y (left–right). All seats face the front.
    const seats = [];
    if (s) {
      const groupWidth = n => n * s.seat_width + (n - 1) * s.paired_seat_gap;

      // Cab: driver (right, RHD) and co-driver (left)
      const cabX = L - s.cab_seat_center_from_front;
      seats.push({ kind: 'driver', cx: cabX, cy: +s.cab_seat_lateral_offset, depth: s.cab_seat_depth, width: s.cab_seat_width, count: 1 });
      seats.push({ kind: 'codriver', cx: cabX, cy: -s.cab_seat_lateral_offset, depth: s.cab_seat_depth, width: s.cab_seat_width, count: 1 });

      // Middle rows: a group on each side of the aisle. The aisle can be off-centre
      // (aisle_center_offset), a row can have no left seat (sliding door), and the left
      // seats can sit further back than the right ones (left_row_offset).
      const aisleC = s.aisle_center_offset || 0;
      const skip = new Set(s.rows_without_left_seat || []);
      const wLeft = groupWidth(s.seats_per_row_left), wRight = groupWidth(s.seats_per_row_right);
      for (let r = 0; r < s.middle_rows; r++) {
        const cx = interior.x1 - s.first_row_setback - r * s.row_pitch;
        if (s.seats_per_row_left > 0 && !skip.has(r + 1)) {
          seats.push({ kind: 'row', side: 'left', row: r, cx: cx - (s.left_row_offset || 0), cy: aisleC - (s.aisle_width / 2 + wLeft / 2), depth: s.seat_depth, width: wLeft, count: s.seats_per_row_left });
        }
        if (s.seats_per_row_right > 0) {
          seats.push({ kind: 'row', side: 'right', row: r, cx, cy: aisleC + (s.aisle_width / 2 + wRight / 2), depth: s.seat_depth, width: wRight, count: s.seats_per_row_right });
        }
      }

      // Rear bench spans from the left seats' outer edge to the right seats' outer edge, set back from the rear wall
      const yLeftOuter = aisleC - s.aisle_width / 2 - wLeft, yRightOuter = aisleC + s.aisle_width / 2 + wRight;
      seats.push({
        kind: 'bench',
        cx: interior.x0 + s.rear_bench_setback + s.rear_bench_depth / 2, cy: (yLeftOuter + yRightOuter) / 2,
        depth: s.rear_bench_depth, width: yRightOuter - yLeftOuter, count: s.rear_bench_seats,
      });
    } // stock seating

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

    return { frontAxleX, rearAxleX, partitionX, interior, cab, wheels, tyreDiameter, trackKnown, wheelHousings, seats, seatCount };
  }

  // ---- Exterior side profile (vehicle frame: x from the rear bumper, z above ground), all mm ----
  // Everything comes from body (brochure) and assumptions.profile (proportions scaled off the
  // side render). Returns polylines/rects any view can draw; arcs are approximated by points.
  function sideProfile(spec) {
    const b = spec.body, a = spec.assumptions, pr = a.profile;
    const L = b.length, H = b.height;
    const fx = fromFront => L - fromFront;
    const lay = layout(spec);
    const tyreR = lay.tyreDiameter / 2;
    const arcPts = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
      const t = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(t), cz + r * Math.sin(t)];
    });
    const bottom = a.body_bottom_height;
    // Outline, clockwise from the rear bottom corner: rear face, roof, windshield, hood, nose, front face, underside with wheel arches
    const rr = pr.rear_roof_corner_radius;
    let outline = [[0, bottom], [0, H - rr], ...arcPts(rr, H - rr, rr, Math.PI, Math.PI / 2, 6).slice(1)];
    outline.push([fx(pr.roof_start_from_front), H]);
    outline.push([fx(pr.windshield_top_from_front), pr.windshield_top_height]);
    outline.push([fx(pr.windshield_base_from_front), pr.windshield_base_height]);
    outline.push([fx(pr.nose_length), pr.hood_height]);
    outline.push([L, pr.bumper_top_height]);
    outline.push([L, bottom]);
    // underside from front to rear with an arch over each axle
    const archR = tyreR + pr.wheel_arch_clearance;
    [lay.frontAxleX, lay.rearAxleX].forEach(ax => {
      outline.push([ax + archR, bottom]);
      outline.push(...arcPts(ax, bottom, archR, 0, Math.PI, 8).slice(1, -1).map(([x, z]) => [x, Math.max(z, bottom)]));
      outline.push([ax - archR, bottom]);
    });
    outline.push([0, bottom]);

    // Windshield glass as seen from the side: a band inset from the windshield line, ending at the A-pillar
    const wb = [fx(pr.windshield_base_from_front), pr.windshield_base_height], wt = [fx(pr.windshield_top_from_front), pr.windshield_top_height];
    const windshield = [
      [wb[0] - 90, wb[1] + 60], [wt[0] - 90, wt[1] - 70], [wt[0] - 400, wt[1] - 70], [wb[0] - 400, wb[1] + 60],
    ];
    // Cab door: only where an OEM side render gives it (Urbania); otherwise null and not drawn.
    const cabDoor = pr.cab_door ? { x0: fx(pr.cab_door.to_front), x1: fx(pr.cab_door.from_front) } : null;
    const slidingDoor = { x0: fx(pr.sliding_door.to_front), x1: fx(pr.sliding_door.from_front), side: pr.sliding_door.side };
    const windows = [
      cabDoor ? { id: 'cab_door', x0: cabDoor.x0 + 60, x1: cabDoor.x1 - 120, z0: pr.window_sill_height, z1: pr.window_top_height - 60 }
        : pr.cab_window ? { id: 'cab', x0: fx(pr.cab_window.to_front), x1: fx(pr.cab_window.from_front), z0: pr.window_sill_height, z1: pr.window_top_height } : null,
      { id: 'sliding_door', x0: slidingDoor.x0 + 50, x1: slidingDoor.x1 - 50, z0: pr.window_sill_height, z1: pr.window_top_height },
      ...pr.side_windows_from_front.map(([f0, f1], i) => ({ id: 'side_' + (i + 1), x0: fx(f1), x1: fx(f0), z0: pr.window_sill_height, z1: pr.window_top_height })),
    ].filter(Boolean);
    const cladding = { x0: 0, x1: L, z0: pr.cladding_bottom_height, z1: pr.cladding_top_height };
    const wheels = [lay.frontAxleX, lay.rearAxleX].map(x => ({ x, z: tyreR, r: tyreR, hubR: tyreR * 0.48 }));
    return { outline, windshield, cabDoor, slidingDoor, windows, cladding, wheels, floor: a.floor_height, groundClearance: b.ground_clearance, tyreR };
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

  function variantOf(component, id) {
    if (!component.variants) return null;
    return component.variants.find(v => v.id === String(id)) || component.variants[0];
  }

  // Price range of one component (with its chosen variant and mount, if any).
  function componentPrice(component, variantId) {
    const v = variantOf(component, variantId);
    const p = v ? v.price_inr : component.price_inr;
    const out = { min: p ? p.min : 0, max: p ? p.max : 0 };
    if (component.mount_price_inr) { out.min += component.mount_price_inr.min; out.max += component.mount_price_inr.max; }
    return out;
  }

  // Sum of price_inr ranges for a list of component ids, using the given variant per id where one applies.
  function priceRange(catalog, ids, variantById) {
    const byId = Object.fromEntries(catalog.components.map(c => [c.id, c]));
    let min = 0, max = 0;
    ids.forEach(id => {
      const c = byId[id];
      if (!c) return;
      const p = componentPrice(c, (variantById || {})[id]);
      min += p.min; max += p.max;
    });
    return { min, max };
  }

  // ---- Module selection, shared between pages through the URL query ----
  // ?layout=camper&modules=crew_bunk,kitchenette,...&tv=43&fridge=built_in&toilet_unit=portable
  function defaultSelection(catalog) {
    const variants = {};
    catalog.components.forEach(c => { if (c.variants) variants[c.id] = c.variants[0].id; });
    return { modules: catalog.components.map(c => c.id), variants };
  }
  function readSelection(catalog, search) {
    const q = new URLSearchParams(search === undefined ? location.search : search);
    const sel = defaultSelection(catalog);
    if (q.has('modules')) sel.modules = q.get('modules').split(',').filter(id => catalog.components.some(c => c.id === id));
    catalog.components.forEach(c => { if (c.variants && q.has(c.id)) sel.variants[c.id] = q.get(c.id); });
    // A sub-module cannot be on without the module it requires
    const on = new Set(sel.modules);
    sel.modules = sel.modules.filter(id => {
      const c = catalog.components.find(c => c.id === id);
      return !c.requires || on.has(c.requires);
    });
    sel.layout = q.get('layout') || null;
    sel.view = q.get('view') || null;     // 3D camera preset (cutaway / topdown / full), used by index.html
    sel.vehicle = q.get('vehicle') || null; // data/vehicles/<id>.json; null = DEFAULT_ID
    return sel;
  }
  // Vehicle id from the page URL (?vehicle=...), or the default
  function vehicleFromUrl(search) {
    const q = new URLSearchParams(search === undefined ? location.search : search);
    return q.get('vehicle') || DEFAULT_ID;
  }
  function selectionQuery(sel, extra) {
    const q = new URLSearchParams();
    if (sel.vehicle) q.set('vehicle', sel.vehicle);
    if (sel.layout) q.set('layout', sel.layout);
    if (sel.view) q.set('view', sel.view);
    q.set('modules', sel.modules.join(','));
    Object.entries(sel.variants).forEach(([id, v]) => q.set(id, v));
    Object.entries(extra || {}).forEach(([k, v]) => q.set(k, v));
    return '?' + q.toString().replace(/%2C/g, ',');
  }
  function writeSelection(sel) {
    history.replaceState(null, '', selectionQuery(sel) + location.hash);
    // keep the cross-page nav links carrying the same configuration
    document.querySelectorAll('nav a[href]').forEach(a => {
      const page = a.getAttribute('href').split('?')[0];
      if (!a.classList.contains('here')) a.setAttribute('href', page + selectionQuery(sel));
    });
  }

  // ---- Placements: one rectangle per selected module, in the vehicle frame (mm) ----
  // Every drawing of a camper module in any view starts from this list, so the views agree.
  //   { id, component, variant, x0, x1, y0, y1, z0, height, zone }   z0 = bottom above the cabin floor
  function camperPlacements(spec, catalog, selection) {
    const lay = layout(spec);
    const cz = camperZones(spec, catalog);
    const sel = selection || defaultSelection(catalog);
    const on = new Set(sel.modules);
    const byId = cz.byId;
    const hw = lay.interior.halfWidth;
    const zoneOf = id => cz.zones.find(z => z.id === id);
    const sideSpan = (side, width) => side === 'left' ? [-hw, -hw + width] : side === 'right' ? [hw - width, hw] : [-width / 2, width / 2];
    const placements = [];

    // Zone modules
    cz.zones.forEach(z => {
      if (!on.has(z.id)) return;
      const [y0, y1] = sideSpan(z.component.side || 'full', z.width);
      placements.push({ id: z.id, component: z.component, variant: null, x0: z.x0, x1: z.x1, y0, y1, z0: 0, height: z.height, zone: z.id });
    });

    // Partition: right at the front of the interior, full width
    const part = byId.partition;
    if (part && on.has('partition')) {
      placements.push({ id: 'partition', component: part, variant: null, x0: lay.interior.x1, x1: lay.interior.x1 + part.footprint.length, y0: -hw, y1: hw, z0: 0, height: part.footprint.height, zone: null });
    }

    // Sub-modules placed inside a zone or on the partition
    catalog.components.forEach(c => {
      if (!c.placement || !on.has(c.id)) return;
      if (c.requires && !on.has(c.requires)) return;
      const v = variantOf(c, sel.variants[c.id]);
      const size = v || c.footprint;
      if (c.placement.on === 'partition') {
        const px = lay.interior.x1;
        placements.push({ id: c.id, component: c, variant: v, x0: px - size.length, x1: px, y0: -size.width / 2, y1: size.width / 2, z0: c.mount_center_height - size.height / 2, height: size.height, zone: null });
        return;
      }
      const z = zoneOf(c.placement.in_zone);
      if (!z) return;
      const inset = c.placement.inset || 0;
      let x0, x1;
      if (c.placement.align === 'rear') { x0 = z.x0 + inset; x1 = x0 + size.length; }
      else if (c.placement.align === 'front') { x1 = z.x1 - inset; x0 = x1 - size.length; }
      else { x0 = z.cx - size.length / 2; x1 = z.cx + size.length / 2; }
      const [y0, y1] = sideSpan(c.placement.side, size.width);
      const yInset = c.placement.side === 'left' ? inset : c.placement.side === 'right' ? -inset : 0;
      placements.push({ id: c.id, component: c, variant: v, x0, x1, y0: y0 + yInset, y1: y1 + yInset, z0: c.mount_height || 0, height: size.height, zone: z.id });
    });

    const price = priceRange(catalog, sel.modules.filter(id => placements.some(p => p.id === id)), sel.variants);
    return { placements, zones: cz.zones, walkway: cz.walkway, price, selection: sel };
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${url}: HTTP ${res.status}`);
    return res.json();
  }

  async function load(id) {
    const vid = id || DEFAULT_ID;
    const spec = toSpec(await fetchJson(vehicleUrl(vid)));
    validate(spec);
    let components = null;
    try { components = await fetchJson(COMPONENTS_URL); }
    catch (e) { warn(`${e.message} — camper modules unavailable`); }
    return { spec, layout: layout(spec), components, camper: components ? camperZones(spec, components) : null };
  }

  // [{ id, display_name, kind, body_family, wheelbase, ... }] for a vehicle picker
  async function list() {
    const idx = await fetchJson(INDEX_URL);
    return idx.vehicles;
  }

  // Fill a <select> with every vehicle; picking one reloads the page with ?vehicle=<id>,
  // keeping the rest of the selection (layout, modules) in the URL.
  async function mountPicker(selectEl, currentId, selection) {
    const vehicles = await list();
    const group = { van: 'Vans (complete vehicles)', bus_chassis: 'Bus chassis (coach body to be built)' };
    Object.keys(group).forEach(kind => {
      const og = document.createElement('optgroup');
      og.label = group[kind];
      vehicles.filter(v => v.kind === kind).forEach(v => {
        const o = document.createElement('option');
        o.value = v.id; o.textContent = v.display_name; o.selected = v.id === currentId;
        og.appendChild(o);
      });
      selectEl.appendChild(og);
    });
    selectEl.addEventListener('change', () => {
      location.search = selectionQuery(Object.assign({ modules: [], variants: {} }, selection, { vehicle: selectEl.value }));
    });
  }

  // Human-readable spec lines shared by the info panels of every view. "(est.)" marks an
  // ESTIMATED number, "(builder)" a BUILDER_MEASURED one, "unknown" an UNKNOWN one.
  function specLines(spec) {
    const b = spec.body, s = spec.stock_seating;
    const v = (path, val, unit) => {
      const c = confidence(spec, path);
      if (val == null) return 'unknown';
      return `${val}${unit || ''}${c === 'ESTIMATED' ? ' (est.)' : c === 'BUILDER_MEASURED' ? ' (builder)' : ''}`;
    };
    return {
      size: `Length ${v('body.length', b.length, 'mm')} · Width ${v('body.width', b.width, 'mm')} · Height ${v('body.height', b.height, 'mm')}`,
      chassis: `Wheelbase ${v('body.wheelbase', b.wheelbase, 'mm')} · Track ${v('body.front_track', b.front_track, 'mm')} · Ground clearance ${v('body.ground_clearance', b.ground_clearance, 'mm')} · Tyres ${b.tyre.size} · GVW ${v('body.gvw_kg', b.gvw_kg, ' kg')}`,
      overhang: `Front overhang ${v('body.front_overhang', b.front_overhang, 'mm')} · Rear overhang ${v('body.rear_overhang', b.rear_overhang, 'mm')}`,
      seating: s ? `Stock layout: ${s.pattern} = ${s.total}` : 'Stock seat layout: not available (no OEM layout drawing in the data)',
      oneLine: `L ${b.length}mm · W ${b.width}mm · H ${b.height}mm · Wheelbase ${b.wheelbase}mm · F/R overhang ${b.front_overhang}/${b.rear_overhang}mm`,
    };
  }

  const api = { load, list, mountPicker, toSpec, layout, validate, specLines, sideProfile, camperZones, camperPlacements, priceRange, componentPrice, variantOf,
    defaultSelection, readSelection, selectionQuery, writeSelection, vehicleFromUrl, provenance, confidence, DEFAULT_ID, INDEX_URL, COMPONENTS_URL };
  global.Vehicle = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
