# ObjectWeave RV v0.2 — Service-System Validation Contract

These are engineering/design validation checks. They are not legal certification and do not substitute for qualified electrical, plumbing, HVAC or vehicle-structure review.

## Global
- Every service component has physical, operating (when relevant), and service/removal envelopes.
- A concealed component must have an explicit accessible service zone.
- A route must have endpoints, path segments, reserved envelope, clearance policy and validation state.
- Service routes cannot silently pass through structural zones, occupied furniture envelopes, tanks, battery service envelopes or other reserved volumes.
- Missing dimensions remain UNKNOWN/VERIFICATION_REQUIRED; zero placeholders are not treated as physical geometry.
- Rendering failure must not delete or mutate canonical service data.

## Electrical
- Source, storage, conversion, distribution and load ratings are internally coherent.
- Isolation and protection devices are represented where required by the selected architecture.
- Cable routes reserve physical space and service/termination access.
- Penetrations have an explicit location and sealing/service treatment requirement.
- Cable bend radius, termination access and separation constraints are validated against the selected component/cable data.
- Battery/BMS/inverter service access and ventilation/thermal requirements are represented before PASS.
- Shore, alternator and solar inputs are not assumed interchangeable; each has its own source/protection/interface record.
- A PASS is prohibited when ratings, cable data, protection or component geometry are UNKNOWN.

## Water
- Fresh, grey and black systems are separate canonical systems.
- Tanks consume actual volume and have service/removal access.
- Pump/filter/service components have physical and service envelopes.
- Every waste route has a defined endpoint and route reservation.
- Drain slope requirements are validated against the selected routing geometry and authoritative/engineering criteria when available.
- Black-water venting and termination requirements are explicit design fields; legal status requires authoritative jurisdiction evidence.
- No route may cross a tank wall or structural zone without an explicit penetration record.

## HVAC
- Indoor/outdoor units have actual selected dimensions and service envelopes.
- Condensate drains have explicit routes and termination.
- Duct/airflow routes reserve volume; decorative rendering cannot hide collisions.
- Thermal/service clearance is checked against manufacturer data where available.

## Vehicle integration
- Underfloor, side-wall, roof and rear service zones must be tied to the canonical donor geometry.
- Structural zones and OEM openings are reserved.
- Heavy equipment placement can be checked against axle/load assumptions only when verified mass data and vehicle limits exist.
- Any unverified structural alteration is VERIFICATION_REQUIRED, never PASS.

## Fail-safe
1. Validate against a checkpointed canonical revision.
2. If validation fails, preserve the prior revision.
3. Renderer/exporter failures cannot erase service-system state.
4. Retried writes must be idempotent by stable component/route IDs.
