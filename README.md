# Urbania configurator

Proof-of-concept interior configurator for the Force Urbania 4400 WB 17-seater.
See `CLAUDE.md` for the file layout, rules and task list.

## Run

```
npx serve .          # or: npx http-server . -p 8080
```

Then open `/index.html` (3D viewer) and `/topview.html` (dimensioned top view).
The camper module selection is kept in the URL query (`?layout=camper&modules=…`), so a link from one page opens the same configuration in the other.
The pages fetch `data/urbania-17.json`, so they need a static server; `file://` will not work.

## Screenshots

```
NODE_PATH=$(npm root -g) node tools/screenshot.js screenshots/
```
