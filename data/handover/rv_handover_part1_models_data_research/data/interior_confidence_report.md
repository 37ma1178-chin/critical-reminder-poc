# Interior confidence report

Prepared 21 Nov 2026 (IST). Companion to data/vehicles.json and research/reports/report_interior_measurements.md.

## Short answer

- **No interior dimension of any of the 14 variants has been measured.** Only two interior numbers are published by a manufacturer, both for the Tata Winger 12S: floor height 495 mm and internal height 1900 mm (CONFIRMED from the Tata page as captured; the page refused access on 21 Nov 2026 so it was not re-read).
- Everything else inside (usable length, usable width, standing height, floor height, wheel arches, door positions) is an ESTIMATE made for design work.

## How the GLB interiors were made

The GLB interiors were **approximated, not modelled from real interior dimensions** (the only exception is the Winger's published floor and internal height).

1. Start from the manufacturer's outside length, width and height (OEM page or brochure; aggregator for the LP 410; estimated body heights for the three buses).
2. Subtract an assumed 40 mm wall on each side and 40 mm roof skin (donors.json planning default, ±15 mm each). Usable width = outside width − 80 mm.
3. Put the floor at a planning height (vans 560 mm, Wider Body 580 mm, LP 410 900 mm, Eicher 950 mm, Viking 1000 mm; Winger 495 mm from Tata). Clear height = outside height − floor − 40 mm roof − 20 mm.
4. Place the cab/living boundary at an estimated cab length from the nose (vans 1650–1800 mm, buses 2100–2600 mm) and start the living area 360 mm behind the cab seat backs; end it 60 mm inside the rear wall.
5. The body is a straight-sided box with a sloped nose: no side taper (tumblehome), no trim panels, no roof bows, no pillars.
6. **Wheel arches are not modelled inside.** They are only cut through the outer side walls. Beds, benches and cabinets sit on a flat floor, so on a real vehicle some furniture over the rear arches will clash.
7. Furniture is laid out by rule in build_camper.py (rear transverse bed, kitchen on the kerb side, dinette, wardrobe, wet room on longer bodies, sofa on the long buses).

## Basis for the expected errors

- **Width:** the wall allowance alone is ±30 mm, but real vans lose more to trim and the inward slope of the sides. Force's own delivery-van leaflet gives a 1680 mm cargo width for a Traveller body that is 1925 mm outside, which is 165 mm less than our 1845 mm. So for vans the error is skewed: **−200 / +30 mm**. Coach-built bus bodies are flatter: ±60 mm.
- **Floor height:** not published for any variant except the Winger: ±100 mm vans, ±150 mm LP 410 / Eicher, ±200 mm Viking (donors.json tolerances).
- **Standing height:** inherits the floor error plus roof build-up: ±100 mm vans. Buses inherit the ±300 mm body-height guess: ±300 mm.
- **Usable length:** dominated by where the cab bulkhead really is: ±250 mm vans, ±300 mm buses. The Viking also carries the unresolved overall-length conflict (10934 OEM vs 10699 aggregator), up to −235 mm more.
- **Wheel arches:** planning defaults 200 mm in from each wall, 340 mm high, 900 mm long (±80 / ±80 / ±150 mm); dual-rear-wheel vehicles are likely larger.
- **Doors:** GLB doors are placeholder outlines (kerb-side entry door only). Real door positions and openings are not published: ±300 mm on position, ±200 mm on size.

## Per variant

Legend: **C** = CONFIRMED (official source), **E** = ESTIMATED, **U** = UNKNOWN.

### Force Motors Traveller N — 3050WB passenger (`force_traveller_3050wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 3080 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 1845 | ESTIMATED | Exterior width 1925 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 1995 | ESTIMATED | GLB living-area clear height = overall height 2615 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3050 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2095 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 5100 (CONFIRMED), width 1925 (CONFIRMED), height 2615 (CONFIRMED).

Watch: Dinette-side aisle in the GLB is only 50 mm: not walkable (design review item).

### Force Motors Traveller N — 3350WB passenger (`force_traveller_3350wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 3565 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 1845 | ESTIMATED | Exterior width 1925 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 1995 | ESTIMATED | GLB living-area clear height = overall height 2615 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3350 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2095 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 5585 (CONFIRMED), width 1925 (CONFIRMED), height 2615 (CONFIRMED).

Watch: Dinette-side aisle 50 mm: not walkable.

### Force Motors Traveller N — 3700WB passenger (`force_traveller_3700wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 4215 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 1845 | ESTIMATED | Exterior width 1925 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 2020 | ESTIMATED | GLB living-area clear height = overall height 2640 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3700 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2120 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 6235 (CONFIRMED), width 1925 (CONFIRMED), height 2640 (CONFIRMED).

Watch: Dinette-side aisle 50 mm: not walkable.

### Force Motors Traveller N — 4020WB passenger (`force_traveller_4020wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 4915 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 1845 | ESTIMATED | Exterior width 1925 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 2140 | ESTIMATED | GLB living-area clear height = overall height 2760 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -4019 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2240 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 6935 (CONFIRMED), width 1925 (CONFIRMED), height 2760 (CONFIRMED).

Watch: Dinette-side aisle 50 mm: not walkable.

### Force Motors Traveller N Wider Body — Wider Body 3350WB passenger (`force_traveller-widerbody_3350wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 3595 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 2165 | ESTIMATED | Exterior width 2245 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 2080 | ESTIMATED | GLB living-area clear height = overall height 2720 − estimated floor 580 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 580 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3350 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2200 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 5615 (CONFIRMED), width 2245 (CONFIRMED), height 2720 (CONFIRMED).

### Force Motors Traveller N Wider Body — Wider Body 4020WB passenger (`force_traveller-widerbody_4020wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 4945 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 2165 | ESTIMATED | Exterior width 2245 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 2210 | ESTIMATED | GLB living-area clear height = overall height 2850 − estimated floor 580 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 580 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -4019 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2350 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 6965 (CONFIRMED), width 2245 (CONFIRMED), height 2850 (CONFIRMED).

### Force Motors Traveller 26 (legacy BS-IV) — 26-seater 4020WB (June 2018 brochure) (`force_traveller26_4020wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 4750 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 2145 | ESTIMATED | Exterior width 2225 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 2250 | ESTIMATED | GLB living-area clear height = overall height 2870 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -4019 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2360 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 6770 (CONFIRMED), width 2225 (CONFIRMED), height 2870 (CONFIRMED).

Watch: Legacy BS-IV model (2018 brochure); interior also estimated.

### Force Motors Urbania — 3350WB passenger (`force_urbania_3350wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 3520 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 2015 | ESTIMATED | Exterior width 2095 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 1930 | ESTIMATED | GLB living-area clear height = overall height 2550 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3350 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2040 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 5440 (CONFIRMED), width 2095 (CONFIRMED), height 2550 (CONFIRMED).

Watch: GLB built with 190 mm ground clearance; Force brochure says 200 mm min.

### Force Motors Urbania — 3615WB passenger (`force_urbania_3615wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 4305 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 2015 | ESTIMATED | Exterior width 2095 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 1930 | ESTIMATED | GLB living-area clear height = overall height 2550 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3615 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2040 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 6225 (CONFIRMED), width 2095 (CONFIRMED), height 2550 (CONFIRMED).

Watch: GLB built with 190 mm ground clearance; Force brochure says 200 mm min.

### Force Motors Urbania — 4400WB passenger (`force_urbania_4400wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 5090 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 2015 | ESTIMATED | Exterior width 2095 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 1930 | ESTIMATED | GLB living-area clear height = overall height 2550 − estimated floor 560 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±100 mm |
| Floor height above ground | 560 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±100 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -4400 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1750 to -850 from front axle; 900 wide × 2040 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 7010 (CONFIRMED), width 2095 (CONFIRMED), height 2550 (CONFIRMED).

Watch: GLB built with 190 mm ground clearance; Force brochure says 200 mm min.

### Tata Motors Winger (high roof) — FL 3488 HR 12S (one GLB also stands in for 15S/9S high roof) (`tata_winger-highroof_3488wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 3698 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±250 mm |
| Usable width | 1825 | ESTIMATED | Exterior width 1905 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | −200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate) |
| Standing (clear) height | 1900 | CONFIRMED | Tata Motors Winger 12S page (internal height line) as recorded in models/source/vehicles.py on 19 Nov 2026; a web search on 21 Nov 2026 also returned 'internal height 1900 mm, floor height 495 mm' for https://busesandvans.tatamotors.com/product/tata-winger-12s. Page itself returned 'Access denied' on 21 Nov 2026, so not re-read directly | n/a (published) |
| Floor height above ground | 495 | CONFIRMED | Tata Motors, Winger 12S product page, specification lines, https://busesandvans.tatamotors.com/product/tata-winger-12s (captured 8 Oct 2026 into research/project_files/donors.json entry 'tata-winger-12s'; re-check on 21 Nov 2026 returned 'Access denied', so not re-read) (floor height line) | n/a (published) |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3488 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x -1650 to -750 from front axle; 900 wide × 2170 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: standing height, floor height. Outside dimensions used as the starting point: length 5458 (CONFIRMED), width 1905 (CONFIRMED), height 2670 (CONFIRMED).

Watch: Dinette-side aisle 50 mm: not walkable. Internal height 1900 mm is below a comfortable stand-up height for many adults.

### Tata Motors LP 410 (face-cowl bus chassis) — 3400WB chassis with coach-built motorhome body (concept) (`tata_lp410_3400wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 4405 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±300 mm |
| Usable width | 2060 | ESTIMATED | Exterior width 2140 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | ±60 mm (flat-sided coach body assumed) |
| Standing (clear) height | 1840 | ESTIMATED | GLB living-area clear height = overall height 2800 − estimated floor 900 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±300 mm |
| Floor height above ground | 900 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±150–200 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -3400 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x 325 to 1025 from front axle; 700 wide × 2090 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 6615 (ESTIMATED), width 2140 (ESTIMATED), height 2800 (ESTIMATED).

Watch: Chassis figures are from an aggregator, not Tata; no OEM 3400 mm wheelbase card found.

### Eicher (VE Commercial Vehicles) Pro 3010 L (bus chassis) — 5260WB chassis with coach-built motorhome body (concept) (`eicher_pro3010l_5260wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 7749 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±300 mm |
| Usable width | 2146 | ESTIMATED | Exterior width 2226 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | ±60 mm (flat-sided coach body assumed) |
| Standing (clear) height | 2190 | ESTIMATED | GLB living-area clear height = overall height 3200 − estimated floor 950 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±300 mm |
| Floor height above ground | 950 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±150–200 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -5260 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x 968 to 1668 from front axle; 700 wide × 2515 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 10159 (CONFIRMED), width 2226 (CONFIRMED), height 3200 (ESTIMATED).

### Ashok Leyland Viking (bus chassis) — 5334WB chassis with coach-built motorhome body (concept) (`ashokleyland_viking_5334wb`)

| Interior item | Value (mm) | Status | How it was obtained | Expected error |
|---|---:|---|---|---|
| Usable living length | 8224 | ESTIMATED | GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement. | ±300 mm plus up to −235 mm from the length conflict |
| Usable width | 2520 | ESTIMATED | Exterior width 2600 − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for. | ±60 mm (flat-sided coach body assumed) |
| Standing (clear) height | 2340 | ESTIMATED | GLB living-area clear height = overall height 3400 − estimated floor 1000 − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02) | ±300 mm |
| Floor height above ground | 1000 | ESTIMATED | Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200) | ±150–200 mm |
| Wheel-arch intrusion | 200 in from each wall, 340 high, 900 long; centred on axles (rear at -5334 from front axle) | E | donors.json planning default; not modelled inside the GLB | ±80 / ±80 / ±150 |
| Entry door (kerb side) | x 1450 to 2150 from front axle; 700 wide × 2670 high | E | GLB placeholder outline | ±300 position / ±200 size |
| OEM door openings | – | U | not published | – |

Proven interior dimensions: none. Outside dimensions used as the starting point: length 10934 (CONFIRMED), width 2600 (CONFIRMED), height 3400 (ESTIMATED).

Watch: Overall length conflict unresolved; width 2600 mm is already at the Rule 93 maximum.

## What would turn estimates into confirmed numbers

- Tape-measure (or laser-scan) one stripped vehicle per body family: Traveller N standard roof, Traveller N Wider Body, Urbania, Winger HR. Wheelbase variants of the same body share the cross-section, so 4 measured sections plus each variant's OEM length cover the 10 vans.
- Ask Force Motors, Tata Motors, Eicher and Ashok Leyland for body-builder drawings (chassis/cowl drawings give frame height, axle positions and arch envelopes).
- For the three buses, the interior depends on the coach builder's body, which does not exist yet; get the builder's drawing before treating any bus interior figure as more than a concept.
