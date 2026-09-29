# 3D Viewer Rebuild Plan — Force Urbania Configurator

## Scope
Rebuild the Three.js 3D viewing system from the current proof-of-concept (simple boxes) into a professional, dimensionally-accurate engineering + visualization tool with three distinct modes.

**PRESERVE:** topview.html, sideview.html, vehicle.js, all data files. Only modify index.html and its supporting 3D code.

## Architecture Overview

### Single Source of Truth
- Vehicle.js provides all shared geometry (layout, placements, dimensions)
- 3D viewer reads from Vehicle.js, never maintains independent geometry
- All transformations: vehicle frame mm → scene metres
- Vehicle frame: x=0 at rear bumper, y=0 at centerline, z=ground up

### Three Viewing Modes

#### MODE A: CUTAWAY / ENGINEERING VIEW
**Purpose:** Show exactly how camper modules fit inside the vehicle interior.

**Display:**
- Vehicle floor (interior box floor)
- Wheel arches and housings (obstacle visualization)
- Interior walls (left/right boundary, rear wall, front partition)
- Roof envelope (wireframe or semi-transparent)
- Doors and windows (to show access)
- Toilet cubicle (fully enclosed sides)
- Crew bunk (with ladder, see-through upper bunk/mattress)
- Kitchenette (with hob, sink, fridge details)
- Lounge bench (cushions, backrest)
- Electrical cabinet (with display panel)
- Water tank and utilities
- Partition with door
- All circulation space (walkway)

**Vehicle Shell Visualization:**
- Partially transparent (alpha ~0.3) or face-culled to show interior
- Show wheel housings as obstacles
- Color coding for different zones optional

**Camera:** Positioned to show interior depth and height. Orbit around center axis.

#### MODE B: ROOF-OFF / TOP-DOWN CONFIGURATOR
**Purpose:** Architectural dollhouse view for planning module placement and clearances.

**Display:**
- Full vehicle outline from above
- All modules as labeled rectangles
- Wheel housings clearly visible (hatching or color)
- Aisle width prominent
- Door swing arcs if feasible
- Module dimensions on labels
- Collision zones highlighted if present

**Vehicle Shell:**
- Hidden or wireframe
- Floor visible for reference
- Walls invisible but can show as grid

**Camera:** Orthographic or high perspective, directly overhead, fitted to vehicle bounds.

#### MODE C: REALISTIC CAMPER EXPERIENCE
**Purpose:** Customer-facing visualization of finished camper interior.

**Display:**
- Properly textured/finished materials
- Realistic cabinet work, cushions, lighting
- Interior color scheme
- Accessories (TV, curtains, fixtures)
- Photo-realistic presentation

**Camera Presets:**
- Driver/cab view
- Galley/kitchen view
- Lounge seating view
- Bunk/sleeping view
- Toilet entrance view
- Exterior 3/4 front
- Exterior 3/4 rear

## Component Design

### Vehicle Body Geometry

#### Current Issues:
- Generic rectangular cabin
- Oversimplified hood
- No windshield tilt
- No rounded roof corners
- Minimal detail

#### Improvements:
- Tapered hood toward front
- Angled windshield (from brochure proportions)
- Rounded roof corners (rear corner radius in assumptions.profile)
- Proper cabin box with interior dimensions
- Doors with hinge lines (cab door, sliding door, rear doors)
- Windows with frames (from sideview geometry)
- Cladding band (body side trim)
- Proper headlights, taillights, mirrors
- Side trim details

**Coordinate System:**
```
Vehicle frame (mm):
  x=0       rear bumper
  x=7010    front bumper
  y=0       centerline
  y=+1047.5 right wall (driver side)
  y=-1047.5 left wall (passenger side)
  z=0       ground
  z=2550    roof peak

Scene conversion (metres):
  scene.x = vehicle_x_mm / 1000 - vehicle_length / 2
  scene.y = vehicle_z_mm / 1000 (height)
  scene.z = vehicle_y_mm / 1000 (width)
```

### Module Geometry

Replace placeholder boxes with recognizable parametric components.

#### PARTITION
- Frame: full-height, full-width wall at cabin/interior boundary
- Door: cutout with door leaf positioned to open toward cabin
- Door frame trim (jamb, header)
- Optional: small window in door

#### TOILET CUBICLE
- Four walls: rear, front (with door), inboard, outer
- Door: hinged leaf on front jamb
- Lid: removable/see-through panel on top
- Interior: toilet bowl, basin, mounting brackets
- All dimensions from components.json (wall_thickness, door, height)

#### CREW BUNK
- Two bunks: lower and upper deck
- Deck platforms: sturdy frame with mattress support
- Mattresses: realistic cushion shapes (lower opaque, upper see-through)
- Pillows: simple cushion geometry on upper
- Ladder: on the aisle end, 4-5 rungs
- Posts/supports: connecting lower to upper
- Headroom clearance visible

#### KITCHENETTE
- Counter base: rectangular cabinet
- Hob: 2-burner with burner circles and trim ring
- Sink: bowl with faucet (tap)
- Cabinet doors (optional): below counter
- Refrigerator: fridge unit (full height or embedded)
- Backsplash, countertop edge details

#### REFRIGERATOR
- Cabinet body
- Door with handle (faced into aisle)
- Hinges on appropriate side (depends on placement.side)
- Optional: window or open shelf appearance

#### LOUNGE BENCH
- Seat base (slab)
- Two cushions (front 50%, rear 50%)
- Full-height backrest
- Optional: side armrests

#### WATER TANK
- Cylindrical or rectangular body
- Filler cap on top
- Mounting brackets
- Drain/vent details optional

#### ELECTRICAL CABINET
- Rectangular enclosure
- Door with handle
- Display panel (flush on front)
- Cable routing clips (optional detail)

#### TV
- Slim bracket mounting
- Screen frame
- Optional: soundbar

**General Module Principles:**
- All dimensions from components.json (footprint.length/width/height)
- Variants handled (different sizes/styles)
- Sub-components positioned via placement rules (align, inset, side)
- Materials: color-coded by type (furniture green, utility dark, appliances gray)

### Collision & Clearance Validation

#### Automatic Checks:
1. Module vs. module overlap
2. Module vs. wheel housing intrusion
3. Module vs. body wall collision
4. Door swing clearance (toilet, fridge)
5. Aisle width (minimum passage)
6. Headroom conflicts (bunks, tall modules)
7. Bed accessibility (no obstructions)

#### Visualization:
- Red tint/wireframe for colliding objects
- Highlight wheel housings in conflicting zones
- Warning badges in the checklist ("⚠ overlaps rear axle")
- Optional: heatmap showing clearance margins

### Performance Optimization

#### LOD (Level of Detail) System:
- **LOD 0 (Distance > 10m):** Simple boxes, no details
- **LOD 1 (5m < distance ≤ 10m):** Basic parametric geometry
- **LOD 2 (distance ≤ 5m):** Full detail (cushion facets, door hinges, etc.)

#### Memory & Rendering:
- GLTF mesh instancing for repeated geometry (cushions, ladder rungs)
- Texture compression (optional, for realistic mode)
- Frustum culling built-in (Three.js)
- Shadow map resolution: 2048x2048 (current, acceptable)
- Polygon budgets: ~100k triangles for typical camper layout
- Mobile: lower shadow resolution, reduced detail LOD

#### Asset Loading:
- Modules load on-demand (lazy load by view mode)
- GLB/GLTF caching in browser
- Draco compression optional for complex geometry
- Pre-warm camera transitions (no stutter)

### UI & Controls

#### Layout:
```
┌─────────────────────────────────────────┐
│ Header (unchanged)                      │
├─────────────────────────────────────────┤
│                │                        │
│  3D Viewport   │     Control Panel      │
│  (main)        │     - View mode        │
│                │     - Camera presets   │
│                │     - Display options  │
│                │     - Module list      │
│                │     - Price total      │
│                │                        │
└─────────────────────────────────────────┘
```

#### View Mode Buttons:
```
[Cutaway] [Roof Off] [Realistic]
```

#### Camera Presets (context-sensitive):

**Cutaway/Roof-Off modes:**
```
[Orbit] [Top] [Front] [Rear] [Left Side] [Right Side]
```

**Realistic mode:**
```
[Driver] [Kitchen] [Lounge] [Sleeping] [Toilet] [Exterior FR] [Exterior RR]
```

#### Display Options (checkboxes):
```
☑ Vehicle Shell
☑ Dimensions
☑ Clearances
☑ Module Labels
☑ Collision Zones (if any)
```

#### Interaction:
- Orbit: Left-mouse drag or touch swipe
- Pan: Right-mouse drag or Ctrl+drag
- Zoom: Mouse scroll or pinch
- Reset Camera: Double-click or button
- Mobile: Single finger rotate, two-finger pan/zoom

### Dimensional Validation Checklist

Before marking complete, verify:

- [ ] Wheelbase matches brochure (4400 mm)
- [ ] Front axle position matches (frontAxleX from layout)
- [ ] Rear axle position matches (rearAxleX from layout)
- [ ] Interior box dimensions match layout (length, width, halfWidth)
- [ ] Floor height matches assumptions.floor_height (550 mm)
- [ ] Wheel housings positioned at correct (x, y, side) per layout
- [ ] Each module's x0, x1, y0, y1, z0 from camperPlacements()
- [ ] Partition at interior.x1 (front of passenger cabin)
- [ ] Camper zones laid out rear-wards with correct gap
- [ ] Door positions from sideview (cab_door, sliding_door, rear doors)
- [ ] Window positions from sideview (window sill, top, side window locations)
- [ ] Roof envelope height = body.height (2550 mm)
- [ ] No hardcoded vehicle dimensions in scene (all from spec/layout)
- [ ] All module dimensions from components.json, not invented

### Testing Checklist

#### Desktop (Chrome/Firefox/Safari):
- [ ] Cutaway mode renders correctly
- [ ] Roof-off mode hides roof, shows top-down
- [ ] Realistic mode shows finished appearance
- [ ] All camera presets work
- [ ] Orbit, pan, zoom responsive
- [ ] Module toggle updates 3D view
- [ ] Configuration change (URL query) updates 3D
- [ ] No console errors
- [ ] 60 FPS on typical desktop

#### Mobile (Android Chrome):
- [ ] Renders without crashing
- [ ] Touch rotate works smoothly
- [ ] Pinch zoom responsive
- [ ] Labels readable at mobile scale
- [ ] Panel fits on screen (scroll if needed)
- [ ] Performance acceptable (30+ FPS)
- [ ] Landscape and portrait modes work

#### Consistency Checks:
- [ ] 3D module positions match 2D top-view
- [ ] 3D heights match 2D side-view
- [ ] All dimensions from single source (Vehicle.js)
- [ ] 2D system unchanged
- [ ] 3D and 2D configurations always in sync

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- Refactor index.html for three-mode architecture
- Build improved vehicle body geometry (hull, hood, windshield)
- Implement view mode switching
- Add camera orbit/pan/zoom controls
- Test basic rendering

### Phase 2: Modules (Days 3-4)
- Implement parametric module geometry (each type)
- Wire up module selection to 3D rendering
- Add material system (colors, textures)
- Test module appearance and positioning

### Phase 3: Modes & Features (Days 5-6)
- Complete cutaway mode (transparency, shell handling)
- Complete roof-off mode (orthographic, top-down labeling)
- Rough realistic mode (better materials, camera positions)
- Implement collision detection visualization

### Phase 4: Polish & Optimization (Days 7-8)
- LOD system implementation
- Mobile optimization
- UI refinement (clear mode/camera controls)
- Dimensional validation against 2D views
- Performance profiling and fixes

### Phase 5: Testing & Validation (Days 9+)
- Full validation checklist
- Cross-browser testing
- Mobile testing
- Compare 3D positions to 2D side/top views
- Document any estimated dimensions

## Known Unknowns / Estimated Dimensions

**Confirmed (from brochure):**
- Overall length: 7010 mm
- Wheelbase: 4400 mm
- Width: 2095 mm
- Height: 2550 mm
- Ground clearance: 170 mm
- Overhangs: 950 mm front, 1660 mm rear
- Tyre code: 235/65 R16 C (diameter: 712 mm)
- Tracks: 1750 mm front and rear

**Estimated (from reference renders ±100 mm):**
- Cab depth: 2600 mm (scaled off top-view render)
- Hood length: 955 mm
- Interior wall thickness: 150 mm
- Rear wall thickness: 100 mm
- Floor height: 550 mm (typical van class)
- Body bottom height (rocker): 340 mm
- Windshield angles, roof radius: all from sideview profile proportions

**To Replace When Actual Data Available:**
- A Force Motors dealer technical drawing with interior dimensions
- Detailed roof contour (is it a simple ridge, or Sprinter-style partial crown?)
- Exact cabin depth and wall thicknesses

## Success Criteria

✅ **Dimensional Accuracy:** Every object positioned from data, not visual estimation.

✅ **Three Modes:** Cutaway (engineering), Roof-Off (planner), Realistic (customer).

✅ **Single Source of Truth:** Vehicle.js drives both 2D and 3D, they never disagree.

✅ **Module Geometry:** Recognizable camper components, not placeholder boxes.

✅ **Performance:** Desktop 60 FPS, mobile 30+ FPS; works on Android browsers.

✅ **Validation:** 3D positions match 2D views within tolerance (±50 mm).

✅ **No Regressions:** 2D top/side views, data files, vehicle.js remain untouched.
