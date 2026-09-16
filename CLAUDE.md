# Urbania 17-seater configurator

Proof-of-concept for a vehicle interior configurator. Single vehicle for now: Force Urbania 4400 WB, 17-seater.

## Files
- `data/urbania-17.json` — the single source of truth for every dimension (mm). `body` = confirmed spec, `assumptions` = estimates, `stock_seating` = seat counts and positions (not yet confirmed against an official drawing).
- `data/components.json` — catalog of camper conversion modules (partition, crew bunk, kitchenette, fridge, lounge bench, toilet cubicle + toilet unit, water tank, electrical cabinet, TV). Each has an installed `footprint` (length along x, width along y, height), the bare `product` size where relevant, an Indian-market `price_inr` range, a `confidence` flag and `sources`. `layout_rules` gives the module order from the partition and the gap between zones.
- `js/vehicle.js` — loads both JSON files and derives all shared geometry once (`Vehicle.load()` → `{ spec, layout, components, camper }`): axle positions, interior box, wheel rectangles and housings, the full list of seat rectangles, and the camper zones (`camperZones`) laid out rear-wards from the partition. `camperPlacements(spec, catalog, selection)` turns a module selection into one rectangle per module (zone modules against their `side`, sub-modules by their `placement`), which is what every view draws. `priceRange` / `componentPrice` sum catalog prices. Both views draw from this, so they cannot disagree. Vehicle frame: x = 0 at the rear bumper increasing to the front, y = 0 on the centreline increasing to the right (driver) side.
- **Module selection lives in the URL query** so both pages show the same configuration: `?layout=camper&modules=a,b,c&tv=43&fridge=built_in&toilet_unit=portable&view=topdown` (`Vehicle.readSelection` / `writeSelection` / `selectionQuery`; `view` is the 3D camera preset). Zones are fixed: a module that is off leaves its bay empty. A sub-module with `requires` is dropped when its parent is off.
- `index.html` — 3D viewer (Three.js r128 via jsdelivr UMD). Cutaway / roof-off / full exterior views, stock 17-seat layout, lounge (still a placeholder preset), camper conversion with a per-module checklist (price range + confidence badge, variant selects, running total). Converts mm → m; scene x = vehicle x − length/2, scene z = vehicle y. **Roof off is the bird view, the detailed one:** the camera fits the vehicle from overhead, tops that hide things (cubicle lid, upper bunk) go see-through, and every seat, module, wheel housing, empty bay and the walkway gets an HTML label chip with its name and size (`refreshLabels`, projected each frame). Label names come from `short_name` in the catalog.
- `topview.html` — dimensioned 2D top-view SVG, 1 unit = 1 mm. Front points right, driver side is down the page. Stock seating or, with `layout=camper`, the selected camper modules as labelled rectangles (dashed = empty bay) with a read-only module list and a link back to the configurator.
- `tools/screenshot.js` — Playwright script that screenshots every view and dumps the top-view SVG for exact diffing. See the header comment for usage.

## Rules
- Never invent a dimension. Confirmed numbers live in `data/urbania-17.json` under `body`. Anything else goes under `assumptions` (or `stock_seating`) with `confirmed: false`.
- Both views must be driven off the same JSON so they can never disagree. Shared derivations belong in `js/vehicle.js`, not in a page.
- No vehicle dimension may be hardcoded in a page. Page margins, stroke widths, camera positions and cosmetic modelling details (roof cap, floor slab, light sizes) are not vehicle dimensions and may stay in the page.
- Camper module sizes come from `data/components.json`; never type a module dimension into a page. The lounge preset's sofa/table sizes are the only remaining placeholders in `index.html`.
- Catalog prices are ranges with a `confidence` flag (`web_quoted`, `estimated_from_import`, `estimated`, or `quoted` once a real supplier quote is in hand). Never present an estimate as a quote.
- Light theme only. Clean, minimal, blueprint-style.
- After every visual change, run the dev server and screenshot the page before reporting done. Do not report a fix you have not looked at.
- Toilet must always be fully enclosed. Camper modules use fixed non-overlapping zones with explicit gaps — no running-cursor placement.

## Run
`npx serve .` (or any static server), then open `/index.html` and `/topview.html`. The pages fetch the JSON, so they must be served over http — opening the files directly (`file://`) will not work.

## Task log
1. ✅ Load `data/urbania-17.json` in both files and remove hardcoded numbers. Done via `js/vehicle.js`; the values that were only in the pages moved into the JSON (`hood_length`, `rear_wall_thickness`, `wheel_width`, seat counts/setbacks/cab seat placement).
3. ✅ `data/components.json` built (10 modules, dimensions + INR ranges + sources); the 3D camper preset is now built from it via `Vehicle.camperZones`, the toilet cubicle is enclosed on all sides, and the roof-off view actually lifts the roof and looks down. Task 2 is still open (waiting on the reference image).
4. ✅ Modules are individually toggleable with per-module prices; placement moved into the catalog (`side`, `placement`, `requires`) and `Vehicle.camperPlacements`; the top view draws the same selection; selection is shared through the URL query.
4b. ✅ Bird view detailing: roof-off view labels everything (seats, modules with size and price, housings, bays, walkway), see-through tops, finer module geometry (hob burners, sink, fridge door, toilet bowl, ladder, cushions), `view=` in the URL.

## Next tasks, in order
2. Get the official seat layout. Ask the user for the Force Motors top-view reference image; match `stock_seating` to it and set `confirmed: true`.
5. Add an exterior side-profile 2D view alongside the top view.
