# Component/SKU normalization contract

Every component is one of:
- `FIXED_SKU`: real manufactured product; engineering dimensions cannot be visually or parametrically scaled.
- `PARAMETRIC_FABRICATED`: dimensions may vary only inside a declared manufacturing range and must produce a new engineered instance.
- `SYSTEM_ASSEMBLY`: composed of child components plus explicit service connections/routes.

Required physical data where applicable:
- physical envelope
- operating envelope
- service/removal envelope
- mounting footprint
- mass
- electrical characteristics
- plumbing connections
- ventilation/thermal requirements
- evidence/provenance
- dated price observations

Examples:
- TV/fridge/microwave/AC/battery/inverter/solar panel/tank/pump/WC product: `FIXED_SKU`.
- Custom seat/recliner/sofa-bed/bed/cabinet/wet-area enclosure: `PARAMETRIC_FABRICATED`.
- Battery + BMS + protection + inverter installation, plumbing installation, HVAC installation: `SYSTEM_ASSEMBLY`.

## Truth and geometry gates

1. A renderer may change appearance but may never change engineering dimensions.
2. A `FIXED_SKU` without known engineering dimensions is `VERIFICATION_REQUIRED`; it cannot receive placement `PASS`.
3. `UNKNOWN` or `ESTIMATED` engineering facts cannot silently become verified through import, AI inference or rendering.
4. A fabricated object may change size only within its declared manufacturing range. A changed size is a new fabricated instance, not a scaled SKU.
5. Operating and service/removal envelopes reserve real space and participate in layout validation.
6. Hidden components remain physical objects and must participate in collision, mass, service-access and routing checks.

## Compatibility gates

Compatibility may constrain:
- donor vehicle and exact physical state
- mass and mounting
- voltage and power
- plumbing/drain requirements
- ventilation and thermal clearance
- indoor/outdoor location
- service access
- spatial clearance
- project budget

Compatibility states are `COMPATIBLE`, `CONDITIONAL`, `INCOMPATIBLE`, `VERIFICATION_REQUIRED`, and `UNKNOWN`.

A component with missing consequential engineering facts fails closed to `VERIFICATION_REQUIRED`, never `COMPATIBLE` by assumption.

## Price observations

Price is not a timeless SKU property. Store it as a dated INR observation with source, retrieval date, market condition (MRP/retail/sale/quoted/estimated/unknown), truth class and confidence. Historical observations remain immutable; refresh by adding a new observation.

## Selection engine

`runtime/component-selector.js` maps requested project features to catalogue categories, filters candidates, evaluates compatibility, and explicitly rejects fixed-SKU visual scaling. Selection does not promote source truth: catalogue evidence and engineering verification remain separate gates.

`models/component-catalogue.example.json` is intentionally a skeleton. Unknown manufacturer/model/dimensions/mass/power/capacity/prices are null rather than fabricated.