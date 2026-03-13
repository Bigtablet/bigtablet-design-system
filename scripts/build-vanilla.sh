#!/usr/bin/env sh
# build-vanilla.sh — Compile vanilla CSS and copy JS/examples to dist
set -e

SRC="src/vanilla"
OUT="dist/vanilla"

mkdir -p "$OUT"

# Compile SCSS → CSS (full + minified)
npx sass --no-source-map --load-path=. --load-path=src \
  "$SRC/bigtablet.scss" "$OUT/bigtablet.css"

npx sass --no-source-map --load-path=. --load-path=src --style=compressed \
  "$SRC/bigtablet.scss" "$OUT/bigtablet.min.css"

echo "✓ Vanilla CSS compiled"

# Copy JS
cp "$SRC/bigtablet.js" "$OUT/bigtablet.js"
echo "✓ Vanilla JS copied"

# Copy examples (if present)
if [ -d "$SRC/examples" ]; then
  cp -r "$SRC/examples" "$OUT/examples"
  echo "✓ Examples copied"
fi

printf "\n📦 Vanilla build complete!\n"
printf "  %s\n" \
  "dist/vanilla/bigtablet.css" \
  "dist/vanilla/bigtablet.min.css" \
  "dist/vanilla/bigtablet.js" \
  "dist/vanilla/bigtablet.min.js"
