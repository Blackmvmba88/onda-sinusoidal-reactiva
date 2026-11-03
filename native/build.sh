#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
PYTHON="${PYTHON:-python3}"
"$PYTHON" -c 'import PyInstaller' || { echo 'Instala native/requirements-build.txt en tu entorno virtual'; exit 1; }
command -v iconutil >/dev/null
mkdir -p native/assets/ONDA.iconset
for size in 16 32 128 256 512; do
 sips -z "$size" "$size" native/assets/icon.png --out "native/assets/ONDA.iconset/icon_${size}x${size}.png" >/dev/null
 double=$((size*2))
 sips -z "$double" "$double" native/assets/icon.png --out "native/assets/ONDA.iconset/icon_${size}x${size}@2x.png" >/dev/null
done
iconutil -c icns native/assets/ONDA.iconset -o native/assets/ONDA.icns
"$PYTHON" -m PyInstaller --noconfirm --clean --distpath native/dist --workpath native/build native/ONDA.spec
codesign --verify --strict native/dist/ONDA.app
