# GLB models (kept for the 3D phase, not used yet)

Copied unchanged from `data/handover/rv_handover_part1_models_data_research/models/` by `tools/import_handover.js`. File names match the vehicle ids in `data/vehicles/`. Each vehicle file's `glb` block gives the original name and SHA-256.

**Coordinate frame (as found, see the handover's `MODEL_CONVENTIONS.md`):**

- Units: metres. Up: +Y. Forward: +X (nose). Kerb / left / door side: −Z.
- **Origin: mid-length of the body, on the centreline, at ground level.** It is not the front axle and not the repo origin.
- Repo frame (2D views, `js/vehicle.js`): x in mm from the rear bumper, positive forward; y in mm from the centreline, positive to the right (driver) side.
- Convert a GLB point to the repo frame: `x_mm = (x_glb + L/2) × 1000`, `y_mm = z_glb × 1000` (both frames put the left side negative), `z_mm = y_glb × 1000`.

**Known mismatches with `data/vehicles/` (fix when 3D work starts):**

- The models were built with the handover's estimated front overhangs (Urbania 1000 mm) and 190 mm Urbania ground clearance. The vehicle files use 950 mm (listings) and 170 mm (India brochure) for the Urbania 4400. So the GLB front axle sits 50 mm further back and the body 20 mm higher than in the 2D drawings.
- Interiors in the GLBs are the handover's planning estimates (Urbania 4400 living area 5090 × 2015 mm). The vehicle files use the builder-measured 4191 × 1651 mm for the Urbania 4400 and a 78.8 % width ratio for the other vans (see `data/vehicles/URBANIA_RECONCILIATION.md`), so every van GLB interior is wider, and the Urbania longer, than the data.
- Wheel arches are cut only through the outer body sides; they are not modelled inside.
- Aisle check (`node tools/extract_glb_layouts.js`, results in `data/layouts/glb/`): 8 of the 14 GLB layouts FAIL D-AISLE-MIN (< 300 mm) beside the dinette: Traveller N 3050 / 3350 / 3700 (49 mm), Winger (50 mm), Urbania 3350 / 3615 (115 mm), LP 410 (160 mm), Traveller 26 (245 mm), Traveller Wider Body 3350 (266 mm). The handover listed the Traveller N 4020 too, but in its GLB the kitchen and dinette do not face each other (narrowest gap 650 mm).
