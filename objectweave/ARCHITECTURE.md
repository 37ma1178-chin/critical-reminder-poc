# ObjectWeave RV India v0.2 — Implementation Foundation

This branch implements the database/domain foundation for the frozen 20-architecture specification.

## Invariants
- One canonical RV model; 2D/3D/services/costing/validation are views of the same state.
- Exact donor variant, never a generic model-family box.
- All consequential facts carry provenance, confidence and applicability.
- Unknown/estimated data remains explicitly unknown/estimated.
- Hidden electrical/plumbing/HVAC systems consume real geometry.
- Critical validation failures cannot be hidden by rendering.
- Project writes are revisioned/checkpointed; subsystem failure must not destroy the last valid state.

## Milestone 0
The first implementation is deliberately data-first. It defines schemas and seed structures without claiming that India-wide regulatory or vehicle data has already been verified.
