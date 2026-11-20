# blender -b --factory-startup --python build_camper.py -- <vehicle_id|all>
import bpy, bmesh, sys, os, json, math
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(__file__))
from vehicles import V
OUT = "/workspace/camper-glb"

MATS = {}
def mat(name, rgb, rough=0.5, metal=0.0, alpha=1.0, emit=None):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal; b.inputs["Alpha"].default_value = alpha
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = 1.0
    if alpha < 1:
        m.blend_method = 'BLEND'
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    m.use_backface_culling = False
    MATS[name] = m; return m

def M():
    return dict(
        paint=mat("Paint_Body_White", (0.92,0.92,0.90), 0.35),
        cut=mat("Body_Cutaway_SemiTransparent", (0.85,0.90,0.95), 0.2, alpha=0.18),
        stripe=mat("Paint_Accent_Teal", (0.05,0.45,0.50), 0.4),
        glass=mat("Glass_Tinted", (0.05,0.08,0.10), 0.05, alpha=0.55),
        glassL=mat("Glass_Clear_CutawaySide", (0.55,0.65,0.72), 0.05, alpha=0.22),
        grille=mat("Grille_DarkGrey", (0.15,0.15,0.16), 0.5),
        tyre=mat("Tyre_Rubber", (0.03,0.03,0.03), 0.9),
        rim=mat("Wheel_Steel", (0.55,0.56,0.58), 0.35, 0.8),
        chassis=mat("Chassis_Black", (0.06,0.06,0.06), 0.7),
        bumper=mat("Bumper_Black", (0.08,0.08,0.08), 0.6),
        head=mat("Headlamp_Lens", (0.95,0.95,0.9), 0.1, emit=(0.6,0.6,0.55)),
        tail=mat("Taillamp_Red", (0.7,0.03,0.03), 0.2, emit=(0.4,0.0,0.0)),
        floor=mat("Floor_Vinyl_Oak", (0.55,0.40,0.26), 0.6),
        wood=mat("Cabinet_Birch_Ply", (0.80,0.66,0.47), 0.55),
        uph=mat("Upholstery_Fabric_Blue", (0.12,0.22,0.40), 0.9),
        matt=mat("Mattress_Cream", (0.93,0.89,0.80), 0.9),
        counter=mat("Countertop_Grey", (0.35,0.36,0.38), 0.4),
        steel=mat("Sink_Stainless", (0.75,0.76,0.78), 0.2, 0.9),
        hob=mat("Cooktop_Black_Glass", (0.02,0.02,0.02), 0.1),
        water=mat("Water_Tank_Blue", (0.10,0.35,0.85), 0.4),
        grey=mat("Grey_Water_Tank", (0.25,0.25,0.25), 0.6),
        batt=mat("Battery_Box_DarkGrey", (0.12,0.12,0.14), 0.5),
        elec=mat("Electrical_Panel_White", (0.95,0.95,0.95), 0.4),
        inlet=mat("Inlet_230V_Blue_CEE", (0.05,0.25,0.75), 0.4),
        ext=mat("Fire_Extinguisher_Red", (0.80,0.04,0.03), 0.3),
        wet=mat("WetRoom_Panel_LightGrey", (0.82,0.84,0.86), 0.3),
        white=mat("Sanitary_White", (0.97,0.97,0.97), 0.2),
        dash=mat("Dashboard_Charcoal", (0.10,0.10,0.11), 0.6),
    )

def link(obj, parent):
    bpy.context.scene.collection.objects.link(obj); obj.parent = parent; return obj

def mesh_obj(name, bm, material, parent):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(material)
    return link(bpy.data.objects.new(name, me), parent)

def box(name, x0,x1,y0,y1,z0,z1, material, parent):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    s = Vector((abs(x1-x0), abs(y1-y0), abs(z1-z0))); c = Vector(((x0+x1)/2,(y0+y1)/2,(z0+z1)/2))
    for v in bm.verts: v.co = Vector((v.co.x*s.x, v.co.y*s.y, v.co.z*s.z)) + c
    return mesh_obj(name, bm, material, parent)

def cyl(name, c, r, depth, axis, material, parent, seg=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=depth)
    R = {'X': Matrix.Rotation(math.pi/2,4,'Y'), 'Y': Matrix.Rotation(math.pi/2,4,'X'), 'Z': Matrix.Identity(4)}[axis]
    bmesh.ops.transform(bm, matrix=Matrix.Translation(Vector(c)) @ R, verts=bm.verts)
    return mesh_obj(name, bm, material, parent)

def prism_bm(pts, y0, y1):
    bm = bmesh.new()
    a = [bm.verts.new((x, y0, z)) for x,z in pts]; b = [bm.verts.new((x, y1, z)) for x,z in pts]
    bm.faces.new(list(reversed(a))); bm.faces.new(b)
    n = len(pts)
    for i in range(n):
        j = (i+1) % n; bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm

def offset_poly(pts, d):
    n = len(pts); out = []
    def off_line(p, q):
        dx, dz = q[0]-p[0], q[1]-p[1]; l = math.hypot(dx, dz); nx, nz = -dz/l, dx/l
        return (p[0]+nx*d, p[1]+nz*d), (dx/l, dz/l)
    for i in range(n):
        p0, d0 = off_line(pts[i-1], pts[i]); p1, d1 = off_line(pts[i], pts[(i+1)%n])
        den = d0[0]*d1[1]-d0[1]*d1[0]
        if abs(den) < 1e-6: out.append(p1); continue
        t = ((p1[0]-p0[0])*d1[1]-(p1[1]-p0[1])*d1[0]) / den
        out.append((p0[0]+d0[0]*t, p0[1]+d0[1]*t))
    return out

def plane_quad(name, p, q, y0, y1, outward, material, parent, inset=0.04):
    # glazing quad along a profile edge p->q (x,z), pushed outward by 8 mm
    dx, dz = q[0]-p[0], q[1]-p[1]; l = math.hypot(dx,dz); ux, uz = dx/l, dz/l
    p = (p[0]+ux*inset+outward[0]*0.008, p[1]+uz*inset+outward[1]*0.008)
    q = (q[0]-ux*inset+outward[0]*0.008, q[1]-uz*inset+outward[1]*0.008)
    bm = bmesh.new()
    vs = [bm.verts.new((p[0],y0,p[1])), bm.verts.new((q[0],y0,q[1])), bm.verts.new((q[0],y1,q[1])), bm.verts.new((p[0],y1,p[1]))]
    bm.faces.new(vs)
    return mesh_obj(name, bm, material, parent)

def shell(name, pts, W, t, arches, mm, parent, H, internal_top=None, xr_open=None):
    """Hollow body shell = outer prism - inner prism - wheel arches. Left wall (+Y) and roof become a separate semi-transparent cutaway object."""
    outer = bpy.data.objects.new(name+"_tmp", bpy.data.meshes.new(name+"_tmp")); bpy.context.scene.collection.objects.link(outer)
    prism_bm(pts, -W/2, W/2).to_mesh(outer.data)
    inner_pts = offset_poly(pts, t)
    if internal_top is not None:
        inner_pts = [(x, min(z, internal_top)) for x,z in inner_pts]
    inner = bpy.data.objects.new(name+"_in", bpy.data.meshes.new(name+"_in")); bpy.context.scene.collection.objects.link(inner)
    prism_bm(inner_pts, -W/2+t, W/2-t).to_mesh(inner.data)
    cutters = [inner]
    for (ax, r) in arches:
        c = bpy.data.objects.new("arch", bpy.data.meshes.new("arch")); bpy.context.scene.collection.objects.link(c)
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=28, radius1=r, radius2=r, depth=W+0.4)
        bmesh.ops.transform(bm, matrix=Matrix.Translation((ax,0,r*0.92)) @ Matrix.Rotation(math.pi/2,4,'X'), verts=bm.verts)
        bm.to_mesh(c.data); bm.free(); cutters.append(c)
    for i, c in enumerate(cutters):
        md = outer.modifiers.new(f"b{i}", 'BOOLEAN'); md.operation = 'DIFFERENCE'; md.object = c; md.solver = 'EXACT'
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(outer.evaluated_get(dg))
    for o in [outer]+cutters: bpy.data.objects.remove(o, do_unlink=True)
    # split faces
    bm = bmesh.new(); bm.from_mesh(me)
    bm2 = bm.copy()
    def is_cut(f):
        n = f.normal; c = f.calc_center_median()
        if c.y > W/2 - t - 0.01 and abs(n.y) > 0.9: return True            # left wall outer+inner faces
        if c.z > H - t - 0.25 and abs(n.z) > 0.6: return True               # roof skin
        return False
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if is_cut(f)], context='FACES')
    bmesh.ops.delete(bm2, geom=[f for f in bm2.faces if not is_cut(f)], context='FACES')
    bpy.data.meshes.remove(me)
    a = mesh_obj(name, bm, mm['paint'], parent)
    b = mesh_obj(name.replace("Shell","Cutaway_LeftWall_Roof"), bm2, mm['cut'], parent)
    return a, b

def wheel_set(v, mm, parent, xf_axle, xr_axle):
    D, tw = v['tyre']; r = D/2
    yo = v['W']/2 - tw/2 - 0.05
    for lab, x, dual in [("Front", xf_axle, False), ("Rear", xr_axle, v['duals'])]:
        for side, s in [("L", 1), ("R", -1)]:
            ys = [yo] if not dual else [yo, yo - tw - 0.03]
            for k, y in enumerate(ys):
                nm = f"Wheel_{lab}_{side}" + ("_Inner" if k else "")
                cyl(nm+"_Tyre", (x, s*y, r), r, tw, 'Y', mm['tyre'], parent)
                cyl(nm+"_Rim", (x, s*(y+0.004*(1 if k==0 else -1)), r), r*0.58, tw+0.012, 'Y', mm['rim'], parent, seg=16)
        cyl(f"Axle_{lab}", (x, 0, r), 0.05, 2*yo, 'Y', mm['chassis'], parent, seg=10)
    return r

def build(v):
    bpy.ops.wm.read_factory_settings(use_empty=True); MATS.clear()
    mm = M()
    L, W, H, WB = v['L'], v['W'], v['H'], v['WB']
    D, tw = v['tyre']; r = D/2
    xF, xB = L/2, -L/2
    ax_f = xF - v['FOH']; ax_r = ax_f - WB
    root = link(bpy.data.objects.new(v['id'], None), None)
    g = {k: link(bpy.data.objects.new(k, None), root) for k in ["Exterior_Body", "Chassis_Wheels", "Cab", "Interior_AIS124_Living"]}
    ext, chs, cab, liv = g["Exterior_Body"], g["Chassis_Wheels"], g["Cab"], g["Interior_AIS124_Living"]
    t = 0.04
    if v['kind'] == 'van':
        zb = v['gc'] + 0.12
        nose, hood, ws = v['nose'], v['hood'], v['ws']
        pts = [(xB, zb), (xF, zb), (xF, hood-0.15), (xF-nose, hood), (xF-nose-ws, H-0.05), (xF-nose-ws-0.25, H), (xB+0.08, H), (xB, H-0.08)]
        wsedge = ((xF-nose, hood), (xF-nose-ws, H-0.05))
    else:
        zb = max(v['gc'] + 0.30, 0.45)
        pts = [(xB, zb), (xF, zb), (xF, zb+0.55), (xF-0.12, H-0.28), (xF-0.38, H), (xB+0.10, H), (xB, H-0.10)]
        wsedge = ((xF, zb+0.55), (xF-0.12, H-0.28))
    internal_top = (v['floor'] + v['internal_h']) if v.get('internal_h') else None
    shell("Body_Shell", pts, W, t, [(ax_f, r+0.06), (ax_r, r+0.06)], mm, ext, H, internal_top)
    # glazing
    p, q = wsedge; dx, dz = q[0]-p[0], q[1]-p[1]; l = math.hypot(dx, dz); outn = (dz/l, -dx/l)
    plane_quad("Windscreen", p, q, -W/2+0.07, W/2-0.07, outn, mm['glass'], ext)
    zf = v['floor']; zc = internal_top if internal_top else H - t - 0.02
    xcab = xF - v['cab']          # cab/living boundary
    belt = (v['hood'] + 0.05) if v['kind']=='van' else zf + 0.85
    wtop = H - 0.30
    for side, s in [("Left", 1), ("Right", -1)]:
        y0 = s*(W/2+0.004); y1 = s*(W/2+0.014)
        # cab side window
        cx1 = (xF - v['nose'] - v['ws']*0.6) if v['kind']=='van' else xF-0.25
        gm = mm['glass'] if s < 0 else mm['glassL']
        box(f"Window_Cab_{side}", xcab+0.15, cx1, min(y0,y1), max(y0,y1), belt, wtop, gm, ext)
        x = xcab - 0.10; i = 0; pane = 1.05 if v['kind']=='van' else 1.35
        while x - pane > xB + 0.35:
            if not (side=="Left" and v['kind']=='bus' and x > xcab - 0.05 and False):
                box(f"Window_{side}_{i}", x-pane, x, min(y0,y1), max(y0,y1), belt, wtop, gm, ext)
            x -= pane + 0.14; i += 1
        box(f"Stripe_{side}", xB+0.02, xF-0.05, min(y0,y1)-0.002*s, max(y0,y1)+0.002*s, belt-0.16, belt-0.08, mm['stripe'], ext)
    box("Window_Rear", xB-0.008, xB-0.002, -W/2+0.25, W/2-0.25, belt, wtop, mm['glass'], ext)
    # entry door (left, kerb side) outline panel
    dx0 = xcab - 0.95 if v['kind']=='van' else xF - 0.95
    dx1 = xcab - 0.05 if v['kind']=='van' else xF - 0.25
    for nm, a0, a1, b0, b1 in [("Front", dx1-0.04, dx1, zb+0.05, H-0.15), ("Rear", dx0, dx0+0.04, zb+0.05, H-0.15), ("Top", dx0, dx1, H-0.19, H-0.15)]:
        box(f"Entry_Door_Left_Frame_{nm}", a0, a1, W/2+0.012, W/2+0.02, b0, b1, mm['bumper'], ext)
    # lights / bumpers
    zl = (v['hood']-0.35) if v['kind']=='van' else zb+0.35
    for s, nm in [(1,"L"),(-1,"R")]:
        box(f"Headlamp_{nm}", xF-0.03, xF+0.004, s*(W/2-0.38), s*(W/2-0.10), zl, zl+0.16, mm['head'], ext)
        box(f"Taillamp_{nm}", xB-0.004, xB+0.02, s*(W/2-0.18), s*(W/2-0.05), zb+0.45, zb+1.05, mm['tail'], ext)
    box("Grille", xF-0.03, xF+0.005, -W/2+0.42, W/2-0.42, zl-0.05, zl+0.18, mm['grille'], ext)
    box("Bumper_Front", xF-0.11, xF, -W/2+0.02, W/2-0.02, zb-0.08, zb+0.18, mm['bumper'], ext)
    box("Bumper_Rear", xB, xB+0.11, -W/2+0.02, W/2-0.02, zb-0.08, zb+0.16, mm['bumper'], ext)
    for s, nm in [(1,"L"),(-1,"R")]:
        box(f"Mirror_{nm}", xcab+ (v['cab']-0.35 if v['kind']=='bus' else 0.9), xcab+(v['cab']-0.27 if v['kind']=='bus' else 0.98), s*(W/2+0.02), s*(W/2+0.22), belt+0.05, belt+0.35, mm['bumper'], ext)
    # chassis
    rail_z = r + 0.05
    for s in (1, -1):
        box(f"Chassis_Rail_{'L' if s>0 else 'R'}", xB+0.3, xF-0.25, s*0.42-0.04, s*0.42+0.04, rail_z, min(rail_z+0.18, zb+0.05), mm['chassis'], chs)
    wheel_set(v, mm, chs, ax_f, ax_r)
    # floor (living + cab)
    Wi = W - 2*t
    xr = xB + t + 0.02
    box("Floor_Living", xr, xF-0.6, -Wi/2, Wi/2, zf-0.03, zf, mm['floor'], liv)
    Hi = zc - zf
    # ---- cab ----
    dseat_x = xcab + 0.35
    seat_y = Wi/2 - 0.45
    if v['kind'] == 'van':
        dash_x = xF - v['nose'] - 0.25; dz1 = v['hood'] - 0.02
    else:
        dash_x = xF - 0.55; dz1 = zb + 0.95
    dseat_x = (dash_x - 0.50) if v['kind'] == 'bus' else min(dseat_x, dash_x - 0.50)
    box("Dashboard", dash_x, dash_x+0.40, -Wi/2+0.05, Wi/2-0.05, dz1-0.30, dz1, mm['dash'], cab)
    for s, nm in [(-1, "Driver"), (1, "CoDriver")]:
        box(f"Seat_{nm}_Base", dseat_x-0.25, dseat_x+0.25, s*seat_y-0.25, s*seat_y+0.25, zf, zf+0.45, mm['uph'], cab)
        box(f"Seat_{nm}_Back", dseat_x-0.30, dseat_x-0.20, s*seat_y-0.25, s*seat_y+0.25, zf+0.45, zf+1.10, mm['uph'], cab)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.19, minor_radius=0.02, location=(dash_x-0.12, -seat_y, zf+0.95), rotation=(0, math.radians(65), 0))
    sw = bpy.context.active_object; sw.name = "Steering_Wheel_RHD"; sw.data.materials.append(mm['dash'])
    bpy.context.scene.collection.objects.unlink(sw) if False else None; sw.parent = cab
    # fire extinguisher 1 - beside driver seat (RHD, right side)
    def extinguisher(nm, x, y, z, parent):
        cyl(nm, (x, y, z+0.20), 0.055, 0.38, 'Z', mm['ext'], parent, seg=16)
        cyl(nm+"_Valve", (x, y, z+0.43), 0.02, 0.08, 'Z', mm['chassis'], parent, seg=8)
    extinguisher("Fire_Extinguisher_1_2kg_Driver", dseat_x+0.05, -seat_y+0.33, zf, cab)
    # ---- living layout ----
    xf = min(xcab - 0.05, dseat_x - 0.36)   # front of living area (behind cab seats)
    Lx = xf - xr
    big = Lx >= 6.5
    notes = []
    ovh_ok = Hi >= 1.75
    # rear fixed bed (transverse) with garage
    bed_d = 2.0 if big else (1.40 if Lx >= 3.6 else 1.25)
    bed_top = zf + (0.95 if big else (0.80 if Hi >= 1.95 else 0.55))
    box("Bed_Platform_Fixed_Rear", xr, xr+bed_d, -Wi/2, Wi/2, zf, bed_top, mm['wood'], liv)
    box("Bed_Mattress_Double", xr+0.03, xr+bed_d-0.03, -Wi/2+0.03, Wi/2-0.03, bed_top, bed_top+0.16, mm['matt'], liv)
    notes.append(f"fixed rear transverse double bed {Wi*1000:.0f}x{bed_d*1000:.0f} mm over a storage garage")
    if big:
        # second bed: bunk/transverse upper over garage end? use a pull-down second double over the lounge
        pass
    # tanks + electrics under the bed
    tl = min(1.4 if big else 0.9, bed_d-0.25); tw_ = 0.9 if big else 0.55; th = min(0.5 if big else 0.35, bed_top-zf-0.05)
    litres = tl*tw_*th*1000
    box(f"Water_Tank_Fresh_{litres:.0f}L", xr+0.1, xr+0.1+tl, -Wi/2+0.05, -Wi/2+0.05+tw_, zf+0.01, zf+0.01+th, mm['water'], liv)
    nb = 4 if big else 1
    for i in range(nb):
        bx = xr+0.15+i*0.36
        box(f"Battery_LiFePO4_{i+1}", bx, bx+0.32, Wi/2-0.30, Wi/2-0.05, zf+0.01, zf+0.24, mm['batt'], liv)
    box("Electrical_Panel_MCB_Inverter_Charger", xr+0.15, xr+0.15+0.45, Wi/2-0.06, Wi/2-0.02, zf+0.28, min(zf+0.62, bed_top-0.03), mm['elec'], liv)
    box("Inlet_230V_Shore_Power_IP44", xB+0.45, xB+0.60, W/2+0.0, W/2+0.05, zb+0.35, zb+0.50, mm['inlet'], ext)
    box("Wiring_Conduit_230V_IS2465", xB+0.5, xr+0.40, Wi/2-0.04, Wi/2-0.01, zb+0.42 if zb+0.42 > zf else zf+0.05, (zb+0.42 if zb+0.42 > zf else zf+0.05)+0.03, mm['chassis'], liv)
    gl = min(1.2 if big else 0.7, WB*0.35)
    box(f"Grey_Water_Tank_Underfloor", ax_r+0.8, ax_r+0.8+gl, -0.35, 0.35, max(zb-0.30, r*2+0.02 if v['kind']=='bus' else zb-0.25), max(zb-0.30, r*2+0.02 if v['kind']=='bus' else zb-0.25)+0.22, mm['grey'], chs)
    cur_x = xr + bed_d
    # wet room
    if big or Lx >= 4.6 or v['kind'] == 'bus':
        wl, wwid = (1.10, 1.10) if big else (0.85, 0.85)
        x0, x1 = cur_x, cur_x+wl; y0 = -Wi/2; y1 = -Wi/2+wwid
        box("WetRoom_Wall_Front", x1-0.03, x1, y0, y1, zf, zc, mm['wet'], liv)
        box("WetRoom_Wall_Side", x0, x1, y1-0.03, y1, zf, zc, mm['wet'], liv)
        box("WetRoom_Shower_Tray", x0, x0+wl*0.55, y0, y1-0.03, zf, zf+0.06, mm['white'], liv)
        box("WetRoom_Toilet_Cassette", x1-0.48, x1-0.08, y0+0.05, y0+0.40, zf, zf+0.45, mm['white'], liv)
        box("WetRoom_Washbasin", x1-0.40, x1-0.10, y1-0.33, y1-0.05, zf+0.80, zf+0.86, mm['white'], liv)
        notes.append("wet room with cassette toilet, shower tray and washbasin")
        right_x = x1
    else:
        right_x = cur_x
    # kitchen - left side (kerb side), immediately ahead of the bed
    kl = 2.0 if big else (1.3 if Lx >= 3.8 else 1.1)
    kd = 0.60; kz = zf + 0.90
    kx0 = cur_x; kx1 = kx0 + kl; ky0 = Wi/2 - kd; ky1 = Wi/2
    box("Kitchen_Base_Cabinets", kx0, kx1, ky0, ky1, zf, kz-0.04, mm['wood'], liv)
    box("Kitchen_Countertop", kx0, kx1, ky0-0.02, ky1, kz-0.04, kz, mm['counter'], liv)
    box("Kitchen_Cooktop_2Burner_LPG", kx1-0.62, kx1-0.12, ky0+0.08, ky1-0.08, kz, kz+0.012, mm['hob'], liv)
    for i, bx in enumerate([kx1-0.50, kx1-0.25]):
        cyl(f"Cooktop_Burner_{i+1}", (bx, (ky0+ky1)/2, kz+0.02), 0.07, 0.016, 'Z', mm['steel'], liv, seg=16)
    box("Kitchen_Sink_Stainless", kx0+0.12, kx0+0.52, ky0+0.10, ky1-0.10, kz-0.16, kz+0.004, mm['steel'], liv)
    cyl("Kitchen_Tap", (kx0+0.32, ky1-0.06, kz+0.12), 0.012, 0.24, 'Z', mm['steel'], liv, seg=8)
    if big or Lx >= 4.0:
        box("Fridge_12V_Compressor", kx1, kx1+0.55, Wi/2-0.60, Wi/2, zf, zf+(1.5 if big else 0.9), mm['elec'], liv)
        kx1e = kx1 + 0.55
    else:
        kx1e = kx1
    notes.append(f"kitchenette {kl*1000:.0f} mm with 2-burner cooktop and sink" + (", 12 V fridge" if kx1e > kx1 else ""))
    extinguisher("Fire_Extinguisher_2_2kg_Kitchen_Door", min(kx1e+0.12, xf-0.15), Wi/2-0.15, zf, liv)
    # dinette - right side, against cab back
    dw = min(1.30, Wi - 0.65)
    dl = 1.70 if Lx >= 3.6 else 1.50
    dx1 = xf; dx0 = max(dx1 - dl, right_x + 0.05)
    y0, y1 = -Wi/2, -Wi/2 + dw
    for nm, a, b, back in [("Front", dx1-0.50, dx1, (dx1-0.10, dx1)), ("Rear", dx0, dx0+0.50, (dx0, dx0+0.10))]:
        box(f"Dinette_Bench_{nm}_StorageBase", a, b, y0, y1, zf, zf+0.40, mm['wood'], liv)
        box(f"Dinette_Bench_{nm}_Cushion", a, b, y0, y1, zf+0.40, zf+0.48, mm['uph'], liv)
        box(f"Dinette_Bench_{nm}_Backrest", back[0], back[1], y0, y1, zf+0.48, zf+1.0, mm['uph'], liv)
    box("Dinette_Table_Removable", dx0+0.55, dx1-0.55, y0+0.05, y1-0.10, zf+0.70, zf+0.73, mm['counter'], liv)
    cyl("Dinette_Table_Leg", ((dx0+dx1)/2, (y0+y1)/2, zf+0.35), 0.03, 0.70, 'Z', mm['steel'], liv, seg=10)
    notes.append(f"dinette {dl*1000:.0f}x{dw*1000:.0f} mm (2 facing benches + removable table, converts to a 2nd bed)")
    # lounge sofa for big coaches, between wet room and dinette on right
    if big and dx0 - right_x > 1.2:
        box("Lounge_Sofa_Longitudinal", right_x+0.1, dx0-0.1, -Wi/2, -Wi/2+0.55, zf, zf+0.45, mm['uph'], liv)
        box("Lounge_Sofa_Back", right_x+0.1, dx0-0.1, -Wi/2, -Wi/2+0.12, zf+0.45, zf+0.95, mm['uph'], liv)
        notes.append("lounge sofa")
    elif dx0 - right_x > 0.4:
        box("Storage_Wardrobe_Tall", right_x+0.02, dx0-0.02, -Wi/2, -Wi/2+0.55, zf, zc-0.05, mm['wood'], liv)
        notes.append("tall wardrobe")
    if big and xf - kx1e > 1.6:
        box("Storage_Wardrobe_Tall", kx1e+0.35, kx1e+0.95, Wi/2-0.60, Wi/2, zf, zc-0.05, mm['wood'], liv)
    # overhead lockers
    if ovh_ok:
        oz0 = zc - 0.38
        box("Storage_Overhead_Rear", xr, xr+0.38, -Wi/2, Wi/2, oz0, zc, mm['wood'], liv)
        box("Storage_Overhead_Right", max(right_x, xr+0.4), xf, -Wi/2, -Wi/2+0.35, oz0, zc, mm['wood'], liv)
        box("Storage_Overhead_Left_Kitchen", kx0, kx1, Wi/2-0.35, Wi/2, oz0, zc, mm['wood'], liv)
        notes.append("overhead lockers")
    notes.append(f"water tank {litres:.0f} L, {nb} x 100 Ah LiFePO4 batter{'ies' if nb>1 else 'y'} + panel, 230 V shore inlet, 2 x 2 kg extinguishers (driver + kitchen/door)")
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, v['id'] + ".glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True, export_cameras=False, export_lights=False)
    meta = dict(id=v['id'], name=v['name'], kind=v['kind'], L=L, W=W, H=H, WB=WB, FOH=v['FOH'], ROH=round(L-WB-v['FOH'],3),
                tyre=v['tyre_src'], tyre_d=round(D,3), floor=zf, cab=v['cab'], living_len=round(Lx,3), living_w=round(Wi,3), living_h=round(Hi,3),
                src=v['src'], layout="; ".join(notes))
    json.dump(meta, open(os.path.join(OUT, "scripts", "meta_"+v['id']+".json"), "w"), indent=1)
    print("BUILT", path, meta['layout'])

want = sys.argv[sys.argv.index("--")+1] if "--" in sys.argv else "all"
for v in V:
    if want in ("all", v['id']): build(v)
