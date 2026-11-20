# Generates data/vehicles.json for the RV configurator handover. Reads copies only.
import json, glob, os
R = '/workspace/rv-handover/rv_configurator_handover'
META = {os.path.basename(f)[5:-5]: json.load(open(f)) for f in glob.glob('/workspace/camper-glb/scripts/meta_*.json')}
GI = json.load(open('/tmp/rvh/glb_inspect.json'))
_ns = {}; exec(open('/workspace/camper-glb/scripts/vehicles.py').read(), _ns)
VGC = {v['id']: v['gc'] for v in _ns['V']}  # ground clearance the GLB was built with
SNAP = 'research/oem_snapshots/'
READ = 'read 21 Nov 2026 IST'
C, E, U = 'CONFIRMED', 'ESTIMATED', 'UNKNOWN'

def n(value, unit, conf, source, method=None, **kw):
    d = dict(value=value, unit=unit, confidence=conf, source=source)
    if method: d['method'] = method
    d.update(kw)
    return d

def force_src(slug, label):
    return (f"Force Motors, {label} product page, 'Specifications' tab, 'Dimensions (mm)' / 'Weight (kg)' / 'Wheels & Tyres' blocks (web page, no page numbers), "
            f"https://www.forcemotors.com/vehicles/{slug}/ ({READ}; saved copy {SNAP}forcemotors_{slug}.html)")
def force_price_src(slug, label):
    return (f"Force Motors, {label} product page header 'Price Starts at ... Lakh*'; footnote on the same page: '* Indicates Ex-showroom price'. "
            f"https://www.forcemotors.com/vehicles/{slug}/ ({READ}; saved copy {SNAP}forcemotors_{slug}.html). City and seating option not stated.")
URB_BRO = ("Force Motors Urbania brochure (Force Motors Ltd, Pune), specification table, PDF page 8 of 9, "
           "https://www.urbania.co.za/wp-content/themes/force-urbania-v2/urbania_brochure.pdf (copy hosted on Force's South Africa Urbania site; "
           f"India-market sheet not found; {READ}; saved copy {SNAP}Force_Urbania_brochure_urbania-co-za.pdf)")
URB_IN = f"Force Motors India Urbania site, 'Variants' section, https://www.forceurbania.co.in/ ({READ}; saved copy {SNAP}forceurbania_co_in_home.html)"
T26 = ("Force Motors Traveller 26 brochure, ref. A-0000-332-21-469 / June 2018 (BS-IV, legacy model), specification panel, PDF page 2 of 2; "
       "copy hosted by wikibus archive https://wikibus.blob.core.windows.net/sources4835/Force%20Traveller%2026.pdf "
       f"({READ}; saved copy {SNAP}Force_Traveller_26_brochure_June2018_wikibus-copy.pdf)")
WING = ("Tata Motors, Winger 12S product page, specification lines, https://busesandvans.tatamotors.com/product/tata-winger-12s "
        "(captured 8 Oct 2026 into research/project_files/donors.json entry 'tata-winger-12s'; re-check on 21 Nov 2026 returned 'Access denied', so not re-read)")
WING_IH = ("Tata Motors Winger 12S page (internal height line) as recorded in models/source/vehicles.py on 19 Nov 2026; "
           "a web search on 21 Nov 2026 also returned 'internal height 1900 mm, floor height 495 mm' for https://busesandvans.tatamotors.com/product/tata-winger-12s. "
           "Page itself returned 'Access denied' on 21 Nov 2026, so not re-read directly")
EICH = ("Eicher Trucks and Buses, Pro 3010 L chassis page, 'Specifications' table (web page, no page numbers), "
        f"https://www.eichertrucksandbuses.com/buses/bus-chassis/pro-3000-series-chassis/pro-3010-l-chassis ({READ}; saved copy {SNAP}eicher_pro-3010-l-chassis.html)")
VIK = ("Ashok Leyland, Viking specification page, 'DIMENSIONS' and 'INDICATIVE SEAT CAPACITY' blocks (web page, no page numbers), "
       f"https://www.ashokleyland.com/in/buses/brands/viking/specification ({READ}; saved copy {SNAP}ashokleyland_viking_specification.html)")
LPD = "BusesDekho (aggregator) Tata LP 410 specifications, https://buses.cardekho.com/buses/tata/lp-410/specifications (captured 8 Oct 2026 in donors.json 'tata-lp410-3400'; not an OEM source)"
VPY = 'models/source/vehicles.py (GLB build input, 19 Nov 2026)'
DON = 'research/project_files/donors.json (ObjectWeave seed 2026-10-08)'

def est(value, unit, method, src=VPY, tol=None):
    d = n(value, unit, E, src, method)
    if tol: d['expected_error'] = tol
    return d

# ---------- per-variant authored facts ----------
F = []
def traveller(glbid, newname, slug, label, model, variant, wb, L, W, H, gc, gvw, seats, price_lakh, tyre, rear):
    s = force_src(slug, label)
    F.append(dict(glbid=glbid, glb=newname, brand='Force Motors', model=model, variant=variant, family='van',
        wb=n(wb,'mm',C,s), seats=n(seats,'seats (+D = plus driver)',C,s), gvw=n(gvw,'kg',C,s),
        price=n(int(round(price_lakh*100000)),'INR',C,force_price_src(slug,label), note=f"Starting ex-showroom price Rs {price_lakh} lakh for the seated passenger van; not a camper price"),
        L=n(L,'mm',C,s), W=n(W,'mm',C,s), H=n(H,'mm',C,s), gc=n(gc,'mm',C,s),
        foh=est(900,'mm',"Front overhang not published for Traveller N. 900 mm taken from the older BS-IV Traveller 3350 Super brochure (via donors.json 'force-traveller-n-3350' interior.frontOverhangMm) and applied to all Traveller N wheelbases", src=DON+"; "+VPY, tol='±150 mm'),
        roh=est(L-wb-900,'mm',f"Derived: overall length {L} − wheelbase {wb} − estimated front overhang 900", tol='±150 mm'),
        tyre=n(tyre,'size',C,s), rear_wheels=rear))
traveller('force_traveller_3050_camper','force_traveller_3050wb.glb','traveller-3050wb','Traveller N 3050WB','Traveller N','3050WB passenger',3050,5100,1925,2615,200,3675,'13+D',15.42,'215/75 R15','single rear (4+1 tyres)')
traveller('force_traveller_3350_camper','force_traveller_3350wb.glb','traveller-3350wb','Traveller N 3350WB','Traveller N','3350WB passenger',3350,5585,1925,2615,200,3965,'12/13/14+D',17.96,'215/75 R15','single rear (4+1 tyres)')
traveller('force_traveller_3700_camper','force_traveller_3700wb.glb','traveller-3700wb','Traveller N 3700WB','Traveller N','3700WB passenger',3700,6235,1925,2640,200,4400,'12/17+D',20.08,'215/75 R15','single rear (4+1 tyres)')
traveller('force_traveller_4020_camper','force_traveller_4020wb.glb','traveller-4020wb','Traveller N 4020WB','Traveller N','4020WB passenger',4020,6935,1925,2760,200,4850,'12/19/20+D',20.71,'235/65 R16','single rear (4+1 tyres)')
traveller('force_traveller_3350_widerbody_camper','force_traveller-widerbody_3350wb.glb','traveller-wider-body-3350wb','Traveller N Wider Body 3350WB','Traveller N Wider Body','3350WB passenger',3350,5615,2245,2720,200,4125,'12/13+D',18.17,'215/75 R15','single rear (4+1 tyres)')
traveller('force_traveller_4020_widerbody_camper','force_traveller-widerbody_4020wb.glb','traveller-wider-body-4020wb','Traveller N Wider Body 4020WB','Traveller N Wider Body','4020WB passenger',4020,6965,2245,2850,180,6000,'19/22/25+D',21.17,'235/65 R16','dual rear (6+1 tyres)')
# Traveller 26 (legacy)
F.append(dict(glbid='force_traveller_26_4020_camper', glb='force_traveller26_4020wb.glb', brand='Force Motors', model='Traveller 26 (legacy BS-IV)', variant='26-seater 4020WB (June 2018 brochure)', family='van',
    wb=n(4020,'mm',C,T26), seats=n('26+D','seats',C,T26), gvw=n(5750,'kg',C,T26),
    price=n(None,'INR',U,'No OEM price: legacy model not on the current Force Motors site (checked 21 Nov 2026).'),
    L=n(6770,'mm',C,T26), W=n(2225,'mm',C,T26), H=n(2870,'mm',C,T26, note='Brochure: 2670 mm, 2870 mm with roof AC. GLB uses 2870 (with AC).'), gc=n(190,'mm',C,T26),
    foh=n(900,'mm',C,T26), roh=n(1850,'mm',C,T26), tyre=n('215/75 R15','size',C,T26), rear_wheels='dual rear (6+1 tyres per vehicles.py)'))
# Urbania
for glbid,newname,wb,L,gvw,seats_in,seats_bro in [('force_urbania_3350_camper','force_urbania_3350wb.glb',3350,5440,3625,'10+D (layout 10 seats excluding driver)','10'),
                                                ('force_urbania_3615_camper','force_urbania_3615wb.glb',3615,6225,4135,'13 excluding driver (layout shown 12+D)','13'),
                                                ('force_urbania_4400_camper','force_urbania_4400wb.glb',4400,7010,4610,'16+D (layout 16 seats excluding driver)','17')]:
    F.append(dict(glbid=glbid, glb=newname, brand='Force Motors', model='Urbania', variant=f'{wb}WB passenger', family='van',
        wb=n(wb,'mm',C,URB_IN+'; also '+URB_BRO), seats=n(seats_in,'seats',C,URB_IN, note=f'Export brochure lists seating capacity {seats_bro}; India site figure used'),
        gvw=n(gvw,'kg',C,URB_BRO),
        price=n(None,'INR',U,"No per-variant OEM ex-showroom price found.", leads=[
            n(2951000,'INR',C,URB_IN+" banner 'Presenting the new urbania DX ... Starting from Rs 29.51 LAKHS* (Exclusive of Insurance, Registration and Road Tax)'", note='Range starting price; the page does not say which wheelbase or seating it applies to, so it is not assigned to this variant')]
            + ([n(2888679,'INR',E,'CarDekho Urbania brochure index (aggregator), https://www.cardekho.com/force/urbania/brochures, 3615WB 14-seater row, via donors.json (read 8 Oct 2026)', 'Aggregator listing; lower than the OEM range start, so likely stale')] if wb==3615 else [])),
        L=n(L,'mm',C,URB_BRO), W=n(2095,'mm',C,URB_BRO), H=n(2550,'mm',C,URB_BRO),
        gc=n(200,'mm',C,URB_BRO, note="Brochure says 'Min. ground clearance 200'. The GLB was built with an estimated 190 mm (vehicles.py), 10 mm lower than this figure."),
        foh=est(1000,'mm','Front overhang not published; 1000 mm planning value in vehicles.py (no stated basis beyond the Urbania nose length).', tol='±150 mm'),
        roh=est(L-wb-1000,'mm',f'Derived: overall length {L} − wheelbase {wb} − estimated front overhang 1000', tol='±150 mm'),
        tyre=n('235/65 R16 C','size',C,URB_BRO, note="vehicles.py had marked this ESTIMATED; the brochure confirms 235/65 R16 C"), rear_wheels='single rear'))
# Winger
F.append(dict(glbid='tata_winger_3488_hr_camper', glb='tata_winger-highroof_3488wb.glb', brand='Tata Motors', model='Winger (high roof)', variant='FL 3488 HR 12S (one GLB also stands in for 15S/9S high roof)', family='van',
    wb=n(3488,'mm',C,WING), seats=n('12 seater','seats',C,WING, note='Page does not say whether the driver is included'), gvw=n(3230,'kg',C,WING),
    price=n(None,'INR',U,'No Winger 12S price captured from Tata. The Winger Plus 9-seater press price (Rs 20.60 lakh) is a different variant and is not used.'),
    L=n(5458,'mm',C,WING, note='15S / 9S high-roof variants list 5478 mm'), W=n(1905,'mm',C,WING), H=n(2670,'mm',C,WING),
    gc=est(180,'mm','vehicles.py cites the Tata page for GC 180, but the donors.json capture of the same page says ground clearance was not in the captured lines. Treated as an estimate until re-read.', tol='±20 mm'),
    foh=est(950,'mm','Planning value in vehicles.py; Tata does not publish overhangs on the captured page.', tol='±150 mm'),
    roh=est(5458-3488-950,'mm','Derived: 5458 − 3488 − estimated front overhang 950', tol='±150 mm'),
    tyre=n('195 R15 LT','size',E,VPY+' (cites the OEM page; donors.json says tyre size was not in the captured lines)','Not re-verified'), rear_wheels='single rear',
    floor_conf=n(495,'mm',C,WING+' (floor height line)'), ih_conf=n(1900,'mm',C,WING_IH)))
# LP 410
F.append(dict(glbid='tata_lp410_3400_motorhome', glb='tata_lp410_3400wb.glb', brand='Tata Motors', model='LP 410 (face-cowl bus chassis)', variant='3400WB chassis with coach-built motorhome body (concept)', family='bus',
    wb=n(3400,'mm',E,LPD,'Aggregator figure only. Tata OEM chassis pages found on 21 Nov 2026 are LP 410/31, /33, /36 (search results suggest about 3100/3300/3500 mm wheelbases); no OEM 3400 mm card was found. See open_questions.md'),
    seats=n('Driver only (cowl chassis)','seats',E,LPD,'Aggregator cowl configuration'),
    gvw=n(6520,'kg',E,LPD+'; also TrucksBuses https://www.trucksbuses.com/buses/chassis/school-staff/tata-lp-410/specifications','Aggregator figure'),
    price=n(None,'INR',U,'No OEM ex-showroom price found.', leads=[n(1370000,'INR',E,'TrucksBuses Tata LP 410 price band (aggregator), https://www.trucksbuses.com/buses/chassis/school-staff/tata-lp-410/price, via donors.json (read 8 Oct 2026)','Aggregator indicative band; chassis only')]),
    L=n(6615,'mm',E,LPD,'Aggregator: 1275 + 3400 + 1940 = 6615'), W=n(2140,'mm',E,LPD,'Aggregator chassis width'),
    H=est(2800,'mm','Concept body height (donors.json proposedBody, ±300 mm). No OEM body exists; chassis height is not the body height.', src=DON, tol='±300 mm'),
    gc=n(210,'mm',E,LPD,'Aggregator'), foh=n(1275,'mm',E,LPD,'Aggregator'), roh=n(1940,'mm',E,LPD,'Aggregator'),
    tyre=n('7.50 R16 class','size',E,VPY,'Planning assumption; aggregator tyre lines disagree'), rear_wheels='dual rear'))
# Eicher
F.append(dict(glbid='eicher_pro_3010l_motorhome', glb='eicher_pro3010l_5260wb.glb', brand='Eicher (VE Commercial Vehicles)', model='Pro 3010 L (bus chassis)', variant='5260WB chassis with coach-built motorhome body (concept)', family='bus',
    wb=n(5260,'mm',C,EICH), seats=n(None,'seats',U,'Chassis page does not fix a seat count (a finished body would).'),
    gvw=n(10700,'kg',C,EICH+" ('GVW 10.7 t')", note='Aggregator TrucksBuses lists 10625 kg; OEM figure used, conflict noted in open_questions.md'),
    price=n(None,'INR',U,"OEM page shows only 'Get Price'.", leads=[n([2801000,3531000],'INR (range)',E,'CarDekho search snippet for a fully built Skyline Pro 3010 L bus, about Rs 28.01–35.31 lakh (via donors.json, 8 Oct 2026)','Built-bus band, not a chassis price; not used')]),
    L=n(10159,'mm',C,EICH, note='Chassis overall length; 1918 + 5260 + 2981 = 10159'), W=n(2226,'mm',C,EICH, note='Chassis overall width'),
    H=est(3200,'mm','Concept body height (donors.json proposedBody, ±300 mm). OEM chassis height is 2470 mm (CONFIRMED, not a body height).', src=DON+'; '+EICH, tol='±300 mm'),
    gc=n(185,'mm',C,EICH), foh=n(1918,'mm',C,EICH), roh=n(2981,'mm',C,EICH), tyre=n('235/75 R17.5 - 14PR','size',C,EICH), rear_wheels='dual rear',
    chassis_h=n(2470,'mm',C,EICH)))
# Viking
F.append(dict(glbid='ashok_leyland_viking_5334_motorhome', glb='ashokleyland_viking_5334wb.glb', brand='Ashok Leyland', model='Viking (bus chassis)', variant='5334WB chassis with coach-built motorhome body (concept)', family='bus',
    wb=n(5334,'mm',C,VIK, note='Page also lists a 5639 mm wheelbase (length 11422 mm)'),
    seats=n('Indicative 37+D to 58+D depending on layout','seats',C,VIK, note='Indicative seat capacities for built buses: 53/58+D 3x2 HHR, 42/46+D 2x2 SR, 37/41+D 2x2 PB'),
    gvw=n(16200,'kg',C,VIK),
    price=n(None,'INR',U,'No OEM ex-showroom price found.', leads=[n(2783000,'INR',E,'TrucksBuses Ashok Leyland Viking price band (aggregator), https://www.trucksbuses.com/buses/inter-city/ashok-leyland-viking/specifications, via donors.json (read 8 Oct 2026)','Aggregator indicative band; chassis path')]),
    L=n(10934,'mm',C,VIK, note='CONFLICT: TrucksBuses (aggregator) lists 10699 mm with FOH 2265 / ROH 3100 for the same wheelbase. OEM value used; unresolved until a drawing is obtained. See open_questions.md'),
    W=n(2600,'mm',C,VIK, note='Equals the Rule 93 maximum width of 2.6 m: no margin for anything that projects'),
    H=est(3400,'mm','Concept body height (donors.json proposedBody, ±300 mm). No OEM body height.', src=DON, tol='±300 mm'),
    gc=est(230,'mm','Planning value in vehicles.py; not on the OEM page.', tol='±40 mm'),
    foh=n(2400,'mm',C,VIK), roh=est(3200,'mm','Derived: OEM length 10934 − OEM front overhang 2400 − wheelbase 5334. Only as good as the disputed length (aggregator implies 3100).', tol='±100 mm'),
    tyre=n('10.00 R20 class','size',E,VPY,'Planning assumption; OEM page lists no tyre'), rear_wheels='dual rear'))

# ---------- assemble ----------
WALL = 40
def cat_as_sold(f):
    g = f['gvw']['value']; s = f['seats']['value']
    if f['family'] == 'bus':
        return dict(unit='M/N category (AIS-053)', value='Incomplete bus chassis (as sold). A completed passenger bus above 5 t GVW would be M3.' if (g or 0) > 5000 or g is None else 'Incomplete chassis', confidence=E,
                    source='AIS-053 cl. 3.1.1.2 / 3.1.1.3 and IS 14272:2011 cl. 3.1.1 (rules/official_pdfs/) applied to the GVW above', method='Rule applied by the packager; not an OEM category label')
    m3 = g and g > 5000
    return dict(unit='M/N category (AIS-053)', value=('M3' if m3 else 'M2') + ' (as a seated passenger van)', confidence=E,
                source='AIS-053 cl. 3.1.1.2 / 3.1.1.3 and IS 14272:2011 cl. 3.1.1 (rules/official_pdfs/) applied to the published seats and GVW',
                method=f"More than 8 passenger seats plus driver and GVW {'above' if m3 else 'not above'} 5 t. Not an OEM label.")

out = []
for f in F:
    m = META[f['glbid']]; gi = GI[f['glbid'] + '.glb']
    Lm, Wm = m['L'], m['W']
    floor = f.get('floor_conf') or est(int(round(m['floor']*1000)),'mm',
        'Not published. Planning default from donors.json (vans 560 ±100 mm, Wider Body 580) / concept floor for bus bodies (LP 410 900 ±150, Eicher 950 ±150, Viking 1000 ±200)', src=DON+'; '+VPY,
        tol='±100 mm' if f['family']=='van' else '±150–200 mm')
    ih = f.get('ih_conf') or est(int(round(m['living_h']*1000)),'mm',
        f"GLB living-area clear height = overall height {int(round(m['H']*1000))} − estimated floor {int(m['floor']*1000)} − 40 mm roof skin − 20 mm (build_camper.py: zc = H − t − 0.02)",
        tol='±100 mm' if f['family']=='van' else '±300 mm')
    uw = est(int(round(m['living_w']*1000)),'mm',f'Exterior width {int(Wm*1000)} − 2 × 40 mm assumed wall (donors.json shellWallEachSideMm 40 ±15). No taper, trim or tumblehome allowed for.',
             src=DON+'; '+VPY, tol='−200/+30 mm (Force delivery-van leaflet shows 1680 mm cargo width on the 1925 mm Traveller body, i.e. up to ~165 mm less than this estimate)' if f['family']=='van' else '±60 mm (flat-sided coach body assumed)')
    ul = est(int(round(m['living_len']*1000)),'mm','GLB living length: from 60 mm inside the rear wall to 360 mm behind the cab-seat backs (cab length estimated: vans 1650–1800 ±250 mm, buses 2100–2600 ±300 mm). Not a measurement.',
             src=VPY+'; models/source/build_camper.py', tol='±250 mm' if f['family']=='van' else ('±300 mm' if 'viking' not in f['glbid'] else '±300 mm plus up to −235 mm from the length conflict'))
    ax = gi['axles']['Axle_Front'][0]
    out.append(dict(
        id=os.path.splitext(f['glb'])[0], brand=f['brand'], model=f['model'], variant_name=f['variant'],
        wheelbase=f['wb'], seating_as_sold=f['seats'], gvw=f['gvw'], base_price_ex_showroom=f['price'],
        category_as_sold=cat_as_sold(f),
        external=dict(length=f['L'], width=f['W'], height=f['H'], front_overhang=f['foh'], rear_overhang=f['roh'], ground_clearance=f['gc'], tyre=f['tyre'], rear_wheels=f['rear_wheels'],
                      **({'chassis_height': f['chassis_h']} if 'chassis_h' in f else {})),
        internal=dict(usable_length=ul, usable_width=uw, standing_height=ih, floor_height=floor),
        glb_file=f"models/{f['glb']}", glb_original=f"/workspace/camper-glb/{f['glbid']}.glb",
        glb_build_values=dict(note='Numbers the GLB was actually built with (models/source/meta_*.json). Where they differ from the fields above, the fields above win.',
                              L_m=m['L'], W_m=m['W'], H_m=m['H'], WB_m=m['WB'], FOH_m=m['FOH'], ROH_m=m['ROH'], floor_m=m['floor'], cab_m=m['cab'], tyre_diameter_m=m['tyre_d'],
                              front_axle_x_in_glb_m=ax, rear_axle_x_in_glb_m=gi['axles']['Axle_Rear'][0], glb_bbox_min_m=gi['min'], glb_bbox_max_m=gi['max'], layout=m['layout']),
        _fam=f['family'], _m=m, _gc=VGC[f['glbid']]*1000))

for o in out:
    m = o.pop('_m'); fam = o.pop('_fam'); gc = o.pop('_gc')
    WB = m['WB']*1000; r = m['tyre_d']/2
    # wheel arch (planning default from donors.json; NOT modelled inside the GLB living area)
    o['internal']['wheel_arch_intrusion'] = dict(
        note='Interior intrusion is NOT modelled in the GLB layouts (the arches are cut only in the body side walls). Values below are donors.json planning defaults, not measurements.',
        intrusion_from_each_side_wall=est(200,'mm','donors.json planning default interior.wheelArchIntrusionMm (tyre size known, housing not)', src=DON, tol='±80 mm (larger for dual rear wheels)'),
        height_above_floor=est(340,'mm','donors.json planning default interior.wheelArchHeightAboveFloorMm', src=DON, tol='±80 mm'),
        length_along_vehicle=est(900,'mm','donors.json planning default interior.wheelArchLengthMm', src=DON, tol='±150 mm'),
        front_arch_centre_x_from_front_axle=n(0,'mm',E,'Geometry: arch centred on the front axle','Arch assumed centred on the axle; inside the cab zone'),
        rear_arch_centre_x_from_front_axle=n(-int(WB),'mm',E,'Geometry: arch centred on the rear axle (−wheelbase)','Arch assumed centred on the axle'),
        glb_arch_cut_radius=n(round((r+0.06)*1000),'mm',E,'models/source/build_camper.py (arch radius = tyre radius + 60 mm, centre at 0.92 × tyre radius above ground)','GLB body-side cut only'))
    # doors (GLB placeholder geometry)
    zb = (gc/1000 if gc else 0.2) + 0.12 if fam=='van' else max((gc/1000 if gc else 0.2) + 0.30, 0.45)
    H = m['H']
    if fam == 'van':
        rear_x = m['FOH'] - m['cab'] - 0.95; front_x = m['FOH'] - m['cab'] - 0.05
        desc = 'Kerb-side (left) passenger door outline in the GLB, placed 0.05–0.95 m behind the estimated cab/living boundary'
    else:
        rear_x = m['FOH'] - 0.95; front_x = m['FOH'] - 0.25
        desc = 'Kerb-side (left) front entry door outline in the GLB, in the front overhang ahead of the front axle'
    o['glb_build_values']['ground_clearance_m'] = gc/1000
    o['internal']['doors'] = [
        dict(name='Entry door, left (kerb) side', side='left (kerb, +Y in Blender / −Z in glTF)',
             front_edge_x_from_front_axle=est(round(front_x*1000),'mm',desc+' (models/source/build_camper.py). Placeholder: the real OEM door position is not published.', src='models/source/build_camper.py', tol='±300 mm'),
             rear_edge_x_from_front_axle=est(round(rear_x*1000),'mm',desc+'. Placeholder.', src='models/source/build_camper.py', tol='±300 mm'),
             width=est(round((front_x-rear_x)*1000),'mm','GLB placeholder door width', src='models/source/build_camper.py', tol='±200 mm'),
             sill_height_above_ground=est(round((zb+0.05)*1000),'mm','GLB placeholder: body bottom (ground clearance + 120 mm for vans, + 300 mm min 450 mm for buses) + 50 mm', src='models/source/build_camper.py', tol='±100 mm'),
             height=est(round((H-0.15-zb-0.05)*1000),'mm','GLB placeholder: from sill to 150 mm below roof', src='models/source/build_camper.py', tol='±200 mm'),
             oem_door_size=n(None,'mm',U,'OEM door opening sizes are not published on the pages read'))]
    if fam == 'van':
        o['internal']['doors'].append(dict(name='Driver and co-driver cab doors / rear doors', oem_data=n(None,'mm',U,'Not published; not modelled as openings in the GLB')))

doc = dict(
    schema_note=("Every number is {value, unit, confidence, source, method (if estimated)}. confidence: CONFIRMED = read from an official OEM or government document; "
                 "ESTIMATED = planning value, derived figure or non-official source (aggregator, dealer, archive) used as a lead; UNKNOWN = not found, value null. "
                 "x positions are measured along the vehicle from the front axle centre, positive forward. Internal dimensions are design estimates used to build the GLBs, "
                 "not measurements (see data/interior_confidence_report.md and research/reports/report_interior_measurements.md)."),
    generated='2026-11-21 (IST)', variant_count=len(out),
    glb_convention=dict(units='metres', up_axis='+Y (glTF)', forward_axis='+X (nose)', kerb_side='−Z (left side; door side)',
                        origin='Mid-length of the body (x = overall length / 2 from the nose), on the vehicle centreline, at ground level (y = 0). NOT at the front axle.',
                        front_axle_offset='Front axle centre is at x = +(L/2 − front overhang) in each GLB; see glb_build_values.front_axle_x_in_glb_m. Subtract it from x to get the requested front-axle origin.'),
    vehicles=out)
json.dump(doc, open(R+'/data/vehicles.json','w'), indent=1, ensure_ascii=False)
print('wrote', len(out))

# ---- post: category as motor caravan + Rule 93 screening ----
doc = json.load(open(R+'/data/vehicles.json'))
for v in doc['vehicles']:
    g = v['gvw']['value']
    v['category_as_motor_caravan'] = dict(unit='M category (AIS-053 / IS 14272)', confidence=E,
        value=('M1 if the finished camper has 8 or fewer seats plus the driver; ' + ('M2' if (g or 0) <= 5000 and g is not None else 'M3') +
               f" if 9 or more passenger seats are kept (GVW {g if g else 'unknown'} kg {'≤' if g and g<=5000 else '>'} 5 t)"),
        source='AIS-053 cl. 3.1.1.1–3.1.1.3 (PDF p.7) and IS 14272:2011 cl. 3.1.1 (rules/official_pdfs/); Rule 2(za) CMVR and AIS-124 cl. 2.2 (motor caravan = special purpose vehicle of category M)',
        method='Definition applied by the packager to a design that is not yet built. M1 has no GVW ceiling in AIS-053/IS 14272. How an RTO actually classifies and registers a converted camper varies by state (see research/open_questions.md).')
    e = v['external']; L, W, H, WB, ROH = e['length'], e['width'], e['height'], v['wheelbase'], e['rear_overhang']
    m3 = (g or 0) > 5000
    lim_len = 13500 if m3 else 12000
    def chk(name, val, lim, conf):
        if val is None: return dict(item=name, result='UNKNOWN', confidence=U)
        return dict(item=name, value=val, limit=lim, result='within' if val <= lim else 'OVER', confidence=C if conf==C else E)
    worst = lambda *xs: C if all(x==C for x in xs) else E
    v['rule93_screen'] = dict(note=('Screening only, on the as-sold figures above (and the estimated body height for buses). Limits: CMVR Rule 93 as substituted by GSR 414(E) 26 Jun 2020: '
                                    'width 2.6 m, height 4.0 m, length 12 m (M1/M2) or 13.5 m (M3, 2 axles), rear overhang ≤ 60 % of wheelbase. '
                                    'A finished camper, and any slide-out or pop-top when deployed, must be re-checked.'),
        checks=[chk('overall width (mm)', W['value'], 2600, W['confidence']), chk('overall height (mm)', H['value'], 4000, H['confidence']),
                chk(f"overall length (mm), limit for {'M3 2-axle' if m3 else 'M1/M2'}", L['value'], lim_len, L['confidence']),
                chk('rear overhang as % of wheelbase', round(100*ROH['value']/WB['value'],1) if ROH['value'] else None, 60, worst(ROH['confidence'], WB['confidence']))])
json.dump(doc, open(R+'/data/vehicles.json','w'), indent=1, ensure_ascii=False)
for v in doc['vehicles']: print(v['id'], [(c['item'][:14], c.get('value'), c['result']) for c in v['rule93_screen']['checks']])
