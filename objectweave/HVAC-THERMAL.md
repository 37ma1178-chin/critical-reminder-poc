# HVAC, thermal and ventilation engineering

ObjectWeave sizes and validates HVAC against an explicit thermal scenario and the canonical vehicle envelope. AC capacity must not be guessed from vehicle length, seating capacity or a generic RV template.

## Required inputs before PASS

- climate/design scenario: outdoor dry-bulb and humidity
- indoor temperature/humidity targets
- solar exposure scenario
- exact conditioned-zone geometry/volume
- roof/wall/floor/glazing areas and thermal properties
- insulation build-up and thermal bridges where consequential
- glazing/solar gains
- occupant sensible/latent gains
- appliance/lighting heat gains
- outside-air ventilation requirement and delivered rate
- infiltration assumption/measurement
- selected HVAC SKU capacity, power, airflow and operating limits
- physical, operating and service envelopes
- condenser/heat-rejection clearance where applicable
- condensate drain geometry

Unknown consequential values block `PASS`.

## Foundation cooling-load model

The foundation validator sums conductive envelope load, explicit solar gain, internal sensible/latent loads and a simplified sensible ventilation/infiltration term. It uses `0.33 W/(m3/h*K)` for sensible air load as an engineering approximation.

This is not a complete psychrometric or dynamic building-energy simulation. Latent ventilation load, transient solar/storage effects, humidity removal, thermal bridging, cycling, part-load efficiency and extreme transient conditions require a more advanced model before final production engineering claims.

## Equipment gates

Installed verified cooling capacity must not be below the applicable calculated load. Capacity alone is insufficient: equipment power, airflow, condensate disposal, operating clearance, service access and heat-rejection ventilation must also pass.

HVAC electrical input links to the electrical-energy model. Equipment mass and position link to mass/axle validation. Roof or interior envelopes link to spatial collision and structural-zone validation.

## Roof and exterior integration

A roof AC, condenser, vent or heat-rejection assembly occupies canonical roof geometry. It can conflict with solar panels, roof structure, service clearances and other penetrations. Rendering cannot hide those conflicts.

## Ventilation

Ventilation is distinct from recirculating cooling. Required outside air and exhaust must be represented explicitly. A high-capacity AC does not compensate for insufficient verified ventilation.

## Condensate

Every unit producing condensate requires a real drain route with an allowed discharge destination and geometry. The route participates in service-space, penetration and drainage validation.

## Urbania candidate state

The current Urbania candidate has no verified thermal envelope, climate design point, ventilation requirement or selected HVAC SKU. It therefore remains `VERIFICATION_REQUIRED`; no arbitrary tonnage or BTU/h value has been inserted.
