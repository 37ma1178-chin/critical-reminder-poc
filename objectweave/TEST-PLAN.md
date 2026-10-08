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
