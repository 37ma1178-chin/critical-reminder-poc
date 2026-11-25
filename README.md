# RV configurator (India)

Proof-of-concept camper configurator over 14 Indian base vehicles (data in `data/vehicles/`, research handover in `data/handover/`).
See `CLAUDE.md` for the file layout, rules and task list.

## Run

```
npx serve .          # serve.json keeps the ?vehicle=… query between pages
                     # or: npx http-server . -p 8080
```

Then open `/topview.html` or `/sideview.html` (pick a vehicle in the panel), or `/questionnaire.html` to run the eligibility engine in the browser.
For the five vehicles in `data/vehicles.json` (Azad's approximate internal dimensions), the 2D views also show Azad's figures and hatch the wheel-arch zones ("arch data pending"); modules on them are drawn as blocked. `/index.html` (3D) still shows only the Urbania 4400.
The camper module selection is kept in the URL query (`?layout=camper&modules=…`), so a link from one page opens the same configuration in the other.
The pages fetch the JSON in `data/`, so they need a static server; `file://` will not work.

## Checks

```
node tests/run_specs.js           # eligibility engine, tests A and B
node tests/interior_spec.js       # data/vehicles.json and js/interior.js
node tools/validate_azad_glb.js   # GLB interiors vs Azad (report only)
```

## Screenshots

```
NODE_PATH=$(npm root -g) node tools/screenshot.js screenshots/
```
