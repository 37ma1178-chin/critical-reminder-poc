# blender -b --factory-startup --python verify_render.py -- <glb> <png> [samples]
import bpy, sys, os, json, math
from mathutils import Vector
a = sys.argv[sys.argv.index("--")+1:]
glb, png = a[0], a[1]; samples = int(a[2]) if len(a) > 2 else 24
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
dg = bpy.context.evaluated_depsgraph_get()
mn = Vector((1e9,)*3); mx = Vector((-1e9,)*3); bmn = Vector((1e9,)*3); bmx = Vector((-1e9,)*3); tris = 0; nmesh = 0; names = []
for o in bpy.context.scene.objects:
    names.append(o.name)
    if o.type != 'MESH': continue
    nmesh += 1
    e = o.evaluated_get(dg); me = e.to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles)
    for vtx in me.vertices:
        w = o.matrix_world @ vtx.co
        mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
        if not o.name.startswith('Mirror'): bmn = Vector(map(min, bmn, w)); bmx = Vector(map(max, bmx, w))
    e.to_mesh_clear()
size = mx - mn
blend = sorted({m.name for m in bpy.data.materials if getattr(m, 'blend_method', 'OPAQUE') == 'BLEND'})
rep = dict(glb=glb, bytes=os.path.getsize(glb), meshes=nmesh, triangles=tris, bbox_m=[round(s,3) for s in size], bbox_no_mirrors_m=[round(s,3) for s in (bmx-bmn)], min=[round(s,3) for s in mn], max=[round(s,3) for s in mx], blend_materials=blend,
           has=[n for n in ["Fire_Extinguisher_1_2kg_Driver","Fire_Extinguisher_2_2kg_Kitchen_Door","Inlet_230V_Shore_Power_IP44","Kitchen_Cooktop_2Burner_LPG","Kitchen_Sink_Stainless","Bed_Mattress_Double","Dinette_Table_Removable"] if n in names])
print("REPORT", json.dumps(rep))
# render
sc = bpy.context.scene
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 800, 600; sc.render.film_transparent = False
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.75, 0.82, 0.92, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.9
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
g = bpy.context.active_object; gm = bpy.data.materials.new("Ground"); gm.use_nodes = True
gm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.42, 0.42, 0.40, 1); g.data.materials.append(gm)
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", 'SUN')); sc.collection.objects.link(sun)
sun.data.energy = 3.5; sun.rotation_euler = (math.radians(40), math.radians(10), math.radians(150))
c = (mn + mx) / 2; L = size.x
cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam")); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 35
d = max(L, 4.0) * 1.35
pos = c + Vector((0.45, 1.0, 0.85)).normalized() * d
cam.location = pos
cam.rotation_euler = (c + Vector((0, 0, -0.2)) - pos).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = png
bpy.ops.render.render(write_still=True)
