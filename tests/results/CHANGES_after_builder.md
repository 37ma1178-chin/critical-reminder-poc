# Test results: before and after the Azad builder data

Generated 21 Nov 2026 by `tools/eligibility.js`. Three runs of the same engine:

- **Before**: vehicle data, catalog and rules as committed before the builder deck (`1_before_builder/`).
- **Dims only**: the builder's Urbania measurements and the 78.8 % width ratio for the other vans, with the old catalog and the old 400 mm aisle minimum (`2_after_builder/dims_only/`).
- **After**: everything from the builder deck. That is the new dimensions, the VIP recliner as the massage-recliner tier, Azad's 1-person transverse sofa-cum-bed as an option, the pantry holding the fridge, and the aisle bands (fail below 300, warn 300–400) (`2_after_builder/`).

## What changed and why

- **Urbania 4400: all three seat tiers went from UNDECIDED to REJECTED.** Before, the living-length band ran up to 5340 mm because it still included the handover's 5090 mm. The builder measured 4191 mm (±25). Test A needs at least 4565 mm even with captain seats and the shortest bed option.
- **Urbania 3615, captain seats: UNDECIDED to REJECTED.** Same reason, with the derived 3406 mm living length.
- **Traveller N 3700, captain: UNDECIDED to REJECTED.** The narrower width default (1517 mm instead of 1845 mm) stops the sofa-bed and the washroom facing seats across the aisle.
- **Traveller N 4020, captain: UNDECIDED to ELIGIBLE.** It now fits with Azad's 1-person transverse sofa-cum-bed. Two caveats come with it. That berth is only as long as the van is wide (1517 mm, below the 1850 mm design minimum). The ELIGIBLE also rests on the handover's unmeasured living length; the one van measured so far was 899 mm shorter than its handover value.
- **Traveller N 4020, massage recliner: UNDECIDED to REJECTED.** The tier is now Azad's real VIP recliner: 640 mm wide, 1118 mm pitch.
- **LP 410: recliner UNDECIDED to ELIGIBLE, massage recliner REJECTED to UNDECIDED.** The 300 mm aisle fail line (300–400 only warns) lets 2-abreast seats fit across the 2060 mm coach body.
- **Test B: no verdict changed.** All 11 vans are still rejected on the AIS-124 seat cap. The Eicher and Viking stay UNDECIDED on the bus-body route because AIS-052 is missing. The LP 410 still does not fit, though its need fell from 8020 to 6240 mm under the 300 mm aisle line.
- **The "Dims only" column isolates the measurements.** With the old 400 mm aisle and no transverse bed, the narrower widths alone made every van worse. The builder's own layout choices bring some of them back.

"Need" is the living length the screening layout needs, in mm, before → after.

## Test A: private, 6 seats, seat tiers

| Vehicle | Tier | Before | Dims only | After | Need |
|---|---|---|---|---|---|
| Traveller 26 (legacy BS-IV) 4020 WB | captain | UNDECIDED | UNDECIDED | **UNDECIDED** | 3550 → 3965 |
| Traveller 26 (legacy BS-IV) 4020 WB | recliner | UNDECIDED | UNDECIDED | **UNDECIDED** | 3850 → 4415 |
| Traveller 26 (legacy BS-IV) 4020 WB | massage_recliner | UNDECIDED | REJECTED | **UNDECIDED** | 4800 → 4751 |
| Traveller N 3050 WB | captain | REJECTED | REJECTED | **REJECTED** | 4250 → 4565 |
| Traveller N 3050 WB | recliner | REJECTED | REJECTED | **REJECTED** | 4640 → 5015 |
| Traveller N 3050 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 5150 → 5369 |
| Traveller N 3350 WB | captain | REJECTED | REJECTED | **REJECTED** | 4250 → 4565 |
| Traveller N 3350 WB | recliner | REJECTED | REJECTED | **REJECTED** | 4640 → 5015 |
| Traveller N 3350 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 5150 → 5369 |
| Traveller N 3700 WB | captain | UNDECIDED | REJECTED | **REJECTED** | 4250 → 4565 | changed
| Traveller N 3700 WB | recliner | REJECTED | REJECTED | **REJECTED** | 4640 → 5015 |
| Traveller N 3700 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 5150 → 5369 |
| Traveller N 4020 WB | captain | UNDECIDED | REJECTED | **ELIGIBLE** | 4400 → 4565 | changed
| Traveller N 4020 WB | recliner | UNDECIDED | REJECTED | **UNDECIDED** | 4640 → 5015 |
| Traveller N 4020 WB | massage_recliner | UNDECIDED | REJECTED | **REJECTED** | 5150 → 5369 | changed
| Traveller N Wider Body 3350 WB | captain | UNDECIDED | REJECTED | **UNDECIDED** | 3550 → 3715 |
| Traveller N Wider Body 3350 WB | recliner | REJECTED | REJECTED | **REJECTED** | 3850 → 4415 |
| Traveller N Wider Body 3350 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 4400 → 4751 |
| Traveller N Wider Body 4020 WB | captain | ELIGIBLE | UNDECIDED | **ELIGIBLE** | 4650 → 4565 |
| Traveller N Wider Body 4020 WB | recliner | UNDECIDED | UNDECIDED | **UNDECIDED** | 3850 → 4415 |
| Traveller N Wider Body 4020 WB | massage_recliner | UNDECIDED | UNDECIDED | **UNDECIDED** | 4800 → 4751 |
| Urbania 3350 WB | captain | REJECTED | REJECTED | **REJECTED** | 4450 → 4565 |
| Urbania 3350 WB | recliner | REJECTED | REJECTED | **REJECTED** | 4850 → 5015 |
| Urbania 3350 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 5150 → 5369 |
| Urbania 3615 WB | captain | UNDECIDED | REJECTED | **REJECTED** | 4450 → 4565 | changed
| Urbania 3615 WB | recliner | REJECTED | REJECTED | **REJECTED** | 4850 → 5015 |
| Urbania 3615 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 5150 → 5369 |
| Urbania 4400 WB | captain | UNDECIDED | REJECTED | **REJECTED** | 4450 → 4565 | changed
| Urbania 4400 WB | recliner | UNDECIDED | REJECTED | **REJECTED** | 4850 → 5015 | changed
| Urbania 4400 WB | massage_recliner | UNDECIDED | REJECTED | **REJECTED** | 5150 → 5369 | changed
| Tata Motors Winger (high roof) 3488 WB | captain | REJECTED | REJECTED | **REJECTED** | 4400 → 4565 |
| Tata Motors Winger (high roof) 3488 WB | recliner | REJECTED | REJECTED | **REJECTED** | 4950 → 5015 |
| Tata Motors Winger (high roof) 3488 WB | massage_recliner | REJECTED | REJECTED | **REJECTED** | 5150 → 5369 |
| Ashok Leyland Viking (bus chassis) 5334 WB | captain | UNDECIDED | UNDECIDED | **UNDECIDED** | 3200 → 3050 |
| Ashok Leyland Viking (bus chassis) 5334 WB | recliner | UNDECIDED | UNDECIDED | **UNDECIDED** | 3450 → 3350 |
| Ashok Leyland Viking (bus chassis) 5334 WB | massage_recliner | UNDECIDED | UNDECIDED | **UNDECIDED** | 4050 → 4086 |
| Eicher Pro 3010 L (bus chassis) 5260 WB | captain | ELIGIBLE | ELIGIBLE | **ELIGIBLE** | 4050 → 3715 |
| Eicher Pro 3010 L (bus chassis) 5260 WB | recliner | ELIGIBLE | ELIGIBLE | **ELIGIBLE** | 4450 → 4015 |
| Eicher Pro 3010 L (bus chassis) 5260 WB | massage_recliner | ELIGIBLE | ELIGIBLE | **ELIGIBLE** | 4800 → 4568 |
| Tata Motors LP 410 (face-cowl bus chassis) 3400 WB | captain | ELIGIBLE | ELIGIBLE | **ELIGIBLE** | 4050 → 3715 |
| Tata Motors LP 410 (face-cowl bus chassis) 3400 WB | recliner | UNDECIDED | UNDECIDED | **ELIGIBLE** | 3850 → 4015 | changed
| Tata Motors LP 410 (face-cowl bus chassis) 3400 WB | massage_recliner | REJECTED | REJECTED | **UNDECIDED** | 4800 → 4269 | changed

## Test B: commercial, 25 seats, Maharashtra

| Vehicle | Tier | Before | Dims only | After | Need |
|---|---|---|---|---|---|
| Traveller 26 (legacy BS-IV) 4020 WB | standard | REJECTED | REJECTED | **REJECTED** | 6360 → 8090 |
| Traveller N 3050 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Traveller N 3350 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Traveller N 3700 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Traveller N 4020 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Traveller N Wider Body 3350 WB | standard | REJECTED | REJECTED | **REJECTED** | 6360 → 8090 |
| Traveller N Wider Body 4020 WB | standard | REJECTED | REJECTED | **REJECTED** | 6360 → 8090 |
| Urbania 3350 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Urbania 3615 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Urbania 4400 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Tata Motors Winger (high roof) 3488 WB | standard | REJECTED | REJECTED | **REJECTED** | 8090 → 9090 |
| Ashok Leyland Viking (bus chassis) 5334 WB | standard | UNDECIDED | UNDECIDED | **UNDECIDED** | 6240 → 6240 |
| Eicher Pro 3010 L (bus chassis) 5260 WB | standard | UNDECIDED | UNDECIDED | **UNDECIDED** | 6240 → 6240 |
| Tata Motors LP 410 (face-cowl bus chassis) 3400 WB | standard | REJECTED | REJECTED | **REJECTED** | 8020 → 6240 |
