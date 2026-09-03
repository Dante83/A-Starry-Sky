#!/usr/bin/env bash
# Milky Way map generator for A-Starry-Sky.
#
# Produces the two textures the milky-way GLSL chunk samples, both written to
# ../../../assets/milky_way/ :
#
#   milky-way-emission-map.webp    unresolved galactic starlight (galpy)
#   milky-way-absorption-map.webp  interstellar dust extinction (SFD-98)
#
# Both are equirectangular in galactic coordinates, 2:1, north galactic pole on
# the top row, galactic longitude DECREASING left to right (l=+180 at the left
# edge, l=0 dead center, l=-180 at the right edge). That is the standard
# all-sky convention used by Gaia/Planck; see README.md.
#
# Usage:
#   ./run.sh --glow      emission map only  (SLOW: hours at full resolution)
#   ./run.sh --dust      absorption map only (~20 min, plus a one-time 128 MB
#                        download of the SFD-98 dust maps on first run)
#   ./run.sh --all       both, dust first
#
# Extra arguments are forwarded to the underlying script, so a quick low-res
# sanity run is:
#   ./run.sh --glow --size 256
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

fetch_sfd_if_needed() {
  # dustmaps refuses to query until the SFD-98 FITS pair is on disk. Fetching
  # is idempotent but re-downloads 128 MB, so only call it when it is missing.
  if ! ./venv/bin/python -c "
import sys
from dustmaps.sfd import SFDQuery
try:
    SFDQuery()
except Exception:
    sys.exit(1)
" 2>/dev/null; then
    echo "Downloading SFD-98 dust maps (~128 MB, one time)..."
    ./venv/bin/python -c "from dustmaps.sfd import fetch; fetch()"
  fi
}

action="${1:---all}"
shift || true

case "$action" in
  --glow)
    ./venv/bin/python generate_glow_map.py "$@"
    ;;
  --dust)
    fetch_sfd_if_needed
    ./venv/bin/python generate_dust_map.py "$@"
    ;;
  --all)
    fetch_sfd_if_needed
    ./venv/bin/python generate_dust_map.py "$@"
    ./venv/bin/python generate_glow_map.py "$@"
    ;;
  *)
    echo "Unknown action: $action" >&2
    echo "Usage: ./run.sh [--glow|--dust|--all] [extra args]" >&2
    exit 1
    ;;
esac
