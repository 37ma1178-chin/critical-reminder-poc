# ObjectWeave RV v0.2 — Layout Engine Contract

## Input sequence

1. Donor vehicle and exact variant.
2. Use intent: PRIVATE or COMMERCIAL.
3. Acquisition path: chassis/cowl, complete vehicle, or stripped shell.
4. Occupancy and driver/seating requirements.
5. Budget ceiling.
6. Required features and equipment.
7. Regulatory/project constraints.
8. Available component SKUs and fabricated-object definitions.

## Candidate generation

The engine may produce multiple layout candidates. Each candidate must reference the same canonical donor geometry and the same requirement set.

A candidate is not approved merely because furniture fits in a top view.

## Placement rules

Every placed object has:
- physical envelope;
- operating envelope when relevant;
- service/removal envelope when relevant;
- transform;
- fixed-geometry flag;
- provenance.

Fixed SKUs cannot be stretched to solve a fit problem.

## Service-aware placement

Layout generation reserves space for:
- electrical equipment and cable routes;
- fresh/grey/black tanks and plumbing;
- HVAC units, ducts and condensate drains;
- maintenance/removal access;
- structural protection zones.

## Candidate states

CANDIDATE → SELECTED → FROZEN

A candidate with unresolved engineering blockers remains CANDIDATE/VERIFICATION_REQUIRED.

## Budget

Budget is a first-class constraint. A layout may be geometrically valid but commercially infeasible. Costing therefore participates in candidate ranking rather than being appended after design.

## Current limitation

No actual Urbania furniture placement has been promoted yet. The current example intentionally contains zero placements because the component catalogue and verified interior geometry are not yet sufficient to create an engineering-valid layout.
