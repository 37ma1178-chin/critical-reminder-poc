#!/bin/bash
B=/workspace/dancestage-bodies/tools/blender-4.2.9-linux-x64/blender
cd /workspace/camper-glb
ls *.glb | xargs -P 3 -I{} sh -c 'n=$(basename {} .glb); '$B' -b --factory-startup --python scripts/verify_render.py -- {} previews/$n.png 20 2>&1 | rg "^REPORT" > scripts/report_$n.txt'
