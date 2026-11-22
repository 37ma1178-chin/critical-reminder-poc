# RV configurator (India)

Proof-of-concept camper configurator over 14 Indian base vehicles (data in `data/vehicles/`, research handover in `data/handover/`).
See `CLAUDE.md` for the file layout, rules and task list.

## Run

```
npx serve .          # serve.json keeps the ?vehicle=… query between pages
                     # or: npx http-server . -p 8080
```

Then open `/topview.html` or `/sideview.html` (pick a vehicle in the panel), or `/questionnaire.html` to run the eligibility engine in the browser. `/index.html` (3D) still shows only the Urbania 4400.
The camper module selection is kept in the URL query (`?layout=camper&modules=…`), so a link from one page opens the same configuration in the other.
The pages fetch the JSON in `data/`, so they need a static server; `file://` will not work.

## Screenshots

```
NODE_PATH=$(npm root -g) node tools/screenshot.js screenshots/
```
