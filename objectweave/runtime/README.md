# ObjectWeave runtime bridge

These scripts are additive and do not change the current prototype pages yet.

- state.js: local revision/checkpoint persistence for fail-safe project state.
- data-quality.js: candidate donor-data checks. Estimated geometry produces VERIFICATION_REQUIRED rather than PASS.

Integration rule: introduce these through an adapter/bootstrap after tests; do not rewrite vehicle.js until the canonical model adapter reproduces the current top/side/3D geometry.
