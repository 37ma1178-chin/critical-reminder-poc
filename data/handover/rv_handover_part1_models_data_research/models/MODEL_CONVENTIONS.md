# GLB conventions (as actually found)

Inspected 21 Nov 2026 (IST) from read-only copies; geometry not changed, files only copied and renamed (see filename_map.csv for the original names and SHA-256).

| Item | Requested in the brief | Actually in the GLBs |
|---|---|---|
| Units | metres | **metres** (glTF default; real scale) |
| Up axis | (not stated) | **+Y** (glTF Y-up; built in Blender Z-up and converted by the exporter) |
| Forward | +X | **+X** = nose / front of vehicle |
| Side | (not stated) | Left (kerb / door) side = **−Z**; right (driver, RHD) side = +Z |
| Origin | front axle centre on the ground | **DIFFERENT: mid-length of the body (overall length ÷ 2 from the nose), on the centreline, at ground level (y = 0)**. The front axle centre is at x = +(L/2 − front overhang), y = tyre radius, z = 0. |

To move a model to the requested origin, translate it by −(front axle x) along X (y and z stay 0). Ground stays at y = 0.

| GLB | Body L (m) | Front overhang used (m) | Front axle x (m) | Rear axle x (m) | Bbox X length (m) | Bbox height (m) | Bbox Z width incl. mirrors (m) | Translate X for front-axle origin (m) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ashokleyland_viking_5334wb.glb | 10.934 | 2.400 | +3.067 | -2.267 | 10.948 | 3.400 | 3.040 | -3.067 |
| eicher_pro3010l_5260wb.glb | 10.159 | 1.918 | +3.161 | -2.099 | 10.172 | 3.200 | 2.666 | -3.161 |
| force_traveller-widerbody_3350wb.glb | 5.615 | 0.900 | +1.908 | -1.442 | 5.628 | 2.720 | 2.684 | -1.908 |
| force_traveller-widerbody_4020wb.glb | 6.965 | 0.900 | +2.582 | -1.438 | 6.977 | 2.850 | 2.684 | -2.582 |
| force_traveller26_4020wb.glb | 6.770 | 0.900 | +2.485 | -1.535 | 6.783 | 2.870 | 2.664 | -2.485 |
| force_traveller_3050wb.glb | 5.100 | 0.900 | +1.650 | -1.400 | 5.113 | 2.615 | 2.366 | -1.650 |
| force_traveller_3350wb.glb | 5.585 | 0.900 | +1.893 | -1.457 | 5.597 | 2.615 | 2.366 | -1.893 |
| force_traveller_3700wb.glb | 6.235 | 0.900 | +2.217 | -1.482 | 6.247 | 2.640 | 2.366 | -2.217 |
| force_traveller_4020wb.glb | 6.935 | 0.900 | +2.568 | -1.452 | 6.948 | 2.760 | 2.366 | -2.568 |
| force_urbania_3350wb.glb | 5.440 | 1.000 | +1.720 | -1.630 | 5.453 | 2.550 | 2.536 | -1.720 |
| force_urbania_3615wb.glb | 6.225 | 1.000 | +2.112 | -1.503 | 6.238 | 2.550 | 2.536 | -2.112 |
| force_urbania_4400wb.glb | 7.010 | 1.000 | +2.505 | -1.895 | 7.023 | 2.550 | 2.536 | -2.505 |
| tata_lp410_3400wb.glb | 6.615 | 1.275 | +2.033 | -1.367 | 6.628 | 2.800 | 2.580 | -2.033 |
| tata_winger-highroof_3488wb.glb | 5.458 | 0.950 | +1.779 | -1.709 | 5.471 | 2.670 | 2.346 | -1.779 |

Notes:
- The bounding-box length is about 13 mm longer than the body length because lamps and bumpers stick out slightly. Bbox width includes the mirrors (README of camper-glb gives widths without mirrors).
- Front overhangs are ESTIMATED for all Force Traveller N, Urbania and Winger models (so the front-axle position inside the GLB is only as good as that estimate, ±150 mm). They are OEM for Eicher and Viking, brochure for Traveller 26, and aggregator for LP 410.
- Scene structure: one root empty per file named after the original id, with child groups Exterior_Body, Chassis_Wheels, Cab, Interior_AIS124_Living. Left wall and roof are a separate semi-transparent cutaway mesh.
- Generator: Khronos glTF Blender I/O v4.2.83 (Blender 4.2.9, headless). Built procedurally by source/build_camper.py from source/vehicles.py.

## Source files
- **.blend files: MISSING.** The models were generated procedurally in a headless Blender session and exported straight to GLB; no .blend was saved (none exists under /workspace/camper-glb). The real source is the build script set in models/source/ (build_camper.py + vehicles.py), which regenerates every GLB with Blender 4.2.9: `blender -b --factory-startup --python build_camper.py -- <id|all>` (note: the script writes to /workspace/camper-glb; change OUT before re-running so originals are not overwritten).
- source/verify_render.py and render_all.sh re-import each GLB, check the bbox and triangle count, and render the previews. source/meta_*.json and report_*.txt are their outputs.
