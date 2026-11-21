# Urbania: India brochure vs handover

**Update 21 Nov 2026: builder measurement.** Azad Automotive Customs' dimensioned layout of a built Urbania 4400 (`data/reference/builders/azad_voyager-vip_urbania-4400_oct-2026.pdf`, p.2–3) gives a living length of 165 in = **4191 mm** and an internal width of 65 in = **1651 mm** (BUILDER_MEASURED, ±25 mm). These replace both the render-scaled values (4310 × 1795) and the handover values (5090 × 2015) below, which stay in the vehicle file as superseded alternates. The 3350 and 3615 are derived from it: living length 4191 − the wheelbase difference = 3141 and 3406 mm, width 1651 mm (ESTIMATED). The render's 1795 mm was the OEM interior at seat level; Azad's 1651 mm is inside their own conversion trims, about 72 mm less per side.

Checked 21 Nov 2026. Rule: the India brochure wins for India. Where neither brochure has the number, the better-evidenced estimate wins and the other is kept in `alt_estimates` in the vehicle file.

Sources compared:

- **India brochure**: `data/reference/force-urbania-dx-brochure-2026.pdf`, page 6 (code URBANIADX/27072025/25000). The page has no text layer; values were read from `force-urbania-dx-brochure-2026-specs-page.png`.
- **South Africa brochure**: the handover's source, `data/handover/rv_handover_part3_urbania_brochure/.../Force_Urbania_brochure_urbania-co-za.pdf`, page 8 (dated Nov 2022).
- **Handover data**: `data/handover/.../data/vehicles.json`, `vehicles_summary.csv`, `models/source/vehicles.py`, `build_camper.py`, `rules/rules_summary.md`.
- **Repo render values**: the earlier `data/urbania-17.json`, scaled off Force's own 4400WB 16+D top-view and side renders.

## Brochure figures

| Item | India brochure | Handover / South Africa | Used | Differs? |
|---|---|---|---|---|
| Wheelbase | 3350 / 3615 / 4400 | same | India | no |
| Length | 5440 / 6225 / 7010 | same | India | no |
| Width | 2095 | same | India | no |
| Height | 2550 | same | India | no |
| **GVW (kg)** | **3750 / 4260 / 4685** | 3625 / 4135 / 4610 | India | **yes, +125 / +125 / +75** |
| **Min. ground clearance** | **170** | 200 (brochure); GLB built with 190 | India | **yes, −30 mm** |
| Front / rear track | 1750 / 1750 | 1750 / 1750 in the brochure, but not imported into vehicles.json | India | handover was missing it |
| Tyre | 235/65 R16 C | same | India | no |
| **Seating, excl. driver** | **3350: 9 or 10; 3615: 9, 12 or 13; 4400: 12, 13 or 16** | brochure 10 / 13 / 17; vehicles.json "10+D", "13 excl. driver (layout 12+D)", "16+D" | India | **yes: the 4400 is 16 in India, 17 in South Africa; India also lists 9-seat options** |
| Engine output | 100 kW (134 hp) @ 3200 rpm | 85 kW (115 hp) @ 2950 rpm | India (not used by any check) | yes |
| Front suspension | Transverse leaf spring with IFS, all wheelbases | 3350 / 3615 independent; **4400 rigid** | India | yes, for the 4400 |
| Anti-roll bar | Front and rear | Front yes, rear optional | India | yes |
| Driver and co-driver airbags | Yes, all | 4400 optional | India | yes |
| ABS + EBD + ESP | Yes | not listed | India | not compared |
| Gearbox | FG32/5, 5-speed | G-32/5, 5-speed | India | naming only |
| Fuel tank | 70 L | 70 L | India | no |
| Emission standard | not stated | BS-VI | South Africa brochure, flagged | India page silent |

## Numbers neither brochure gives

| Item | Handover value | Repo value and basis | Used | Why |
|---|---|---|---|---|
| Front overhang, 4400 | 1000, vehicles.py planning value, ±150, no stated basis | 950, Cardekho / ZigWheels listings | 950 | Sourced lead beats an unexplained planning value |
| Rear overhang, 4400 | 1610, derived from 1000 | 1660, listings; 950 + 4400 + 1660 = 7010 | 1660 | Follows the front overhang |
| Front overhang, 3350 / 3615 | 1000, planning value | none | 1000, ±150 | Only figure available |
| Rear overhang, 3350 / 3615 | handover derived it from the South Africa length, which matches India | – | 1090 / 1610 | Unchanged |
| **Usable living length** | **3520 / 4305 / 5090, ±250** | **4310** for the 4400: cab boundary 2600 mm from the front, scaled off Force's top-view render (±50) | **2740 / 3525 / 4310** | The handover starts the living area about 1860 mm from the nose. That puts the driver seat about 800 mm ahead of where Force's render shows it, 3 × the handover's own stated error. The cab is common to all three wheelbases (the handover also uses one cab length for all three), so the render value is applied to all three. |
| **Usable width** | **2015, −200/+30** | **1795**: 150 mm walls scaled off the render (±50) | **1795** | Render evidence. 1795 sits just below the low end of the handover's own range (1815). |
| Floor height | 560 ±100, planning default | 550, "typical for the class", not measured | 560 | Both are guesses; the handover value keeps all 14 variants consistent |
| Standing height | 1930 = 2550 − 560 − 60 | none | 1930 ±100 | Only figure available |
| Wheel arch inside | 200 in from wall, 340 high, 900 long | 250 in, 300 high, 900 long | handover | Both estimates; handover keeps all variants consistent; repo values kept as alternates |
| Living area start from rear | 60 mm (build rule) | 100 mm rear-door thickness | 100 | Goes with the render-scaled length |
| Entry (sliding) door | 900 wide, 1850–2750 from front (GLB placeholder) | 1050 wide, 2400–3450 from front (side render) | render | Force image beats a placeholder |
| Side profile shape | GLB build rule: nose 750, hood 1200 high, windscreen run 750, body bottom = GC + 120 | side render: nose 500, hood 1505 high, windscreen base 955 from front at 1500, top 1835 at 2310, rocker 340 | render | Force image beats a build rule |
| Cab seat position | about 1450 mm from the nose (implied by build_camper.py) | 2250 mm from the front (render) | render | as above |
| Stock seating layout | none | 16+D layout matched to Force's render (pattern exact, ±50 mm) | repo, 4400 only | No render for the 3350 / 3615 layouts yet |

## Knock-on effects

- **Category.** M2 as sold either way; India GVW is still ≤ 5 t. As a camper: M1 with ≤ 8 seats plus driver.
- **Rule 93 rear overhang screen.** 1660 / 4400 = 37.7 % (handover said 36.6 %). Both are well under 60 %.
- **GLB alignment.** `force_urbania_*.glb` were built with a 1000 mm front overhang and 190 mm ground clearance. Laid over the 2D drawings, which use 950 and 170, the 4400 model's front axle sits 50 mm further back and its body 20 mm higher. Not fixed now: 3D is out of scope for this phase.
- **Handover rules summary.** `rules_summary.md` section 9 uses 4610 kg and "13 excl. driver" for the Urbania rows. The category conclusions there do not change.
- **Engine.** For the usable length and width the engine uses the full spread of both estimates: 4260–5340 mm long and 1745–2045 mm wide for the 4400. A layout that only fits the handover figures comes out UNDECIDED, not ELIGIBLE.
