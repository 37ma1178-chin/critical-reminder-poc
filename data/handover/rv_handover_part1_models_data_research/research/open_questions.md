# Open questions (unresolved at handover, 21 Nov 2026 IST)

Each item says why it matters for the configurator and what would close it.

## Legal / regulatory

1. **Are slide-out / expandable sections legal for bus-type conversions in India?** (LP 410, Eicher Pro 3010 L, Ashok Leyland Viking, and any M3 build.)
   - What we know: CMVR and AIS-124 neither name nor ban slide-outs or pop-tops. Rule 93 limits (2.6 m wide, 4.0 m high, 13.5 m long for 2-axle M3) have no parked-mode exception, and AIS-124 Table 2 says any change in overall dimensions must be tested. Bus bodies also have to meet the bus body code (emergency exits etc.).
   - Unresolved: whether ARAI/ICAT would type-approve a body whose deployed width exceeds 2.6 m if it is stowed for travel; whether the RC records stowed or deployed size; whether deployment inside a private caravan park is outside Rule 93.
   - Width margin when stowed: Viking 0 mm (already 2600 mm), Eicher 374 mm, LP 410 460 mm. A slide-out on the Viking cannot add any stowed width.
   - Close it by: written query to ARAI / ICAT (homologation) and MoRTH; ask a coach builder that has an AIS-124 approval.
2. **Same question for van conversions** (pop-top roofs on Traveller / Urbania / Winger). Pop-top raised height would add to 2.55–2.87 m; 4.0 m limit leaves room, but whether the raised state counts as the "hood when down" exclusion is only our reading.
3. **GSR 596(E) (2021)** — now found and downloaded (gazette copy, third-party host). Still to do: get the copy from egazette.gov.in / MoRTH (MoRTH URL returned HTTP 500) to have an official host.
4. **GSR 868(E) (2016)** original PDF not downloaded (India Code 504). Rule 2(za) / 125G text is from the annotated reprint.
5. **Current consolidated CMVR** — reprint covers amendments only to Apr 2023. Any 2023–2026 amendment touching Rule 93, 112, 125G or 138 is not captured.
6. **RTO classification varies by state**: whether a converted camper is registered as M1 "motor caravan", "camper van (private)" (non-transport) or a transport vehicle; whether seats removed changes the category on the RC; road-tax treatment. Close by asking 2–3 target state transport departments.
7. **M1 vs M3 for heavy campers**: AIS-053/IS 14272 put any vehicle with ≤ 8 seats + driver in M1 regardless of GVW (so a 16.2 t Viking camper with 6 seats would be "M1"). Whether RTOs and test agencies accept that, and which Rule 93 length (12 m M1 vs 13.5 m M3) then applies, is unconfirmed. AIS-053 cl. 3.1.7.1 still says "special purpose M1" for motor caravans while AIS-124/Rule 2(za) say "category M".
8. **S.O. 1248(E) (2004)** copy is on a non-Indian site; get the egazette copy.
9. **Karnataka Tourism Policy 2024-29**: scanned PDF, caravan clauses not extracted (needs OCR).
10. **Rule 93 side projection, rear overhang 60 %, Rules 118, 125H, 128A, 138A, 62**: taken from earlier reports, not re-read in this pass.
11. **Driving Regulations 2017, reg. 35** not downloaded.
12. **No published ARAI/ICAT approval** for any Indian pop-top or slide-out camper was found; maker claims (LuxeCamper, EarthCamper, Pinnacle Finetza) unverified.

## Vehicle data

13. **Ashok Leyland Viking length conflict**: OEM page 10934 mm (FOH 2400) vs TrucksBuses 10699 mm (FOH 2265, ROH 3100) for the 5334 mm wheelbase. vehicles.json uses the OEM value (CONFIRMED) but the conflict is open. With OEM figures the rear overhang is 3200 mm = exactly 60.0 % of wheelbase, i.e. at the Rule 93 limit. Close by getting an Ashok Leyland chassis drawing.
14. **Bus body heights are guesses**: LP 410 2800, Eicher 3200, Viking 3400 mm (±300 mm). These drive standing height, roof equipment space and the 4.0 m check. Needs a coach builder's drawing.
15. **Tata LP 410 3400 mm wheelbase**: all LP 410 data is from aggregators; one listing says BS-III. Tata's current site lists LP 410/31, /33, /36 chassis (pages timed out), so the 3400 mm variant may not be current. Decide whether to swap to a current OEM LP 410 card.
16. **Interior widths**: all estimated as outside width − 80 mm. Force's delivery-van leaflet suggests the real Traveller interior is up to ~165 mm narrower (1680 vs 1845 mm). Needs measurement of one vehicle per body family.
17. **50 mm dinette aisle**: on the standard Traveller N (3050/3350/3700/4020) and the Winger the gap beside the dinette is 50 mm, not walkable. Design-review item: slimmer dinette, side-facing dinette or move it.
18. **Wheel arches not modelled inside the GLBs**; real intrusion unknown for every variant (planning default 200 mm × 340 mm × 900 mm).
19. **Front overhangs** estimated for all Traveller N (900), Urbania (1000) and Winger (950); this also sets where the front axle sits inside each GLB.
20. **Floor heights** estimated for all except Winger (495 mm OEM).
21. **Urbania**: dimensions are from the Force brochure hosted on the South Africa Urbania site; confirm the India-market sheet is the same. The GLB used 190 mm ground clearance; the brochure says 200 mm min. Brochure seating (10/13/17) differs from the India site (10/13/16).
22. **Winger 12S**: Tata page refused access on 21 Nov 2026, so the 8 Oct capture was not re-checked. Ground clearance 180 mm and tyre 195 R15 LT are in vehicles.py but not in the donors.json capture. Whether "12 seater" includes the driver is unclear.
23. **Eicher GVW**: OEM 10.7 t vs aggregator 10625 kg (OEM used).
24. **Prices**: no OEM ex-showroom price for Urbania (only a range start of Rs 29.51 lakh), Winger 12S, LP 410, Eicher, Viking, Traveller 26. Force Traveller N prices are "starting" ex-showroom prices for the seated van, city not stated.
25. **Door positions and sizes**: not published by any OEM; GLB doors are placeholders.
26. **.blend source files** do not exist; only the procedural build scripts.

## Process

27. Research reports "CMVR conversion citations", "vehicle suitability list" and "bus specs" were not available to the packager (see research/reports/MISSING_reports.md).
28. Queued next step (not started): plumbing and electrical configuration in 2D and 3D for standard and expandable designs, after Arihant's design review.
