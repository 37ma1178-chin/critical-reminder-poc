# Urbania 17-seater configurator

Proof-of-concept for a vehicle interior configurator. Single vehicle for now: Force Urbania 4400 WB, 17-seater.

## Files
- `index.html` — 3D viewer (Three.js r128 via jsdelivr UMD). Cutaway/roof-off/full views, stock 17-seat layout, lounge, camper conversion (partition, crew bunk, kitchenette + fridge space, water tank + electrical panel, 32"/43" TV mount, enclosed rear toilet).
- `topview.html` — dimensioned 2D top-view SVG, 1 unit = 1 mm.
- `data/urbania-17.json` — the single source of truth for every dimension. Both HTML files currently have these numbers hardcoded; wiring them to this file is task 1.

## Rules
- Never invent a dimension. Confirmed numbers live in `data/urbania-17.json` under `body`. Anything else goes under `assumptions` with `confirmed: false`.
- Both views must be driven off the same JSON so they can never disagree.
- Light theme only. Clean, minimal, blueprint-style.
- After every visual change, run the dev server and screenshot the page before reporting done. Do not report a fix you have not looked at.
- Toilet must always be fully enclosed. Camper modules use fixed non-overlapping zones with explicit gaps — no running-cursor placement.

## Run
`npx serve .` (or any static server), then open `/index.html` and `/topview.html`.

## Next tasks, in order
1. Load `data/urbania-17.json` in both files and remove hardcoded numbers.
2. Get the official seat layout. Ask the user for the Force Motors top-view reference image; match `stock_seating` to it and set `confirmed: true`.
3. Build `data/components.json` — catalog of camper modules (toilet cubicle, kitchenette, fridge, bunk, TV sizes, water tank, electrical panel) with real product dimensions and an Indian-market price range each.
4. Make camper modules individually toggleable instead of one bundled "camper conversion" preset.
5. Add an exterior side-profile 2D view alongside the top view.
