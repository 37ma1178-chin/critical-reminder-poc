# Vehicle configs. Units mm in comments, metres in values. src: provenance of each figure.
def tyre_d(rim_in, width_mm, ratio):
    return (rim_in*25.4 + 2*width_mm*ratio)/1000.0

V = []
def van(fid, name, L, W, H, WB, gc, FOH, tyre, tyre_src, floor, cab, nose, hood, ws, src, duals=False, internal_h=None, notes=""):
    V.append(dict(id=fid, name=name, kind="van", L=L, W=W, H=H, WB=WB, gc=gc, FOH=FOH, tyre=tyre, tyre_src=tyre_src,
                  floor=floor, cab=cab, nose=nose, hood=hood, ws=ws, src=src, duals=duals, internal_h=internal_h, notes=notes))
def bus(fid, name, L, W, H, WB, gc, FOH, tyre, tyre_src, floor, cab, src, notes=""):
    V.append(dict(id=fid, name=name, kind="bus", L=L, W=W, H=H, WB=WB, gc=gc, FOH=FOH, tyre=tyre, tyre_src=tyre_src,
                  floor=floor, cab=cab, src=src, duals=True, internal_h=None, notes=notes))

T215 = (tyre_d(15,215,0.75), 0.215); T235 = (tyre_d(16,235,0.65), 0.235)
FTURL = "forcemotors.com/vehicles/traveller-{}wb/"
for wb, L, H, gvw in [(3050,5100,2615,3675),(3350,5585,2615,3965),(3700,6235,2640,4400)]:
    van(f"force_traveller_{wb}_camper", f"Force Traveller N {wb}WB", L/1000, 1.925, H/1000, wb/1000, 0.200, 0.900, T215, "215/75 R15 (OEM page)",
        0.560, 1.70, 0.85, 1.25, 0.60,
        src=f"L/W/H/WB/GC/GVW {L}x1925x{H}, WB {wb}, GC 200, GVW {gvw}: Force Motors page {FTURL.format(wb)} (OEM). Front overhang 900, floor 560, cab 1700 estimated (donors.json interior block)" + (" ; 3350WB figures identical to donors.json force-traveller-n-3350" if wb==3350 else ""))
van("force_traveller_4020_camper", "Force Traveller N 4020WB", 6.935, 1.925, 2.760, 4.020, 0.200, 0.900, T235, "235/65 R16 (OEM page)",
    0.560, 1.70, 0.85, 1.25, 0.60, src="6935x1925x2760, WB 4020, GC 200, GVW 4850: forcemotors.com/vehicles/traveller-4020wb/ (OEM). Overhang/floor/cab estimated")
van("force_traveller_4020_widerbody_camper", "Force Traveller N Wider Body 4020WB", 6.965, 2.245, 2.850, 4.020, 0.180, 0.900, T235, "235/65 R16, 6+1 = dual rear (OEM page)",
    0.580, 1.70, 0.85, 1.25, 0.65, duals=True, src="6965x2245x2850, WB 4020, GC 180, GVW 6000: forcemotors.com/vehicles/traveller-wider-body-4020wb/ (OEM). Overhang/floor/cab estimated")
van("force_traveller_26_4020_camper", "Force Traveller 26 (4020WB, legacy BS-IV)", 6.770, 2.225, 2.870, 4.020, 0.190, 0.900, T215, "215/75 R15, 6+1 = dual rear (2018 brochure)",
    0.560, 1.70, 0.85, 1.25, 0.65, duals=True, src="6770x2225x2670 (2870 with AC), WB 4020, FOH 900, ROH 1850, GC 190, GVW 5750: Force Traveller 26 brochure June 2018 (BS-IV, legacy) and TrucksBuses spec page. AC height 2870 used")
for wb, L, gvw in [(3350,5440,3625),(3615,6225,4135),(4400,7010,4610)]:
    van(f"force_urbania_{wb}_camper", f"Force Urbania {wb}WB", L/1000, 2.095, 2.550, wb/1000, 0.190, 1.000, T235, "235/65 R16 (ESTIMATED, not in seed)",
        0.560, 1.80, 0.75, 1.20, 0.75,
        src=f"{L}x2095x2550, WB {wb}, GVW {gvw}: Force Motors Urbania pages (OEM, via parent research)" + ("; same as donors.json force-urbania-3615" if wb==3615 else "") + ". Front overhang 1000, GC 190, floor 560, cab 1800 estimated")
van("tata_winger_3488_hr_camper", "Tata Winger FL 3488 HR (12S/15S/9S high roof)", 5.458, 1.905, 2.670, 3.488, 0.180, 0.950, (tyre_d(15,195,0.82),0.195), "195 R15 LT (OEM page)",
    0.495, 1.65, 0.55, 1.15, 0.80, internal_h=1.900,
    src="5458x1905x2670, WB 3488, GC 180, floor 495, internal height 1900, GVW 3230: busesandvans.tatamotors.com/product/tata-winger-12s (OEM; donors.json tata-winger-12s). 15S/9S HR list 5478 long. Front overhang 950, cab 1650 estimated")
bus("tata_lp410_3400_motorhome", "Tata LP 410 face-cowl chassis 3400WB, coach-built motorhome", 6.615, 2.140, 2.800, 3.400, 0.210, 1.275, (0.80,0.19), "7.50 R16 class (ESTIMATED), dual rear",
    0.900, 2.10, src="L 6615, W 2140, WB 3400, FOH 1275, ROH 1940, GC 210: donors.json tata-lp410-3400 (reputable_secondary). Body height 2800 ESTIMATED (proposedBody). Floor 900, cab 2100 estimated")
bus("eicher_pro_3010l_motorhome", "Eicher Pro 3010 L bus chassis 5260WB, coach-built motorhome", 10.159, 2.226, 3.200, 5.260, 0.185, 1.918, (tyre_d(17.5,235,0.75),0.235), "235/75 R17.5 (OEM, seed), dual rear",
    0.950, 2.30, src="L 10159, W 2226, WB 5260, FOH 1918, ROH 2981, GC 185: donors.json eicher-pro-3010-l (OEM). Body height 3200 ESTIMATED (proposedBody; chassis height 2470 is OEM). Floor 950, cab 2300 estimated")
bus("ashok_leyland_viking_5334_motorhome", "Ashok Leyland Viking 5334WB bus chassis, coach-built motorhome", 10.934, 2.600, 3.400, 5.334, 0.230, 2.400, (1.02,0.26), "10.00 R20 class (ESTIMATED), dual rear",
    1.000, 2.60, src="W 2600, WB 5334, FOH 2400: donors.json ashok-leyland-viking-5334 (OEM). Length 10934 = OEM spec page (conflict: TrucksBuses 10699, FOH 2265, ROH 3100 - unresolved, OEM used as planning length). ROH 3200 derived. Body height 3400 ESTIMATED. GC 230, floor 1000, cab 2600 estimated")
van("force_traveller_3350_widerbody_camper", "Force Traveller N Wider Body 3350WB", 5.615, 2.245, 2.720, 3.350, 0.200, 0.900, T215, "215/75 R15, 4+1 = single rear (OEM page)",
    0.580, 1.70, 0.85, 1.25, 0.65, src="5615x2245x2720, WB 3350, GC 200, GVW 4125: forcemotors.com/vehicles/traveller-wider-body-3350wb/ (OEM, re-read 19 Nov 2026). Overhang/floor/cab estimated")
