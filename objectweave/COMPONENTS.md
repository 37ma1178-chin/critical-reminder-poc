# Component/SKU normalization contract

Every component is one of:
- FIXED_SKU: physical dimensions cannot be visually scaled.
- PARAMETRIC_FABRICATED: dimensions may vary only inside a declared manufacturing range.
- SYSTEM_ASSEMBLY: composed of child components and service connections.

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
- TV/fridge/microwave/AC: FIXED_SKU.
- Custom seat/sofa-bed/cabinet/WC enclosure: PARAMETRIC_FABRICATED.
- Battery + BMS + protection + inverter installation: SYSTEM_ASSEMBLY.

A renderer may change appearance but may never change engineering dimensions.
