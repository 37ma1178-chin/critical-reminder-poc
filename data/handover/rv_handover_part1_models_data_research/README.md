# RV configurator handover package

Built 21 Nov 2026 (IST) for Arihant Mangale (ObjectWeave RV India). One zip, everything copied, nothing in the source folders changed. Plain English; every number in /data carries a confidence label. **No estimate is presented as confirmed.**

## What's in the zip

| Folder | Contents |
|---|---|
| `/models/` | 14 GLB files (one per vehicle–wheelbase variant), renamed `brand_model_wheelbase.glb`; `filename_map.csv` (old → new name, SHA-256); `MODEL_CONVENTIONS.md` (units, origin, axes actually found); `glb_inspection.json`; `previews/` (14 renders + contact sheet); `source/` (Blender build scripts and their outputs). **.blend files: MISSING** (never saved; the build scripts are the real source). |
| `/data/` | `vehicles.json` (14 entries, every number = value / unit / confidence / source / method); `vehicles_summary.csv`; `interior_confidence_report.md`; `build_vehicles_json.py` (how vehicles.json was generated). |
| `/rules/` | Official PDFs (AIS-124, AIS-022, AIS-053, IS 14272, GSR 596(E), GSR 240(E), GSR 414(E), S.O. 1248(E), Form 22F, old CMVR), state policies (Kerala, Maharashtra, Goa, Karnataka), other official docs, `text_extracts/` (all /workspace/rv/*.txt), `rules_summary.md` (rules as measurable constraints + M-category section), `MANIFEST.md` (source URL, status, SHA-256, MISSING list). |
| `/research/` | `reports/` (all research reports available, as delivered; state-by-state Page source and table; camper-glb README; 8 Oct regulatory research; MISSING_reports.md), `oem_snapshots/` (OEM pages and brochures saved 21 Nov 2026), `project_files/` (copies of donors.json, regulatory.json), `sources.md`, `open_questions.md`. |
| `/contact_sheet.png` | All 14 previews on one sheet (also in models/previews/). |

File count: 126 files (including this README).

## Variant list: 14, not the "Urbania × 4, Traveller × 3" in the brief

The brief guessed "Force Urbania × 4, Force Traveller × 3, buses × 3, others". The actual built set is **7 Force Traveller, 3 Force Urbania, 1 Tata Winger and 3 bus chassis = 14**. Force sells the Urbania in 3 wheelbases only (3350 / 3615 / 4400), and the Traveller N passenger range has 6 variants plus the legacy Traveller 26 that was also built.

| Variant | WB (mm) | GLB | GLB done? | OEM price? | Data complete? (count of numeric fields) | Key gaps |
|---|---:|---|---|---|---|---|
| Force Motors Traveller N 3050WB passenger | 3050 | `models/force_traveller_3050wb.glb` | Yes | Yes | Partly: 9 confirmed / 19 estimated / 2 unknown | interior all estimated; FOH estimated; 50 mm dinette aisle |
| Force Motors Traveller N 3350WB passenger | 3350 | `models/force_traveller_3350wb.glb` | Yes | Yes | Partly: 9 confirmed / 19 estimated / 2 unknown | interior all estimated; FOH estimated; 50 mm dinette aisle |
| Force Motors Traveller N 3700WB passenger | 3700 | `models/force_traveller_3700wb.glb` | Yes | Yes | Partly: 9 confirmed / 19 estimated / 2 unknown | interior all estimated; FOH estimated; 50 mm dinette aisle |
| Force Motors Traveller N 4020WB passenger | 4020 | `models/force_traveller_4020wb.glb` | Yes | Yes | Partly: 9 confirmed / 19 estimated / 2 unknown | interior all estimated; FOH estimated; 50 mm dinette aisle |
| Force Motors Traveller N Wider Body 3350WB passenger | 3350 | `models/force_traveller-widerbody_3350wb.glb` | Yes | Yes | Partly: 9 confirmed / 19 estimated / 2 unknown | interior all estimated; FOH estimated |
| Force Motors Traveller N Wider Body 4020WB passenger | 4020 | `models/force_traveller-widerbody_4020wb.glb` | Yes | Yes | Partly: 9 confirmed / 19 estimated / 2 unknown | interior all estimated; FOH estimated; M3 as sold (GVW 6000) |
| Force Motors Traveller 26 (legacy BS-IV) 26-seater 4020WB (June 2018 brochure) | 4020 | `models/force_traveller26_4020wb.glb` | Yes | No (UNKNOWN) | Partly: 10 confirmed / 17 estimated / 3 unknown | legacy 2018 BS-IV model; no price; interior estimated |
| Force Motors Urbania 3350WB passenger | 3350 | `models/force_urbania_3350wb.glb` | Yes | No (UNKNOWN) | Partly: 8 confirmed / 19 estimated / 3 unknown | no per-variant OEM price; FOH estimated; ZA-hosted brochure; GLB GC 190 vs brochure 200 |
| Force Motors Urbania 3615WB passenger | 3615 | `models/force_urbania_3615wb.glb` | Yes | No (UNKNOWN) | Partly: 8 confirmed / 19 estimated / 3 unknown | no per-variant OEM price; FOH estimated; ZA-hosted brochure; GLB GC 190 vs 200 |
| Force Motors Urbania 4400WB passenger | 4400 | `models/force_urbania_4400wb.glb` | Yes | No (UNKNOWN) | Partly: 8 confirmed / 19 estimated / 3 unknown | no per-variant OEM price; FOH estimated; ZA-hosted brochure; GLB GC 190 vs 200 |
| Tata Motors Winger (high roof) FL 3488 HR 12S (one GLB also stands in for 15S/9S high roof) | 3488 | `models/tata_winger-highroof_3488wb.glb` | Yes | No (UNKNOWN) | Partly: 8 confirmed / 19 estimated / 3 unknown | Tata page not re-readable (access denied); GC/FOH estimated; no price; 50 mm dinette aisle |
| Tata Motors LP 410 (face-cowl bus chassis) 3400WB chassis with coach-built motorhome body (concept) | 3400 | `models/tata_lp410_3400wb.glb` | Yes | No (UNKNOWN) | Partly: 0 confirmed / 27 estimated / 2 unknown | all chassis data from aggregators; no OEM 3400 WB card; body height estimated; no price |
| Eicher (VE Commercial Vehicles) Pro 3010 L (bus chassis) 5260WB chassis with coach-built motorhome body (concept) | 5260 | `models/eicher_pro3010l_5260wb.glb` | Yes | No (UNKNOWN) | Partly: 9 confirmed / 18 estimated / 3 unknown | body height estimated; no price; GVW conflict noted |
| Ashok Leyland Viking (bus chassis) 5334WB chassis with coach-built motorhome body (concept) | 5334 | `models/ashokleyland_viking_5334wb.glb` | Yes | No (UNKNOWN) | Partly: 6 confirmed / 21 estimated / 2 unknown | length conflict (10934 OEM vs 10699); body height, GC estimated; width at 2.6 m limit; no price |

"Data complete" is never "Yes": no variant has a single measured interior dimension except the Winger's floor and internal height.

## GLB units, origin and axes (actually found)

- **Units: metres.** Real scale.
- **Axes: +X forward (nose), +Y up, −Z = left / kerb / door side** (glTF Y-up; built Z-up in Blender).
- **Origin: NOT at the front axle.** It is at **mid-length of the body, on the centreline, at ground level**. The front axle centre is at x = +(L/2 − front overhang) — e.g. +2.505 m in force_urbania_4400wb.glb. Per-file offsets are in models/MODEL_CONVENTIONS.md and in vehicles.json (`glb_build_values.front_axle_x_in_glb_m`). Translate by −that value along X to get the requested origin. Geometry was not re-exported or altered.

## Known gaps

- Interiors are design estimates (outside size − 40 mm walls, planning floor heights, estimated cab length); wheel arches are not modelled inside; door positions are placeholders. See data/interior_confidence_report.md.
- 50 mm aisle beside the dinette on the four standard Traveller N models and the Winger (not walkable) — design review item.
- Bus body heights (2800 / 3200 / 3400 mm) are guesses; LP 410 data is all from aggregators; Viking length conflict unresolved.
- OEM ex-showroom prices exist only for the six Traveller N variants (starting prices for the seated van).
- Legality of slide-outs / expandable sections (especially on bus conversions) is unresolved; see research/open_questions.md (item 1).
- Front overhangs estimated for Traveller N, Urbania, Winger.

## MISSING

| Item | Why | Where noted |
|---|---|---|
| .blend source files | Never created (procedural build exported straight to GLB) | models/MODEL_CONVENTIONS.md |
| GSR 868(E) 2016 PDF | India Code timed out / HTTP 504 | rules/MANIFEST.md |
| Current official consolidated CMVR PDF | MoRTH HTTP 500, India Code HTTP 504 (old c.2006 copy and Apr-2023 reprint text included instead) | rules/MANIFEST.md |
| GSR 414(E) and GSR 596(E) from MoRTH itself | MoRTH HTTP 500 (other official copies included) | rules/MANIFEST.md |
| S.O. 1248(E) from an Indian government host | none found (non-official mirror included) | rules/MANIFEST.md |
| MV Act s.52 text, Driving Regulations 2017 | not downloaded (India Code down) | rules/MANIFEST.md |
| Research reports: CMVR conversion citations, vehicle suitability list, bus specs | text not available to the packager | research/reports/MISSING_reports.md |
| Tata Winger 12S page snapshot | Tata site returned "Access denied" on 21 Nov 2026 | research/sources.md |
| Tata LP 410 OEM spec card for 3400 mm wheelbase | not found; OEM chassis pages timed out | research/open_questions.md |
| Measured interior dimensions (all variants) | never measured | data/interior_confidence_report.md |
| OEM door sizes / positions, wheel-arch sizes (all variants) | not published | data/vehicles.json |

## Rules followed

- CONFIRMED only from OEM pages/brochures, AIS/ARAI/BIS standards, MoRTH/gazette and state government documents. Aggregator, dealer and archive figures are ESTIMATED leads. UNKNOWN values are null.
- Source folders (/workspace/camper-glb, /workspace/rv, /workspace/objectweave-deploy) were only read and copied. No paid generation credits were used.
