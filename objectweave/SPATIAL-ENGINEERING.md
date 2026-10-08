# ObjectWeave RV v0.2 — Spatial Engineering Contract

The spatial model is the canonical physical coordinate layer shared by 2D views, sections, 3D, service routing, validation and later fabrication output.

## Rules

- One coordinate system per canonical donor twin.
- A vehicle is represented by measured/verified geometry plus explicitly marked estimated geometry.
- Furniture, fixed SKUs, fabricated objects and service systems all occupy real volumes.
- Every service route reserves volume; a line drawn for illustration is not sufficient.
- Service envelopes are separate from physical envelopes.
- Structural zones are protected unless an engineering rule explicitly permits an operation.
- Unknown geometry blocks engineering PASS.
- Visual transforms cannot silently resize a fixed SKU.
- Section views must be able to expose concealed service zones.
- 2D and 3D must consume the same canonical spatial objects; neither view may create independent geometry.

## Current Urbania status

The existing Urbania candidate has reliable candidate exterior dimensions carried from the prototype data, but its detailed floor, wheelhouse, wall, cab, structural and underfloor geometry remains verification-required. Therefore the spatial model is a foundation candidate, not an engineering-ready digital twin.
