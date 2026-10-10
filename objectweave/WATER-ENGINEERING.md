# Water and plumbing engineering

ObjectWeave derives water storage and plumbing requirements from explicit occupancy, usage and autonomy scenarios. Tank sizes must not be guessed from vehicle class or copied from a template without validation.

## Required inputs before PASS

- occupant count and autonomy target
- explicit water-use profile for drinking, cooking, basin, shower, WC and dishwashing as applicable
- reserve policy
- selected fresh/grey/black tank SKUs or engineered fabricated tanks with real capacity and geometry
- usable capacity/fill limits
- tank coordinates and service/removal access
- pump flow/pressure requirement and selected pump data
- pipe/hose diameters and real route geometry
- gravity-drain slope requirements and calculated slopes
- fill, overflow and vent routes
- black-tank venting
- penetrations and structural-zone review

Unknown consequential values block `PASS`.

## Demand and tank sizing

Daily fresh-water demand is derived from explicit volume-per-use, use frequency, occupants and applicable use types. Grey and black generation are derived from declared waste fractions rather than assumed equal to fresh-water demand.

Required tank capacity applies the requested autonomy and reserve scenario to the derived flows. A selected tank fails if its usable capacity is below the requirement.

## Mass integration

Tank contents are physical load. The foundation uses the engineering approximation 1 litre = 1 kg for water-based contents until fluid-specific density is modelled. Fresh, grey and black fill states must be emitted as mass items at the tanks' actual CG coordinates and evaluated by the mass/axle load cases.

This means a layout that passes when tanks are empty is not sufficient. Relevant travel/worst-credible tank states must also pass GVW and axle limits.

## Drainage

Grey and black drains require explicit route geometry. Where gravity drainage is used, actual slope is calculated from route elevation change and length and compared with the applicable engineering requirement. Missing geometry or missing slope requirement blocks `PASS`.

Black-water venting is a mandatory verification gate. Fill/overflow/vent/discharge routes remain distinct route types.

## Pump and electrical integration

The selected pump must have verified flow, pressure and electrical characteristics. Its electrical demand links into the electrical-energy model using the pump load ID. Pump location, service envelope, vibration/mounting and plumbing connections remain spatial/component constraints.

## Wet-area integration

Shower/WC/wet-area layouts must reserve real fixture envelopes, operating clearance, waterproofing/drainage zones and service access. A visually fitting wet room is not sufficient if drainage, tank routing or service access fails.

## Urbania candidate state

The Urbania water candidate deliberately leaves consumption rates, tank sizes, pump requirements and route geometry unknown. It remains `VERIFICATION_REQUIRED` until user requirements and verified component/geometry data exist.
