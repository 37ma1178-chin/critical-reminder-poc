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
