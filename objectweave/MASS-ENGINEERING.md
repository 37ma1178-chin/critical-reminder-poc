# Mass, payload and axle-load engineering

Mass engineering is a canonical validation layer. It is not a visual estimate and cannot be bypassed by a successful 2D/3D render.

## Required inputs

Before engineering `PASS`, ObjectWeave requires:

- verified GVW/GVM applicable to the exact donor variant
- verified front and rear axle ratings
- known starting/base vehicle mass for the physical state being converted
- longitudinal base centre of gravity, or verified front/rear axle scale readings from which it can be derived
- mass and longitudinal CG for every installed component/fabricated object/system
- fluid loads for the validation scenario
- occupants and luggage for the validation scenario

Unknown consequential values remain unknown and block `PASS`.

## Load cases

The final validator should evaluate multiple explicit load cases rather than one optimistic configuration. Minimum intended cases:

1. empty conversion / no occupants
2. travel occupancy
3. full fresh-water condition
4. waste-tank loading condition
5. luggage/cargo condition
6. combined design-worst credible condition

Water/fuel/waste quantities must be represented as physical masses at real tank coordinates. They are not metadata-only capacity values.

## Axle model

The foundation solver uses static longitudinal equilibrium between front and rear axle reference points. Its local convention is `x=0` at the front axle and `x=wheelbase` at the rear axle.

The existing canonical Urbania geometry uses a different vehicle coordinate convention. Therefore an explicit coordinate adapter is required before live integration. Do not feed canonical x positions directly into the mass solver until that adapter is implemented and tested.

## Blocking rules

A layout cannot become `FROZEN` when:

- calculated total mass exceeds GVW
- either calculated axle load exceeds its rating
- GVW or axle ratings are unknown
- starting vehicle mass/CG is unknown
- any consequential installed item has unknown mass or longitudinal CG
- a selected fluid/occupant/load case is incomplete

A renderer, AI recommendation or template score cannot downgrade these findings.

## Lateral and vertical stability

The current foundation calculates longitudinal axle loads only. Lateral left/right balance, vertical CG, rollover/stability analysis, dynamic braking/cornering loads, tyre ratings and structural mounting loads are separate engineering requirements and are not claimed complete in v0.2 foundation.

## Urbania candidate state

The normalized Urbania candidate currently carries GVW 4685 kg, but authoritative source review remains required. Base/kerb conversion-state mass, base CG/axle scale values and front/rear axle ratings are not yet verified in the ObjectWeave candidate data. Consequently the Urbania mass model is correctly `VERIFICATION_REQUIRED`, not `PASS`.
