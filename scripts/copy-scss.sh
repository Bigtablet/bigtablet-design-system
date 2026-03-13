#!/usr/bin/env sh
# copy-scss.sh — Copy SCSS token files to dist
set -e

SRC="src/styles/scss"
OUT="dist/styles/scss"

mkdir -p "$OUT"
cp -r "$SRC/." "$OUT/"
