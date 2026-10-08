# ObjectWeave RV India v0.2 data foundation

This directory is the first implementation milestone for the architecture freeze.

- `domain.schema.json`: shared enums and evidence/measurement primitives.
- `entities.json`: canonical domain entity registry.
- Existing `data/urbania-17.json` and `data/components.json` remain prototype inputs; they are not automatically promoted to verified national database records.

Next implementation slice: split entity schemas into regulatory, donor-vehicle, geometry, component, project/revision and validation modules; add migration/version checks and adapters from the current Urbania prototype.
