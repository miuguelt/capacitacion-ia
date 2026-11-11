"""
Verificación de paridad criptográfica SHA-256 de la arquitectura espejo en src/.
Valida que todos los 23 pares de archivos fuente y réplica sean 100% idénticos byte a byte.
"""

import hashlib
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

PAIRS = [
    ("index.html", "src/index.html"),
    ("css/styles.css", "src/css/styles.css"),
    ("css/styles.css", "src/styles/styles.css"),
    ("devbrain-prose.css", "src/devbrain-prose.css"),
    ("devbrain-prose.js", "src/devbrain-prose.js"),
    ("js/app.js", "src/js/app.js"),
    ("js/app.js", "src/shared/app.js"),
    ("js/projects-hub.js", "src/js/projects-hub.js"),
    ("js/projects-hub.js", "src/shared/projects-hub.js"),
    ("js/canvas-exercises.js", "src/js/canvas-exercises.js"),
    ("js/canvas-exercises.js", "src/shared/canvas-exercises.js"),
    ("js/canvas-possibilities.js", "src/js/canvas-possibilities.js"),
    ("js/canvas-possibilities.js", "src/shared/canvas-possibilities.js"),
    ("js/canvas-nav.js", "src/js/canvas-nav.js"),
    ("js/canvas-nav.js", "src/shared/canvas-nav.js"),
    ("js/canvas-coverage.js", "src/js/canvas-coverage.js"),
    ("js/canvas-coverage.js", "src/shared/canvas-coverage.js"),
    ("js/canvas-subnav.js", "src/js/canvas-subnav.js"),
    ("js/canvas-subnav.js", "src/shared/canvas-subnav.js"),
    ("js/canvas-column-dnd.js", "src/js/canvas-column-dnd.js"),
    ("js/canvas-column-dnd.js", "src/shared/canvas-column-dnd.js"),
    ("js/dia3-module.js", "src/js/dia3-module.js"),
    ("js/dia3-module.js", "src/shared/dia3-module.js"),
]

def verify_mirrors():
    print(f"Cotejando {len(PAIRS)} pares espejo en {BASE_DIR}...")
    errors = 0
    for root_rel, mirror_rel in PAIRS:
        root_path = BASE_DIR / root_rel
        mirror_path = BASE_DIR / mirror_rel

        if not root_path.exists():
            print(f"  [ERROR] No existe el archivo canónico: {root_rel}")
            errors += 1
            continue
        if not mirror_path.exists():
            print(f"  [ERROR] No existe el archivo espejo: {mirror_rel}")
            errors += 1
            continue

        r_bytes = root_path.read_bytes()
        m_bytes = mirror_path.read_bytes()
        r_hash = hashlib.sha256(r_bytes).hexdigest()
        m_hash = hashlib.sha256(m_bytes).hexdigest()

        if r_hash != m_hash:
            print(f"  [MISMATCH] {root_rel} ({r_hash[:10]}) != {mirror_rel} ({m_hash[:10]})")
            errors += 1
        else:
            print(f"  [OK] {root_rel} <-> {mirror_rel} [SHA-256: {r_hash[:12]}...]")

    if errors == 0:
        print(f"\nPARIDAD CRIPTOGRÁFICA 100% CONFIRMADA: Todos los {len(PAIRS)} pares espejo son idénticos.")
        return 0
    else:
        print(f"\nFALLO DE PARIDAD: Se encontraron {errors} discrepancias.")
        return 1

if __name__ == "__main__":
    sys.exit(verify_mirrors())
