# Foundation acceptance tests

1. Existing Urbania top/side/3D pages render unchanged before runtime integration.
2. Candidate donor record resolves to the same brochure dimensions used by data/urbania-17.json.
3. Estimated fields remain estimated after normalization.
4. Missing required donor geometry yields FAIL or VERIFICATION_REQUIRED, never PASS.
5. Project checkpoint round-trip preserves revision and canonical model version.
6. Repeated checkpoint/retry does not duplicate physical components.
7. A 3D/render failure cannot delete canonical project state.
8. Fixed SKU dimensions are not changed by visual scaling.
9. 2D and 3D continue to consume shared geometry rather than independent dimensions.
10. No candidate regulatory/vehicle/component record is promoted to VERIFIED solely by an AI/import step.
11. Service nodes and routes reserve physical volume independently of renderer visibility.
12. Missing consequential service-system dimensions/capacities yield VERIFICATION_REQUIRED, never PASS.
13. Electrical source, storage, conversion, protection and distribution remain distinct model objects.
14. Fresh, grey and black water systems remain distinct and cannot silently share incompatible routes or tanks.
15. HVAC condensate/drain/service reservations participate in validation when HVAC is selected.
16. Furniture/components cannot overlap protected structural zones without an explicit engineering decision.
17. Concealed service components require an access/service envelope before engineering PASS.
18. Section/profile views consume the same canonical spatial/service objects as top and 3D views.
19. Layout candidates preserve donor vehicle, requirement set, budget and validation status as explicit inputs/state.
20. A layout candidate cannot become FROZEN while blocking geometry/service/regulatory findings remain unresolved.
21. A FIXED_SKU with unknown engineering dimensions yields VERIFICATION_REQUIRED.
22. A requested visual scale change to a FIXED_SKU is rejected as FIXED_SKU_SCALING_FORBIDDEN.
23. PARAMETRIC_FABRICATED resizing is accepted only inside its declared manufacturing range and creates/updates an engineered fabricated instance rather than scaling a SKU.
24. Component selection rejects donor-vehicle or physical-state incompatibility.
25. Component selection rejects known voltage, power or mass incompatibility.
26. Component selection respects the remaining project budget when a current price observation is available.
27. Missing price does not fabricate a cost; costing remains incomplete/verification-required.
28. Price refresh creates a new dated observation rather than overwriting historical observations.
29. Unknown component mass/power/capacity/clearance cannot be inferred into PASS solely by AI/import.
30. Component service/removal and operating envelopes participate in collision/layout validation before a layout is frozen.
31. Unknown base vehicle mass or longitudinal CG blocks mass-engineering PASS.
32. Unknown front or rear axle rating blocks mass-engineering PASS even when total mass is below GVW.
33. Any installed component with unknown mass or longitudinal CG blocks mass-engineering PASS.
34. Calculated total mass above GVW produces FAIL.
35. Calculated front axle load above its rating produces FAIL.
36. Calculated rear axle load above its rating produces FAIL.
37. Fluid loads are physical mass items at tank coordinates and affect total mass, CG and axle loads.
38. Occupants and luggage are explicit mass items and affect total mass, CG and axle loads.
39. Canonical vehicle coordinates are converted through an explicit adapter before use by the axle solver; coordinate systems are never silently mixed.
40. A layout cannot become FROZEN unless its required mass/load cases pass the applicable mass and axle gates.
41. Unknown appliance/load power, runtime or duty cycle blocks electrical-energy PASS.
42. Daily energy demand is derived from explicit load power, runtime, duty cycle and quantity; it is never inferred from RV size alone.
43. Unknown requested autonomy or battery usable fraction blocks storage-sizing PASS.
44. Required nominal battery energy is derived from usable energy requirement and verified usable fraction.
45. Known inverter continuous demand above its continuous rating produces FAIL.
46. Known inverter surge demand above its surge rating produces FAIL.
47. Installed battery nominal energy below the calculated scenario requirement produces FAIL.
48. Solar production remains a scenario estimate using explicit array rating, peak-sun-hours and efficiency assumptions; it is never treated as guaranteed.
49. Alternator charging energy uses explicit charge power and driving/charging time; it is never assumed unlimited.
50. A negative known daily generation-versus-load balance produces a warning and requires an explicit charging/storage strategy.
51. Battery/BMS discharge capability, voltage compatibility, thermal/service constraints, mass and physical placement remain separate required engineering gates.
52. Solar panel selection cannot exceed verified usable roof geometry after fixed panel dimensions, roof equipment and clearances are applied.
53. Electrical component dimensions and mass remain linked to the same fixed SKU records used by spatial and mass validation.
54. Unknown electrical SKU data cannot be promoted to PASS by template recommendation, AI inference or rendering.
55. A layout cannot become FROZEN when its required electrical-energy scenario has FAIL or VERIFICATION_REQUIRED findings.
56. Unknown occupant count, water autonomy, reserve policy, per-use volume or use frequency blocks water-sizing PASS.
57. Fresh-water demand is derived from explicit use volumes, frequencies and occupants rather than RV size alone.
58. Grey and black generation are derived from explicit waste fractions; incompatible fractions fail validation.
59. Selected fresh, grey and black usable tank capacities must satisfy the applicable scenario requirements.
60. Unknown tank capacity or usable fraction blocks PASS rather than generating an assumed tank size.
61. Fresh, grey and black tanks require verified service/removal access.
62. Black-water tank venting must be verified before plumbing PASS.
63. Gravity drain routes require known diameter, length/elevations and applicable minimum slope; insufficient calculated slope produces FAIL.
64. Fill, overflow, vent, fresh-pressure, grey-drain and black-drain routes remain distinct service-route types.
65. Pump flow and pressure requirements must be explicit and selected pump electrical demand links to the electrical-energy model.
66. Tank contents become physical mass items at actual tank coordinates and participate in GVW/axle load cases.
67. Empty-tank mass PASS cannot substitute for required full/partial tank travel and worst-credible load cases.
68. Tank and pump fixed-SKU geometry participates in spatial collision and service-access validation.
69. Wet-area/WC placement cannot PASS on visual fit alone when waterproofing, drainage, fixture clearance or service access is unresolved.
70. Unknown plumbing/tank data cannot be promoted to PASS by templates, AI inference or rendering.
71. A layout cannot become FROZEN when its required water/plumbing scenario has FAIL or VERIFICATION_REQUIRED findings.
72. Unknown outdoor/indoor design temperatures, humidity targets or solar scenario blocks HVAC thermal PASS.
73. Unknown envelope area, U-value or solar gain blocks final cooling-load PASS.
74. Cooling load is derived from canonical envelope geometry and explicit thermal properties, not vehicle length or generic RV tonnage rules.
75. Occupant, appliance and lighting sensible/latent gains are explicit inputs and cannot be silently omitted.
76. Outside-air ventilation requirement is distinct from recirculating AC capacity; insufficient verified outside air produces FAIL.
77. Unknown infiltration blocks final thermal PASS.
78. Selected HVAC unit capacity, input power and airflow must be verified fixed-SKU engineering data.
79. Installed verified cooling capacity below the calculated applicable load produces FAIL.
80. Every condensate-producing HVAC unit requires a real condensate drain route.
81. HVAC physical, operating, heat-rejection and service envelopes participate in spatial validation.
82. Roof HVAC/vents cannot overlap solar panels, protected roof structure or required service clearances.
83. HVAC electrical input participates in electrical-energy and inverter validation.
84. HVAC equipment mass and location participate in GVW/axle/CG validation.
85. The foundation sensible-air approximation cannot be represented as a full psychrometric/dynamic simulation result.
86. Unknown humidity/latent ventilation requirements cannot be promoted to PASS by AI inference or rendering.
87. A layout cannot become FROZEN when its required HVAC/thermal scenario has FAIL or VERIFICATION_REQUIRED findings.
