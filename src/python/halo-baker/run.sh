#!/usr/bin/env bash
# Halo atlas generator for A-Starry-Sky.
# Output goes to ../../../assets/halos/ (halo-atlas.webp and halo-atlas.json).
#
# Ray traces light through hexagonal ice crystals and packs the resulting
# 22/46 degree halos, sundogs, tangent arcs and circumzenithal arc into one atlas.
# All arguments are passed to bake.py -- try --selftest, --budget or --samples N.
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

./venv/bin/python bake.py "$@"
