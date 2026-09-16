# Urbania configurator

Proof-of-concept interior configurator for the Force Urbania 4400 WB 17-seater.
See `CLAUDE.md` for the file layout, rules and task list.

## Run

```
npx serve .          # or: npx http-server . -p 8080
```

Then open `/index.html` (3D viewer) and `/topview.html` (dimensioned top view).
The pages fetch `data/urbania-17.json`, so they need a static server; `file://` will not work.

## Screenshots

```
NODE_PATH=$(npm root -g) node tools/screenshot.js screenshots/
```
