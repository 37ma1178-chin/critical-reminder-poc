# Milestone 0 Status

## Implemented
- Architecture invariants and canonical entity registry
- Shared truth/provenance and lifecycle primitives
- Donor vehicle schema
- Project/revision schema
- Regulatory, geometry, component, service-route, checkpoint and validation example records
- Project-intent, budget and verified-template example records
- Provenance-safe adapter metadata for the existing Urbania prototype
- Normalized Urbania 4400 WB 16+D candidate record marked CONCEPT_ONLY

## Safety rules now represented in data
- Exact donor configuration, not generic model names
- No automatic promotion of prototype assumptions to verified facts
- Hidden services have routes and reserved geometry
- Project state supports stable checkpoints/revisions
- Validation is domain-specific rather than one global green tick
- Budget and requirements are first-class inputs

## Next slice
1. Normalize existing components into candidate ComponentSKU records without changing their confidence.
2. Create DigitalTwin v0 candidate metadata for Urbania linked to existing vehicle.js/data.
3. Add project-state/revision/checkpoint helpers around the existing configurator.
4. Add validation adapters for geometry collisions and missing/estimated data.
5. Only after these foundations are stable, expand donor/regulatory datasets.
