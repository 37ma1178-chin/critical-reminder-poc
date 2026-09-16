# Urbania 17-seater configurator

Proof-of-concept for a vehicle interior configurator. Single vehicle for now: Force Urbania 4400 WB, 17-seater.

## Files
- `data/urbania-17.json` — the single source of truth for every dimension (mm). `body` = confirmed spec, `assumptions` = estimates, `stock_seating` = seat counts and positions (not yet confirmed against an official drawing).
- `js/vehicle.js` — loads the JSON and derives all shared geometry once (`Vehicle.load()` → `{ spec, layout }`): axle positions, interior box, wheel rectangles, and the full list of seat rectangles. Both views draw from this, so they cannot disagree. Vehicle frame: x = 0 at the rear bumper increasing to the front, y = 0 on the centreline increasing to the right (driver) side.
- `index.html` — 3D viewer (Three.js r128 via jsdelivr UMD). Cutaway/roof-off/full views, stock 17-seat layout, lounge, camper conversion (partition, crew bunk, kitchenette + fridge space, water tank + electrical panel, 32"/43" TV mount, enclosed rear toilet). Converts mm → m; scene x = vehicle x − length/2, scene z = vehicle y.
- `topview.html` — dimensioned 2D top-view SVG, 1 unit = 1 mm. Front points right, driver side is down the page.
- `tools/screenshot.js` — Playwright script that screenshots every view and dumps the top-view SVG for exact diffing. See the header comment for usage.

## Rules
- Never invent a dimension. Confirmed numbers live in `data/urbania-17.json` under `body`. Anything else goes under `assumptions` (or `stock_seating`) with `confirmed: false`.
- Both views must be driven off the same JSON so they can never disagree. Shared derivations belong in `js/vehicle.js`, not in a page.
- No vehicle dimension may be hardcoded in a page. Page margins, stroke widths, camera positions and cosmetic modelling details (roof cap, floor slab, light sizes) are not vehicle dimensions and may stay in the page.
- Lounge and camper module sizes are still placeholders inside `index.html` until `data/components.json` exists (task 3).
- Light theme only. Clean, minimal, blueprint-style.
- After every visual change, run the dev server and screenshot the page before reporting done. Do not report a fix you have not looked at.
- Toilet must always be fully enclosed. Camper modules use fixed non-overlapping zones with explicit gaps — no running-cursor placement.

## Run
`npx serve .` (or any static server), then open `/index.html` and `/topview.html`. The pages fetch the JSON, so they must be served over http — opening the files directly (`file://`) will not work.

## Task log
1. ✅ Load `data/urbania-17.json` in both files and remove hardcoded numbers. Done via `js/vehicle.js`; the values that were only in the pages moved into the JSON (`hood_length`, `rear_wall_thickness`, `wheel_width`, seat counts/setbacks/cab seat placement).

## Next tasks, in order
2. Get the official seat layout. Ask the user for the Force Motors top-view reference image; match `stock_seating` to it and set `confirmed: true`.
3. Build `data/components.json` — catalog of camper modules (toilet cubicle, kitchenette, fridge, bunk, TV sizes, water tank, electrical panel) with real product dimensions and an Indian-market price range each.
4. Make camper modules individually toggleable instead of one bundled "camper conversion" preset.
5. Add an exterior side-profile 2D view alongside the top view.
