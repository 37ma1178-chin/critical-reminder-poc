# Electrical energy sizing and validation

ObjectWeave sizes electrical systems from the selected appliance/component catalogue plus an explicit user usage scenario. It must not recommend an arbitrary battery, inverter or solar size from vehicle class alone.

## Inputs required before PASS

- exact selected electrical loads/SKUs
- nominal and surge power where applicable
- AC/DC classification and operating voltage
- expected runtime and duty cycle
- required off-grid autonomy
- battery nominal energy and verified usable fraction
- battery/BMS continuous discharge limits
- inverter continuous and surge ratings and efficiency
- solar array rating plus scenario-specific production assumptions
- alternator/DC-DC charging capability and expected charging time
- shore charger capability where applicable
- wiring/protection/routing data from the electrical system model

Unknown consequential values block `PASS`.

## Core calculations

Daily load energy is the sum of `power W × runtime h/day × duty cycle × quantity`.

Required usable storage is daily load multiplied by requested autonomy days. Required nominal storage then accounts for the verified usable fraction of the selected battery system.

Solar and alternator energy are scenario estimates, not guaranteed production. Their assumptions must remain explicit. Weather/irradiance and driving time must never be silently treated as guaranteed.

## Inverter gates

The selected inverter must satisfy both continuous and surge requirements of the applicable simultaneous-load scenario. A system fails if known continuous or surge demand exceeds the corresponding verified inverter rating.

Future refinement must replace the conservative all-load sum with explicit concurrency groups/load schedules. Until then, the foundation calculation must not claim a final optimized inverter size.

## Battery/BMS gates

Energy capacity alone is insufficient. The selected storage system must also satisfy voltage compatibility, BMS current/discharge limits, thermal requirements, service access, mass and physical-space constraints. Those checks link the energy model back to the component, mass and spatial validators.

## Solar roof integration

Solar selection must eventually be constrained by actual usable roof geometry, vents/AC/roof structures, panel fixed dimensions, mounting/service clearances and mass. Nominal requested wattage cannot create roof area that does not exist.

## Urbania candidate state

The current Urbania candidate intentionally contains null appliance powers, runtimes, battery capacity, inverter ratings and charging-source ratings. This is correct until exact SKUs and a user usage/autonomy profile exist. Its status is `VERIFICATION_REQUIRED`.
