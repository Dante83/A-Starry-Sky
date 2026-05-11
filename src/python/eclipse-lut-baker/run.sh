#!/usr/bin/env bash
# Eclipse-Shadow LuT generator for A-Starry-Sky.
# Output goes to ../../../assets/lunar_eclipse/eclipse-shadow-lut.webp.
#
# Default action: convert the CC0-licensed Schneegans earthShadow.tif from the
# local CosmoScout VR checkout. That LuT is the output of their CUDA tool
# (extended Bruneton multi-scattering + refraction + limb-view integration);
# we just repackage it into our sRGB WebP format.
#
# Pass `--simple` to instead run our from-scratch approximate bake.py
# (kept for experimentation; produces a too-red penumbra so don't use for
# production rendering -- see Schneegans 2025 §5.2 for why).
#
# First run: creates a venv and installs requirements.txt.
# Subsequent runs: reuses the venv but always re-syncs requirements (cheap if
# nothing changed).

set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d venv ]; then
  echo "Creating venv..."
  python3 -m venv venv
  ./venv/bin/pip install --quiet --upgrade pip
fi

./venv/bin/pip install --quiet -r requirements.txt

if [ "${1:-}" = "--simple" ]; then
  shift
  ./venv/bin/python bake.py "$@"
else
  ./venv/bin/python convert_schneegans_lut.py "$@"
fi
